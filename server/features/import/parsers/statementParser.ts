/**
 * Parser inteligente para extratos bancários brasileiros
 * Extrai transações usando regex otimizados por banco
 */

import { normalizeDate } from "../../../../shared/utils/date";
import { logger } from "../../../core/logger";

export interface ParsedTransaction {
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  type: "income" | "expense";
  mode?: "avulsa" | "parcelada";
  installment_number?: number | null;
  installments_total?: number | null;
  card_last_digits?: string | null;
  card_holder_name?: string | null;
}

export interface ParserResult {
  transactions: ParsedTransaction[];
  bank: string;
  statementType: "credit_card" | "checking";
  metadata: {
    totalTransactions: number;
    parsingMethod: "regex" | "hybrid";
    confidence: number; // 0-1
  };
}

/**
 * Detecta qual banco emitiu o extrato
 */
/**
 * Detecta o banco do extrato
 *
 * Atualmente suportado:
 * - Bradesco (implementado)
 *
 * TODO - Bancos para implementar no futuro:
 * - Inter, Nubank, Itaú, Santander, Caixa, Banco do Brasil, BTG
 */
export function detectBank(text: string): string {
  if (/bradesco/i.test(text)) {
    return "Bradesco";
  }

  return "Desconhecido";
}

/**
 * Detecta se é fatura de cartão ou extrato de conta corrente
 */
export function detectStatementType(text: string): "credit_card" | "checking" {
  const creditCardKeywords = [
    /fatura/i,
    /cartão de crédito/i,
    /cartao de credito/i,
    /número do cartão/i,
    /limite disponível/i,
    /total da fatura/i,
  ];

  const checkingKeywords = [
    /extrato/i,
    /conta corrente/i,
    /saldo anterior/i,
    /débitos/i,
    /créditos/i,
  ];

  let creditScore = 0;
  let checkingScore = 0;

  for (const pattern of creditCardKeywords) {
    if (pattern.test(text)) creditScore++;
  }

  for (const pattern of checkingKeywords) {
    if (pattern.test(text)) checkingScore++;
  }

  return creditScore > checkingScore ? "credit_card" : "checking";
}

/**
 * Parser para Bradesco
 */
