import { storage } from '../../core/infrastructure/supabaseStorage';
import { logger } from '../../core/logger';
import type { TransactionSource } from '../../core/infrastructure/supabase';

// Tipos para transações do Gemini
interface GeminiTransaction {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  categoryId: string;
  mode?: "avulsa" | "parcelada";
  installment_number?: number | null;
  installments_total?: number | null;
  card_holder_name?: string | null;
}

/**
 * Calcula a data de vencimento (dueDate) para transações importadas
 *
 * Para cartões de crédito:
 * - Usa closingDay e dueDay do cartão para determinar o ciclo de faturamento
 * - Transações antes do fechamento: vencem no mesmo mês
 * - Transações após fechamento: vencem no próximo mês
 *
 * Para extratos bancários:
 * - Usa a própria data da transação (já ocorreu)
 */
export function calculateDueDate(
  transactionDate: Date | string,
  statementType: 'credit_card' | 'checking',
  card?: { closingDay: number | null; dueDay: number | null }
): string | null {
  const txDate = typeof transactionDate === 'string'
    ? new Date(transactionDate + 'T12:00:00')
    : transactionDate;

  if (statementType === 'checking') {
    // Extrato bancário: usar data da transação (já ocorreu)
    const year = txDate.getFullYear();
    const month = String(txDate.getMonth() + 1).padStart(2, '0');
    const day = String(txDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  if (statementType === 'credit_card') {
    // Cartão de crédito: calcular baseado no ciclo de faturamento
    const closingDay = card?.closingDay || 1; // Default: fecha dia 1
    const dueDay = card?.dueDay || 10; // Default: vence dia 10

    const txDay = txDate.getDate();
    const txMonth = txDate.getMonth();
    const txYear = txDate.getFullYear();

    let dueMonth: number;
    let dueYear: number;

    if (txDay < closingDay) {
      // Transação antes do fechamento: vence no mesmo mês
      dueMonth = txMonth;
      dueYear = txYear;
    } else {
      // Transação no dia ou após fechamento: vence no próximo mês
      dueMonth = txMonth + 1;
      dueYear = txYear;
      if (dueMonth > 11) {
        dueMonth = 0;
        dueYear++;
      }
    }

    // Formatar como YYYY-MM-DD
    return `${dueYear}-${String(dueMonth + 1).padStart(2, '0')}-${String(dueDay).padStart(2, '0')}`;
  }

  return null;
}

/**
 * Função de pós-processamento inteligente para transações extraídas pela IA
 *
 * Realiza:
 * 1. Filtragem de pagamentos de fatura (se cartão de crédito)
 * 2. Detecção de parcelamentos via regex (fallback)
 * 3. Mapeamento de nomes de adicionais para family_member_id
 */
export async function postProcessTransactions(
  transactions: GeminiTransaction[],
  statementType: string,
  userId: string,
  allCards?: any[]  // ⚡ OTIMIZAÇÃO: Aceitar cartões pré-carregados para evitar query duplicada
): Promise<any[]> {

  // 1. Filtrar pagamentos de fatura (se for cartão de crédito)
  let filtered = transactions;
  if (statementType === 'credit_card') {
    const before = transactions.length;
    filtered = transactions.filter(t => {
      const desc = t.description.toUpperCase();
      return !desc.includes('PAGTO') &&
             !desc.includes('PAGAMENTO') &&
             !desc.includes('DEB EM C/C') &&
             !desc.includes('DEBITO EM C/C');
    });

    const removed = before - filtered.length;
    if (removed > 0) {
      logger.debug(`   🗑️  Filtrados ${removed} pagamento(s) de fatura`);
    }
  }

  // 2. Detectar parcelamentos via regex (se Gemini não detectou)
  const processed = filtered.map(t => {
    // Regex para detectar XX/YY no final da descrição
    const installmentMatch = t.description.match(/(\d{2})\/(\d{2})\s*$/);

    if (installmentMatch && (!t.installment_number || t.mode !== 'parcelada')) {
      const currentParcela = parseInt(installmentMatch[1]);
      const totalParcelas = parseInt(installmentMatch[2]);

      logger.debug(`   💳 Parcelamento detectado: ${t.description.substring(0, 30)}... (${currentParcela}/${totalParcelas})`);

      return {
        ...t,
        mode: 'parcelada',
        installment_number: currentParcela,
        installments_total: totalParcelas
      };
    }

    // Se Gemini já detectou, manter
    return t;
  });

  // 3. Mapear nomes de adicionais para family_member_id
  // Cache para evitar duplicação ao criar membros
  const memberCache = new Map<string, any>();

  // Primeiro, coletar todos os nomes únicos
  const uniqueNames = Array.from(new Set(processed.map(t => t.card_holder_name).filter(Boolean)));

  // ✅ OTIMIZAÇÃO: Buscar ou criar membros em paralelo ao invés de sequencial
  const memberPromises = uniqueNames.map(async (name) => {
    let member = await storage.findFamilyMemberByName(userId, name as string);

    if (!member) {
      logger.debug(`   👤 Criando membro da família: ${name}`);

      // Detectar relacionamento pelo nome (heurística simples)
      let relationship: "self" | "spouse" | "child" | "other" = "other";
      const nameParts = (name as string).toLowerCase().split(' ');

      // Se tem "silva", "santos", "oliveira" etc. pode ser cônjuge
      if (nameParts.length >= 3) {
        relationship = "spouse";
      }

      member = await storage.createFamilyMember({
        name: name as string,
        relationship,
        isPrimary: false
      }, userId);
    }

    return [name as string, member] as [string, typeof member];
  });

  const memberEntries = await Promise.all(memberPromises);
  memberEntries.forEach(([name, member]) => {
    memberCache.set(name, member);
  });

  // Agora mapear transações para membros usando o cache
  const processedWithMembers = processed.map((t) => {
    if (!t.card_holder_name) return t;

    const member = memberCache.get(t.card_holder_name);

    return {
      ...t,
      familyMemberId: member?.id,
      // Remover card_holder_name do retorno final
      card_holder_name: undefined
    };
  });

  // 4. Associar transações aos cartões cadastrados usando últimos 4 dígitos
  // ⚡ OTIMIZAÇÃO: Se cartões já foram passados, não buscar novamente
  if (!allCards) {
    allCards = await storage.getAllCreditCards(userId);
  }
  logger.debug(`\n💳 Cartões cadastrados: ${allCards.length}`);
  allCards.forEach(card => {
    logger.debug(`   - ${card.name} (final ${card.lastFourDigits})`);
  });

  // ⚡ OTIMIZAÇÃO: Criar Maps para lookup O(1) ao invés de array.find() O(n)
  const cardsByDigits = new Map(allCards.map(card => [card.lastFourDigits, card]));
  const cardsByMember = new Map(
    allCards
      .filter(card => card.holderFamilyMemberId)
      .map(card => [card.holderFamilyMemberId!, card])
  );

  const processedWithCards = processedWithMembers.map((t: any) => {
    // Se Gemini retornou card_last_digits, usar para encontrar o cartão
    if (t.card_last_digits) {
      const matchingCard = cardsByDigits.get(t.card_last_digits);

      if (matchingCard) {
        logger.debug(`   💳 Match! Transação "${t.description.substring(0, 30)}..." → Cartão "${matchingCard.name}" (${matchingCard.lastFourDigits})`);
        return {
          ...t,
          cardId: matchingCard.id,
          // Usar o familyMemberId do cartão cadastrado, se houver
          familyMemberId: matchingCard.holderFamilyMemberId || t.familyMemberId,
          card_last_digits: undefined // Remover campo temporário
        };
      } else {
        logger.debug(`   ⚠️ Cartão com final ${t.card_last_digits} não cadastrado no sistema`);
        return {
          ...t,
          card_last_digits: undefined
        };
      }
    }

    // Fallback: Se tem familyMemberId mas não tem card_last_digits,
    // tentar encontrar cartão pelo titular
    if (t.familyMemberId) {
      const memberCard = cardsByMember.get(t.familyMemberId);
      if (memberCard) {
        logger.debug(`   💳 Associando por membro: "${t.description.substring(0, 30)}..." → "${memberCard.name}"`);
        return {
          ...t,
          cardId: memberCard.id
        };
      }
    }

    return t;
  });

  // 5. Adicionar dueDate, source e isPaid para integração com Pagamentos
  // ⚡ Criar Map para lookup rápido de cartões por ID
  const cardsById = new Map(allCards.map(card => [card.id, card]));

  const finalProcessed = processedWithCards.map((t: any) => {
    // Encontrar cartão associado (se houver)
    const matchedCard = t.cardId ? cardsById.get(t.cardId) : null;

    // Calcular dueDate baseado no tipo de extrato
    const dueDate = calculateDueDate(
      t.date,
      statementType as 'credit_card' | 'checking',
      matchedCard ? { closingDay: matchedCard.closingDay, dueDay: matchedCard.dueDay } : undefined
    );

    // Determinar source baseado no tipo de extrato
    const source: TransactionSource = statementType === 'credit_card'
      ? 'credit_card_import'
      : 'bank_statement_import';

    return {
      ...t,
      dueDate,
      source,
      isPaid: false, // Transações importadas começam como não pagas
    };
  });

  logger.debug(`   ✅ Processamento concluído: ${finalProcessed.length} transações com dueDate e source`);

  return finalProcessed;
}
