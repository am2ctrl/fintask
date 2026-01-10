/**
 * Parser inteligente para extratos bancários brasileiros
 * Suporta: Bradesco, Nubank, Inter, Itaú, BTG, Santander, C6 Bank, Cora
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
export function detectBank(text: string): string {
  const textLower = text.toLowerCase();

  // Nubank - verificar primeiro pois é muito comum
  if (/nubank|nu pagamentos/i.test(text) || /roxinho|nu s\.a/i.test(text)) {
    return "Nubank";
  }

  // Inter
  if (/banco inter|inter s\.?a|intermedium/i.test(text)) {
    return "Inter";
  }

  // Itaú
  if (/ita[uú]|itau unibanco/i.test(text)) {
    return "Itaú";
  }

  // BTG
  if (/btg pactual|btg banking/i.test(text)) {
    return "BTG";
  }

  // Santander
  if (/santander/i.test(text)) {
    return "Santander";
  }

  // C6 Bank
  if (/c6 bank|c6 s\.?a/i.test(text)) {
    return "C6 Bank";
  }

  // Cora
  if (/cora scm|cora s\.?a|cora\.com/i.test(text)) {
    return "Cora";
  }

  // Bradesco - verificar por último (nome muito genérico)
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
    /vencimento da fatura/i,
    /pagamento mínimo/i,
    /crédito rotativo/i,
  ];

  const checkingKeywords = [
    /extrato/i,
    /conta corrente/i,
    /saldo anterior/i,
    /débitos/i,
    /créditos/i,
    /saldo disponível/i,
    /cheque especial/i,
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

// ========================================
// PARSERS ESPECÍFICOS POR BANCO
// ========================================

/**
 * Parser para Nubank
 */
export function parseNubank(text: string, type: "credit_card" | "checking"): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const processedLines = new Set<string>();

  if (type === "credit_card") {
    // Nubank fatura: DD MMM DESCRIÇÃO VALOR (ex: "15 JAN AMAZON BR 77,98")
    // Também: DD/MM DESCRIÇÃO VALOR
    const patterns = [
      // Padrão 1: DD MMM DESCRIÇÃO VALOR
      /(\d{1,2})\s+(JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ)\s+(.+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})/gi,
      // Padrão 2: DD/MM DESCRIÇÃO VALOR
      /(\d{2})\/(\d{2})\s+(.+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        let dateStr: string;
        let description: string;
        let amountStr: string;

        if (pattern.source.includes("JAN|FEV")) {
          // Padrão com mês por extenso
          const [, day, monthName, desc, amount] = match;
          const monthMap: Record<string, string> = {
            'JAN': '01', 'FEV': '02', 'MAR': '03', 'ABR': '04',
            'MAI': '05', 'JUN': '06', 'JUL': '07', 'AGO': '08',
            'SET': '09', 'OUT': '10', 'NOV': '11', 'DEZ': '12'
          };
          dateStr = `${day.padStart(2, '0')}/${monthMap[monthName.toUpperCase()]}`;
          description = desc;
          amountStr = amount;
        } else {
          // Padrão DD/MM
          const [, day, month, desc, amount] = match;
          dateStr = `${day}/${month}`;
          description = desc;
          amountStr = amount;
        }

        const lineKey = `${dateStr}-${description.substring(0, 30)}-${amountStr}`;
        if (processedLines.has(lineKey)) continue;
        processedLines.add(lineKey);

        // Pular linhas de total/pagamento
        if (/total|pagamento|ajuste|encargos|iof|juros/i.test(description)) continue;

        // Limpar descrição
        let cleanDescription = cleanTransactionDescription(description);
        if (!cleanDescription || cleanDescription.length < 3) continue;

        // Detectar parcelamento
        const installmentMatch = cleanDescription.match(/(\d{1,2})\/(\d{1,2})\s*$/);
        if (installmentMatch) {
          cleanDescription = cleanDescription.replace(/\s*\d{1,2}\/\d{1,2}\s*$/, '').trim();
        }

        // Nubank usa valores negativos para estornos
        const amount = parseAmount(amountStr);
        const isRefund = amount < 0 || /estorno|devolução|reembolso/i.test(description);

        transactions.push({
          date: parseDateDDMM(dateStr),
          description: cleanDescription,
          amount: Math.abs(amount),
          type: isRefund ? "income" : "expense",
          mode: installmentMatch ? "parcelada" : "avulsa",
          installment_number: installmentMatch ? parseInt(installmentMatch[1]) : null,
          installments_total: installmentMatch ? parseInt(installmentMatch[2]) : null,
          card_last_digits: null,
          card_holder_name: null,
        });
      }
    }
  } else {
    // Conta corrente Nubank
    // Padrão: DD/MM/YYYY ou DD/MM + DESCRIÇÃO + VALOR (com + ou -)
    const pattern = /(\d{2}\/\d{2}(?:\/\d{4})?)\s+(.+?)\s+([+-]?\s*\d{1,3}(?:\.\d{3})*,\d{2})/g;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      const [, dateStr, description, amountStr] = match;

      const lineKey = `${dateStr}-${description.substring(0, 30)}-${amountStr}`;
      if (processedLines.has(lineKey)) continue;
      processedLines.add(lineKey);

      if (/saldo|total|data|descrição/i.test(description)) continue;

      const cleanDescription = cleanTransactionDescription(description);
      if (!cleanDescription || cleanDescription.length < 3) continue;

      const amount = parseAmount(amountStr.replace(/\s/g, ''));
      const isIncome = amountStr.includes('+') || amount > 0;

      transactions.push({
        date: normalizeDateString(dateStr),
        description: cleanDescription,
        amount: Math.abs(amount),
        type: isIncome ? "income" : "expense",
        mode: "avulsa",
        installment_number: null,
        installments_total: null,
        card_last_digits: null,
        card_holder_name: null,
      });
    }
  }

  logger.debug(`   📊 parseNubank: ${transactions.length} transações extraídas`);
  return transactions;
}

/**
 * Parser para Inter
 */
