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
interface Gate {
  id: number;
  gate_code: string | null;
  gate_name: string;
  location: string | null;
  connecting_country: string | null;
  isActive: boolean;
}

export default function GatesSection({ initialData }: { initialData: Gate[] }) {
  const { hasPermission } = usePermissions();
  const [items, setItems] = useState<Gate[]>(initialData);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Gate | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Gate>>({ isActive: true });

  const handleOpenAdd = () => {
    setFormData({ isActive: true });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (item: Gate) => {
    setSelectedItem(item);
    setFormData({ ...item });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (item: Gate) => {
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
      const url = isEdit ? `/api/settings/gates/${selectedItem.id}` : "/api/settings/gates";
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

      toast.success(isEdit ? "Gate updated" : "Gate created");
      closeModals();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/settings/gates/${selectedItem.id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete");

      setItems((prev) => prev.map((item) => (item.id === selectedItem.id ? { ...item, isActive: false } : item)));

      toast.success("Gate deleted (set to inactive)");
      closeModals();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold font-heading">Gates</h3>
          <p className="text-sm text-muted-foreground">{items.length} records</p>
        </div>
        {hasPermission(PERMISSIONS.CREATE_GATE) && (
          <Button onClick={handleOpenAdd}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New
          </Button>
        )}
      </div>

      {!hasPermission(PERMISSIONS.VIEW_GATE) ? (
        <div className="p-8 text-center bg-muted/20 rounded-lg border border-dashed">
          <p className="text-muted-foreground">You do not have permission to view gates.</p>
        </div>
      ) : (

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Gate Code</TableHead>
              <TableHead>Gate Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Connecting Country</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No Gates found. Add your first one.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.gate_code || "—"}</TableCell>
                  <TableCell>{item.gate_name}</TableCell>
                  <TableCell>{item.location || "—"}</TableCell>
                  <TableCell>{item.connecting_country || "—"}</TableCell>
                  <TableCell>
                    {item.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {hasPermission(PERMISSIONS.EDIT_GATE) && (
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    {hasPermission(PERMISSIONS.DELETE_GATE) && (
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
            <DialogTitle>{isEditOpen ? "Edit Gate" : "Add New Gate"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Gate Name *</Label>
              <Input
                required
                disabled={isLoading}
                value={formData.gate_name || ""}
                onChange={(e) => setFormData({ ...formData, gate_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Gate Code</Label>
              <Input
                disabled={isLoading}
                value={formData.gate_code || ""}
                onChange={(e) => setFormData({ ...formData, gate_code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                disabled={isLoading}
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Connecting Country</Label>
              <Input
                disabled={isLoading}
                value={formData.connecting_country || ""}
                onChange={(e) => setFormData({ ...formData, connecting_country: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActiveGate"
                className="h-4 w-4"
                disabled={isLoading}
                checked={!!formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <Label htmlFor="isActiveGate">{formData.isActive ? "Active" : "Inactive"}</Label>
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
              This action will mark the gate &quot;{selectedItem?.gate_name}&quot; as inactive.
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
