"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Layers,
  AlertTriangle,
  FileText,
  MapPin,
  Anchor,
  Scale,
  Activity,
  Upload,
  Edit,
  Trash2,
  Ship,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { cn } from "@/app/lib/utils";
import { apiClient } from "@/app/lib/api-client";
import { toast } from "sonner";

// ===================== Types =====================
interface ShipmentCompany {
  id: number;
  company_name?: string;
}
interface Port {
  id: number;
  port_name: string;
  country?: string;
  city?: string;
}
interface ShippingComp {
  id: number;
  ship_comp: string;
}
interface ShipmentDoc {
  id: number;
  file_name: string;
  file_url: string;
  document_type: string;
  document_number?: string;
  createdAt: string;
}
interface Shipment {
  id: number;
  shipment_number?: string;
  bl_number?: string;
  status: string;
  isActive?: boolean;
  shipping_company?: number;
  sender_company_id?: number;
  port_of_loading?: number;
  port_of_discharge?: number;
  total_containers?: number;
  containers_numbers?: string;
  total_gross_weight?: number;
  arrival_date?: string;
  createdAt: string;
  sender_company?: { company_name: string };
  loading_port?: { port_name: string; country?: string };
  discharge_port?: { port_name: string; city?: string };
  shipment_comp?: { ship_comp: string };
  documents?: { id: number }[];
}

// ===================== Document types list =====================
const DOCUMENT_TYPES = [
  { value: "BL", label: "بوليصة الشحن (BL)" },
  { value: "INVOICE", label: "فاتورة تجارية" },
  { value: "PACKING_LIST", label: "قائمة التعبئة" },
  { value: "CUSTOMS_DEC", label: "بيان جمركي" },
  { value: "CERTIFICATE", label: "شهادة منشأ" },
  { value: "INSURANCE", label: "وثيقة تأمين" },
  { value: "OTHER", label: "أخرى" },
];

