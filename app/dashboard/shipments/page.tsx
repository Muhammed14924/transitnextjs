"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  Calendar,
  Layers,
  AlertTriangle,
  PackageCheck,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
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
import { Badge } from "@/app/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { cn } from "@/app/lib/utils";
import { apiClient } from "@/app/lib/api-client";
import { toast } from "sonner";

interface Shipment {
  id: number;
  shipment_number: string;
  container_number?: string;
  goods_description?: string;
  status: string;
  shipping_date?: string;
  origin?: string;
  weight?: number;
  quantity?: number;
  companies?: { company_name: string };
  company_name?: number;
}

export default function ShipmentsPage() {
  const { user } = useAuth();
  const canWrite = user?.role === "ADMIN" || user?.role === "MANAGER";
  const [shipmentsData, setShipmentsData] = useState<Shipment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null,
  );

  const [companies, setCompanies] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    shipment_number: "",
    container_number: "",
    goods_description: "",
    status: "في الطريق",
    company_name: "",
    weight: 0,
    quantity: 0,
    origin: "",
  });

  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getShipments({ limit: 10, q: searchTerm });
      if (data) {
        setShipmentsData(data.shipments);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Failed to fetch shipments", error);
      toast.error("فشل في تحميل الشحنات");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  const fetchCompanies = async () => {
    const data = await apiClient.getCompanies();
    if (data) setCompanies(data);
  };

  useEffect(() => {
    fetchShipments();
    fetchCompanies();
  }, [fetchShipments]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createShipment({
        ...formData,
        company_name: parseInt(formData.company_name),
        weight: Number(formData.weight),
        quantity: Number(formData.quantity),
      });
      setIsAddDialogOpen(false);
      resetForm();
      fetchShipments();
      toast.success("تم تسجيل الشحنة بنجاح");
    } catch (error) {
      console.error("Error creating shipment", error);
      toast.error("حدث خطأ أثناء الإضافة");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;
    try {
      await apiClient.updateShipment(selectedShipment.id, {
        ...formData,
        company_name: parseInt(formData.company_name),
        weight: Number(formData.weight),
        quantity: Number(formData.quantity),
      });
      setIsEditDialogOpen(false);
      resetForm();
      fetchShipments();
      toast.success("تم تحديث بيانات الشحنة");
    } catch (error) {
      console.error("Error updating shipment", error);
      toast.error("حدث خطأ أثناء التحديث");
    }
  };

  const handleDelete = async () => {
    if (!selectedShipment) return;
    try {
      await apiClient.deleteShipment(selectedShipment.id);
      setIsDeleteDialogOpen(false);
      setSelectedShipment(null);
      fetchShipments();
      toast.success("تم حذف الشحنة بنجاح");
    } catch (error) {
      console.error("Error deleting shipment", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const openEditDialog = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setFormData({
      shipment_number: shipment.shipment_number || "",
      container_number: shipment.container_number || "",
      goods_description: shipment.goods_description || "",
      status: shipment.status || "في الطريق",
      company_name: (shipment.company_name || "").toString(),
      weight: shipment.weight || 0,
      quantity: shipment.quantity || 0,
      origin: shipment.origin || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      shipment_number: "",
      container_number: "",
      goods_description: "",
      status: "في الطريق",
      company_name: "",
      weight: 0,
      quantity: 0,
      origin: "",
    });
    setSelectedShipment(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            إدارة الشحنات
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            تتبع وإدارة جميع الشحنات وعمليات النقل النشطة في الوقت الحقيقي.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-xl h-10 gap-2 border-slate-200 text-slate-600 bg-white hover:bg-slate-50 font-medium"
          >
            <Download size={16} />
            تصدير PDF
          </Button>
          {canWrite && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl h-10 gap-2 bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all px-6">
                <Plus size={16} />
                إضافة شحنة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-2xl p-8">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-right text-slate-900">
                  إضافة شحنة جديدة
                </DialogTitle>
                <DialogDescription className="text-right text-slate-500">
                  أدخل تفاصيل الشحنة الجديدة ليتم تسجيلها وجدولتها في النظام.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate}>
                <div className="grid grid-cols-2 gap-5 py-6 rtl text-right">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="shipment_number"
                      className="font-bold text-slate-700"
                    >
                      رقم الشحنة
                    </Label>
                    <Input
                      id="shipment_number"
                      value={formData.shipment_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shipment_number: e.target.value,
                        })
                      }
                      className="rounded-xl h-11 bg-slate-50 border-slate-100 font-medium"
                      placeholder="SHP-2024-XXX"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="container_number"
                      className="font-bold text-slate-700"
                    >
                      رقم الحاوية
                    </Label>
                    <Input
                      id="container_number"
                      value={formData.container_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          container_number: e.target.value,
                        })
                      }
                      className="rounded-xl h-11 bg-slate-50 border-slate-100 font-medium"
                      placeholder="CONT-XXXXXX"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="comp_id"
                      className="font-bold text-slate-700"
                    >
                      الشركة المالكة
                    </Label>
                    <select
                      id="comp_id"
                      value={formData.company_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          company_name: e.target.value,
                        })
                      }
                      className="w-full h-11 rounded-xl border border-slate-100 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-900"
                      required
                    >
                      <option value="">اختر الشركة...</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.company_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="status"
                      className="font-bold text-slate-700"
                    >
                      حالة الشحنة
                    </Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full h-11 rounded-xl border border-slate-100 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-slate-900"
                    >
                      <option value="في الطريق">في الطريق</option>
                      <option value="تم التوصيل">تم التوصيل</option>
                      <option value="معلق">معلق</option>
                      <option value="قيد المعالجة">قيد المعالجة</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="origin"
                      className="font-bold text-slate-700"
                    >
                      المنشأ
                    </Label>
                    <Input
                      id="origin"
                      value={formData.origin}
                      onChange={(e) =>
                        setFormData({ ...formData, origin: e.target.value })
                      }
                      className="rounded-xl h-11 bg-slate-50 border-slate-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="qty" className="font-bold text-slate-700">
                        الكمية
                      </Label>
                      <Input
                        id="qty"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            quantity: Number(e.target.value),
                          })
                        }
                        className="h-11 rounded-xl bg-slate-50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="weight"
                        className="font-bold text-slate-700"
                      >
                        الوزن
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            weight: Number(e.target.value),
                          })
                        }
                        className="h-11 rounded-xl bg-slate-50"
                      />
                    </div>
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label htmlFor="desc" className="font-bold text-slate-700">
                      وصف البضائع
                    </Label>
                    <Input
                      id="desc"
                      value={formData.goods_description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          goods_description: e.target.value,
                        })
                      }
                      className="rounded-xl h-11 bg-slate-50 border-slate-100"
                    />
                  </div>
                </div>
                <DialogFooter className="flex-row-reverse sm:justify-start gap-3 pt-4 border-t border-slate-50">
                  <Button
                    type="submit"
                    className="rounded-xl px-12 h-12 font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20"
                  >
                    تسجيل الشحنة
                  </Button>
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="rounded-xl h-12 px-8 font-bold text-slate-400"
                  >
                    إلغاء
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MiniStatsCard
          title="نشط حالياً"
          value={loading ? "..." : total.toString()}
          detail="إجمالي الشحنات"
          color="blue"
          icon={<Truck size={18} />}
        />
        <MiniStatsCard
          title="تم التسليم"
          value="45"
          detail="خلال الـ 30 يوماً الماضية"
          color="emerald"
          icon={<CheckCircle2 size={18} />}
        />
        <MiniStatsCard
          title="قيد الانتظار"
          value="12"
          detail="تحتاج إجراء"
          color="amber"
          icon={<Clock size={18} />}
        />
        <MiniStatsCard
          title="بوابات نشطة"
          value="5"
          detail="تحديث مباشر"
          color="indigo"
          icon={<MapPin size={18} />}
        />
      </div>

      <Card className="border-slate-100 shadow-xl shadow-slate-200/50 rounded-[28px] overflow-hidden hover:shadow-2xl transition-all duration-500 bg-white border-none">
        <CardHeader className="bg-white border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 py-10 px-8">
          <div className="relative w-full md:w-[450px] group">
            <Search
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
              size={20}
            />
            <Input
              placeholder="ابحث برقم الشحنة، الحاوية، أو الشركة..."
              className="pr-12 bg-slate-50 border-slate-100 focus:bg-white focus:border-primary/20 focus-visible:ring-primary/5 rounded-[20px] h-12 text-sm font-medium transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => fetchShipments()}
              className="h-12 rounded-[20px] gap-2 border-slate-100 text-slate-600 bg-white hover:bg-slate-50 font-bold px-6 shadow-sm"
            >
              تحديث البيانات
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-14">
                <TableHead className="text-right font-black text-slate-400 text-xs px-8 uppercase tracking-widest">
                  المعرف / التتبع
                </TableHead>
                <TableHead className="text-right font-black text-slate-400 text-xs px-4 uppercase tracking-widest">
                  العميل / الشركة
                </TableHead>
                <TableHead className="text-right font-black text-slate-400 text-xs px-4 uppercase tracking-widest">
                  المسار والبيانات
                </TableHead>
                <TableHead className="text-right font-black text-slate-400 text-xs px-4 uppercase tracking-widest text-center">
                  التاريخ والحالة
                </TableHead>
                <TableHead className="text-center font-black text-slate-400 text-xs px-8 uppercase tracking-widest">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipmentsData.length > 0 ? (
                shipmentsData.map((shipment) => (
                  <TableRow
                    key={shipment.id}
                    className="hover:bg-slate-50/40 transition-all border-slate-50 h-[92px] group"
                  >
                    <TableCell className="px-8">
                      <div className="flex flex-col gap-1">
                        <span className="font-black text-primary text-sm tracking-tight">
                          {shipment.shipment_number || `ID-${shipment.id}`}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                          <Layers size={11} className="text-slate-300" />
                          <span>
                            {shipment.container_number || "حاوية مفقودة"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-xs text-slate-400">
                          {shipment.companies?.company_name?.[0] || "C"}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm truncate max-w-[180px]">
                            {shipment.companies?.company_name || "غير محدد"}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            العميل المالك
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                          <MapPin size={12} className="text-primary" />
                          <span>{shipment.origin || "الميناء الرئيسي"}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">
                          {shipment.goods_description || "لا يوجد وصف للمواد"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex flex-col items-center gap-2">
                        <Badge
                          className={cn(
                            "rounded-full font-black text-[10px] px-3 py-1 border-none shadow-sm",
                            shipment.status === "تم التوصيل"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-blue-50 text-blue-600",
                          )}
                        >
                          {shipment.status}
                        </Badge>
                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                          <Calendar size={10} />
                          {shipment.shipping_date
                            ? new Date(
                                shipment.shipping_date,
                              ).toLocaleDateString("ar-SA")
                            : "غير مقرر"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-8">
                      <div className="flex items-center justify-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-2xl"
                        >
                          <Eye size={18} />
                        </Button>
                        {canWrite && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(shipment)}
                          className="h-10 w-10 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl"
                        >
                          <Edit size={18} />
                        </Button>
                        )}
                        {canWrite && (
                        <DropdownMenu dir="rtl">
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 text-slate-400 hover:bg-slate-100 rounded-2xl"
                            >
                              <MoreVertical size={18} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 rounded-2xl p-2 border-slate-100 shadow-2xl"
                          >
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(shipment)}
                              className="p-3 text-sm font-bold text-rose-600 focus:bg-rose-50 rounded-xl gap-3 cursor-pointer"
                            >
                              <Trash2 size={16} /> حذف الشحنة
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-20 text-slate-300 font-bold italic"
                  >
                    {loading ? "جاري جرد الشحنات..." : "لا توجد شحنات في السجل"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-right text-slate-900">
              تعديل بيانات الشحنة
            </DialogTitle>
            <DialogDescription className="text-right text-slate-500">
              قم بتعديل المعلومات اللازمة واضغط على حفظ التغييرات.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid grid-cols-2 gap-5 py-6 rtl text-right">
              <div className="space-y-1.5">
                <Label className="font-bold">رقم الشحنة</Label>
                <Input
                  value={formData.shipment_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shipment_number: e.target.value,
                    })
                  }
                  className="h-11 rounded-xl bg-slate-50"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-bold">الحالة</Label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full h-11 rounded-xl bg-slate-50 px-3 text-sm font-bold border-slate-100"
                >
                  <option value="في الطريق">في الطريق</option>
                  <option value="تم التوصيل">تم التوصيل</option>
                  <option value="معلق">معلق</option>
                </select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="font-bold">المنتجات / الوصف</Label>
                <Input
                  value={formData.goods_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      goods_description: e.target.value,
                    })
                  }
                  className="h-11 rounded-xl bg-slate-50"
                />
              </div>
            </div>
            <DialogFooter className="flex-row-reverse gap-3">
              <Button
                type="submit"
                className="rounded-xl h-12 px-10 font-bold bg-primary shadow-lg shadow-primary/20"
              >
                حفظ التغييرات
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsEditDialogOpen(false)}
                className="rounded-xl h-12 font-bold text-slate-400"
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl p-8 border-none shadow-2xl">
          <DialogHeader>
            <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-100">
              <AlertTriangle className="text-rose-600" size={32} />
            </div>
            <DialogTitle className="text-center font-black text-slate-900 text-xl">
              حذف الشحنة
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500 font-bold py-4">
              هل أنت متأكد من حذف الشحنة رقم{" "}
              <span className="text-slate-900">
                "{selectedShipment?.shipment_number}"
              </span>
              ؟
              <br /> هذا الإجراء نهائي ولا يمكن استعادته.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3 mt-4">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="rounded-2xl h-14 w-full sm:flex-1 font-black bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-100"
            >
              نعم، حذف نهائي
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-2xl h-14 w-full sm:flex-1 font-bold text-slate-500 border-slate-100 bg-slate-50/50"
            >
              تراجع
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MiniStatsCard({ title, value, detail, color, icon }: any) {
  const themes: any = {
    blue: "bg-blue-50/50 text-blue-600 border-blue-100 shadow-blue-100/20",
    emerald:
      "bg-emerald-50/50 text-emerald-600 border-emerald-100 shadow-emerald-100/20",
    amber: "bg-amber-50/50 text-amber-600 border-amber-100 shadow-amber-100/20",
    indigo:
      "bg-indigo-50/50 text-indigo-600 border-indigo-100 shadow-indigo-100/20",
  };

  return (
    <div
      className={cn(
        "p-6 rounded-[24px] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 duration-500 bg-white group",
        themes[color],
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
          {title}
        </span>
        <div className="p-2 rounded-xl bg-white shadow-sm border border-slate-50 group-hover:rotate-12 transition-transform duration-500">
          {icon}
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-black text-slate-900 leading-none tracking-tight tabular-nums">
          {value}
        </span>
        <span className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-1.5 px-0.5">
          <div className="w-1 h-1 rounded-full bg-slate-200"></div>
          {detail}
        </span>
      </div>
    </div>
  );
}
