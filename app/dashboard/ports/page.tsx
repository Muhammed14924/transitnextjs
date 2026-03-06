"use client";

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

// export default function PortsPage() {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Add State
//   const [isAddOpen, setIsAddOpen] = useState(false);
//   const [addData, setAddData] = useState({ port_name: "" });

//   // Edit State
//   const [isEditOpen, setIsEditOpen] = useState(false);
//   const [editData, setEditData] = useState({ id: 0, port_name: "" });

//   const fetchData = async () => {
//     try {
//       const res = await apiClient.getPorts();
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
//       await apiClient.deletePort(id);
//       toast.success("تم الحذف بنجاح");
//       fetchData();
//     } catch (e) {
//       toast.error("خطأ في الحذف");
//     }
//   };

//   const handleAdd = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await apiClient.createPort(addData);
//       toast.success("تمت الإضافة بنجاح");
//       setIsAddOpen(false);
//       setAddData({ port_name: "" });
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
//       await apiClient.updatePort(editData.id, editData);
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
//         <h1 className="text-2xl font-bold">المنافذ</h1>

//         <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
//           <DialogTrigger asChild>
//             <Button className="gap-2 bg-primary hover:bg-primary/90 rounded-xl px-6">
//               <Plus size={16} /> إضافة منفذ جديد
//             </Button>
//           </DialogTrigger>
//           <DialogContent
//             className="sm:max-w-[425px] rounded-2xl p-6 text-right"
//             dir="rtl"
//           >
//             <DialogHeader>
//               <DialogTitle className="text-right text-xl font-bold">
//                 إضافة منفذ
//               </DialogTitle>
//             </DialogHeader>
//             <form onSubmit={handleAdd} className="space-y-4 pt-4">
//               <div className="space-y-2">
//                 <Label className="block font-bold">اسم المنفذ</Label>
//                 <Input
//                   required
//                   value={addData.port_name}
//                   onChange={(e) =>
//                     setAddData({ ...addData, port_name: e.target.value })
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
//                 تعديل المنفذ
//               </DialogTitle>
//             </DialogHeader>
//             <form onSubmit={handleEdit} className="space-y-4 pt-4">
//               <div className="space-y-2">
//                 <Label className="block font-bold">اسم المنفذ</Label>
//                 <Input
//                   required
//                   value={editData.port_name}
//                   onChange={(e) =>
//                     setEditData({ ...editData, port_name: e.target.value })
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
//                 <TableHead className="text-right font-black">
//                   اسم المنفذ
//                 </TableHead>
//                 <TableHead className="text-center font-black">
//                   الإجراءات
//                 </TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {loading ? (
//                 <TableRow>
//                   <TableCell colSpan={2} className="text-center py-10">
//                     جاري التحميل...
//                   </TableCell>
//                 </TableRow>
//               ) : data.length === 0 ? (
//                 <TableRow>
//                   <TableCell
//                     colSpan={2}
//                     className="text-center py-10 text-slate-500"
//                   >
//                     لا توجد بيانات
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 data.map((item: any) => (
//                   <TableRow key={item.id}>
//                     <TableCell>{item.port_name}</TableCell>
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
import { Plus, Trash2, Edit, MapPin, Globe } from "lucide-react";
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
import { Badge } from "@/app/components/ui/badge";
import { apiClient } from "@/app/lib/api-client";
import { toast } from "sonner";

export default function PortsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addData, setAddData] = useState({
    port_name: "",
    port_code: "",
    city: "",
    country: "",
    isActive: true,
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: 0,
    port_name: "",
    port_code: "",
    city: "",
    country: "",
    isActive: true,
  });

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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createPort(addData);
      toast.success("تم الإضافة بنجاح");
      setIsAddOpen(false);
      setAddData({
        port_name: "",
        port_code: "",
        city: "",
        country: "",
        isActive: true,
      });
      fetchData();
    } catch (e) {
      toast.error("خطأ في الإضافة");
    }
  };

  const handleEditClick = (item: any) => {
    setEditData({
      id: item.id,
      port_name: item.port_name || "",
      port_code: item.port_code || "",
      city: item.city || "",
      country: item.country || "",
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
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

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      await apiClient.deletePort(id);
      toast.success("تم الحذف بنجاح");
      fetchData();
    } catch (e) {
      toast.error("خطأ في الحذف");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">الموانئ</h1>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary hover:bg-primary/90 rounded-xl px-6">
              <Plus size={16} /> إضافة ميناء
            </Button>
          </DialogTrigger>
          <DialogContent
            className="sm:max-w-[425px] rounded-2xl p-6 text-right"
            dir="rtl"
          >
            <DialogHeader>
              <DialogTitle className="text-right text-xl font-bold">
                إضافة ميناء جديد
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">اسم الميناء</Label>
                  <Input
                    required
                    value={addData.port_name}
                    onChange={(e) =>
                      setAddData({ ...addData, port_name: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">الكود العالمي</Label>
                  <Input
                    value={addData.port_code}
                    onChange={(e) =>
                      setAddData({ ...addData, port_code: e.target.value })
                    }
                    className="rounded-xl"
                    placeholder="TRMER"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">المدينة</Label>
                <div className="relative">
                  <MapPin
                    className="absolute right-3 top-3 text-gray-400"
                    size={16}
                  />
                  <Input
                    value={addData.city}
                    onChange={(e) =>
                      setAddData({ ...addData, city: e.target.value })
                    }
                    className="rounded-xl pr-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">الدولة</Label>
                <div className="relative">
                  <Globe
                    className="absolute right-3 top-3 text-gray-400"
                    size={16}
                  />
                  <Input
                    value={addData.country}
                    onChange={(e) =>
                      setAddData({ ...addData, country: e.target.value })
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
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <Label htmlFor="isActive" className="font-bold cursor-pointer">
                  الميناء يعمل
                </Label>
              </div>

              <Button type="submit" className="w-full rounded-xl mt-4">
                حفظ الميناء
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="sm:max-w-[425px] rounded-2xl p-6 text-right"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle className="text-right text-xl font-bold">
              تعديل الميناء
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">اسم الميناء</Label>
                <Input
                  required
                  value={editData.port_name}
                  onChange={(e) =>
                    setEditData({ ...editData, port_name: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">الكود العالمي</Label>
                <Input
                  value={editData.port_code}
                  onChange={(e) =>
                    setEditData({ ...editData, port_code: e.target.value })
                  }
                  className="rounded-xl"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold">المدينة</Label>
              <Input
                value={editData.city}
                onChange={(e) =>
                  setEditData({ ...editData, city: e.target.value })
                }
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">الدولة</Label>
              <Input
                value={editData.country}
                onChange={(e) =>
                  setEditData({ ...editData, country: e.target.value })
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
                className="w-4 h-4 rounded text-primary focus:ring-primary"
              />
              <Label
                htmlFor="editIsActive"
                className="font-bold cursor-pointer"
              >
                الميناء يعمل
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
              <TableRow className="bg-gray-50/50">
                <TableHead className="text-right font-bold py-4">
                  الكود
                </TableHead>
                <TableHead className="text-right font-bold py-4">
                  اسم الميناء
                </TableHead>
                <TableHead className="text-right font-bold py-4">
                  المدينة
                </TableHead>
                <TableHead className="text-right font-bold py-4">
                  الدولة
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
                  <TableCell colSpan={6} className="text-center py-8">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-slate-500"
                  >
                    لا توجد بيانات
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant="outline">{item.port_code || "—"}</Badge>
                    </TableCell>
                    <TableCell className="font-bold">
                      {item.port_name}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {item.city || "—"}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {item.country || "—"}
                    </TableCell>
                    <TableCell>
                      {item.isActive ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                          يعمل
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