export function parseInter(text: string, type: "credit_card" | "checking"): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const processedLines = new Set<string>();

  if (type === "credit_card") {
    // Inter fatura: DD/MM DESCRIÇÃO VALOR ou DD MMM DESCRIÇÃO VALOR
    const patterns = [
      /(\d{2}\/\d{2})\s+(.+?)\s+R?\$?\s*(\d{1,3}(?:\.\d{3})*,\d{2})/g,
      /(\d{1,2})\s+(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\s+(.+?)\s+R?\$?\s*(\d{1,3}(?:\.\d{3})*,\d{2})/gi,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        let dateStr: string;
        let description: string;
        let amountStr: string;

        if (match.length === 5) {
          // Padrão com mês por extenso
          const [, day, monthName, desc, amount] = match;
          const monthMap: Record<string, string> = {
            'jan': '01', 'fev': '02', 'mar': '03', 'abr': '04',
            'mai': '05', 'jun': '06', 'jul': '07', 'ago': '08',
            'set': '09', 'out': '10', 'nov': '11', 'dez': '12'
          };
          dateStr = `${day.padStart(2, '0')}/${monthMap[monthName.toLowerCase()]}`;
          description = desc;
          amountStr = amount;
        } else {
          [, dateStr, description, amountStr] = match;
        }

        const lineKey = `${dateStr}-${description.substring(0, 30)}-${amountStr}`;
        if (processedLines.has(lineKey)) continue;
        processedLines.add(lineKey);

        if (/total|pagamento|limite|disponível/i.test(description)) continue;

        let cleanDescription = cleanTransactionDescription(description);
        if (!cleanDescription || cleanDescription.length < 3) continue;

        const installmentMatch = cleanDescription.match(/(\d{1,2})\/(\d{1,2})\s*$/);
        if (installmentMatch) {
          cleanDescription = cleanDescription.replace(/\s*\d{1,2}\/\d{1,2}\s*$/, '').trim();
        }

        const isRefund = /estorno|devolução|cashback/i.test(description);

        transactions.push({
          date: parseDateDDMM(dateStr),
          description: cleanDescription,
          amount: parseAmount(amountStr),
          type: isRefund ? "income" : "expense",
          mode: installmentMatch ? "parcelada" : "avulsa",
          installment_number: installmentMatch ? parseInt(installmentMatch[1]) : null,
          installments_total: installmentMatch ? parseInt(installmentMatch[2]) : null,
          card_last_digits: null,
          card_holder_name: null,
        });
      }
    }
  } else {
    // Conta corrente Inter - Formato novo (PDF exportado)
    // Formato: "4 de Janeiro de 2025 Saldo do dia: R$ 6.000,06"
    // Seguido de linhas como: "Pix recebido: "Cp :76059997-Maria De Araujo Silva" R$ 6.000,00 R$ 6.000,06"

    // Primeiro, tentar o formato novo do Inter (com datas por extenso)
    const newFormatTransactions = parseInterNewFormat(text);
    if (newFormatTransactions.length > 0) {
      logger.debug(`   📊 parseInter (novo formato): ${newFormatTransactions.length} transações extraídas`);
      return newFormatTransactions;
    }

    // Fallback: formato antigo DD/MM/YYYY
    const pattern = /(\d{2}\/\d{2}(?:\/\d{4})?)\s+(.+?)\s+([+-]?\s*R?\$?\s*\d{1,3}(?:\.\d{3})*,\d{2})/g;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      const [, dateStr, description, amountStr] = match;

      const lineKey = `${dateStr}-${description.substring(0, 30)}-${amountStr}`;
      if (processedLines.has(lineKey)) continue;
      processedLines.add(lineKey);

      if (/saldo|total|data|descrição|anterior/i.test(description)) continue;

      const cleanDescription = cleanTransactionDescription(description);
      if (!cleanDescription || cleanDescription.length < 3) continue;

      const cleanAmount = amountStr.replace(/[R$\s]/g, '');
      const amount = parseAmount(cleanAmount);
      const isIncome = cleanAmount.includes('+') ||
                       /pix recebido|transferência recebida|crédito|ted recebida/i.test(description);

      transactions.push({
        date: normalizeDateString(dateStr),
        description: cleanDescription,
        amount: Math.abs(amount),
        type: isIncome ? "income" : "expense",
        mode: "avulsa",
        installment_number: null,
        installments_total: null,
        card_last_digits: null,
        card_holder_name: null,
      });
    }
  }

  logger.debug(`   📊 parseInter: ${transactions.length} transações extraídas`);
  return transactions;
}

/**
 * Parser para o novo formato de extrato do Banco Inter
 * Formato: "4 de Janeiro de 2025 Saldo do dia: R$ 6.000,06"
 * Transações: "Pix recebido: "Cp :76059997-Nome" R$ 6.000,00 R$ 6.000,06"
 */
