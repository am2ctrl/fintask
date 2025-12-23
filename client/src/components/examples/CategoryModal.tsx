import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CategoryModal } from "../CategoryModal";

export default function CategoryModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Nova Categoria</Button>
      <CategoryModal
        open={open}
        onOpenChange={setOpen}
        type="expense"
        onSave={(data) => {
          console.log("Saved category:", data);
        }}
      />
    </>
  );
}
