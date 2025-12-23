import { CategoryPieChart } from "../CategoryPieChart";

// todo: remove mock data
const mockCategoryData = [
  { name: "Alimentação", value: 1500, color: "#f97316" },
  { name: "Moradia", value: 1200, color: "#ef4444" },
  { name: "Transporte", value: 800, color: "#eab308" },
  { name: "Lazer", value: 600, color: "#6366f1" },
  { name: "Contas", value: 730, color: "#0ea5e9" },
  { name: "Outros", value: 400, color: "#8b5cf6" },
];

export default function CategoryPieChartExample() {
  return <CategoryPieChart data={mockCategoryData} />;
}