export function parseBradesco(text: string, type: "credit_card" | "checking"): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];

  if (type === "credit_card") {
    // Padrão Bradesco fatura de cartão:
    // DD/MM DESCRIÇÃO                     VALOR
    // 15/07 AMAZON BR 01/03              77,98

    // Primeiro, detectar seções de cartão
    const cardSections = detectBradescoCardSections(text);

    if (cardSections.length > 0) {
      // Processar por seção de cartão
      for (const section of cardSections) {
        logger.debug(`   🔍 Processando seção do cartão ${section.lastDigits} (${section.holderName})...`);
        logger.debug(`   📝 Tamanho do texto da seção: ${section.text.length} caracteres`);
        
        // Regex melhorado: captura DD/MM + descrição + valor (cidade opcional no meio)
        // Usa non-greedy para capturar até encontrar o valor
        // Padrão: DD/MM + espaços + descrição (qualquer coisa) + espaços + valor
        const transactionPattern = /(\d{2}\/\d{2})\s+(.+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})/g;
        let match;
        let sectionCount = 0;
        const processedLines = new Set<string>(); // Evitar duplicatas

        while ((match = transactionPattern.exec(section.text)) !== null) {
          const [fullMatch, dateStr, description, amountStr] = match;
          
          // Criar chave única para evitar duplicatas
          const lineKey = `${dateStr}-${description.substring(0, 30)}-${amountStr}`;
          if (processedLines.has(lineKey)) continue;
          processedLines.add(lineKey);

          // Pular linhas de total/subtotal/pagamento
          if (/total|subtotal|pagto|pagamento|data|histórico|lançamento|vencimento/i.test(description)) continue;
          
          // Limpar descrição: remover cidade no final (palavras maiúsculas)
          let cleanDescription = description.trim();
          // Remover cidade: geralmente 1-3 palavras maiúsculas no final
          cleanDescription = cleanDescription.replace(/\s+[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]{2,}(\s+[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]{2,}){0,2}\s*$/, '').trim();

          // Extrair parcelamento da descrição (ex: "AMAZON BR 01/03")
          const installmentMatch = cleanDescription.match(/(\d{2})\/(\d{2})\s*$/);
          cleanDescription = cleanDescription.replace(/\s*\d{2}\/\d{2}\s*$/, '').trim();

          // Validar que temos dados mínimos
          if (!cleanDescription || cleanDescription.length < 3) continue;

          transactions.push({
            date: parseBradescoDate(dateStr),
            description: cleanDescription,
            amount: parseAmount(amountStr),
            type: "expense",
            mode: installmentMatch ? "parcelada" : "avulsa",
            installment_number: installmentMatch ? parseInt(installmentMatch[1]) : null,
            installments_total: installmentMatch ? parseInt(installmentMatch[2]) : null,
            card_last_digits: section.lastDigits || null,
            card_holder_name: section.holderName || null,
          });
          sectionCount++;
        }
        logger.debug(`   ✓ Seção do cartão ${section.lastDigits}: ${sectionCount} transações encontradas`);
        
        // Log de amostra das primeiras transações para debug
        if (sectionCount > 0 && sectionCount < 5) {
          const sectionTransactions = transactions.slice(-sectionCount);
          logger.debug(`   📋 Amostra: ${sectionTransactions.map(t => `${t.date} ${t.description.substring(0, 20)}...`).join(', ')}`);
        }
      }
      logger.debug(`   📊 Total de transações extraídas: ${transactions.length}`);
      
      // Se encontrou poucas transações, tentar fallback também
      if (transactions.length < 50 && transactions.length > 0) {
        logger.debug(`   ⚠️ Poucas transações encontradas (${transactions.length}). Tentando fallback adicional...`);
        const fallbackTransactions = parseGeneric(text, type);
        if (fallbackTransactions.length > transactions.length) {
          logger.debug(`   ✅ Fallback encontrou ${fallbackTransactions.length} transações (vs ${transactions.length} das seções)`);
          // Combinar, evitando duplicatas
          const existingKeys = new Set(transactions.map(t => `${t.date}-${t.description.substring(0, 30)}-${t.amount}`));
          const newTransactions = fallbackTransactions.filter(t => {
            const key = `${t.date}-${t.description.substring(0, 30)}-${t.amount}`;
            return !existingKeys.has(key);
          });
          transactions.push(...newTransactions);
          logger.debug(`   📊 Total após fallback: ${transactions.length} transações`);
        }
      }
    } else {
      // Fallback: processar sem separar por cartão
      logger.debug(`   ⚠️ Nenhuma seção de cartão detectada, processando texto completo...`);
      logger.debug(`   📝 Tamanho do texto completo: ${text.length} caracteres`);
      
      const transactionPattern = /(\d{2}\/\d{2})\s+(.+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})/g;
      let match;
      let fallbackCount = 0;
      const processedLines = new Set<string>();
      const skippedReasons = {
        duplicate: 0,
        header: 0,
        invalid: 0,
      };

      while ((match = transactionPattern.exec(text)) !== null) {
        const [fullMatch, dateStr, description, amountStr] = match;
        
        // Criar chave única para evitar duplicatas
        const lineKey = `${dateStr}-${description.substring(0, 30)}-${amountStr}`;
        if (processedLines.has(lineKey)) {
          skippedReasons.duplicate++;
          continue;
        }
        processedLines.add(lineKey);

        // Pular linhas de total/subtotal/pagamento
        if (/total|subtotal|pagto|pagamento|data|histórico|lançamento|vencimento/i.test(description)) {
          skippedReasons.header++;
          continue;
        }

        // Limpar descrição: remover cidade no final
        let cleanDescription = description.trim();
        cleanDescription = cleanDescription.replace(/\s+[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]{2,}(\s+[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]{2,}){0,2}\s*$/, '').trim();

        // Extrair parcelamento da descrição
        const installmentMatch = cleanDescription.match(/(\d{2})\/(\d{2})\s*$/);
        cleanDescription = cleanDescription.replace(/\s*\d{2}\/\d{2}\s*$/, '').trim();

        // Validar que temos dados mínimos
        if (!cleanDescription || cleanDescription.length < 3) {
          skippedReasons.invalid++;
          continue;
        }

        transactions.push({
          date: parseBradescoDate(dateStr),
          description: cleanDescription,
          amount: parseAmount(amountStr),
          type: "expense",
          mode: installmentMatch ? "parcelada" : "avulsa",
          installment_number: installmentMatch ? parseInt(installmentMatch[1]) : null,
          installments_total: installmentMatch ? parseInt(installmentMatch[2]) : null,
          card_last_digits: null,
          card_holder_name: null,
        });
        fallbackCount++;
      }
      logger.debug(`   ✓ Fallback: ${fallbackCount} transações encontradas`);
      logger.debug(`   📊 Puladas: ${skippedReasons.duplicate} duplicatas, ${skippedReasons.header} cabeçalhos, ${skippedReasons.invalid} inválidas`);
    }
  }

  logger.debug(`   📊 parseBradesco: Total final de ${transactions.length} transações extraídas`);
  
  // Validação: alertar se encontrar poucas transações (pode indicar problema no parser)
  if (transactions.length > 0 && transactions.length < 50) {
    logger.debug(`   ⚠️ ATENÇÃO: Apenas ${transactions.length} transações encontradas. Esperado: 70-85 para faturas completas.`);
    logger.debug(`   💡 Dica: Verifique se todas as seções de cartão foram detectadas corretamente.`);
  }
  
  return transactions;
}

