"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { apiClient } from "@/app/lib/api-client";
import { toast } from "sonner";

export default function PortsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addData, setAddData] = useState({ port_name: "" });

  // Edit State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({ id: 0, port_name: "" });

  const fetchData = async () => {
    try {
      const res = await apiClient.getPorts();
      setData(res || []);
    } catch (e) {
      toast.error("فشل جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number | string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      await apiClient.deletePort(id);
      toast.success("تم الحذف بنجاح");
      fetchData();
    } catch (e) {
      toast.error("خطأ في الحذف");
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createPort(addData);
      toast.success("تمت الإضافة بنجاح");
      setIsAddOpen(false);
      setAddData({ port_name: "" });
      fetchData();
    } catch (e) {
      toast.error("خطأ في الإضافة");
    }
  };

  const handleEditClick = (item: any) => {
    setEditData(item);
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.updatePort(editData.id, editData);
      toast.success("تم التعديل بنجاح");
      setIsEditOpen(false);
      fetchData();
    } catch (e) {
      toast.error("خطأ في التعديل");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">المنافذ</h1>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90 rounded-xl px-6">
              <Plus size={16} /> إضافة منفذ جديد
            </Button>
          </DialogTrigger>
          <DialogContent
            className="sm:max-w-[425px] rounded-2xl p-6 text-right"
            dir="rtl"
          >
            <DialogHeader>
              <DialogTitle className="text-right text-xl font-bold">
                إضافة منفذ
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="block font-bold">اسم المنفذ</Label>
                <Input
                  required
                  value={addData.port_name}
                  onChange={(e) =>
                    setAddData({ ...addData, port_name: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
              <DialogFooter className="mt-6">
                <Button type="submit" className="w-full rounded-xl bg-primary">
                  حفظ
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent
            className="sm:max-w-[425px] rounded-2xl p-6 text-right"
            dir="rtl"
          >
            <DialogHeader>
              <DialogTitle className="text-right text-xl font-bold">
                تعديل المنفذ
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="block font-bold">اسم المنفذ</Label>
                <Input
                  required
                  value={editData.port_name}
                  onChange={(e) =>
                    setEditData({ ...editData, port_name: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
              <DialogFooter className="mt-6">
                <Button type="submit" className="w-full rounded-xl bg-primary">
                  حفظ التعديلات
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-right font-black">
                  اسم المنفذ
                </TableHead>
                <TableHead className="text-center font-black">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-10">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center py-10 text-slate-500"
                  >
                    لا توجد بيانات
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.port_name}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(item)}
                          className="text-blue-500 hover:bg-blue-50"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
