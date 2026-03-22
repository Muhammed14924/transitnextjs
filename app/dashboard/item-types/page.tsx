// "use client";

// import { useState, useEffect } from "react";
// import { Plus, Trash2, Edit } from "lucide-react";
// import { Card, CardContent } from "@/app/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/app/components/ui/table";
// import { Input } from "@/app/components/ui/input";
// import { Button } from "@/app/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
//   DialogFooter,
// } from "@/app/components/ui/dialog";
// import { Label } from "@/app/components/ui/label";
// import { apiClient } from "@/app/lib/api-client";
// import { toast } from "sonner";

// export default function ItemTypesPage() {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Add State
//   const [isAddOpen, setIsAddOpen] = useState(false);
//   const [addData, setAddData] = useState({ item_type: "", typecode: "" });

//   // Edit State
//   const [isEditOpen, setIsEditOpen] = useState(false);
//   const [editData, setEditData] = useState({
//     id: 0,
//     item_type: "",
//     typecode: "",
//   });

//   const fetchData = async () => {
//     try {
//       const res = await apiClient.getTypeofitems();
//       setData(res || []);
//     } catch (e) {
//       toast.error("فشل جلب البيانات");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const handleDelete = async (id: number | string) => {
//     if (!confirm("هل أنت متأكد من الحذف؟")) return;
//     try {
//       await apiClient.deleteTypeofitem(id);
//       toast.success("تم الحذف بنجاح");
//       fetchData();
//     } catch (e) {
//       toast.error("خطأ في الحذف");
//     }
//   };

//   const handleAdd = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await apiClient.createTypeofitem(addData);
//       toast.success("تمت الإضافة بنجاح");
//       setIsAddOpen(false);
//       setAddData({ item_type: "", typecode: "" });
//       fetchData();
//     } catch (e) {
//       toast.error("خطأ في الإضافة");
//     }
//   };

//   const handleEditClick = (item: any) => {
//     setEditData(item);
//     setIsEditOpen(true);
//   };

//   const handleEdit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await apiClient.updateTypeofitem(editData.id, editData);
//       toast.success("تم التعديل بنجاح");
//       setIsEditOpen(false);
//       fetchData();
//     } catch (e) {
//       toast.error("خطأ في التعديل");
//     }
//   };

//   return (
//     <div className="space-y-6 pb-20">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <h1 className="text-2xl font-bold">أنواع العناصر</h1>

//         <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
//           <DialogTrigger asChild>
//             <Button className="gap-2 bg-primary hover:bg-primary/90 rounded-xl px-6">
//               <Plus size={16} /> إضافة نوع عنصر جديد
//             </Button>
//           </DialogTrigger>
//           <DialogContent
//             className="sm:max-w-[425px] rounded-2xl p-6 text-right"
//             dir="rtl"
//           >
//             <DialogHeader>
//               <DialogTitle className="text-right text-xl font-bold">
//                 إضافة نوع عنصر
//               </DialogTitle>
//             </DialogHeader>
//             <form onSubmit={handleAdd} className="space-y-4 pt-4">
//               <div className="space-y-2">
//                 <Label className="block font-bold">النوع</Label>
//                 <Input
//                   required
//                   value={addData.item_type}
//                   onChange={(e) =>
//                     setAddData({ ...addData, item_type: e.target.value })
//                   }
//                   className="rounded-xl"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label className="block font-bold">الرمز</Label>
//                 <Input
//                   value={addData.typecode}
//                   onChange={(e) =>
//                     setAddData({ ...addData, typecode: e.target.value })
//                   }
//                   className="rounded-xl"
//                 />
//               </div>
//               <DialogFooter className="mt-6">
//                 <Button type="submit" className="w-full rounded-xl bg-primary">
//                   حفظ
//                 </Button>
//               </DialogFooter>
//             </form>
//           </DialogContent>
//         </Dialog>

//         <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
//           <DialogContent
//             className="sm:max-w-[425px] rounded-2xl p-6 text-right"
//             dir="rtl"
//           >
//             <DialogHeader>
//               <DialogTitle className="text-right text-xl font-bold">
//                 تعديل نوع العنصر
//               </DialogTitle>
//             </DialogHeader>
//             <form onSubmit={handleEdit} className="space-y-4 pt-4">
//               <div className="space-y-2">
//                 <Label className="block font-bold">النوع</Label>
//                 <Input
//                   required
//                   value={editData.item_type}
//                   onChange={(e) =>
//                     setEditData({ ...editData, item_type: e.target.value })
//                   }
//                   className="rounded-xl"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label className="block font-bold">الرمز</Label>
//                 <Input
//                   value={editData.typecode}
//                   onChange={(e) =>
//                     setEditData({ ...editData, typecode: e.target.value })
//                   }
//                   className="rounded-xl"
//                 />
//               </div>
//               <DialogFooter className="mt-6">
//                 <Button type="submit" className="w-full rounded-xl bg-primary">
//                   حفظ التعديلات
//                 </Button>
//               </DialogFooter>
//             </form>
//           </DialogContent>
//         </Dialog>
//       </div>