function parseInterNewFormat(text: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const processedLines = new Set<string>();

  const monthMap: Record<string, string> = {
    'janeiro': '01', 'fevereiro': '02', 'março': '03', 'marco': '03', 'abril': '04',
    'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
    'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
  };

  // Regex para capturar datas no formato "4 de Janeiro de 2025"
  const dateHeaderPattern = /(\d{1,2})\s+de\s+(janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+(\d{4})/gi;

  // Dividir o texto por seções de data
  const sections: { date: string; content: string }[] = [];
  let lastIndex = 0;
  let lastDate = '';

  let dateMatch;
  const dateMatches: { index: number; date: string }[] = [];

  while ((dateMatch = dateHeaderPattern.exec(text)) !== null) {
    const [, day, monthName, year] = dateMatch;
    const month = monthMap[monthName.toLowerCase()];
    const formattedDate = `${year}-${month}-${day.padStart(2, '0')}`;
    dateMatches.push({ index: dateMatch.index, date: formattedDate });
  }

  // Criar seções baseadas nas datas encontradas
  for (let i = 0; i < dateMatches.length; i++) {
    const startIndex = dateMatches[i].index;
    const endIndex = i < dateMatches.length - 1 ? dateMatches[i + 1].index : text.length;
    sections.push({
      date: dateMatches[i].date,
      content: text.substring(startIndex, endIndex)
    });
  }

  // Processar cada seção
  for (const section of sections) {
    // Padrões para diferentes tipos de transação do Inter
    const transactionPatterns = [
      // Pix recebido/enviado: "Pix recebido: "Cp :76059997-Nome" R$ 6.000,00 R$ saldo"
      // ou "Pix enviado: "00019 65272790 NOME" -R$ 6.000,00 R$ saldo"
      /(?:Pix\s+(?:recebido|enviado)(?:\s+devolvido)?)[:\s]+[""]([^""]+)[""]?\s+(-?R\$\s*[\d.,]+)\s+(?:-?R\$\s*[\d.,]+)?/gi,

      // Pagamento efetuado: "Pagamento efetuado CARVALHO CONTABILIDADE LTDA -R$ 250,00 R$ saldo"
      // ou "Pagamento efetuado: "Civic" -R$ 3.785,86"
      /Pagamento\s+(?:efetuado|de\s+(?:Convenio|Titulo(?:\s+-\s+Inter)?)|Darf\s+Numerado|Simples\s+Nacional)[:\s]+[""]?([^""]+?)[""]?\s+(-R\$\s*[\d.,]+)/gi,
    ];

    for (const pattern of transactionPatterns) {
      let match;
      while ((match = pattern.exec(section.content)) !== null) {
        const [fullMatch, rawDescription, amountStr] = match;

        // Extrair descrição limpa
        let description = rawDescription.trim();

        // Para Pix, extrair nome do destinatário/remetente
        // Formato: "Cp :76059997-Nome Completo" ou "00019 65272790 NOME"
        const pixNameMatch = description.match(/(?:Cp\s*:\s*\d+-)?(.+)/i);
        if (pixNameMatch) {
          description = pixNameMatch[1].trim();
        }

        // Remover códigos numéricos iniciais
        description = description.replace(/^\d+\s+\d+\s+/, '').trim();

        // Determinar tipo baseado na descrição original
        const isIncome = /recebido/i.test(fullMatch) && !/devolvido/i.test(fullMatch);
        const isRefundedReceived = /recebido\s+devolvido/i.test(fullMatch); // PIX que foi devolvido (saída)

        // Limpar e parsear valor
        const cleanAmount = amountStr.replace(/[R$\s]/g, '').replace('.', '').replace(',', '.');
        const amount = Math.abs(parseFloat(cleanAmount));

        if (isNaN(amount) || amount === 0) continue;
        if (!description || description.length < 2) continue;

        // Criar chave única para evitar duplicatas
        const lineKey = `${section.date}-${description.substring(0, 30)}-${amount.toFixed(2)}`;
        if (processedLines.has(lineKey)) continue;
        processedLines.add(lineKey);

        // Pular linhas que são claramente não-transações
        if (/saldo\s+do\s+dia|saldo\s+disponível|saldo\s+bloqueado|fale\s+com\s+a\s+gente|sac:|ouvidoria:/i.test(description)) continue;

        // Determinar tipo final
        let type: "income" | "expense";
        if (isRefundedReceived) {
          type = "expense"; // PIX recebido que foi devolvido é uma saída
        } else if (isIncome) {
          type = "income";
        } else {
          type = "expense";
        }

        transactions.push({
          date: section.date,
          description: description,
          amount: amount,
          type: type,
          mode: "avulsa",
          installment_number: null,
          installments_total: null,
          card_last_digits: null,
          card_holder_name: null,
        });
      }
    }
  }

  return transactions;
}

/**
 * Parser para Itaú
 */
export function parseItau(text: string, type: "credit_card" | "checking"): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const processedLines = new Set<string>();

  if (type === "credit_card") {
    // Itaú fatura: DD/MM DESCRIÇÃO VALOR
    // Itaú também usa: DESCRIÇÃO DD/MM VALOR em alguns formatos
    const patterns = [
      /(\d{2}\/\d{2})\s+(.+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})\s*$/gm,
      /(.+?)\s+(\d{2}\/\d{2})\s+(\d{1,3}(?:\.\d{3})*,\d{2})\s*$/gm,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        let dateStr: string;
        let description: string;
        let amountStr: string;

        // Determinar qual grupo é a data
        if (/^\d{2}\/\d{2}$/.test(match[1])) {
          [, dateStr, description, amountStr] = match;
        } else {
          [, description, dateStr, amountStr] = match;
        }

        const lineKey = `${dateStr}-${description.substring(0, 30)}-${amountStr}`;
        if (processedLines.has(lineKey)) continue;
        processedLines.add(lineKey);

        if (/total|pagamento|saldo|crédito anterior|encargos/i.test(description)) continue;

        let cleanDescription = cleanTransactionDescription(description);
        if (!cleanDescription || cleanDescription.length < 3) continue;

        const installmentMatch = cleanDescription.match(/(\d{1,2})\/(\d{1,2})\s*$/);
        if (installmentMatch) {
          cleanDescription = cleanDescription.replace(/\s*\d{1,2}\/\d{1,2}\s*$/, '').trim();
        }

        const isRefund = /estorno|credito|devolução/i.test(description);

        transactions.push({
          date: parseDateDDMM(dateStr),
          description: cleanDescription,
          amount: parseAmount(amountStr),
          type: isRefund ? "income" : "expense",
          mode: installmentMatch ? "parcelada" : "avulsa",
          installment_number: installmentMatch ? parseInt(installmentMatch[1]) : null,
          installments_total: installmentMatch ? parseInt(installmentMatch[2]) : null,
          card_last_digits: null,
          card_holder_name: null,
        });
      }
    }
  } else {
    // Conta corrente Itaú
    const pattern = /(\d{2}\/\d{2}(?:\/\d{4})?)\s+(.+?)\s+([+-]?\s*\d{1,3}(?:\.\d{3})*,\d{2})\s*([CD])?/g;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      const [, dateStr, description, amountStr, creditDebit] = match;

      const lineKey = `${dateStr}-${description.substring(0, 30)}-${amountStr}`;
      if (processedLines.has(lineKey)) continue;
      processedLines.add(lineKey);

      if (/saldo|total|data|lançamento|anterior/i.test(description)) continue;

      const cleanDescription = cleanTransactionDescription(description);
      if (!cleanDescription || cleanDescription.length < 3) continue;

      const amount = parseAmount(amountStr.replace(/\s/g, ''));
      // Itaú usa C para crédito e D para débito
      const isIncome = creditDebit === 'C' || amountStr.includes('+') ||
                       /pix recebido|ted recebida|crédito|depósito/i.test(description);

      transactions.push({
        date: normalizeDateString(dateStr),
        description: cleanDescription,
        amount: Math.abs(amount),
        type: isIncome ? "income" : "expense",
        mode: "avulsa",
        installment_number: null,
        installments_total: null,
        card_last_digits: null,
        card_holder_name: null,
      });
    }
  }

  logger.debug(`   📊 parseItau: ${transactions.length} transações extraídas`);
  return transactions;
}

/**
 * Parser para BTG
 */
