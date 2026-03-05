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

// export default function DepotsPage() {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Add State
//   const [isAddOpen, setIsAddOpen] = useState(false);
//   const [addData, setAddData] = useState({
//     depot_name: "",
//     depot_place: "",
//     depot_code: "",
//   });

//   // Edit State
//   const [isEditOpen, setIsEditOpen] = useState(false);
//   const [editData, setEditData] = useState({
//     id: 0,
//     depot_name: "",
//     depot_place: "",
//     depot_code: "",
//   });

//   const fetchData = async () => {
//     try {
//       const res = await apiClient.getDepots();
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
//       await apiClient.deleteDepot(id);
//       toast.success("تم الحذف بنجاح");
//       fetchData();
//     } catch (e) {
//       toast.error("خطأ في الحذف");
//     }
//   };

//   const handleAdd = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await apiClient.createDepot(addData);
//       toast.success("تمت الإضافة بنجاح");
//       setIsAddOpen(false);
//       setAddData({ depot_name: "", depot_place: "", depot_code: "" });
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
//       await apiClient.updateDepot(editData.id, editData);
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
//         <h1 className="text-2xl font-bold">المستودعات</h1>

//         <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
//           <DialogTrigger asChild>
//             <Button className="gap-2 bg-primary hover:bg-primary/90 rounded-xl px-6">
//               <Plus size={16} /> إضافة مستودع جديد
//             </Button>
//           </DialogTrigger>
//           <DialogContent
//             className="sm:max-w-[425px] rounded-2xl p-6 text-right"
//             dir="rtl"
//           >
//             <DialogHeader>
//               <DialogTitle className="text-right text-xl font-bold">
//                 إضافة مستودع
//               </DialogTitle>
//             </DialogHeader>
//             <form onSubmit={handleAdd} className="space-y-4 pt-4">
//               <div className="space-y-2">
//                 <Label className="block font-bold">الاسم</Label>
//                 <Input
//                   required
//                   value={addData.depot_name}
//                   onChange={(e) =>
//                     setAddData({ ...addData, depot_name: e.target.value })
//                   }
//                   className="rounded-xl"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label className="block font-bold">المكان</Label>
//                 <Input
//                   value={addData.depot_place}
//                   onChange={(e) =>
//                     setAddData({ ...addData, depot_place: e.target.value })
//                   }
//                   className="rounded-xl"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label className="block font-bold">الرمز</Label>
//                 <Input
//                   value={addData.depot_code}
//                   onChange={(e) =>
//                     setAddData({ ...addData, depot_code: e.target.value })
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
//                 تعديل المستودع
//               </DialogTitle>
//             </DialogHeader>
//             <form onSubmit={handleEdit} className="space-y-4 pt-4">
//               <div className="space-y-2">
//                 <Label className="block font-bold">الاسم</Label>
//                 <Input
//                   required
//                   value={editData.depot_name}
//                   onChange={(e) =>
//                     setEditData({ ...editData, depot_name: e.target.value })
//                   }
//                   className="rounded-xl"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label className="block font-bold">المكان</Label>
//                 <Input
//                   value={editData.depot_place}
//                   onChange={(e) =>
//                     setEditData({ ...editData, depot_place: e.target.value })
//                   }
//                   className="rounded-xl"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label className="block font-bold">الرمز</Label>
//                 <Input
//                   value={editData.depot_code}
//                   onChange={(e) =>
//                     setEditData({ ...editData, depot_code: e.target.value })
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
//                 <TableHead className="text-right font-black">الاسم</TableHead>
//                 <TableHead className="text-right font-black">المكان</TableHead>
//                 <TableHead className="text-right font-black">الرمز</TableHead>
//                 <TableHead className="text-center font-black">
//                   الإجراءات
//                 </TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {loading ? (
//                 <TableRow>
//                   <TableCell colSpan={4} className="text-center py-10">
//                     جاري التحميل...
//                   </TableCell>
//                 </TableRow>
//               ) : data.length === 0 ? (
//                 <TableRow>
//                   <TableCell
//                     colSpan={4}
//                     className="text-center py-10 text-slate-500"
//                   >
//                     لا توجد بيانات
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 data.map((item: any) => (
//                   <TableRow key={item.id}>
//                     <TableCell>{item.depot_name}</TableCell>
//                     <TableCell>{item.depot_place}</TableCell>
//                     <TableCell>{item.depot_code}</TableCell>
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
import {
  Plus,
  Trash2,
  Edit,
  Activity,
  MapPin,
  User,
  Phone,
} from "lucide-react";
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
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge"; // استخدمنا Badge لعرض حالة المستودع
import { apiClient } from "@/app/lib/api-client";
import { toast } from "sonner";

export default function DepotsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // حالة الإضافة الجديدة (بدون depot_code)
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addData, setAddData] = useState({
    depot_name: "",
    location: "",
    manager_name: "",
    contact_number: "",
    isActive: true, // المستودع نشط افتراضياً
  });

  // حالة التعديل
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: 0,
    depot_name: "",
    depot_code: "", // نحتفظ به للعرض فقط أثناء التعديل
    location: "",
    manager_name: "",
    contact_number: "",
    isActive: true,
  });

  const fetchData = async () => {
    try {
      // يجب أن يتم إرجاع الحقول الجديدة من الـ API ضمن البيانات
      const res = await apiClient.getDepots();
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

  // تعديل وظيفة الحذف (يمكنك لاحقاً تحويلها لإيقاف التفعيل بدل الحذف النهائي)
  const handleDelete = async (id: number | string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      await apiClient.deleteDepot(id);
      toast.success("تم الحذف بنجاح");
      fetchData();
    } catch (e) {
      toast.error("خطأ في الحذف");
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await apiClient.createDepot(addData);
      if (!result) {
        toast.error("غير مصرح لك بالإضافة. يرجى تسجيل الدخول مرة أخرى.");
        return;
      }
      toast.success("تمت الإضافة بنجاح");
      setIsAddOpen(false);
      // تصفير البيانات بعد الإضافة
      setAddData({
        depot_name: "",
        location: "",
        manager_name: "",
        contact_number: "",
        isActive: true,
      });
      fetchData();
    } catch (e: any) {
      console.error("Error creating depot:", e);
      toast.error(e?.message || "خطأ في الإضافة");
    }
  };

  const handleEditClick = (item: any) => {
    setEditData({
      id: item.id,
      depot_name: item.depot_name || "",
      depot_code: item.depot_code || "",
      location: item.location || "",
      manager_name: item.manager_name || "",
      contact_number: item.contact_number || "",
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await apiClient.updateDepot(editData.id, editData);
      if (!result) {
        toast.error("غير مصرح لك بالتعديل. يرجى تسجيل الدخول مرة أخرى.");
        return;
      }
      toast.success("تم التعديل بنجاح");
      setIsEditOpen(false);
      fetchData();
    } catch (e: any) {
      console.error("Error updating depot:", e);
      toast.error(e?.message || "خطأ في التعديل");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">المستودعات</h1>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90 rounded-xl px-6 cursor-pointer">
              <Plus size={16} /> إضافة مستودع جديد
            </Button>
          </DialogTrigger>
          <DialogContent
            className="sm:max-w-[425px] rounded-2xl p-6 text-right"
            dir="rtl"
          >
            <DialogHeader>
              <DialogTitle className="text-right text-xl font-bold">
                إضافة مستودع
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="block font-bold">اسم المستودع</Label>
                <Input
                  required
                  value={addData.depot_name}
                  onChange={(e) =>
                    setAddData({ ...addData, depot_name: e.target.value })
                  }
                  className="rounded-xl"
                  placeholder="مستودع العبور..."
                />
              </div>

              {/* الحقول اللوجستية الجديدة */}
              <div className="space-y-2">
                <Label className="block font-bold">الموقع / العنوان</Label>
                <div className="relative">
                  <MapPin
                    className="absolute right-3 top-3 text-gray-400"
                    size={16}
                  />
                  <Input
                    value={addData.location}
                    onChange={(e) =>
                      setAddData({ ...addData, location: e.target.value })
                    }
                    className="rounded-xl pr-10"
                    placeholder="المدينة، المنطقة..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="block font-bold">أمين المستودع</Label>
                <div className="relative">
                  <User
                    className="absolute right-3 top-3 text-gray-400"
                    size={16}
                  />
                  <Input
                    value={addData.manager_name}
                    onChange={(e) =>
                      setAddData({ ...addData, manager_name: e.target.value })
                    }
                    className="rounded-xl pr-10"
                    placeholder="اسم المسؤول..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="block font-bold">رقم التواصل</Label>
                <div className="relative">
                  <Phone
                    className="absolute right-3 top-3 text-gray-400"
                    size={16}
                  />
                  <Input
                    value={addData.contact_number}
                    onChange={(e) =>
                      setAddData({ ...addData, contact_number: e.target.value })
                    }
                    className="rounded-xl pr-10 text-left"
                    dir="ltr"
                    placeholder="+90 5XX XXX XX XX"
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
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <Label htmlFor="isActive" className="font-bold cursor-pointer">
                  المستودع نشط ويعمل حالياً
                </Label>
              </div>

              <Button type="submit" className="w-full rounded-xl mt-4">
                حفظ المستودع
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* نافذة التعديل */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="sm:max-w-[425px] rounded-2xl p-6 text-right"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle className="text-right text-xl font-bold">
              تعديل المستودع
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="block font-bold text-gray-500">
                كود المستودع (للعرض فقط)
              </Label>
              <Input
                disabled
                value={editData.depot_code}
                className="rounded-xl bg-gray-100 cursor-not-allowed text-center font-bold"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label className="block font-bold">الاسم</Label>
              <Input
                required
                value={editData.depot_name}
                onChange={(e) =>
                  setEditData({ ...editData, depot_name: e.target.value })
                }
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="block font-bold">الموقع / العنوان</Label>
              <Input
                value={editData.location}
                onChange={(e) =>
                  setEditData({ ...editData, location: e.target.value })
                }
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="block font-bold">أمين المستودع</Label>
              <Input
                value={editData.manager_name}
                onChange={(e) =>
                  setEditData({ ...editData, manager_name: e.target.value })
                }
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="block font-bold">رقم التواصل</Label>
              <Input
                value={editData.contact_number}
                onChange={(e) =>
                  setEditData({ ...editData, contact_number: e.target.value })
                }
                className="rounded-xl text-left"
                dir="ltr"
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
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <Label
                htmlFor="editIsActive"
                className="font-bold cursor-pointer"
              >
                المستودع نشط
              </Label>
            </div>

            <Button type="submit" className="w-full rounded-xl mt-4">
              حفظ التعديلات
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="rounded-2xl border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                <TableHead className="text-right font-bold py-4">
                  الكود
                </TableHead>
                <TableHead className="text-right font-bold py-4">
                  اسم المستودع
                </TableHead>
                <TableHead className="text-right font-bold py-4">
                  الموقع
                </TableHead>
                <TableHead className="text-right font-bold py-4">
                  أمين المستودع
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
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    لا توجد بيانات
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline" className="font-mono text-xs">
                        {item.depot_code}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold">
                      {item.depot_name}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {item.location || "—"}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {item.manager_name || "—"}
                    </TableCell>
                    <TableCell>
                      {item.isActive ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200">
                          نشط
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-gray-500">
                          متوقف
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(item)}
                          className="text-blue-500 hover:bg-blue-50 cursor-pointer"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="text-rose-500 hover:bg-rose-50 cursor-pointer"
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