//       <Card>
//         <CardContent className="p-0">
//           <Table>
//             <TableHeader className="bg-slate-50">
//               <TableRow>
//                 <TableHead className="text-right font-black">النوع</TableHead>
//                 <TableHead className="text-right font-black">الرمز</TableHead>
//                 <TableHead className="text-center font-black">
//                   الإجراءات
//                 </TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {loading ? (
//                 <TableRow>
//                   <TableCell colSpan={3} className="text-center py-10">
//                     جاري التحميل...
//                   </TableCell>
//                 </TableRow>
//               ) : data.length === 0 ? (
//                 <TableRow>
//                   <TableCell
//                     colSpan={3}
//                     className="text-center py-10 text-slate-500"
//                   >
//                     لا توجد بيانات
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 data.map((item: any) => (
//                   <TableRow key={item.id}>
//                     <TableCell>{item.item_type}</TableCell>
//                     <TableCell>{item.typecode}</TableCell>
//                     <TableCell className="text-center">
//                       <div className="flex justify-center items-center gap-2">
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => handleEditClick(item)}
//                           className="text-blue-500 hover:bg-blue-50"
//                         >
//                           <Edit size={16} />
//                         </Button>
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => handleDelete(item.id)}
//                           className="text-rose-500 hover:bg-rose-50"
//                         >
//                           <Trash2 size={16} />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Layers, FileText, AlertTriangle } from "lucide-react";
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
  DialogDescription,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";
import { apiClient } from "@/app/lib/api-client";
import { toast } from "sonner";
import { usePermissions } from "@/app/hooks/use-permissions";
import { PERMISSIONS } from "@/app/lib/permissions";
import { useRouter } from "next/navigation";