export function parseBTG(text: string, type: "credit_card" | "checking"): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const processedLines = new Set<string>();

  // BTG usa formato padrão: DD/MM ou DD/MM/YYYY DESCRIÇÃO VALOR
  const patterns = [
    /(\d{2}\/\d{2}(?:\/\d{4})?)\s+(.+?)\s+R?\$?\s*([+-]?\d{1,3}(?:\.\d{3})*,\d{2})/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const [, dateStr, description, amountStr] = match;

      const lineKey = `${dateStr}-${description.substring(0, 30)}-${amountStr}`;
      if (processedLines.has(lineKey)) continue;
      processedLines.add(lineKey);

      if (/saldo|total|data|descrição|limite/i.test(description)) continue;

      let cleanDescription = cleanTransactionDescription(description);
      if (!cleanDescription || cleanDescription.length < 3) continue;

      if (type === "credit_card") {
        const installmentMatch = cleanDescription.match(/(\d{1,2})\/(\d{1,2})\s*$/);
        if (installmentMatch) {
          cleanDescription = cleanDescription.replace(/\s*\d{1,2}\/\d{1,2}\s*$/, '').trim();
        }

        const isRefund = /estorno|devolução|cashback/i.test(description);

        transactions.push({
          date: normalizeDateString(dateStr),
          description: cleanDescription,
          amount: Math.abs(parseAmount(amountStr)),
          type: isRefund ? "income" : "expense",
          mode: installmentMatch ? "parcelada" : "avulsa",
          installment_number: installmentMatch ? parseInt(installmentMatch[1]) : null,
          installments_total: installmentMatch ? parseInt(installmentMatch[2]) : null,
          card_last_digits: null,
          card_holder_name: null,
        });
      } else {
        const amount = parseAmount(amountStr);
        const isIncome = amountStr.includes('+') ||
                         /recebido|crédito|ted recebida|pix recebido/i.test(description);

        transactions.push({
          date: normalizeDateString(dateStr),
          description: cleanDescription,
          amount: Math.abs(amount),
          type: isIncome ? "income" : "expense",
          mode: "avulsa",
          installment_number: null,
          installments_total: null,
          card_last_digits: null,
          card_holder_name: null,
        });
      }
    }
  }

  logger.debug(`   📊 parseBTG: ${transactions.length} transações extraídas`);
  return transactions;
}

/**
 * Parser para Santander
 */
export function parseSantander(text: string, type: "credit_card" | "checking"): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const processedLines = new Set<string>();

  if (type === "credit_card") {
    // Santander fatura: DD/MM DESCRIÇÃO VALOR (pode ter cidade no meio)
    const pattern = /(\d{2}\/\d{2})\s+(.+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})/g;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      const [, dateStr, description, amountStr] = match;

      const lineKey = `${dateStr}-${description.substring(0, 30)}-${amountStr}`;
      if (processedLines.has(lineKey)) continue;
      processedLines.add(lineKey);

      if (/total|pagamento|saldo|encargos|iof|juros/i.test(description)) continue;

      let cleanDescription = cleanTransactionDescription(description);
      if (!cleanDescription || cleanDescription.length < 3) continue;

      const installmentMatch = cleanDescription.match(/(\d{1,2})\/(\d{1,2})\s*$/);
      if (installmentMatch) {
        cleanDescription = cleanDescription.replace(/\s*\d{1,2}\/\d{1,2}\s*$/, '').trim();
      }

      const isRefund = /estorno|devolução|crédito/i.test(description);

      transactions.push({
        date: parseDateDDMM(dateStr),
        description: cleanDescription,
        amount: parseAmount(amountStr),
        type: isRefund ? "income" : "expense",
        mode: installmentMatch ? "parcelada" : "avulsa",
        installment_number: installmentMatch ? parseInt(installmentMatch[1]) : null,
        installments_total: installmentMatch ? parseInt(installmentMatch[2]) : null,
        card_last_digits: null,
        card_holder_name: null,
      });
    }
  } else {
    // Conta corrente Santander
    const pattern = /(\d{2}\/\d{2}(?:\/\d{4})?)\s+(.+?)\s+([+-]?\s*\d{1,3}(?:\.\d{3})*,\d{2})/g;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      const [, dateStr, description, amountStr] = match;

      const lineKey = `${dateStr}-${description.substring(0, 30)}-${amountStr}`;
      if (processedLines.has(lineKey)) continue;
      processedLines.add(lineKey);

      if (/saldo|total|data|descrição|anterior/i.test(description)) continue;

      const cleanDescription = cleanTransactionDescription(description);
      if (!cleanDescription || cleanDescription.length < 3) continue;

      const amount = parseAmount(amountStr.replace(/\s/g, ''));
      const isIncome = amountStr.includes('+') ||
                       /pix recebido|ted recebida|crédito|depósito/i.test(description);

      transactions.push({
        date: normalizeDateString(dateStr),
        description: cleanDescription,
        amount: Math.abs(amount),
        type: isIncome ? "income" : "expense",
        mode: "avulsa",
        installment_number: null,
        installments_total: null,
        card_last_digits: null,
        card_holder_name: null,
      });
    }
  }

  logger.debug(`   📊 parseSantander: ${transactions.length} transações extraídas`);
  return transactions;
}

/**
 * Parser para C6 Bank
 */
export function parseC6Bank(text: string, type: "credit_card" | "checking"): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const processedLines = new Set<string>();

  // C6 usa formato similar: DD/MM DESCRIÇÃO VALOR ou DD MMM DESCRIÇÃO VALOR
  const patterns = [
    /(\d{2}\/\d{2}(?:\/\d{4})?)\s+(.+?)\s+R?\$?\s*([+-]?\d{1,3}(?:\.\d{3})*,\d{2})/g,
    /(\d{1,2})\s+(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\s+(.+?)\s+R?\$?\s*(\d{1,3}(?:\.\d{3})*,\d{2})/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      let dateStr: string;
      let description: string;
      let amountStr: string;

      if (match.length === 5) {
        const [, day, monthName, desc, amount] = match;
        const monthMap: Record<string, string> = {
          'jan': '01', 'fev': '02', 'mar': '03', 'abr': '04',
          'mai': '05', 'jun': '06', 'jul': '07', 'ago': '08',
          'set': '09', 'out': '10', 'nov': '11', 'dez': '12'
        };
        dateStr = `${day.padStart(2, '0')}/${monthMap[monthName.toLowerCase()]}`;
        description = desc;
        amountStr = amount;
      } else {
        [, dateStr, description, amountStr] = match;
      }

      const lineKey = `${dateStr}-${description.substring(0, 30)}-${amountStr}`;
      if (processedLines.has(lineKey)) continue;
      processedLines.add(lineKey);

      if (/saldo|total|data|descrição|limite/i.test(description)) continue;

      let cleanDescription = cleanTransactionDescription(description);
      if (!cleanDescription || cleanDescription.length < 3) continue;

      if (type === "credit_card") {
        const installmentMatch = cleanDescription.match(/(\d{1,2})\/(\d{1,2})\s*$/);
        if (installmentMatch) {
          cleanDescription = cleanDescription.replace(/\s*\d{1,2}\/\d{1,2}\s*$/, '').trim();
        }

        const isRefund = /estorno|devolução|cashback|átomos/i.test(description);

        transactions.push({
          date: normalizeDateString(dateStr),
          description: cleanDescription,
          amount: Math.abs(parseAmount(amountStr)),
          type: isRefund ? "income" : "expense",
          mode: installmentMatch ? "parcelada" : "avulsa",
          installment_number: installmentMatch ? parseInt(installmentMatch[1]) : null,
          installments_total: installmentMatch ? parseInt(installmentMatch[2]) : null,
          card_last_digits: null,
          card_holder_name: null,
        });
      } else {
        const amount = parseAmount(amountStr);
        const isIncome = amountStr.includes('+') ||
                         /recebido|crédito|ted recebida|pix recebido/i.test(description);

        transactions.push({
          date: normalizeDateString(dateStr),
          description: cleanDescription,
          amount: Math.abs(amount),
          type: isIncome ? "income" : "expense",
          mode: "avulsa",
          installment_number: null,
          installments_total: null,
          card_last_digits: null,
          card_holder_name: null,
        });
      }
    }
  }

  logger.debug(`   📊 parseC6Bank: ${transactions.length} transações extraídas`);
  return transactions;
}