// ===================== Main Page =====================
export default function ShipmentsPage() {
  const { user } = useAuth();
  const canWrite = user?.role === "ADMIN" || user?.role === "MANAGER";

  const [shipmentsData, setShipmentsData] = useState<Shipment[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({
    pending: 0,
    delivered: 0,
    inTransit: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDocsDialogOpen, setIsDocsDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null,
  );

  // Master Data
  const [companies, setCompanies] = useState<ShipmentCompany[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [shippingComps, setShippingComps] = useState<ShippingComp[]>([]);

  const [formData, setFormData] = useState({
    shipment_number: "",
    bl_number: "",
    status: "PENDING",
    shipping_company: "",
    sender_company_id: "",
    port_of_loading: "",
    port_of_discharge: "",
    total_containers: 0,
    total_gross_weight: 0,
    containers_numbers: "",
    arrival_date: "",
    isActive: true,
  });

  // ===================== Fetch Data =====================
  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getShipments({ limit: 50, q: searchTerm });
      if (data) {
        setShipmentsData(data.shipments || []);
        setTotal(data.total || 0);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error("Failed to fetch shipments", error);
      toast.error("فشل في تحميل الشحنات");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  const fetchMasterData = async () => {
    try {
      const [comps, pts, shipComps] = await Promise.all([
        apiClient.getCompanies(),
        apiClient.getPorts(),
        apiClient.getShippingCompanies(),
      ]);
      if (comps) setCompanies(Array.isArray(comps) ? comps : []);
      if (pts) setPorts(Array.isArray(pts) ? pts : []);
      if (shipComps)
        setShippingComps(Array.isArray(shipComps) ? shipComps : []);
    } catch (e) {
      console.error("Master data fetch error", e);
    }
  };

  useEffect(() => {
    fetchShipments();
    fetchMasterData();
  }, [fetchShipments]);

  // ===================== CRUD Handlers =====================
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createShipment({
        shipment_number: formData.shipment_number || undefined,
        bl_number: formData.bl_number || undefined,
        status: formData.status,
        shipping_company: formData.shipping_company || undefined,
        sender_company_id: formData.sender_company_id || undefined,
        port_of_loading: formData.port_of_loading || undefined,
        port_of_discharge: formData.port_of_discharge || undefined,
        total_containers: Number(formData.total_containers),
        total_gross_weight: Number(formData.total_gross_weight),
        containers_numbers: formData.containers_numbers || undefined,
        arrival_date: formData.arrival_date || undefined,
        isActive: formData.isActive,
      });
      setIsAddDialogOpen(false);
      resetForm();
      fetchShipments();
      toast.success("تم تسجيل الشحنة بنجاح");
    } catch (error) {
      console.error("Error creating shipment", error);
      toast.error("حدث خطأ أثناء الإضافة: " + (error as Error).message);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipment) return;
    try {
      await apiClient.updateShipment(selectedShipment.id, {
        shipment_number: formData.shipment_number || undefined,
        bl_number: formData.bl_number || undefined,
        status: formData.status,
        shipping_company: formData.shipping_company || undefined,
        sender_company_id: formData.sender_company_id || undefined,
        port_of_loading: formData.port_of_loading || undefined,
        port_of_discharge: formData.port_of_discharge || undefined,
        total_containers: Number(formData.total_containers),
        total_gross_weight: Number(formData.total_gross_weight),
        containers_numbers: formData.containers_numbers || undefined,
        arrival_date: formData.arrival_date || undefined,
        isActive: formData.isActive,
      });
      setIsEditDialogOpen(false);
      resetForm();
      fetchShipments();
      toast.success("تم تحديث بيانات الشحنة");
    } catch (error) {
      console.error("Error updating shipment", error);
      toast.error("حدث خطأ أثناء التحديث: " + (error as Error).message);
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
      toast.error("حدث خطأ أثناء الحذف: " + (error as Error).message);
    }
  };

  const openEditDialog = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setFormData({
      shipment_number: shipment.shipment_number || "",
      bl_number: shipment.bl_number || "",
      status: shipment.status || "PENDING",
      shipping_company: (shipment.shipping_company || "").toString(),
      sender_company_id: (shipment.sender_company_id || "").toString(),
      port_of_loading: (shipment.port_of_loading || "").toString(),
      port_of_discharge: (shipment.port_of_discharge || "").toString(),
      total_containers: shipment.total_containers || 0,
      total_gross_weight: shipment.total_gross_weight || 0,
      containers_numbers: shipment.containers_numbers || "",
      arrival_date: shipment.arrival_date
        ? new Date(shipment.arrival_date).toISOString().split("T")[0]
        : "",
      isActive: shipment.isActive !== false,
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      shipment_number: "",
      bl_number: "",
      status: "PENDING",
      shipping_company: "",
      sender_company_id: "",
      port_of_loading: "",
      port_of_discharge: "",
      total_containers: 0,
      total_gross_weight: 0,
      containers_numbers: "",
      arrival_date: "",
      isActive: true,
    });
    setSelectedShipment(null);
  };

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      PENDING: "قيد الانتظار",
      IN_TRANSIT: "في الطريق",
      ARRIVED: "وصلت",
      DELIVERED: "تم الاستلام",
    };
    return map[s] || s;
  };

  // ===================== UI =====================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="text-primary" /> إدارة شحنات الترانزيت
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            متابعة البوالص، الحاويات، والمستندات الجمركية للشحنات الصادرة
            والواردة.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canWrite && (
            <Button
              onClick={() => {
                resetForm();
                setIsAddDialogOpen(true);
              }}
              className="rounded-xl h-10 gap-2 bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all px-6 font-bold"
            >
              <Plus size={16} />
              إضافة شحنة جديدة
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MiniStatsCard
          title="إجمالي الشحنات"
          value={loading ? "..." : total.toString()}
          icon={<Activity size={18} />}
          color="blue"
          detail="جميع الشحنات المسجلة"
        />
        <MiniStatsCard
          title="قيد الانتظار"
          value={loading ? "..." : stats.pending.toString()}
          icon={<Clock size={18} />}
          color="amber"
          detail="تحتاج معالجة"
        />
        <MiniStatsCard
          title="مكتملة"
          value={loading ? "..." : stats.delivered.toString()}
          icon={<CheckCircle2 size={18} />}
          color="emerald"
          detail="تم التخليص والاستلام"
        />
        <MiniStatsCard
          title="في الطريق / وصلت"
          value={loading ? "..." : stats.inTransit.toString()}
          icon={<Anchor size={18} />}
          color="indigo"
          detail="في الموانئ أو بالطريق"
        />
      </div>

      {/* Table */}
      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[28px] overflow-hidden bg-white">
        <CardHeader className="bg-white border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 px-8">
          <div className="relative w-full md:w-[450px] group">
            <Search
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <Input
              placeholder="ابحث برقم الشحنة، BL، أو اسم المصدر..."
              className="pr-12 bg-slate-50 border-none rounded-2xl h-12 text-sm font-medium focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={fetchShipments}
            className="rounded-xl h-11 border-slate-100 font-bold px-6"
          >
            تحديث
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50">
                <TableHead className="text-right font-black text-slate-400 text-xs px-8 h-14 uppercase">
                  رقم الشحنة / BL
                </TableHead>
                <TableHead className="text-right font-black text-slate-400 text-xs px-4 h-14 uppercase">
                  المرسل / الناقل
                </TableHead>
                <TableHead className="text-right font-black text-slate-400 text-xs px-4 h-14 uppercase">
                  المسار (من → إلى)
                </TableHead>
                <TableHead className="text-center font-black text-slate-400 text-xs px-4 h-14 uppercase">
                  الحالة / البيانات
                </TableHead>
                <TableHead className="text-center font-black text-slate-400 text-xs px-8 h-14 uppercase">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipmentsData.length > 0 ? (
                shipmentsData.map((s) => (
                  <TableRow
                    key={s.id}
                    className="hover:bg-slate-50/40 border-slate-50 group"
                  >
                    <TableCell className="px-8 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-black text-primary text-sm">
                          {s.shipment_number || `SH-${s.id}`}
                        </span>
                        {s.bl_number && (
                          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                            <FileText size={10} /> BL: {s.bl_number}
                          </span>
                        )}
                        <span className="text-[9px] text-slate-300 mt-1">
                          {new Date(s.createdAt).toLocaleDateString("ar-SA")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-400 text-[10px]">
                            {s.sender_company?.company_name?.[0] || "?"}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-xs">
                              {s.sender_company?.company_name || "---"}
                            </span>
                            <span className="text-[9px] text-slate-400">
                              المرسل
                            </span>
                          </div>
                        </div>
                        {s.shipment_comp?.ship_comp && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                            <Ship size={10} className="text-blue-400" />
                            <span>{s.shipment_comp.ship_comp}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                          <Anchor
                            size={11}
                            className="text-blue-500 shrink-0"
                          />
                          <span>{s.loading_port?.port_name || "---"}</span>
                          <span className="text-slate-300 mx-0.5">→</span>
                          <MapPin
                            size={11}
                            className="text-rose-500 shrink-0"
                          />
                          <span>{s.discharge_port?.port_name || "---"}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          وصول:{" "}
                          {s.arrival_date
                            ? new Date(s.arrival_date).toLocaleDateString(
                                "ar-SA",
                              )
                            : "---"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Badge
                          className={cn(
                            "rounded-full px-3 py-0.5 text-[10px] font-bold border-none",
                            s.status === "DELIVERED"
                              ? "bg-emerald-50 text-emerald-600"
                              : s.status === "PENDING"
                                ? "bg-amber-50 text-amber-600"
                                : s.status === "ARRIVED"
                                  ? "bg-violet-50 text-violet-600"
                                  : "bg-blue-50 text-blue-600",
                          )}
                        >
                          {statusLabel(s.status)}
                        </Badge>
                        <div className="flex gap-3 text-[10px] font-bold text-slate-400">
                          <span className="flex items-center gap-0.5">
                            <Layers size={10} /> {s.total_containers || 0} حاوية
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Scale size={10} /> {s.total_gross_weight || 0} T
                          </span>
                        </div>
                        {s.documents && s.documents.length > 0 && (
                          <span className="text-[9px] text-indigo-500 font-bold">
                            {s.documents.length} مستند
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedShipment(s);
                            setIsDocsDialogOpen(true);
                          }}
                          className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
                          title="المستندات"
                        >
                          <FileText size={16} />
                        </Button>
                        {canWrite && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(s)}
                              className="h-9 w-9 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-xl"
                              title="تعديل"
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedShipment(s);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                              title="حذف"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </>
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
                    {loading
                      ? "جاري جلب البيانات..."
                      : "لا توجد شحنات مسجلة حالياً"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ==================== Add/Edit Dialog ==================== */}
      <Dialog
        open={isAddDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            resetForm();
          }
        }}
      >
        <DialogContent
          className="sm:max-w-[750px] rounded-3xl p-8 max-h-[90vh] overflow-y-auto"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 text-right">
              {isEditDialogOpen
                ? "✏️ تعديل بيانات الشحنة"
                : "📦 تسجيل شحنة ترانزيت جديدة"}
            </DialogTitle>
            <DialogDescription className="text-right font-bold text-slate-400 mt-2">
              يرجى إدخال جميع تفاصيل البوليصة، الموانئ، الحاويات، وشركة الشحن.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={isEditDialogOpen ? handleUpdate : handleCreate}
            className="space-y-6 pt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* -- Shipment Number -- */}
              <div className="space-y-2 text-right">
                <Label className="font-bold text-slate-700 pr-1">
                  رقم الشحنة (داخلي)
                </Label>
                <Input
                  value={formData.shipment_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shipment_number: e.target.value,
                    })
                  }
                  className="rounded-2xl h-12 bg-slate-50 border-none px-5"
                  placeholder="مثلاً: TR-2024-001"
                />
              </div>
              {/* -- BL Number -- */}
              <div className="space-y-2 text-right">
                <Label className="font-bold text-slate-700 pr-1">
                  رقم البوليصة (BL Number)
                </Label>
                <Input
                  value={formData.bl_number}
                  onChange={(e) =>
                    setFormData({ ...formData, bl_number: e.target.value })
                  }
                  className="rounded-2xl h-12 bg-slate-50 border-none px-5"
                  placeholder="MSCU123456..."
                />
              </div>
              {/* -- Sender Company -- */}
              <div className="space-y-2 text-right">
                <Label className="font-bold text-slate-700 pr-1">
                  الشركة المرسلة (Sender)
                </Label>
                <select
                  value={formData.sender_company_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sender_company_id: e.target.value,
                    })
                  }
                  className="w-full h-12 rounded-2xl bg-slate-50 border-none px-5 text-sm font-bold text-slate-700"
                >
                  <option value="">اختر الشركة المرسلة...</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>
              {/* -- Shipping Company (Carrier) -- */}
              <div className="space-y-2 text-right">
                <Label className="font-bold text-slate-700 pr-1">
                  شركة الشحن (Carrier)
                </Label>
                <select
                  value={formData.shipping_company}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shipping_company: e.target.value,
                    })
                  }
                  className="w-full h-12 rounded-2xl bg-slate-50 border-none px-5 text-sm font-bold text-slate-700"
                >
                  <option value="">اختر شركة الشحن...</option>
                  {shippingComps.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.ship_comp}
                    </option>
                  ))}
                </select>
              </div>
              {/* -- Port Loading -- */}
              <div className="space-y-2 text-right">
                <Label className="font-bold text-slate-700 pr-1">
                  ميناء التحميل (Loading)
                </Label>
                <select
                  value={formData.port_of_loading}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      port_of_loading: e.target.value,
                    })
                  }
                  className="w-full h-12 rounded-2xl bg-slate-50 border-none px-5 text-sm font-bold text-slate-700"
                >
                  <option value="">اختر ميناء التحميل...</option>
                  {ports.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.port_name}
                      {p.country ? ` — ${p.country}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              {/* -- Port Discharge -- */}
              <div className="space-y-2 text-right">
                <Label className="font-bold text-slate-700 pr-1">
                  ميناء التفريغ (Discharge)
                </Label>
                <select
                  value={formData.port_of_discharge}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      port_of_discharge: e.target.value,
                    })
                  }
                  className="w-full h-12 rounded-2xl bg-slate-50 border-none px-5 text-sm font-bold text-slate-700"
                >
                  <option value="">اختر ميناء التفريغ...</option>
                  {ports.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.port_name}
                      {p.city ? ` — ${p.city}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              {/* -- Status -- */}
              <div className="space-y-2 text-right">
                <Label className="font-bold text-slate-700 pr-1">الحالة</Label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full h-12 rounded-2xl bg-slate-50 border-none px-5 text-sm font-bold text-slate-700"
                >
                  <option value="PENDING">⏳ قيد الانتظار (PENDING)</option>
                  <option value="IN_TRANSIT">🚢 في الطريق (IN TRANSIT)</option>
                  <option value="ARRIVED">📍 وصلت (ARRIVED)</option>
                  <option value="DELIVERED">✅ تم الاستلام (DELIVERED)</option>
                </select>
              </div>
              {/* -- Arrival Date -- */}
              <div className="space-y-2 text-right">
                <Label className="font-bold text-slate-700 pr-1">
                  تاريخ الوصول المتوقع
                </Label>
                <Input
                  type="date"
                  value={formData.arrival_date}
                  onChange={(e) =>
                    setFormData({ ...formData, arrival_date: e.target.value })
                  }
                  className="rounded-2xl h-12 bg-slate-50 border-none px-5"
                />
              </div>
              {/* -- Containers count & Weight -- */}
              <div className="space-y-2 text-right">
                <Label className="font-bold text-slate-700 px-1 text-xs">
                  عدد الحاويات
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.total_containers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      total_containers: Number(e.target.value),
                    })
                  }
                  className="rounded-2xl h-12 bg-slate-50 border-none px-4"
                />
              </div>
              <div className="space-y-2 text-right">
                <Label className="font-bold text-slate-700 px-1 text-xs">
                  الوزن الإجمالي (طن)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.total_gross_weight}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      total_gross_weight: Number(e.target.value),
                    })
                  }
                  className="rounded-2xl h-12 bg-slate-50 border-none px-4"
                />
              </div>
              {/* -- Container Numbers (full width) -- */}
              <div className="col-span-1 md:col-span-2 space-y-2 text-right">
                <Label className="font-bold text-slate-700 pr-1">
                  أرقام الحاويات (Container Numbers)
                </Label>
                <textarea
                  value={formData.containers_numbers}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      containers_numbers: e.target.value,
                    })
                  }
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none text-sm font-medium focus:ring-2 focus:ring-primary/20 min-h-[80px] resize-y"
                  placeholder="MSKU0012345, MSCU9876543, TCLU4567890..."
                />
              </div>
              {/* isActive */}
              <div className="col-span-1 md:col-span-2 flex items-center gap-3 text-right">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-5 w-5 rounded-lg accent-primary"
                />
                <Label className="font-bold text-slate-700">
                  الشحنة نشطة (isActive)
                </Label>
              </div>
            </div>

            <DialogFooter className="flex-row-reverse gap-3 pt-6 border-t border-slate-100">
              <Button
                type="submit"
                className="rounded-2xl h-14 px-12 font-black bg-primary shadow-xl shadow-primary/10 hover:shadow-primary/30 transition-all text-lg"
              >
                {isEditDialogOpen ? "💾 حفظ التعديلات" : "✅ تأكيد التسجيل"}
              </Button>
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setIsEditDialogOpen(false);
                  resetForm();
                }}
                className="rounded-2xl h-14 px-8 font-bold text-slate-400 hover:bg-slate-50"
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ==================== Delete Confirmation ==================== */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent
          className="sm:max-w-[400px] rounded-3xl p-8 border-none text-right"
          dir="rtl"
        >
          <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
            <AlertTriangle className="text-rose-600" size={32} />
          </div>
          <DialogTitle className="font-black text-slate-900 text-xl">
            تأكيد الحذف
          </DialogTitle>
          <DialogDescription className="font-bold text-slate-500 py-4">
            هل أنت متأكد من حذف الشحنة{" "}
            <strong>
              {selectedShipment?.shipment_number ||
                `SH-${selectedShipment?.id}`}
            </strong>
            ؟ سيتم حذف جميع المستندات المرتبطة. هذا الإجراء لا يمكن التراجع عنه.
          </DialogDescription>
          <DialogFooter className="gap-3 mt-4">
            <Button
              onClick={handleDelete}
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

      {/* ==================== Documents Dialog ==================== */}
      <DocumentsDialog
        open={isDocsDialogOpen}
        onOpenChange={setIsDocsDialogOpen}
        shipment={selectedShipment}
      />
    </div>
  );
}

