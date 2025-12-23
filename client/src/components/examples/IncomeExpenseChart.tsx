import { IncomeExpenseChart } from "../IncomeExpenseChart";

// todo: remove mock data
const mockChartData = [
  { month: "Jul", income: 6500, expense: 4200 },
  { month: "Ago", income: 7200, expense: 5100 },
  { month: "Set", income: 8000, expense: 4800 },
  { month: "Out", income: 7500, expense: 5500 },
  { month: "Nov", income: 8200, expense: 5000 },
  { month: "Dez", income: 11000, expense: 5230 },
];

export default function IncomeExpenseChartExample() {
  return <IncomeExpenseChart data={mockChartData} />;
}
