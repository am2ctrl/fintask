// Tipo simples de Category para uso em AI
interface CategoryForAI {
  id: string;
  name: string;
  type: "income" | "expense";
}

/**
 * Constrói um prompt otimizado para extração completa de transações
 * Usado pela rota legacy /api/extract-transactions
 */
export function buildExtractionPrompt(
  text: string,
  statementType: "credit_card" | "checking",
  categories: CategoryForAI[]
): string {
  const isChecking = statementType === "checking";

  const statementContext = isChecking
    ? `Este é um EXTRATO DE CONTA CORRENTE. As transações típicas incluem:
       - Receitas: Salários, PIX recebidos, TED recebidos, depósitos
       - Despesas: PIX enviados, TED enviados, pagamentos de boletos, débitos automáticos, tarifas bancárias`
    : `Esta é uma FATURA DE CARTÃO DE CRÉDITO. As transações típicas incluem:
       - Despesas: Compras em lojas, restaurantes, serviços online, assinaturas, parcelas
       - Receitas (estornos): Devoluções, cashback, reembolsos, cancelamentos
       IMPORTANTE: Na fatura de cartão, valores NEGATIVOS geralmente são estornos/reembolsos (marque como income).`;

  return `Você é um especialista em análise de extratos bancários e faturas de cartão de crédito brasileiros.

TIPO DE DOCUMENTO: ${statementType === "credit_card" ? "FATURA DE CARTÃO DE CRÉDITO" : "EXTRATO BANCÁRIO"}

${statementType === "credit_card" ? `
═══════════════════════════════════════════════════════════════════
INSTRUÇÕES ESPECÍFICAS PARA FATURAS DE CARTÃO DE CRÉDITO
═══════════════════════════════════════════════════════════════════

1. **IGNORE PAGAMENTOS DE FATURA:**
   - Linhas com "PAGTO. POR DEB EM C/C", "PAGAMENTO", "DEB EM C/C" NÃO são transações
   - São apenas registros de pagamento da fatura anterior
   - NÃO extraia essas linhas

2. **TIPO DE TRANSAÇÃO:**
   - TODAS as transações são type: "expense" (despesas)
   - Apenas ESTORNOS/DEVOLUÇÕES são type: "income"

3. **DETECÇÃO DE PARCELAMENTOS (CRÍTICO):**
   - Procure padrão XX/YY ao FINAL da descrição
   - Exemplos: "AMAZON BR 01/03", "HTM*asimovacadem 06/06", "F1 MEDFORMULA 05/06"
   - Se encontrar:
     * mode: "parcelada"
     * installment_number: primeiro número (XX)
     * installments_total: segundo número (YY)
   - Se NÃO encontrar:
     * mode: "avulsa"
     * installment_number: null
     * installments_total: null

4. **DETECÇÃO DE CARTÃO E TITULAR (MUITO IMPORTANTE):**

   ATENÇÃO: Faturas Bradesco e outros bancos separam transações por cartão.
   Cada cartão tem seu próprio número e titular.

   PADRÃO A PROCURAR:
   - Linha "Número do Cartão XXXX XXXX XXXX YYYY" (exemplo: "4066 XXXX XXXX 3639")
   - Logo abaixo, linha "Total para NOME COMPLETO" (exemplo: "Total para MAINARA LETICIA DA SILVA BARIL")
   - TODAS as transações listadas APÓS essas linhas pertencem a esse cartão específico

   COMO EXTRAIR:
   1. Quando encontrar "Número do Cartão XXXX XXXX XXXX YYYY", extraia os últimos 4 dígitos (YYYY)
   2. Quando encontrar "Total para [NOME]", extraia o NOME COMPLETO após "Total para"
   3. TODAS as transações listadas após têm:
      * card_last_digits: "YYYY" (últimos 4 dígitos do cartão)
      * card_holder_name: "NOME COMPLETO" (exato como no extrato)
   4. Continue até encontrar outro "Número do Cartão" ou fim da seção

   EXEMPLOS:
   - "Número do Cartão 4066 XXXX XXXX 1758" + "Total para MAINARA LETICIA DA SILVA BARIL"
     → card_last_digits: "1758", card_holder_name: "MAINARA LETICIA DA SILVA BARIL"
   - "Número do Cartão 4066 XXXX XXXX 3639" + "Total para ALLAN BRUNO GOMES FERREIRA"
     → card_last_digits: "3639", card_holder_name: "ALLAN BRUNO GOMES FERREIRA"
   - Transação sem número de cartão definido
     → card_last_digits: null, card_holder_name: null

` : `
═══════════════════════════════════════════════════════════════════
INSTRUÇÕES ESPECÍFICAS PARA EXTRATOS BANCÁRIOS
═══════════════════════════════════════════════════════════════════

1. **TIPO DE TRANSAÇÃO:**
   - PIX RECEBIDO, TED RECEBIDO, SALARIO, CREDITO, DEPOSITO = income
   - PIX ENVIADO, TED ENVIADO, PAGAMENTO, DEBITO, SAQUE, COMPRA = expense
   - ESTORNO, DEVOLUCAO, CASHBACK, REEMBOLSO = income
   - "PAGTO. POR DEB EM C/C" em conta corrente É uma despesa legítima

2. **IDENTIFICAÇÃO DE TRANSFERÊNCIAS:**
   - PIX, TED, DOC devem manter a direção (enviado/recebido)

`}

═══════════════════════════════════════════════════════════════════
REGRAS GERAIS PARA TODAS AS TRANSAÇÕES
═══════════════════════════════════════════════════════════════════

${statementContext}

**EXTRAÇÃO COMPLETA - MUITO IMPORTANTE:**
- Extraia ABSOLUTAMENTE TODAS as transações do documento
- NÃO omita nenhuma linha, mesmo valores pequenos (R$0,01)
- Inclua: rendimentos, tarifas, IOF, taxas, aplicações, resgates, TUDO

**CATEGORIZAÇÃO INTELIGENTE (CRÍTICO - LEIA COM ATENÇÃO):**

⚠️ ATENÇÃO: Você DEVE categorizar cada transação de forma DIFERENTE baseado na descrição.
⚠️ NÃO categorize TUDO como "Alimentacao" - isso está ERRADO!

Categorias disponíveis:
${categories.map(c => `- ${c.id}: ${c.name} (${c.type})`).join('\n')}

GUIA DE CATEGORIZAÇÃO (use o UUID correspondente acima):

🍽️ Alimentacao → SOMENTE: supermercados, restaurantes, lanchonetes, delivery comida, padarias
   Exemplos: MUFFATO, GRACCO, HOLANDESA, PIZZA, IFOOD, RAPPI comida

🏥 Saude → farmácia, drogaria, hospital, clínica, médico, dentista, suplementos
   Exemplos: FARMACIA, DROGARIA, PANVEL, DROGA RAIA, GROWTH SUPPLEMENT

🛒 Compras → lojas em geral, e-commerce, roupas, eletrônicos, móveis
   Exemplos: AMAZON, MERCADO LIVRE, MAGAZINE, CASAS BAHIA, ZARA, RENNER

🚗 Transporte → combustível, estacionamento, UBER, táxi, pedágio, transporte público
   Exemplos: POSTO, SHELL, UBER, 99, ESTACIONAMENTO, VAGA, GAS

🎮 Lazer → cinema, jogos, parques, bares, festas, diversões
   Exemplos: PACMAN, TOCA DO SHREK, CINEMARK, SHOPPING diversão

📺 Streaming → assinaturas de vídeo/música online
   Exemplos: NETFLIX, SPOTIFY, AMAZON PRIME, DISNEY+, HBO

🎓 Educacao → faculdade, cursos, livros, material escolar
   Exemplos: MBA, UNIVERSIDADE, CURSO, UDEMY, HOTMART educação

🏠 Moradia → aluguel, condomínio, IPTU, reformas
   Exemplos: ALUGUEL, CONDOMINIO, IPTU

💡 Contas → luz, água, gás, internet, telefone
   Exemplos: COPEL, SANEPAR, COMPAGAS

🏦 Banco → tarifas bancárias, IOF, TEF, seguros bancários, anuidade cartão
   Exemplos: TARIFA, IOF, SEGURO SUPERPROTEGIDO, ANUIDADE

💰 Salario → salário recebido, pagamento freelance
   Exemplos: SALARIO, PAGAMENTO

REGRA DE OURO:
- Leia a descrição completa
- Identifique palavras-chave
- Escolha a categoria que FAZ MAIS SENTIDO
- VARIE as categorias - não use sempre a mesma!

═══════════════════════════════════════════════════════════════════
FORMATO DE SAÍDA (JSON - SIGA RIGOROSAMENTE)
═══════════════════════════════════════════════════════════════════

{
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "Descrição original COMPLETA da transação",
      "amount": 123.45,
      "type": "expense" | "income",
      "categoryId": "uuid-da-categoria-apropriada",
      "mode": "avulsa" | "parcelada",
      "installment_number": 1 | null,
      "installments_total": 3 | null,
      "card_last_digits": "1758" | null,
      "card_holder_name": "NOME COMPLETO DO ADICIONAL" | null
    }
  ]
}

**EXEMPLOS:**

Fatura com múltiplos cartões:
{
  "transactions": [
    {
      "date": "2025-07-17",
      "description": "RUGGERI E PIVA LAGUN01/03",
      "amount": 134.74,
      "type": "expense",
      "categoryId": "b3b91fe7-fb7e-4919-99b8-5b7a90396621",
      "mode": "parcelada",
      "installment_number": 1,
      "installments_total": 3,
      "card_last_digits": "3639",
      "card_holder_name": "ALLAN BRUNO GOMES FERREIRA"
    },
    {
      "date": "2025-05-15",
      "description": "RELOJOARIA ORIENTE 05/06",
      "amount": 367.33,
      "type": "expense",
      "categoryId": "b3b91fe7-fb7e-4919-99b8-5b7a90396621",
      "mode": "parcelada",
      "installment_number": 5,
      "installments_total": 6,
      "card_last_digits": "1758",
      "card_holder_name": "MAINARA LETICIA DA SILVA BARIL"
    }
  ]
}

**ATENÇÃO:**
- NÃO invente informações
- Seja preciso com valores e datas
- Se fatura de cartão: IGNORE linhas de pagamento da fatura
- SEMPRE detecte parcelamentos no formato XX/YY
- SEMPRE identifique seções de cartão adicional

Texto do extrato (${text.length} caracteres):
${text}`;
}