/**
 * Parser para Cora (banco digital para empresas - só conta corrente)
 */
export function parseCora(text: string, type: "credit_card" | "checking"): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const processedLines = new Set<string>();

  // Cora é banco para empresas, normalmente só extrato de conta
  const pattern = /(\d{2}\/\d{2}(?:\/\d{4})?)\s+(.+?)\s+R?\$?\s*([+-]?\d{1,3}(?:\.\d{3})*,\d{2})/g;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    const [, dateStr, description, amountStr] = match;

    const lineKey = `${dateStr}-${description.substring(0, 30)}-${amountStr}`;
    if (processedLines.has(lineKey)) continue;
    processedLines.add(lineKey);

    if (/saldo|total|data|descrição|anterior/i.test(description)) continue;

    const cleanDescription = cleanTransactionDescription(description);
    if (!cleanDescription || cleanDescription.length < 3) continue;

    const amount = parseAmount(amountStr);
    const isIncome = amountStr.includes('+') ||
                     /recebido|crédito|ted recebida|pix recebido|boleto pago/i.test(description);

    transactions.push({
      date: normalizeDateString(dateStr),
      description: cleanDescription,
      amount: Math.abs(amount),
      type: isIncome ? "income" : "expense",
      mode: "avulsa",
      installment_number: null,
      installments_total: null,
      card_last_digits: null,
      card_holder_name: null,
    });
  }

  logger.debug(`   📊 parseCora: ${transactions.length} transações extraídas`);
  return transactions;
}

/**
 * Parser para Bradesco
 */
