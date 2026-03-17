"use client";

import { useState } from "react";
import { UserWithRelations } from "@/types/user";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  user: UserWithRelations | null;
  onClose: () => void;
  onSuccess: (deletedId: string) => void;
}

export default function DeleteUserModal({
  open,
  user,
  onClose,
  onSuccess,
}: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/user/${user.id}`, {
        method: "DELETE",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to delete user");
      }

      toast.success("User deleted");

      onSuccess(user.id);
      onClose();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isDeleting && !isOpen) {
      onClose();
    }
  };

  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete User</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {user.name || user.email}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} onClick={onClose}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            className="bg-destructive hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
