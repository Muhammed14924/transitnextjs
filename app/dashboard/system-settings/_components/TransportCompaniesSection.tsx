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

interface TransportCompany {
  id: number;
  trans_name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  transport_type: string | null;
  opening_balance: string | number;
  isActive: boolean;
}

export default function TransportCompaniesSection({ initialData }: { initialData: TransportCompany[] }) {
  const { hasPermission } = usePermissions();
  const [items, setItems] = useState<TransportCompany[]>(initialData);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TransportCompany | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<TransportCompany>>({ isActive: true, opening_balance: 0 });

  const handleOpenAdd = () => {
    setFormData({ isActive: true, opening_balance: 0 });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (item: TransportCompany) => {
    setSelectedItem(item);
    setFormData({ ...item });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (item: TransportCompany) => {
    setSelectedItem(item);
    setIsDeleteOpen(true);
  };

  const closeModals = () => {
    setIsAddOpen(false);
    setIsEditOpen(false);
    setIsDeleteOpen(false);
    setSelectedItem(null);
    setFormData({ isActive: true, opening_balance: 0 });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isEdit = !!selectedItem;
      const url = isEdit ? `/api/settings/transport-companies` : "/api/settings/transport-companies";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        ...formData,
        opening_balance: typeof formData.opening_balance === 'string' 
          ? parseFloat(formData.opening_balance) 
          : formData.opening_balance
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");

      if (isEdit) {
        setItems((prev) => prev.map((item) => (item.id === selectedItem.id ? json : item)));
      } else {
        setItems((prev) => [json, ...prev]);
      }

      toast.success(isEdit ? "Company updated" : "Company created");
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
      const res = await fetch(`/api/settings/transport-companies?id=${selectedItem.id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete");

      setItems((prev) => prev.map((item) => (item.id === selectedItem.id ? { ...item, isActive: false } : item)));

      toast.success("Company deleted (set to inactive)");
      closeModals();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num || 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold font-heading">Transport Companies</h3>
          <p className="text-sm text-muted-foreground">{items.length} records</p>
        </div>
        {hasPermission(PERMISSIONS.CREATE_TRANSPORT_COMPANY) && (
          <Button onClick={handleOpenAdd}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New
          </Button>
        )}
      </div>

      {!hasPermission(PERMISSIONS.VIEW_TRANSPORT_COMPANY) ? (
        <div className="p-8 text-center bg-muted/20 rounded-lg border border-dashed">
          <p className="text-muted-foreground">You do not have permission to view transport companies.</p>
        </div>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No Transport Companies found. Add your first one.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.trans_name}</TableCell>
                    <TableCell>{item.contact_person || "—"}</TableCell>
                    <TableCell>{item.phone || "—"}</TableCell>
                    <TableCell>{item.email || "—"}</TableCell>
                    <TableCell>{item.transport_type || "—"}</TableCell>
                    <TableCell>{formatCurrency(item.opening_balance)}</TableCell>
                    <TableCell>
                      {item.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {hasPermission(PERMISSIONS.EDIT_TRANSPORT_COMPANY) && (
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(item)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      {hasPermission(PERMISSIONS.DELETE_TRANSPORT_COMPANY) && (
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
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditOpen ? "Edit Company" : "Add New Company"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="grid grid-cols-2 gap-4 pt-4">
            <div className="space-y-2 col-span-2">
              <Label>Company Name *</Label>
              <Input
                required
                disabled={isLoading}
                value={formData.trans_name || ""}
                onChange={(e) => setFormData({ ...formData, trans_name: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-1">
              <Label>Contact Person</Label>
              <Input
                disabled={isLoading}
                value={formData.contact_person || ""}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-1">
              <Label>Phone</Label>
              <Input
                disabled={isLoading}
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-1">
              <Label>Email</Label>
              <Input
                type="email"
                disabled={isLoading}
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-1">
              <Label>Transport Type</Label>
              <Input
                disabled={isLoading}
                value={formData.transport_type || ""}
                onChange={(e) => setFormData({ ...formData, transport_type: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-1">
              <Label>Opening Balance</Label>
              <Input
                type="number"
                step="0.01"
                disabled={isLoading}
                value={formData.opening_balance || 0}
                onChange={(e) => setFormData({ ...formData, opening_balance: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 pt-2 col-span-2">
              <input
                type="checkbox"
                id="isActiveTC"
                className="h-4 w-4"
                disabled={isLoading}
                checked={!!formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <Label htmlFor="isActiveTC">{formData.isActive ? "Active" : "Inactive"}</Label>
            </div>
            <div className="col-span-2 flex justify-end gap-3 pt-4">
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
              This action will mark the company &quot;{selectedItem?.trans_name}&quot; as inactive.
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
