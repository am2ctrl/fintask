import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TransactionModal } from "../TransactionModal";

export default function TransactionModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Abrir Modal</Button>
      <TransactionModal
        open={open}
        onOpenChange={setOpen}
        onSave={(data) => {
          console.log("Saved:", data);
        }}
      />
    </>
  );
}