export function parseBradesco(text: string, type: "credit_card" | "checking"): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];

  if (type === "credit_card") {
    // Primeiro, detectar seções de cartão
    const cardSections = detectBradescoCardSections(text);

    if (cardSections.length > 0) {
      for (const section of cardSections) {
        logger.debug(`   🔍 Processando seção do cartão ${section.lastDigits} (${section.holderName})...`);

        const transactionPattern = /(\d{2}\/\d{2})\s+(.+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})/g;
        let match;
        const processedLines = new Set<string>();

        while ((match = transactionPattern.exec(section.text)) !== null) {
          const [, dateStr, description, amountStr] = match;

          const lineKey = `${dateStr}-${description.substring(0, 30)}-${amountStr}`;
          if (processedLines.has(lineKey)) continue;
          processedLines.add(lineKey);

          if (/total|subtotal|pagto|pagamento|data|histórico|lançamento|vencimento/i.test(description)) continue;

          let cleanDescription = cleanTransactionDescription(description);
          const installmentMatch = cleanDescription.match(/(\d{2})\/(\d{2})\s*$/);
          cleanDescription = cleanDescription.replace(/\s*\d{2}\/\d{2}\s*$/, '').trim();

          if (!cleanDescription || cleanDescription.length < 3) continue;

          transactions.push({
            date: parseDateDDMM(dateStr),
            description: cleanDescription,
            amount: parseAmount(amountStr),
            type: "expense",
            mode: installmentMatch ? "parcelada" : "avulsa",
            installment_number: installmentMatch ? parseInt(installmentMatch[1]) : null,
            installments_total: installmentMatch ? parseInt(installmentMatch[2]) : null,
            card_last_digits: section.lastDigits || null,
            card_holder_name: section.holderName || null,
          });
        }
      }
    } else {
      // Fallback: processar sem separar por cartão
      const transactionPattern = /(\d{2}\/\d{2})\s+(.+?)\s+(\d{1,3}(?:\.\d{3})*,\d{2})/g;
      let match;
      const processedLines = new Set<string>();

      while ((match = transactionPattern.exec(text)) !== null) {
        const [, dateStr, description, amountStr] = match;

        const lineKey = `${dateStr}-${description.substring(0, 30)}-${amountStr}`;
        if (processedLines.has(lineKey)) continue;
        processedLines.add(lineKey);

        if (/total|subtotal|pagto|pagamento|data|histórico|lançamento|vencimento/i.test(description)) continue;

        let cleanDescription = cleanTransactionDescription(description);
        const installmentMatch = cleanDescription.match(/(\d{2})\/(\d{2})\s*$/);
        cleanDescription = cleanDescription.replace(/\s*\d{2}\/\d{2}\s*$/, '').trim();

        if (!cleanDescription || cleanDescription.length < 3) continue;

        transactions.push({
          date: parseDateDDMM(dateStr),
          description: cleanDescription,
          amount: parseAmount(amountStr),
          type: "expense",
          mode: installmentMatch ? "parcelada" : "avulsa",
          installment_number: installmentMatch ? parseInt(installmentMatch[1]) : null,
          installments_total: installmentMatch ? parseInt(installmentMatch[2]) : null,
          card_last_digits: null,
          card_holder_name: null,
        });
      }
    }
  } else {
    // Conta corrente Bradesco
    const pattern = /(\d{2}\/\d{2}(?:\/\d{4})?)\s+(.+?)\s+([+-]?\s*\d{1,3}(?:\.\d{3})*,\d{2})\s*([CD])?/g;
    let match;
    const processedLines = new Set<string>();

    while ((match = pattern.exec(text)) !== null) {
      const [, dateStr, description, amountStr, creditDebit] = match;

      const lineKey = `${dateStr}-${description.substring(0, 30)}-${amountStr}`;
      if (processedLines.has(lineKey)) continue;
      processedLines.add(lineKey);

      if (/saldo|total|data|lançamento|anterior/i.test(description)) continue;

      const cleanDescription = cleanTransactionDescription(description);
      if (!cleanDescription || cleanDescription.length < 3) continue;

      const amount = parseAmount(amountStr.replace(/\s/g, ''));
      const isIncome = creditDebit === 'C' || amountStr.includes('+') ||
                       /pix recebido|ted recebida|crédito|depósito/i.test(description);

      transactions.push({
        date: normalizeDateString(dateStr),
        description: cleanDescription,
        amount: Math.abs(amount),
        type: isIncome ? "income" : "expense",
        mode: "avulsa",
        installment_number: null,
        installments_total: null,
        card_last_digits: null,
        card_holder_name: null,
      });
    }
  }

  logger.debug(`   📊 parseBradesco: ${transactions.length} transações extraídas`);
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

  const cardPattern = /Número do Cartão\s+(?:\d{4}|XXXX)\s+(?:XXXX|\d{4})\s+(?:XXXX|\d{4})\s+(?:XXXX|\d{4})\s+(\d{4})/gi;
  const holderPattern = /Total para\s+([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]+?)(?:\s|$|\n)/gi;

  const cardMatches = Array.from(text.matchAll(cardPattern));
  const holderMatches = Array.from(text.matchAll(holderPattern));

  logger.debug(`   🔍 Detectadas ${cardMatches.length} seções de cartão e ${holderMatches.length} titulares`);

  for (let i = 0; i < cardMatches.length; i++) {
    const cardMatch = cardMatches[i];
    const cardIndex = cardMatch.index!;

    let closestHolder: RegExpMatchArray | null = null;
    let closestDistance = Infinity;

    for (const holderMatch of holderMatches) {
      const holderIndex = holderMatch.index!;
      if (holderIndex > cardIndex) {
        const distance = holderIndex - cardIndex;
        if (distance < closestDistance) {
          closestDistance = distance;
          closestHolder = holderMatch;
        }
      }
    }

    if (!closestHolder) {
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

    const startIndex = closestHolder.index! + closestHolder[0].length;
    let endIndex = text.length;

    if (i < cardMatches.length - 1) {
      endIndex = cardMatches[i + 1].index!;
    } else {
      const nextTotalMatch = text.indexOf("Total da fatura", startIndex);
      if (nextTotalMatch > startIndex) {
        endIndex = nextTotalMatch;
      }
    }

    sections.push({
      lastDigits,
      holderName,
      text: text.substring(startIndex, endIndex).trim(),
    });
  }

  return sections;
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Limpa descrição de transação removendo cidade e caracteres extras
 */
function cleanTransactionDescription(description: string): string {
  let clean = description.trim();

  // Remover cidade no final (palavras maiúsculas)
  clean = clean.replace(/\s+[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]{2,}(\s+[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]{2,}){0,2}\s*$/, '').trim();

  // Remover asteriscos e caracteres especiais repetidos
  clean = clean.replace(/\*+/g, ' ').trim();
  clean = clean.replace(/\s{2,}/g, ' ');

  return clean;
}

/**
 * Converte data DD/MM para YYYY-MM-DD
 */
function parseDateDDMM(dateStr: string): string {
  const [day, month] = dateStr.split('/');
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const year = parseInt(month) > currentMonth ? currentYear - 1 : currentYear;

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Normaliza string de data para YYYY-MM-DD
 */
function normalizeDateString(dateStr: string): string {
  // Se já tem ano (DD/MM/YYYY)
  if (/\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  }

  // Se só tem DD/MM
  if (/\d{2}\/\d{2}/.test(dateStr)) {
    return parseDateDDMM(dateStr);
  }

  // Tentar normalização genérica
  return normalizeDate(dateStr);
}

/**
 * Converte valor brasileiro para número
 */
function parseAmount(amountStr: string): number {
  const cleaned = amountStr.replace(/[R$\s]/g, '');
  const isNegative = cleaned.startsWith('-');
  const absolute = cleaned.replace(/^[+-]/, '');
  const value = parseFloat(absolute.replace(/\./g, '').replace(',', '.'));
  return isNegative ? -value : value;
}

/**
 * Parser genérico UNIVERSAL para extratos brasileiros
 * Reconhece qualquer formato de banco brasileiro
 */
export function parseGeneric(text: string, type: "credit_card" | "checking"): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const processedLines = new Set<string>();

  // ========================================
  // ESTRATÉGIA 1: Extratos com datas por extenso
  // Formato: "4 de Janeiro de 2025" seguido de transações
  // ========================================
  const extensoTransactions = parseExtenseDateFormat(text, type);
  if (extensoTransactions.length > 0) {
    logger.debug(`   📊 parseGeneric (formato extenso): ${extensoTransactions.length} transações`);
    return extensoTransactions;
  }

  // ========================================
  // ESTRATÉGIA 2: Padrões tradicionais de extrato
  // ========================================
  const patterns = [
    // Padrão 1: DD/MM/YYYY DESCRIÇÃO VALOR
    /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+R?\$?\s*([+-]?\d{1,3}(?:\.\d{3})*,\d{2})/g,
    // Padrão 2: DD/MM DESCRIÇÃO VALOR
    /(\d{2}\/\d{2})\s+(.+?)\s+R?\$?\s*([+-]?\d{1,3}(?:\.\d{3})*,\d{2})/g,
    // Padrão 3: YYYY-MM-DD DESCRIÇÃO VALOR
    /(\d{4}-\d{2}-\d{2})\s+(.+?)\s+R?\$?\s*([+-]?\d{1,3}(?:\.\d{3})*,\d{2})/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const [, dateStr, description, amountStr] = match;

      const lineKey = `${dateStr}-${description.substring(0, 30)}-${amountStr}`;
      if (processedLines.has(lineKey)) continue;
      processedLines.add(lineKey);

      // Pular cabeçalhos e totais
      if (/^(data|valor|descrição|total|saldo|anterior|limite)$/i.test(description.trim())) continue;

      let cleanDescription = cleanTransactionDescription(description);
      if (!cleanDescription || cleanDescription.length < 3) continue;

      if (type === "credit_card") {
        const installmentMatch = cleanDescription.match(/(\d{1,2})\/(\d{1,2})\s*$/);
        if (installmentMatch) {
          cleanDescription = cleanDescription.replace(/\s*\d{1,2}\/\d{1,2}\s*$/, '').trim();
        }

        const isRefund = /estorno|devolução|crédito|cashback/i.test(description);

        transactions.push({
          date: normalizeDateString(dateStr),
          description: cleanDescription,
          amount: Math.abs(parseAmount(amountStr)),
          type: isRefund ? "income" : "expense",
          mode: installmentMatch ? "parcelada" : "avulsa",
          installment_number: installmentMatch ? parseInt(installmentMatch[1]) : null,
          installments_total: installmentMatch ? parseInt(installmentMatch[2]) : null,
          card_last_digits: null,
          card_holder_name: null,
        });
      } else {
        const amount = parseAmount(amountStr);
        const isIncome = detectIsIncome(description, amountStr);

        transactions.push({
          date: normalizeDateString(dateStr),
          description: cleanDescription,
          amount: Math.abs(amount),
          type: isIncome ? "income" : "expense",
          mode: "avulsa",
          installment_number: null,
          installments_total: null,
          card_last_digits: null,
          card_holder_name: null,
        });
      }
    }
  }

  logger.debug(`   📊 parseGeneric: ${transactions.length} transações extraídas`);
  return transactions;
}