/**
 * Detecta seções de cartões na fatura Bradesco
 */
function detectBradescoCardSections(text: string): Array<{
  lastDigits: string;
  holderName: string;
  text: string;
}> {
  const sections: Array<{ lastDigits: string; holderName: string; text: string }> = [];

  // Padrão: "Número do Cartão 4066 XXXX XXXX 3639" ou "Número do Cartão 4066 XXXX XXXX 1758"
  // Captura especificamente os ÚLTIMOS 4 dígitos após XXXX XXXX XXXX
  // Versão flexível: aceita números ou XXXX nos primeiros grupos
  const cardPattern = /Número do Cartão\s+(?:\d{4}|XXXX)\s+(?:XXXX|\d{4})\s+(?:XXXX|\d{4})\s+(?:XXXX|\d{4})\s+(\d{4})/gi;
  // Padrão: "Total para NOME COMPLETO"
  const holderPattern = /Total para\s+([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]+?)(?:\s|$|\n)/gi;

  const cardMatches = Array.from(text.matchAll(cardPattern));
  const holderMatches = Array.from(text.matchAll(holderPattern));

  logger.debug(`   🔍 Detectadas ${cardMatches.length} seções de cartão e ${holderMatches.length} titulares`);
  
  // Debug: mostrar os cartões encontrados
  if (cardMatches.length > 0) {
    cardMatches.forEach((match, i) => {
      logger.debug(`   🔍 Cartão ${i}: "${match[0].trim()}" → últimos 4 dígitos: ${match[1]}`);
    });
  }

  // Encontrar início e fim de cada seção
  // Estratégia: para cada cartão, encontrar o titular mais próximo após ele
  for (let i = 0; i < cardMatches.length; i++) {
    const cardMatch = cardMatches[i];
    const cardIndex = cardMatch.index!;
    
    // Encontrar o titular mais próximo após este cartão
    let closestHolder: RegExpMatchArray | null = null;
    let closestDistance = Infinity;
    
    for (const holderMatch of holderMatches) {
      const holderIndex = holderMatch.index!;
      // Titular deve estar após o cartão
      if (holderIndex > cardIndex) {
        const distance = holderIndex - cardIndex;
        if (distance < closestDistance) {
          closestDistance = distance;
          closestHolder = holderMatch;
        }
      }
    }

    if (!closestHolder) {
      logger.debug(`   ⚠️ Seção ${i}: cartão ${cardMatch[1]} encontrado mas titular não encontrado após ele`);
      // Mesmo sem titular, criar seção com o texto após o cartão
      const startIndex = cardIndex + cardMatch[0].length;
      const endIndex = i < cardMatches.length - 1
        ? cardMatches[i + 1].index!
        : text.length;
      
      sections.push({
        lastDigits: cardMatch[1],
        holderName: "Desconhecido",
        text: text.substring(startIndex, endIndex),
      });
      continue;
    }

    const lastDigits = cardMatch[1];
    const holderName = closestHolder[1].trim();

    logger.debug(`   ✓ Seção ${i}: Cartão final ${lastDigits} - Titular: ${holderName}`);

    // Início: após "Total para NOME" (onde começam as transações)
    const startIndex = closestHolder.index! + closestHolder[0].length;
    
    // Fim: próximo "Número do Cartão" ou próximo "Total para" (se houver outro cartão)
    // OU se for o último cartão, vai até o final do texto
    let endIndex = text.length;
    
    if (i < cardMatches.length - 1) {
      // Há outro cartão, pegar até ele
      endIndex = cardMatches[i + 1].index!;
    } else {
      // Último cartão: procurar por "Total da fatura" ou fim do texto
      const nextTotalMatch = text.indexOf("Total da fatura", startIndex);
      if (nextTotalMatch > startIndex) {
        endIndex = nextTotalMatch;
      }
    }

    const sectionText = text.substring(startIndex, endIndex).trim();
    logger.debug(`   📏 Seção ${i}: ${sectionText.length} caracteres capturados (índices ${startIndex}-${endIndex})`);

    sections.push({
      lastDigits,
      holderName,
      text: sectionText,
    });
  }

  return sections;
}

