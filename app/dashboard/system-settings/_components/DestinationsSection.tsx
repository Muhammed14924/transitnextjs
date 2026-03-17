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

interface Destination {
  id: number;
  destination_name: string;
  destination_type: string | null;
  isActive: boolean;
}

export default function DestinationsSection({ initialData }: { initialData: Destination[] }) {
  const { hasPermission } = usePermissions();
  const [items, setItems] = useState<Destination[]>(initialData);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Destination | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Destination>>({ isActive: true });

  const handleOpenAdd = () => {
    setFormData({ isActive: true });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (item: Destination) => {
    setSelectedItem(item);
    setFormData({ ...item });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (item: Destination) => {
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
      const url = isEdit ? `/api/settings/destinations` : "/api/settings/destinations";
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

      toast.success(isEdit ? "Destination updated" : "Destination created");
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
      const res = await fetch(`/api/settings/destinations?id=${selectedItem.id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete");

      setItems((prev) => prev.filter((item) => item.id !== selectedItem.id));

      toast.success("Destination deleted permanently");
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
          <h3 className="text-xl font-bold font-heading">Destinations</h3>
          <p className="text-sm text-muted-foreground">{items.length} records</p>
        </div>
        {hasPermission(PERMISSIONS.CREATE_DESTINATION) && (
          <Button onClick={handleOpenAdd}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New
          </Button>
        )}
      </div>

      {!hasPermission(PERMISSIONS.VIEW_DESTINATION) ? (
        <div className="p-8 text-center bg-muted/20 rounded-lg border border-dashed">
          <p className="text-muted-foreground">You do not have permission to view destinations.</p>
        </div>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Destination Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No Destinations found. Add your first one.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.destination_name}</TableCell>
                    <TableCell>{item.destination_type || "—"}</TableCell>
                    <TableCell>
                      {item.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {hasPermission(PERMISSIONS.EDIT_DESTINATION) && (
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      {hasPermission(PERMISSIONS.DELETE_DESTINATION) && (
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
            <DialogTitle>{isEditOpen ? "Edit Destination" : "Add New Destination"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Destination Name *</Label>
              <Input
                required
                disabled={isLoading}
                value={formData.destination_name || ""}
                onChange={(e) => setFormData({ ...formData, destination_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Input
                disabled={isLoading}
                value={formData.destination_type || ""}
                onChange={(e) => setFormData({ ...formData, destination_type: e.target.value })}
              />
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActiveDest"
                className="h-4 w-4"
                disabled={isLoading}
                checked={!!formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <Label htmlFor="isActiveDest">{formData.isActive ? "Active" : "Inactive"}</Label>
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
              This action will permanently delete the destination &quot;{selectedItem?.destination_name}&quot; from the database.
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