/**
 * Parser para formato com datas por extenso (usado por Inter, e outros bancos)
 * Formato: "4 de Janeiro de 2025 Saldo do dia: R$ X"
 * Seguido de: "Pix recebido: "Nome" R$ valor R$ saldo"
 */
function parseExtenseDateFormat(text: string, type: "credit_card" | "checking"): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const processedLines = new Set<string>();

  const monthMap: Record<string, string> = {
    'janeiro': '01', 'fevereiro': '02', 'março': '03', 'marco': '03', 'abril': '04',
    'maio': '05', 'junho': '06', 'julho': '07', 'agosto': '08',
    'setembro': '09', 'outubro': '10', 'novembro': '11', 'dezembro': '12'
  };

  // Verificar se o texto tem datas por extenso
  const dateHeaderPattern = /(\d{1,2})\s+de\s+(janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+(\d{4})/gi;

  const dateMatches: { index: number; date: string }[] = [];
  let dateMatch;

  while ((dateMatch = dateHeaderPattern.exec(text)) !== null) {
    const [, day, monthName, year] = dateMatch;
    const month = monthMap[monthName.toLowerCase()];
    if (month) {
      const formattedDate = `${year}-${month}-${day.padStart(2, '0')}`;
      dateMatches.push({ index: dateMatch.index, date: formattedDate });
    }
  }

  // Se não encontrou datas por extenso, retornar vazio
  if (dateMatches.length === 0) {
    return [];
  }

  // Criar seções baseadas nas datas
  for (let i = 0; i < dateMatches.length; i++) {
    const startIndex = dateMatches[i].index;
    const endIndex = i < dateMatches.length - 1 ? dateMatches[i + 1].index : text.length;
    const sectionText = text.substring(startIndex, endIndex);
    const currentDate = dateMatches[i].date;

    // Padrões universais para transações brasileiras
    const transactionPatterns = [
      // PIX: "Pix recebido/enviado: "Descrição" R$ valor"
      {
        pattern: /(?:Pix\s+(?:recebido|enviado)(?:\s+devolvido)?)[:\s]+[""]([^""]+)[""]?\s+(-?R\$\s*[\d.,]+)/gi,
        getType: (match: string) => {
          if (/recebido\s+devolvido/i.test(match)) return "expense";
          if (/recebido/i.test(match)) return "income";
          return "expense";
        }
      },
      // TED/DOC: "TED recebida/enviada: "Descrição" R$ valor"
      {
        pattern: /(?:TED|DOC)\s+(?:recebid[ao]|enviad[ao])[:\s]+[""]?([^""]+?)[""]?\s+(-?R\$\s*[\d.,]+)/gi,
        getType: (match: string) => /recebid/i.test(match) ? "income" : "expense"
      },
      // Transferência: "Transferência recebida/enviada: "Descrição" R$ valor"
      {
        pattern: /Transferência\s+(?:recebida|enviada)[:\s]+[""]?([^""]+?)[""]?\s+(-?R\$\s*[\d.,]+)/gi,
        getType: (match: string) => /recebida/i.test(match) ? "income" : "expense"
      },
      // Pagamento: "Pagamento efetuado/de Convenio/de Titulo: "Descrição" -R$ valor"
      {
        pattern: /Pagamento\s+(?:efetuado|de\s+(?:Convenio|Convênio|Titulo|Título)(?:\s+-\s+\w+)?|Darf\s+Numerado|Simples\s+Nacional)[:\s]+[""]?([^""]+?)[""]?\s+(-R\$\s*[\d.,]+)/gi,
        getType: () => "expense" as const
      },
      // Depósito: "Depósito: "Descrição" R$ valor"
      {
        pattern: /Depósito[:\s]+[""]?([^""]+?)[""]?\s+(R\$\s*[\d.,]+)/gi,
        getType: () => "income" as const
      },
      // Saque: "Saque: "Descrição" -R$ valor"
      {
        pattern: /Saque[:\s]+[""]?([^""]+?)[""]?\s+(-R\$\s*[\d.,]+)/gi,
        getType: () => "expense" as const
      },
      // Tarifa/Taxa: "Tarifa/Taxa bancária -R$ valor"
      {
        pattern: /(?:Tarifa|Taxa)\s+(?:bancária|de\s+\w+)?[:\s]*[""]?([^""]+?)[""]?\s+(-R\$\s*[\d.,]+)/gi,
        getType: () => "expense" as const
      },
      // Boleto: "Boleto pago: "Descrição" -R$ valor"
      {
        pattern: /Boleto\s+(?:pago)?[:\s]+[""]?([^""]+?)[""]?\s+(-R\$\s*[\d.,]+)/gi,
        getType: () => "expense" as const
      },
      // Rendimento: "Rendimento/Juros: R$ valor"
      {
        pattern: /(?:Rendimento|Juros|Dividendos)[:\s]+[""]?([^""]*?)[""]?\s+(R\$\s*[\d.,]+)/gi,
        getType: () => "income" as const
      },
      // Genérico com valor negativo (despesa)
      {
        pattern: /([A-Za-zÀ-ÿ\s]{3,50}?)\s+(-R\$\s*[\d.,]+)\s+(?:-?R\$\s*[\d.,]+)?$/gm,
        getType: () => "expense" as const
      },
      // Genérico com valor positivo (receita)
      {
        pattern: /([A-Za-zÀ-ÿ\s]{3,50}?)\s+(R\$\s*[\d.,]+)\s+(?:R\$\s*[\d.,]+)?$/gm,
        getType: (match: string, desc: string) => {
          // Se a descrição indica entrada
          if (detectIsIncome(desc, match)) return "income";
          return "expense";
        }
      },
    ];

    for (const { pattern, getType } of transactionPatterns) {
      let match;
      // Reset lastIndex para cada seção
      pattern.lastIndex = 0;

      while ((match = pattern.exec(sectionText)) !== null) {
        const [fullMatch, rawDescription, amountStr] = match;

        let description = cleanExtractedDescription(rawDescription);
        if (!description || description.length < 2) continue;

        // Parsear valor
        const cleanAmount = amountStr.replace(/[R$\s]/g, '');
        const amount = parseAmountBrazilian(cleanAmount);

        if (isNaN(amount) || amount === 0) continue;

        // Criar chave única
        const lineKey = `${currentDate}-${description.substring(0, 30)}-${amount.toFixed(2)}`;
        if (processedLines.has(lineKey)) continue;
        processedLines.add(lineKey);

        // Pular não-transações
        if (isNonTransaction(description)) continue;

        // Determinar tipo
        const transactionType = getType(fullMatch, description);

        transactions.push({
          date: currentDate,
          description: description,
          amount: Math.abs(amount),
          type: transactionType,
          mode: "avulsa",
          installment_number: null,
          installments_total: null,
          card_last_digits: null,
          card_holder_name: null,
        });
      }
    }
  }

  return transactions;
}