/**
 * Converte data DD/MM para YYYY-MM-DD
 */
function parseBradescoDate(dateStr: string): string {
  const [day, month] = dateStr.split('/');
  const currentYear = new Date().getFullYear();

  // Se o mês é futuro, assume ano passado
  const currentMonth = new Date().getMonth() + 1;
  const year = parseInt(month) > currentMonth ? currentYear - 1 : currentYear;

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Converte valor brasileiro para número
 * Ex: "1.234,56" -> 1234.56
 */
function parseAmount(amountStr: string): number {
  return parseFloat(amountStr.replace(/\./g, '').replace(',', '.'));
}

/**
 * Parser genérico usando padrões comuns
 */
export function parseGeneric(text: string, type: "credit_card" | "checking"): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];

  // Padrões comuns de data em extratos brasileiros
  const datePatterns = [
    /(\d{2}\/\d{2}\/\d{4})/,  // DD/MM/YYYY
    /(\d{2}\/\d{2})/,          // DD/MM
    /(\d{4}-\d{2}-\d{2})/,     // YYYY-MM-DD
  ];

  // Padrão de valor: números com ponto/vírgula
  const amountPattern = /(\d{1,3}(?:\.\d{3})*,\d{2})/;

  // Tentar extrair linhas que parecem transações
  const lines = text.split('\n');

  for (const line of lines) {
    // Pular linhas vazias ou muito curtas
    if (line.trim().length < 10) continue;

    // Pular cabeçalhos
    if (/data|valor|descrição|description/i.test(line)) continue;

    // Tentar encontrar data
    let dateMatch = null;
    let datePattern = null;
    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        dateMatch = match[1];
        datePattern = pattern;
        break;
      }
    }

    if (!dateMatch) continue;

    // Tentar encontrar valor
    const amountMatch = line.match(amountPattern);
    if (!amountMatch) continue;

    // Extrair descrição (entre data e valor)
    const dateIndex = line.indexOf(dateMatch);
    const amountIndex = line.indexOf(amountMatch[1]);
    const description = line.substring(dateIndex + dateMatch.length, amountIndex).trim();

    if (!description) continue;

    // Detectar parcelamento
    const installmentMatch = description.match(/(\d{2})\/(\d{2})\s*$/);

    transactions.push({
      date: normalizeDate(dateMatch),
      description: description.replace(/\s*\d{2}\/\d{2}\s*$/, '').trim(),
      amount: parseAmount(amountMatch[1]),
      type: "expense", // Será determinado pela IA
      mode: installmentMatch ? "parcelada" : "avulsa",
      installment_number: installmentMatch ? parseInt(installmentMatch[1]) : null,
      installments_total: installmentMatch ? parseInt(installmentMatch[2]) : null,
    });
  }

  return transactions;
}

/**
 * Parser principal que escolhe o melhor método
 */
export function parseStatement(text: string): ParserResult {
  const bank = detectBank(text);
  const statementType = detectStatementType(text);

  let transactions: ParsedTransaction[] = [];
  let confidence = 0;
  let parsingMethod: "regex" | "hybrid" = "regex";

  // Tentar parser específico do banco
  if (bank === "Bradesco") {
    transactions = parseBradesco(text, statementType);
    confidence = transactions.length > 0 ? 0.95 : 0;
  }

  // Fallback para parser genérico se necessário
  if (transactions.length === 0) {
    transactions = parseGeneric(text, statementType);
    confidence = transactions.length > 0 ? 0.7 : 0;
    parsingMethod = "hybrid";
  }

  return {
    transactions,
    bank,
    statementType,
    metadata: {
      totalTransactions: transactions.length,
      parsingMethod,
      confidence,
    },
  };
}
