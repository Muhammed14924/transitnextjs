"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/app/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Edit2, Trash2, PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner"; 
import { usePermissions } from "@/app/hooks/use-permissions";
import { PERMISSIONS } from "@/app/lib/permissions";

interface Unit {
  id: number;
  unit_name: string;
  isActive: boolean;
}

export default function UnitsSection({ initialData }: { initialData: Unit[] }) {
  const { hasPermission } = usePermissions();
  const [items, setItems] = useState<Unit[]>(initialData);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Unit | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Unit>>({ isActive: true });

  const handleOpenAdd = () => {
    setFormData({ isActive: true });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (item: Unit) => {
    setSelectedItem(item);
    setFormData({ ...item });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (item: Unit) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const closeModals = () => {
    setIsAddOpen(false);
    setIsEditOpen(false);
    setIsDeleteOpen(false);
    setSelectedItem(null);
    setFormData({ isActive: true });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isEdit = !!selectedItem;
      const url = isEdit ? `/api/settings/units` : "/api/settings/units";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");

      if (isEdit) {
        setItems((prev) => prev.map((item) => (item.id === selectedItem.id ? json : item)));
      } else {
        setItems((prev) => [json, ...prev]);
      }

      toast.success(isEdit ? "Unit updated" : "Unit created");
      closeModals();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/settings/units?id=${selectedItem.id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete");

      setItems((prev) => prev.filter((item) => item.id !== selectedItem.id));

      toast.success("Unit deleted permanently");
      closeModals();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold font-heading">Units</h3>
          <p className="text-sm text-muted-foreground">{items.length} records</p>
        </div>
        {hasPermission(PERMISSIONS.CREATE_UNIT) && (
          <Button onClick={handleOpenAdd}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New
          </Button>
        )}
      </div>

      {!hasPermission(PERMISSIONS.VIEW_UNIT) ? (
        <div className="p-8 text-center bg-muted/20 rounded-lg border border-dashed">
          <p className="text-muted-foreground">You do not have permission to view units.</p>
        </div>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Unit Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No Units found. Add your first one.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.unit_name}</TableCell>
                    <TableCell>
                      {item.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {hasPermission(PERMISSIONS.EDIT_UNIT) && (
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      {hasPermission(PERMISSIONS.DELETE_UNIT) && (
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(item)} className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(isOpen) => !isOpen && closeModals()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditOpen ? "Edit Unit" : "Add New Unit"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Unit Name *</Label>
              <Input
                required
                disabled={isLoading}
                value={formData.unit_name || ""}
                onChange={(e) => setFormData({ ...formData, unit_name: e.target.value })}
              />
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActiveUnit"
                className="h-4 w-4"
                disabled={isLoading}
                checked={!!formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <Label htmlFor="isActiveUnit">{formData.isActive ? "Active" : "Inactive"}</Label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={closeModals} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={(isOpen) => !isOpen && closeModals()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the unit &quot;{selectedItem?.unit_name}&quot; from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
