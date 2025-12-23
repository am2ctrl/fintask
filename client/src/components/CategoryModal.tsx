import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Category } from "./CategoryBadge";

const colorOptions = [
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
  "#eab308", "#84cc16",
];

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  type: "income" | "expense";
  onSave: (data: { name: string; color: string; type: "income" | "expense" }) => void;
}

export function CategoryModal({
  open,
  onOpenChange,
  category,
  type,
  onSave,
}: CategoryModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(colorOptions[0]);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setColor(category.color);
    } else {
      setName("");
      setColor(colorOptions[0]);
    }
  }, [category, open]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), color, type });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-category">
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Categoria</Label>
            <Input
              id="name"
              placeholder="Ex: Alimentação"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="input-category-name"
            />
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-transform ${
                    color === c ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
                  }`}
                  style={{ backgroundColor: c }}
                  data-testid={`button-color-${c}`}
                />
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">Pré-visualização</p>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${color}20` }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
              <span className="font-medium">{name || "Nome da categoria"}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel-category"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
            data-testid="button-save-category"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