// ===================== Documents Dialog Component =====================
function DocumentsDialog({
  open,
  onOpenChange,
  shipment,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  shipment: Shipment | null;
}) {
  const [docs, setDocs] = useState<ShipmentDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState("OTHER");
  const [docNumber, setDocNumber] = useState("");

  const fetchDocs = useCallback(async () => {
    if (!shipment) return;
    setLoading(true);
    try {
      const data = await apiClient.getShipmentDocuments(shipment.id);
      if (data) setDocs(Array.isArray(data) ? data : []);
    } catch {
      toast.error("فشل تحميل المستندات");
    } finally {
      setLoading(false);
    }
  }, [shipment]);

  useEffect(() => {
    if (open && shipment) {
      fetchDocs();
      setDocType("OTHER");
      setDocNumber("");
    }
  }, [open, fetchDocs, shipment]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !shipment) return;

    setUploading(true);
    try {
      const uploadRes = await apiClient.uploadToS3(file);
      if (uploadRes && uploadRes.fileUrl) {
        await apiClient.createShipmentDocument(shipment.id, {
          document_type: docType,
          document_number: docNumber || null,
          file_url: uploadRes.fileUrl,
          file_name: file.name,
        });
        toast.success("تم رفع المستند بنجاح ✅");
        fetchDocs();
        setDocNumber("");
      }
    } catch {
      toast.error("فشل رفع الملف — تأكد من اتصال S3");
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const docTypeLabel = (val: string) => {
    const found = DOCUMENT_TYPES.find((d) => d.value === val);
    return found ? found.label : val;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[650px] rounded-3xl p-8 max-h-[85vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-right flex items-center gap-2">
            <FileText className="text-primary" size={20} />
            مستندات الشحنة: {shipment?.shipment_number || `SH-${shipment?.id}`}
          </DialogTitle>
          <DialogDescription className="text-right">
            عرض ورفع المستندات المرفقة بهذه الشحنة (بوليصة، فاتورة، بيان جمركي،
            إلخ).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Upload Section */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 p-5 rounded-2xl border border-dashed border-slate-200 space-y-4">
            <p className="text-sm font-black text-slate-700">
              📎 رفع مستند جديد
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5 text-right">
                <Label className="text-xs font-bold text-slate-500">
                  نوع المستند
                </Label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full h-11 rounded-xl bg-white border border-slate-100 px-4 text-sm font-bold text-slate-700"
                >
                  {DOCUMENT_TYPES.map((dt) => (
                    <option key={dt.value} value={dt.value}>
                      {dt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5 text-right">
                <Label className="text-xs font-bold text-slate-500">
                  رقم المستند (اختياري)
                </Label>
                <Input
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="rounded-xl h-11 bg-white border-slate-100 px-4"
                  placeholder="INV-001..."
                />
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <input
                type="file"
                onChange={handleUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                disabled={uploading}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
              />
              <Button
                disabled={uploading}
                className="rounded-xl gap-2 font-bold h-12 w-full bg-primary/90 hover:bg-primary transition-colors shadow-md"
              >
                {uploading ? (
                  "⏳ جاري الرفع إلى الخادم..."
                ) : (
                  <>
                    <Upload size={16} /> اختر ملف ورفعه
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Documents List */}
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">
              المستندات المرفوعة ({docs.length})
            </p>
            {loading ? (
              <p className="text-center text-slate-400 py-8">جاري التحميل...</p>
            ) : docs.length > 0 ? (
              docs.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-xl hover:bg-slate-50/50 hover:border-slate-200 transition-all group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                      <FileText className="text-indigo-500" size={18} />
                    </div>
                    <div className="flex flex-col text-right min-w-0">
                      <span className="text-sm font-bold text-slate-700 truncate block">
                        {d.file_name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant="outline"
                          className="text-[9px] py-0 px-1.5 rounded-full font-bold border-slate-200"
                        >
                          {docTypeLabel(d.document_type)}
                        </Badge>
                        {d.document_number && (
                          <span className="text-[9px] text-slate-400">
                            #{d.document_number}
                          </span>
                        )}
                        <span className="text-[9px] text-slate-300">
                          {new Date(d.createdAt).toLocaleDateString("ar-SA")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-primary font-bold shrink-0 hover:bg-primary/5 rounded-lg"
                  >
                    <a href={d.file_url} target="_blank" rel="noreferrer">
                      عرض ↗
                    </a>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-300">
                <FileText className="mx-auto mb-3 text-slate-200" size={40} />
                <p className="italic font-bold">
                  لا توجد مستندات مرفوعة حتى الآن
                </p>
                <p className="text-[11px] mt-1">
                  استخدم النموذج أعلاه لرفع أول مستند
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ===================== Stats Card Component =====================
function MiniStatsCard({
  title,
  value,
  detail,
  color,
  icon,
}: {
  title: string;
  value: string;
  detail: string;
  color: string;
  icon: React.ReactNode;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50/50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50/50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50/50 text-amber-600 border-amber-100",
    indigo: "bg-indigo-50/50 text-indigo-600 border-indigo-100",
  };

  return (
    <div
      className={cn(
        "p-6 rounded-[24px] border border-slate-100 bg-white hover:shadow-xl transition-all group",
        colors[color],
      )}
    >
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
          {title}
        </span>
        <div className="p-2 rounded-xl bg-white shadow-sm group-hover:rotate-12 transition-transform">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-black text-slate-900 tracking-tight tabular-nums">
        {value}
      </div>
      <div className="text-[10px] text-slate-400 font-bold mt-2">{detail}</div>
    </div>
  );
}
