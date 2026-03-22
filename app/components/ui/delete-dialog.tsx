"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  itemName: string | undefined;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  itemName,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[420px] rounded-[32px] p-8 border-none shadow-2xl"
        dir="rtl"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
            <AlertTriangle className="text-rose-600" size={32} />
          </div>
          <DialogTitle className="font-black text-slate-900 text-xl">
            {title}
          </DialogTitle>
          <DialogDescription className="font-bold text-slate-500 py-4">
            هل أنت متأكد من حذف{" "}
            <strong className="text-slate-900">{itemName}</strong>
            ？ هذا الإجراء لا يمكن التراجع عنه.
          </DialogDescription>
        </div>
        <DialogFooter className="gap-3 mt-4 flex sm:justify-center">
          <Button
            onClick={onConfirm}
            className="rounded-2xl h-12 flex-1 bg-rose-600 font-bold hover:bg-rose-700 transition-colors"
          >
            نعم، احذف
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-2xl h-12 flex-1 font-bold"
          >
            تراجع
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
