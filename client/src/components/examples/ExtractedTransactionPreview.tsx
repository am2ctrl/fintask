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
  },
  {
    id: "4",
    date: new Date(2024, 11, 15),
    description: "PAG*JOSELITO",
    amount: 150,
    type: "expense",
    suggestedCategory: defaultCategories[11],
    confidence: 0.45,
    selected: true,
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
  },
];

export default function ExtractedTransactionPreviewExample() {
  const [transactions, setTransactions] = useState(mockExtracted);

  return (
    <ExtractedTransactionPreview
      transactions={transactions}
      onTransactionsChange={setTransactions}
      onConfirm={(selected) => {
        console.log("Confirmed:", selected);
      }}
      onCancel={() => console.log("Cancelled")}
    />
  );
}
