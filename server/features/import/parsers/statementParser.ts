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
    // Conta corrente Inter
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
 * Parser genérico usando padrões comuns
 */
export function parseGeneric(text: string, type: "credit_card" | "checking"): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const processedLines = new Set<string>();

  // Padrões mais flexíveis para capturar transações
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
      if (/data|valor|descrição|total|saldo|anterior|limite/i.test(description)) continue;

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
        const isIncome = amountStr.includes('+') ||
                         /recebido|crédito|ted recebida|pix recebido|depósito/i.test(description);

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
