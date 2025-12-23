import { CategoryBadge, defaultCategories } from "../CategoryBadge";

export default function CategoryBadgeExample() {
  return (
    <div className="flex flex-wrap gap-2">
      {defaultCategories.map((category) => (
        <CategoryBadge key={category.id} category={category} />
      ))}
    </div>
  );
}