export default function ItemTypesPage() {
  const { hasPermission, loading: permLoading } = usePermissions();
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!permLoading && !hasPermission(PERMISSIONS.VIEW_ITEM_TYPE)) {
      router.push("/dashboard");
    }
  }, [hasPermission, permLoading, router]);

  // حالة الإضافة (بدون كود لأن السيرفر يولده)
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addData, setAddData] = useState({
    item_type: "",
    description: "",
    isActive: true,
  });

  // حالة التعديل
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: 0,
    typecode: "",
    item_type: "",
    description: "",
    isActive: true,
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const fetchData = async () => {
    try {
      const res = await apiClient.getTypeofitems();
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

  const handleAdd = async (e?: any) => {
    if (e) e.preventDefault();
    if (!addData.item_type.trim()) {
      toast.error("يرجى إدخال اسم النوع");
      return;
    }

    try {
      await apiClient.createTypeofitem(addData);
      toast.success("تم الإضافة بنجاح");
      setIsAddOpen(false);
      setAddData({ item_type: "", description: "", isActive: true });
      fetchData();
    } catch (e) {
      toast.error("خطأ في الإضافة");
    }
  };

  const handleEditClick = (item: any) => {
    setEditData({
      id: item.id,
      typecode: item.typecode || "",
      item_type: item.item_type || "",
      description: item.description || "",
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setIsEditOpen(true);
  };

  const handleEdit = async (e?: any) => {
    if (e) e.preventDefault();
    if (!editData.item_type.trim()) {
      toast.error("يرجى إدخال اسم النوع");
      return;
    }

    try {
      await apiClient.updateTypeofitem(editData.id, editData);
      toast.success("تم التعديل بنجاح");
      setIsEditOpen(false);
      fetchData();
    } catch (e) {
      toast.error("خطأ في التعديل");
    }
  };

  const openDeleteDialog = (id: number) => {
    const item = data.find((d) => d.id === id);
    setDeleteTarget({ id, name: item?.item_type || "هذا النوع" });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.deleteTypeofitem(deleteTarget.id);
      toast.success("تم الحذف بنجاح");
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
      fetchData();
    } catch (e) {
      toast.error("لا يمكن الحذف لأن هذا النوع مرتبط بمنتجات مسجلة.");
    }
  };

  const handleDelete = async (id: number) => {
    openDeleteDialog(id);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Layers className="text-primary" />
          الأنواع الرئيسية للاصناف
        </h1>
        {hasPermission(PERMISSIONS.CREATE_ITEM_TYPE) && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary rounded-xl px-6">
                <Plus size={16} /> إضافة نوع جديد
              </Button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-[425px] rounded-2xl p-6 text-right"
              dir="rtl"
            >
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  إضافة نوع (تصنيف) جديد
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="font-bold">
                    اسم النوع (مثال: بسكويت، عصير طبيعي)
                  </Label>
                  <Input
                    value={addData.item_type}
                    onChange={(e) =>
                      setAddData({ ...addData, item_type: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">وصف النوع (اختياري)</Label>
                  <div className="relative">
                    <FileText
                      className="absolute right-3 top-3 text-gray-400"
                      size={16}
                    />
                    <Input
                      value={addData.description}
                      onChange={(e) =>
                        setAddData({ ...addData, description: e.target.value })
                      }
                      className="rounded-xl pr-10"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={addData.isActive}
                    onChange={(e) =>
                      setAddData({ ...addData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-primary"
                  />
                  <Label htmlFor="isActive" className="font-bold cursor-pointer">
                    النوع متاح للاستخدام
                  </Label>
                </div>
                <Button
                  type="button"
                  onClick={handleAdd}
                  className="w-full rounded-xl mt-4"
                >
                  حفظ النوع
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="sm:max-w-[425px] rounded-2xl p-6 text-right"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              تعديل نوع الصنف
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="font-bold text-gray-500">
                كود النوع (للعرض فقط)
              </Label>
              <Input
                disabled
                value={editData.typecode}
                className="rounded-xl bg-gray-50 text-center font-mono font-bold"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">اسم النوع</Label>
              <Input
                value={editData.item_type}
                onChange={(e) =>
                  setEditData({ ...editData, item_type: e.target.value })
                }
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">الوصف</Label>
              <Input
                value={editData.description}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
                className="rounded-xl"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="editIsActive"
                checked={editData.isActive}
                onChange={(e) =>
                  setEditData({ ...editData, isActive: e.target.checked })
                }
                className="w-4 h-4 rounded text-primary"
              />
              <Label
                htmlFor="editIsActive"
                className="font-bold cursor-pointer"
              >
                النوع متاح
              </Label>
            </div>
            <Button
              type="button"
              onClick={handleEdit}
              className="w-full rounded-xl mt-4"
            >
              حفظ التعديلات
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="rounded-2xl border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="text-right font-bold py-4">
                  الكود
                </TableHead>
                <TableHead className="text-right font-bold py-4">
                  اسم النوع
                </TableHead>
                <TableHead className="text-right font-bold py-4">
                  الوصف
                </TableHead>
                <TableHead className="text-right font-bold py-4">
                  الحالة
                </TableHead>
                <TableHead className="text-center font-bold py-4 w-[100px]">
                  إجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-slate-500"
                  >
                    لا توجد بيانات
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="font-mono text-sm bg-slate-50"
                      >
                        {item.typecode}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-gray-900">
                      {item.item_type}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {item.description || "—"}
                    </TableCell>
                    <TableCell>
                      {item.isActive ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                          متاح
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-rose-600 bg-rose-50 border-rose-200"
                        >
                          متوقف
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center gap-2">
                        {hasPermission(PERMISSIONS.EDIT_ITEM_TYPE) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(item)}
                            className="text-blue-500 hover:bg-blue-50"
                          >
                            <Edit size={16} />
                          </Button>
                        )}
                        {hasPermission(PERMISSIONS.DELETE_ITEM_TYPE) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(item.id)}
                            className="text-rose-500 hover:bg-rose-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent
          className="sm:max-w-[420px] rounded-[32px] p-8 border-none shadow-2xl"
          dir="rtl"
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
              <AlertTriangle className="text-rose-600" size={32} />
            </div>
            <DialogTitle className="font-black text-slate-900 text-xl">
              حذف نوع الصنف
            </DialogTitle>
            <DialogDescription className="font-bold text-slate-500 py-4">
              هل أنت متأكد من حذف{" "}
              <strong className="text-slate-900">{deleteTarget?.name}</strong>
              ？ هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </div>
          <DialogFooter className="gap-3 mt-4 flex sm:justify-center">
            <Button
              onClick={confirmDelete}
              className="rounded-2xl h-12 flex-1 bg-rose-600 font-bold hover:bg-rose-700 transition-colors"
            >
              نعم، احذف
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-2xl h-12 flex-1 font-bold"
            >
              تراجع
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