/**
 * Limpa descrição extraída de transação
 */
function cleanExtractedDescription(description: string): string {
  let clean = description.trim();

  // Remover prefixo "Cp :NÚMEROS-"
  clean = clean.replace(/^Cp\s*:\s*\d+-/i, '').trim();

  // Remover códigos numéricos no início (ex: "00019 65272790")
  clean = clean.replace(/^\d+\s+\d+\s+/, '').trim();

  // Remover aspas extras
  clean = clean.replace(/^[""]|[""]$/g, '').trim();

  return clean;
}

/**
 * Detecta se uma transação é receita baseado na descrição e valor
 */
function detectIsIncome(description: string, amountStr: string): boolean {
  const incomeKeywords = [
    /recebido/i, /recebida/i, /crédito/i, /credito/i,
    /depósito/i, /deposito/i, /rendimento/i, /juros/i,
    /dividendo/i, /salário/i, /salario/i, /reembolso/i,
    /estorno/i, /devolução/i, /devolvido/i, /cashback/i
  ];

  // Verificar sinal positivo explícito
  if (amountStr.includes('+')) return true;

  // Verificar palavras-chave de receita
  for (const keyword of incomeKeywords) {
    if (keyword.test(description)) return true;
  }

  return false;
}

/**
 * Verifica se a linha é uma não-transação (cabeçalho, rodapé, etc)
 */
function isNonTransaction(description: string): boolean {
  const nonTransactionPatterns = [
    /^saldo\s+(do\s+dia|disponível|bloqueado|anterior|total)/i,
    /^(fale\s+com|sac:|ouvidoria:|deficiência)/i,
    /^(data|valor|descrição|histórico|lançamento)$/i,
    /^total\s+(da\s+fatura|para|geral)/i,
    /^(período|agência|conta|cpf|cnpj)/i,
  ];

  for (const pattern of nonTransactionPatterns) {
    if (pattern.test(description)) return true;
  }

  return false;
}

/**
 * Parseia valor no formato brasileiro (1.234,56 ou 1234,56)
 */
function parseAmountBrazilian(amountStr: string): number {
  // Remover R$ e espaços
  let clean = amountStr.replace(/[R$\s]/g, '');

  // Verificar se é negativo
  const isNegative = clean.startsWith('-');
  clean = clean.replace(/^[+-]/, '');

  // Formato brasileiro: 1.234,56 → remover pontos, trocar vírgula por ponto
  // Verificar se tem vírgula (decimal brasileiro)
  if (clean.includes(',')) {
    clean = clean.replace(/\./g, '').replace(',', '.');
  }

  const value = parseFloat(clean);
  return isNegative ? -value : value;
}

/**
 * Parser principal que escolhe o melhor método
 * @param text - Texto do extrato
 * @param forcedType - Tipo informado pelo usuário (opcional, sobrescreve auto-detecção)
 */
export function parseStatement(text: string, forcedType?: "credit_card" | "checking" | null): ParserResult {
  const bank = detectBank(text);
  // Usar tipo informado pelo usuário se disponível, senão auto-detectar
  const statementType = forcedType || detectStatementType(text);

  logger.debug(`🏦 Banco detectado: ${bank}`);
  logger.debug(`📄 Tipo de extrato: ${statementType}`);

  let transactions: ParsedTransaction[] = [];
  let confidence = 0;
  let parsingMethod: "regex" | "hybrid" = "regex";

  // Tentar parser específico do banco
  switch (bank) {
    case "Nubank":
      transactions = parseNubank(text, statementType);
      confidence = transactions.length > 0 ? 0.95 : 0;
      break;
    case "Inter":
      transactions = parseInter(text, statementType);
      confidence = transactions.length > 0 ? 0.95 : 0;
      break;
    case "Itaú":
      transactions = parseItau(text, statementType);
      confidence = transactions.length > 0 ? 0.95 : 0;
      break;
    case "BTG":
      transactions = parseBTG(text, statementType);
      confidence = transactions.length > 0 ? 0.95 : 0;
      break;
    case "Santander":
      transactions = parseSantander(text, statementType);
      confidence = transactions.length > 0 ? 0.95 : 0;
      break;
    case "C6 Bank":
      transactions = parseC6Bank(text, statementType);
      confidence = transactions.length > 0 ? 0.95 : 0;
      break;
    case "Cora":
      transactions = parseCora(text, statementType);
      confidence = transactions.length > 0 ? 0.95 : 0;
      break;
    case "Bradesco":
      transactions = parseBradesco(text, statementType);
      confidence = transactions.length > 0 ? 0.95 : 0;
      break;
    default:
      // Banco desconhecido - usar parser genérico
      break;
  }

  // Fallback para parser genérico se necessário
  if (transactions.length === 0) {
    logger.debug(`   ⚠️ Parser específico não encontrou transações, usando genérico...`);
    transactions = parseGeneric(text, statementType);
    confidence = transactions.length > 0 ? 0.7 : 0;
    parsingMethod = "hybrid";
  }

  // Se parser específico encontrou poucas transações, tentar complementar com genérico
  if (transactions.length > 0 && transactions.length < 10 && bank !== "Desconhecido") {
    logger.debug(`   ⚠️ Poucas transações (${transactions.length}), tentando complementar com genérico...`);
    const genericTransactions = parseGeneric(text, statementType);
    if (genericTransactions.length > transactions.length) {
      const existingKeys = new Set(transactions.map(t =>
        `${t.date}-${t.description.substring(0, 30)}-${t.amount}`
      ));
      const newTransactions = genericTransactions.filter(t => {
        const key = `${t.date}-${t.description.substring(0, 30)}-${t.amount}`;
        return !existingKeys.has(key);
      });
      transactions.push(...newTransactions);
      parsingMethod = "hybrid";
    }
  }

  logger.debug(`   ✅ Total: ${transactions.length} transações extraídas`);

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
