import { useState } from "react";
import { ExtractedTransactionPreview, type ExtractedTransaction } from "../ExtractedTransactionPreview";
import { defaultCategories } from "../CategoryBadge";

// todo: remove mock data
const mockExtracted: ExtractedTransaction[] = [
  {
    id: "1",
    date: new Date(2024, 11, 5),
    description: "TED RECEBIDO - EMPRESA XYZ LTDA",
    amount: 8500,
    type: "income",
    suggestedCategory: defaultCategories[0],
    confidence: 0.95,
    selected: true,
    isRefund: false,
  },
  {
    id: "2",
    date: new Date(2024, 11, 10),
    description: "SUPERMERCADO BOM PRECO",
    amount: 450.32,
    type: "expense",
    suggestedCategory: defaultCategories[4],
    confidence: 0.88,
    selected: true,
    isRefund: false,
  },
  {
    id: "3",
    date: new Date(2024, 11, 12),
    description: "UBER *TRIP",
    amount: 28.90,
    type: "expense",
    suggestedCategory: defaultCategories[5],
    confidence: 0.92,
    selected: true,
    isRefund: false,
  },
  {
    id: "4",
    date: new Date(2024, 11, 15),
    description: "ESTORNO - LOJA ABC",
    amount: 150,
    type: "income",
    suggestedCategory: defaultCategories[3],
    confidence: 0.75,
    selected: true,
    isRefund: true,
  },
  {
    id: "5",
    date: new Date(2024, 11, 18),
    description: "PIX RECEBIDO - CLIENTE ABC",
    amount: 2500,
    type: "income",
    suggestedCategory: defaultCategories[1],
    confidence: 0.75,
    selected: true,
    isRefund: false,
  },
];

export default function ExtractedTransactionPreviewExample() {
  const [transactions, setTransactions] = useState(mockExtracted);

  return (
    <ExtractedTransactionPreview
      transactions={transactions}
      statementType="checking"
      onTransactionsChange={setTransactions}
      onConfirm={(selected) => {
        console.log("Confirmed:", selected);
      }}
      onCancel={() => console.log("Cancelled")}
    />
  );
}
