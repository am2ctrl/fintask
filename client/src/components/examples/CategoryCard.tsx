import { CategoryCard } from "../CategoryCard";
import { defaultCategories } from "../CategoryBadge";

export default function CategoryCardExample() {
  return (
    <div className="space-y-3">
      <CategoryCard
        category={defaultCategories[0]}
        transactionCount={12}
        onEdit={(c) => console.log("Edit:", c)}
        onDelete={(id) => console.log("Delete:", id)}
      />
      <CategoryCard
        category={defaultCategories[4]}
        transactionCount={45}
        onEdit={(c) => console.log("Edit:", c)}
        onDelete={(id) => console.log("Delete:", id)}
      />
    </div>
  );
}
