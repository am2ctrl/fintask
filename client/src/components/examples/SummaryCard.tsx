import { SummaryCard } from "../SummaryCard";

export default function SummaryCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SummaryCard type="income" value={8500} trend={12.5} label="Receitas" />
      <SummaryCard type="expense" value={5230} trend={-3.2} label="Despesas" />
      <SummaryCard type="balance" value={3270} trend={25.8} label="Saldo" />
    </div>
  );
}
