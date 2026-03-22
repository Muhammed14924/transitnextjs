"use client";

import { Fragment, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import {
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  ShipWheel,
  Layers,
  AlertTriangle,
  FileText,
  MapPin,
  Anchor,
  Activity,
  Upload,
  Edit,
  Trash2,
  Ship,
  X,
  PlusCircle,
  FileUp,
} from "lucide-react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
interface Container {
  id: number;
  container_number: string;
  container_type?: string;
  weight?: number;
  empty_return_date?: string;
  customs_declaration_number?: string;
  item_count?: number;
  notes?: string;
}
interface Shipment {
  id: number;
  bl_number: string;
  status: string;
  isActive?: boolean;
  shipping_company?: number;
  sender_company_id?: number;
  sub_company_id?: number;
  port_of_loading?: number;
  port_of_discharge?: number;
  arrival_date?: string;
  expected_discharge_date?: string;
  free_time_days?: number;
  createdAt: string;
  sender_company?: { company_name: string };
  loading_port?: { port_name: string; country?: string };
  discharge_port?: { port_name: string; city?: string };
  carrier?: { trans_name: string };
  sub_company?: { sub_company_name: string };
  documents?: {
    id: number;
    file_url: string;
    file_name: string;
    document_type: string;
    document_number?: string;
  }[];
  containers?: Container[];
}

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
  trans_name: string;
}
interface SubCompany {
  id: number;
  sub_company_name: string;
  company_id: number;
}

// ===================== Schema & Defaults =====================
const containerSchema = z.object({
  container_number: z.string().min(1, "رقم الحاوية مطلوب"),
  container_type: z.string().optional(),
  weight: z.number().optional().nullable(),
  empty_return_date: z.string().optional().nullable(),
  customs_declaration_number: z.string().optional().nullable(),
  item_count: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const shipmentSchema = z.object({
  bl_number: z.string().min(1, "رقم البوليصة مطلوب"),
  status: z.string().min(1, "الحالة مطلوبة"),
  shipping_company: z.string().optional().nullable(),
  sender_company_id: z.string().optional().nullable(),
  sub_company_id: z.string().optional().nullable(),
  port_of_loading: z.string().optional().nullable(),
  port_of_discharge: z.string().optional().nullable(),
  arrival_date: z.string().min(1, "تاريخ الوصول المتوقع مطلوب"),
  expected_discharge_date: z.string().optional().nullable(),
  free_time_days: z.number().int().min(0).default(7),
  isActive: z.boolean().default(true),
  containers: z.array(containerSchema).default([]),
  documents: z
    .array(
      z.object({
        dbId: z.number().optional(),
        document_type: z.string(),
        document_number: z.string().optional().nullable(),
        file_url: z.string(),
        file_name: z.string(),
      }),
    )
    .default([]),
});

// ===================== Document types list =====================
const DOCUMENT_TYPES = [
  { value: "BL", label: "بوليصة الشحن" },
  { value: "FACTORY_INVOICE", label: "فاتورة المعمل" },
  { value: "ORIGIN_CERT", label: "شهادة المنشأ" },
  { value: "HEALTH_CERT", label: "شهادة صحية" },
  { value: "CHECKLIST", label: "checklist" },
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
  const [expandedShipment, setExpandedShipment] = useState<number | null>(null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "shipment" | "document" | null;
    shipmentId?: number;
    docId?: number;
    formDocIndex?: number;
    title: string;
    description: string;
  }>({ type: null, title: "", description: "" });

  // Master Data
  const [companies, setCompanies] = useState<ShipmentCompany[]>([]);
  const [ports, setPorts] = useState<Port[]>([]);
  const [shippingComps, setShippingComps] = useState<ShippingComp[]>([]);
  const [subCompanies, setSubCompanies] = useState<SubCompany[]>([]);

  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const form = useForm({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      bl_number: "",
      status: "IN_TRANSIT",
      free_time_days: 7,
      isActive: true,
      containers: [],
      documents: [],
    },
  });

  const resetForm = useCallback(() => {
    form.reset({
      bl_number: "",
      status: "IN_TRANSIT",
      free_time_days: 7,
      isActive: true,
      containers: [],
      documents: [],
    });
  }, [form]);

  const {
    fields: containerFields,
    append: appendContainer,
    remove: removeContainer,
  } = useFieldArray({
    control: form.control,
    name: "containers",
  });

  const {
    fields: docFields,
    append: appendDoc,
    remove: removeDoc,
  } = useFieldArray({
    control: form.control,
    name: "documents",
  });

  // ===================== Auto-Status Logic =====================
  const watchedArrivalDate = form.watch("arrival_date");
  useEffect(() => {
    if (!watchedArrivalDate) {
      // Default to IN_TRANSIT if no date is set for new shipments
      if (isAddDialogOpen && !form.getValues("status")) {
        form.setValue("status", "IN_TRANSIT");
      }
      return;
    }

    try {
      const currentStatus = form.getValues("status");
      // If already Delivered, we don't want to auto-revert to Arrived/EnRoute
      if (currentStatus === "DELIVERED") return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const arrival = new Date(watchedArrivalDate);
      arrival.setHours(0, 0, 0, 0);

      const diffTime = arrival.getTime() - today.getTime();

      if (diffTime > 0) {
        form.setValue("status", "IN_TRANSIT");
      } else {
        form.setValue("status", "ARRIVED");
      }
    } catch (e) {
      console.error("Status calculation error:", e);
    }
  }, [watchedArrivalDate, form, isAddDialogOpen]);
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
      const [comps, pts, shipComps, subComps] = await Promise.all([
        apiClient.getCompanies(),
        apiClient.getPorts(),
        apiClient.getShippingCompanies(),
        apiClient.getSubCompanies(),
      ]);
      if (comps) setCompanies(Array.isArray(comps) ? comps : []);
      if (pts) setPorts(Array.isArray(pts) ? pts : []);
      if (shipComps)
        setShippingComps(Array.isArray(shipComps) ? shipComps : []);
      if (subComps) setSubCompanies(Array.isArray(subComps) ? subComps : []);
    } catch (e) {
      console.error("Master data fetch error", e);
    }
  };

  useEffect(() => {
    fetchShipments();
    fetchMasterData();
  }, [fetchShipments]);

  // ===================== CRUD Handlers =====================
  const onSubmit = async (values: z.infer<typeof shipmentSchema>) => {
    try {
      if (isEditDialogOpen && selectedShipment) {
        await apiClient.updateShipment(selectedShipment.id, values);
        toast.success("تم تحديث بيانات الشحنة");
      } else {
        await apiClient.createShipment(values);
        toast.success("تم تسجيل الشحنة بنجاح");
      }
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      form.reset();
      fetchShipments();
    } catch (error) {
      console.error("Error submitting shipment", error);
      toast.error("حدث خطأ: " + (error as Error).message);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget.type) return;
    try {
      if (deleteTarget.type === "shipment" && deleteTarget.shipmentId) {
        await apiClient.deleteShipment(deleteTarget.shipmentId);
        toast.success("تم حذف الشحنة بنجاح");
      } else if (
        deleteTarget.type === "document" &&
        deleteTarget.shipmentId &&
        deleteTarget.docId
      ) {
        await apiClient.deleteShipmentDocument(
          deleteTarget.shipmentId,
          deleteTarget.docId,
        );
        if (typeof deleteTarget.formDocIndex === "number") {
          removeDoc(deleteTarget.formDocIndex);
        }
        toast.success("تم حذف المستند بنجاح");
      }
      fetchShipments();
    } catch (error) {
      console.error("Delete error", error);
      toast.error("حدث خطأ أثناء الحذف: " + (error as Error).message);
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteTarget({ type: null, title: "", description: "" });
      setSelectedShipment(null);
    }
  };

  const openDeleteShipmentDialog = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setDeleteTarget({
      type: "shipment",
      shipmentId: shipment.id,
      title: "تأكيد حذف الرحلة",
      description:
        "هل أنت متأكد من حذف هذه الرحلة؟ سيتم حذف جميع المستندات المرتبطة بها.",
    });
    setIsDeleteDialogOpen(true);
  };

  const openDeleteDocumentDialog = (
    shipmentId: number,
    docId: number,
    formDocIndex?: number,
  ) => {
    setDeleteTarget({
      type: "document",
      shipmentId,
      docId,
      formDocIndex,
      title: "تأكيد حذف المستند",
      description:
        "هل أنت متأكد من حذف هذا المستند؟ لا يمكن التراجع عن هذا الإجراء.",
    });
    setIsDeleteDialogOpen(true);
  };

  const openEditDialog = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    form.reset({
      bl_number: shipment.bl_number || "",
      status: shipment.status || "PENDING",
      shipping_company: (shipment.shipping_company || "").toString(),
      sender_company_id: (shipment.sender_company_id || "").toString(),
      sub_company_id: (shipment.sub_company_id || "").toString(),
      port_of_loading: (shipment.port_of_loading || "").toString(),
      port_of_discharge: (shipment.port_of_discharge || "").toString(),
      arrival_date: shipment.arrival_date
        ? new Date(shipment.arrival_date).toISOString().split("T")[0]
        : "",
      expected_discharge_date: shipment.expected_discharge_date
        ? new Date(shipment.expected_discharge_date).toISOString().split("T")[0]
        : "",
      free_time_days: shipment.free_time_days || 14,
      isActive: shipment.isActive !== false,
      containers:
        shipment.containers?.map((c) => ({
          container_number: c.container_number,
          container_type: c.container_type || "",
          weight: c.weight ? Number(c.weight) : undefined,
          empty_return_date: c.empty_return_date
            ? new Date(c.empty_return_date).toISOString().split("T")[0]
            : "",
          customs_declaration_number: c.customs_declaration_number || "",
          item_count: c.item_count || undefined,
          notes: c.notes || "",
        })) || [],
      documents:
        shipment.documents?.map((d) => ({
          dbId: d.id,
          document_type: d.document_type,
          document_number: d.document_number || "",
          file_url: d.file_url,
          file_name: d.file_name,
        })) || [],
    });
    setIsEditDialogOpen(true);
  };

  const [selectedDocType, setSelectedDocType] = useState("BL");
  const [selectedDocNumber, setSelectedDocNumber] = useState("");

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingDoc(true);
    try {
      const res = await apiClient.uploadToS3(file, "shipments");
      if (res?.fileUrl) {
        appendDoc({
          document_type: selectedDocType,
          document_number: selectedDocNumber || "",
          file_url: res.fileUrl,
          file_name: file.name,
        });
        toast.success("تم رفع المستند بنجاح ✅");
        setSelectedDocNumber("");
      }
    } catch {
      toast.error("فشل رفع الملف");
    } finally {
      setIsUploadingDoc(false);
      e.target.value = "";
    }
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

  const toggleExpand = (shipmentId: number) => {
    setExpandedShipment(expandedShipment === shipmentId ? null : shipmentId);
  };

  // ===================== UI =====================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShipWheel className="text-primary" /> إدارة النقل البحري
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
                <TableHead className="w-12 px-2" />
                <TableHead className="text-center font-bold whitespace-nowrap text-xs">
                  رقم الشحنة / BL
                </TableHead>
                <TableHead className="text-center font-bold whitespace-nowrap text-xs">
                  المرسل
                </TableHead>
                <TableHead className="text-center font-bold whitespace-nowrap text-xs">
                  الناقل
                </TableHead>
                <TableHead className="text-center font-bold whitespace-nowrap text-xs">
                  المسار (من → إلى)
                </TableHead>
                <TableHead className="text-center font-bold whitespace-nowrap text-xs">
                  ت. الوصول
                </TableHead>
                <TableHead className="text-center font-bold whitespace-nowrap text-xs">
                  ت. التفريغ
                </TableHead>
                <TableHead className="text-center font-bold whitespace-nowrap text-xs">
                  Free Time
                </TableHead>
                <TableHead className="text-center font-bold whitespace-nowrap text-xs">
                  الحالة / البيانات
                </TableHead>
                <TableHead className="text-center font-bold whitespace-nowrap text-xs">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipmentsData.length > 0 ? (
                shipmentsData.map((s) => (
                  <Fragment key={s.id}>
                    <TableRow className="hover:bg-slate-50/40 border-slate-50 group">
                      <TableCell className="px-2 py-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleExpand(s.id)}
                          className="h-8 w-8 rounded-lg"
                        >
                          {expandedShipment === s.id ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-center py-3 whitespace-nowrap">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="font-bold text-slate-900 text-sm">
                            {s.bl_number || `SH-${s.id}`}
                          </span>
                          {s.bl_number && (
                            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                              <FileText size={10} /> BL: {s.bl_number}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-300 mt-0.5">
                            {new Date(s.createdAt).toLocaleDateString("ar-SA")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-3 whitespace-nowrap">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-semibold text-slate-800 text-xs">
                            {s.sender_company?.company_name || "—"}
                          </span>
                          {s.sub_company && (
                            <span className="text-[10px] text-blue-600 font-medium">
                              ({s.sub_company.sub_company_name})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-3 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 text-[10px] text-slate-600">
                          <Ship size={10} className="text-blue-400" />
                          <span className="font-semibold text-xs">
                            {s.carrier?.trans_name || "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-3 whitespace-nowrap">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600">
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
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-3 whitespace-nowrap text-xs">
                        {s.arrival_date
                          ? new Date(s.arrival_date).toLocaleDateString("ar-SA")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-center py-3 whitespace-nowrap text-xs">
                        {s.expected_discharge_date
                          ? new Date(
                              s.expected_discharge_date,
                            ).toLocaleDateString("ar-SA")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-center py-3 whitespace-nowrap text-xs">
                        <span className="font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                          {s.free_time_days ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-center">
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
                          <div className="flex gap-3 text-[10px] font-medium text-slate-500">
                            <span className="flex items-center gap-0.5">
                              <Layers size={10} /> {s.containers?.length || 0}{" "}
                              حاوية
                            </span>
                          </div>
                          <span
                            className={cn(
                              "text-[10px] font-semibold",
                              s.isActive === false
                                ? "text-rose-500"
                                : "text-emerald-600",
                            )}
                          >
                            {s.isActive === false ? "موقوفة" : "نشطة"}
                          </span>
                          {s.documents && s.documents.length > 0 && (
                            <span className="text-[10px] text-indigo-500 font-semibold">
                              {s.documents.length} مستند
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(s)}
                            className="h-8 w-8 text-blue-500 hover:bg-blue-50 rounded-lg"
                            title="تعديل"
                            disabled={!canWrite}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteShipmentDialog(s)}
                            className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-lg"
                            title="حذف"
                            disabled={!canWrite}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedShipment === s.id && (
                      <TableRow>
                        <TableCell colSpan={10} className="bg-slate-50 p-4">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-bold text-sm flex items-center gap-2 mb-3">
                                <Layers size={16} />
                                تفاصيل الحاويات ({s.containers?.length || 0})
                              </h4>
                              {s.containers && s.containers.length > 0 ? (
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-white">
                                      <TableHead className="text-right text-xs">
                                        رقم الحاوية
                                      </TableHead>
                                      <TableHead className="text-center text-xs">
                                        النوع
                                      </TableHead>
                                      <TableHead className="text-center text-xs">
                                        الوزن
                                      </TableHead>
                                      <TableHead className="text-center text-xs">
                                        البيان الجمركي
                                      </TableHead>
                                      <TableHead className="text-center text-xs">
                                        العدد
                                      </TableHead>
                                      <TableHead className="text-right text-xs">
                                        ملاحظات
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {s.containers.map((container) => (
                                      <TableRow
                                        key={container.id}
                                        className="bg-white"
                                      >
                                        <TableCell className="text-xs font-mono">
                                          {container.container_number || "—"}
                                        </TableCell>
                                        <TableCell className="text-center text-xs">
                                          {container.container_type || "—"}
                                        </TableCell>
                                        <TableCell className="text-center text-xs font-mono">
                                          {container.weight
                                            ? Number(
                                                container.weight,
                                              ).toLocaleString()
                                            : "—"}
                                        </TableCell>
                                        <TableCell className="text-center text-xs">
                                          {container.customs_declaration_number ||
                                            "—"}
                                        </TableCell>
                                        <TableCell className="text-center text-xs">
                                          {container.item_count || "—"}
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-600">
                                          {container.notes || "—"}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : (
                                <p className="text-sm text-slate-400 text-center py-4 bg-white rounded-xl border border-slate-100">
                                  لا توجد حاويات لهذه الشحنة
                                </p>
                              )}
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                              <h4 className="font-bold text-sm flex items-center gap-2 mb-3">
                                <FileText size={16} />
                                المستندات ({s.documents?.length || 0})
                              </h4>
                              {s.documents && s.documents.length > 0 ? (
                                <div className="flex flex-wrap gap-3">
                                  {s.documents.map((doc) => (
                                    <div
                                      key={doc.id}
                                      className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-primary/20 transition-all min-w-[250px]"
                                    >
                                      <div className="h-10 w-10 shrink-0 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-500">
                                        <FileText size={18} />
                                      </div>
                                      <div className="flex flex-col flex-1 min-w-0 text-right">
                                        <span className="text-sm font-bold text-slate-700 truncate block">
                                          {doc.file_name}
                                        </span>
                                        <div className="flex items-center justify-end gap-2 mt-0.5">
                                          <Badge
                                            variant="outline"
                                            className="text-[9px] py-0 px-1.5 rounded-full border-slate-200"
                                          >
                                            {DOCUMENT_TYPES.find(
                                              (t) =>
                                                t.value === doc.document_type,
                                            )?.label || doc.document_type}
                                          </Badge>
                                          {doc.document_number && (
                                            <span className="text-[10px] text-slate-400">
                                              #{doc.document_number}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            window.open(doc.file_url, "_blank")
                                          }
                                          className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg"
                                        >
                                          <Search size={14} />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            openDeleteDocumentDialog(
                                              s.id,
                                              doc.id,
                                            )
                                          }
                                          className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg"
                                          disabled={!canWrite}
                                        >
                                          <Trash2 size={14} />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-slate-400 text-center py-4 bg-white rounded-xl border border-slate-100">
                                  لا توجد مستندات مرفوعة
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={10}
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
                : "📦 تسجيل شحنة بحرية جديدة"}
            </DialogTitle>
            <DialogDescription className="text-right font-bold text-slate-400 mt-2">
              يرجى إدخال جميع تفاصيل البوليصة، الموانئ، الحاويات، وشركة الشحن.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 pt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* -- BL Number -- */}
              <div className="space-y-2 text-right">
                <Label className="font-bold text-slate-700 pr-1">
                  رقم البوليصة (BL Number) *
                </Label>
                <Input
                  {...form.register("bl_number")}
                  className="rounded-2xl h-12 bg-slate-50 border-none px-5"
                  placeholder="MSCU123456..."
                />
                {form.formState.errors.bl_number && (
                  <p className="text-rose-500 text-xs mt-1">
                    {form.formState.errors.bl_number.message as string}
                  </p>
                )}
              </div>

              {/* -- Sender Company -- */}
              <div className="space-y-2 text-right">
                <Label className="font-bold text-slate-700 pr-1">
                  الشركة المصدرة (Exporter)
                </Label>
                <select
                  {...form.register("sender_company_id")}
                  className="w-full h-12 rounded-2xl bg-slate-50 border-none px-5 text-sm font-bold text-slate-700"
                >
                  <option value="">اختر الشركة المصدرة...</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* -- Sub Company -- */}
              <div className="space-y-2 text-right">
                <Label className="font-bold text-slate-700 pr-1">
                  تخريج الفاتورة باسم (Sub Company)
                </Label>
                <select
                  {...form.register("sub_company_id")}
                  className="w-full h-12 rounded-2xl bg-slate-50 border-none px-5 text-sm font-bold text-slate-700"
                >
                  <option value="">اختر الشركة الفرعية...</option>
                  {subCompanies
                    .filter(
                      (sc) =>
                        !form.watch("sender_company_id") ||
                        sc.company_id.toString() ===
                          form.watch("sender_company_id"),
                    )
                    .map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.sub_company_name}
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
                  {...form.register("shipping_company")}
                  className="w-full h-12 rounded-2xl bg-slate-50 border-none px-5 text-sm font-bold text-slate-700"
                >
                  <option value="">اختر شركة الشحن...</option>
                  {shippingComps.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.trans_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* -- Port Loading & Discharge -- */}
              <div className="space-y-2 text-right">
                <Label className="font-bold text-slate-700 pr-1">
                  ميناء التحميل (Loading)
                </Label>
                <select
                  {...form.register("port_of_loading")}
                  className="w-full h-12 rounded-2xl bg-slate-50 border-none px-5 text-sm font-bold text-slate-700"
                >
                  <option value="">اختر ميناء التحميل...</option>
                  {ports.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.port_name} {p.country ? `— ${p.country}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 text-right">
                <Label className="font-bold text-slate-700 pr-1">
                  ميناء التفريغ (Discharge)
                </Label>
                <select
                  {...form.register("port_of_discharge")}
                  className="w-full h-12 rounded-2xl bg-slate-50 border-none px-5 text-sm font-bold text-slate-700"
                >
                  <option value="">اختر ميناء التفريغ...</option>
                  {ports.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.port_name} {p.city ? `— ${p.city}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* -- Dates & Free Time -- */}
              <div className="space-y-2 text-right">
                <Label className="font-bold text-slate-700 pr-1">
                  وصول متوقع *
                </Label>
                <Input
                  type="date"
                  {...form.register("arrival_date")}
                  className={cn(
                    "rounded-2xl h-12 bg-slate-50 border-none px-5",
                    form.formState.errors.arrival_date &&
                      "ring-2 ring-rose-500",
                  )}
                />
                {form.formState.errors.arrival_date && (
                  <p className="text-rose-500 text-[10px] mt-1 pr-1 font-bold">
                    {form.formState.errors.arrival_date.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2 text-right">
                <Label className="font-bold text-slate-700 pr-1">
                  تفريغ متوقع
                </Label>
                <Input
                  type="date"
                  {...form.register("expected_discharge_date")}
                  className="rounded-2xl h-12 bg-slate-50 border-none px-5"
                />
              </div>
              <div className="space-y-2 text-right">
                <Label className="font-bold text-slate-700 pr-1">
                  أيام العطل (Free Time)
                </Label>
                <Input
                  type="number"
                  {...form.register("free_time_days", { valueAsNumber: true })}
                  className="rounded-2xl h-12 bg-slate-50 border-none px-5"
                />
              </div>

              {/* -- Status & isActive -- */}
              <div className="space-y-2 text-right opacity-80 pointer-events-none">
                <Label className="font-bold text-slate-700 pr-1">
                  الحالة (يتم حسابها آلياً)
                </Label>
                <select
                  {...form.register("status")}
                  className="w-full h-12 rounded-2xl bg-slate-100 border-none px-5 text-sm font-black text-primary"
                >
                  <option value="PENDING">⏳ قيد الانتظار</option>
                  <option value="IN_TRANSIT">🚢 في الطريق</option>
                  <option value="ARRIVED">📍 وصلت المينا</option>
                  <option value="DELIVERED">✅ تم الاستلام</option>
                </select>
                <p className="text-[10px] text-slate-400 font-bold px-2">
                  يتم تحديث الحالة تلقائياً بناءً على تاريخ الوصول المتوقع
                </p>
              </div>
              <div className="flex items-center gap-3 text-right mt-6">
                <input
                  type="checkbox"
                  {...form.register("isActive")}
                  className="h-5 w-5 rounded-lg accent-primary"
                />
                <Label className="font-bold text-slate-700">الشحنة نشطة</Label>
              </div>

              {/* -- Multi Document Upload Section -- */}
              <div className="col-span-1 md:col-span-2 space-y-4 text-right bg-slate-50/50 p-6 rounded-[24px] border border-slate-100">
                <Label className="font-black text-slate-900 flex items-center gap-2 text-lg mb-2">
                  <FileUp size={20} className="text-primary" /> مستندات الشحنة
                </Label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-black text-slate-500">
                      نوع المستند
                    </Label>
                    <select
                      value={selectedDocType}
                      onChange={(e) => setSelectedDocType(e.target.value)}
                      className="w-full h-11 rounded-xl bg-slate-50 border-none px-4 text-sm font-bold text-slate-700"
                    >
                      {DOCUMENT_TYPES.map((dt) => (
                        <option key={dt.value} value={dt.value}>
                          {dt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-black text-slate-500">
                      رقم المستند (اختياري)
                    </Label>
                    <Input
                      value={selectedDocNumber}
                      onChange={(e) => setSelectedDocNumber(e.target.value)}
                      className="h-11 rounded-xl bg-slate-50 border-none px-4"
                      placeholder="رقم الفاتورة أو البوليصة..."
                    />
                  </div>
                  <div className="md:col-span-2 relative">
                    <input
                      type="file"
                      onChange={handleDocUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      disabled={isUploadingDoc}
                    />
                    <Button
                      type="button"
                      disabled={isUploadingDoc}
                      className="w-full h-12 rounded-xl border-dashed border-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 gap-2 font-bold"
                    >
                      {isUploadingDoc ? (
                        "⏳ جاري الرفع..."
                      ) : (
                        <>
                          <Upload size={16} /> اختر ملف لرفعه
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* List of uploaded documents in Form */}
                <div className="space-y-3 mt-4">
                  {docFields.map((doc, index: number) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-primary/20 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                          <FileText size={18} className="text-indigo-500" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold text-slate-700 truncate block">
                            {doc.file_name || "مستند بدون اسم"}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge
                              variant="outline"
                              className="text-[9px] py-0 px-1.5 rounded-full border-slate-100 font-bold"
                            >
                              {DOCUMENT_TYPES.find(
                                (t) => t.value === doc.document_type,
                              )?.label || doc.document_type}
                            </Badge>
                            {doc.document_number && (
                              <span className="text-[10px] text-slate-400">
                                #{doc.document_number}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(doc.file_url, "_blank")}
                          className="h-9 w-9 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
                        >
                          <Search size={16} />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            if (doc.dbId) {
                              // Existing doc in DB
                              if (selectedShipment?.id) {
                                openDeleteDocumentDialog(
                                  selectedShipment.id,
                                  doc.dbId,
                                  index,
                                );
                              }
                            } else {
                              // New doc not yet in DB
                              if (doc.file_url) {
                                await apiClient
                                  .deleteFromS3(doc.file_url)
                                  .catch(console.error);
                              }
                              removeDoc(index);
                              toast.success("تم إزالة المستند");
                            }
                          }}
                          className="h-9 w-9 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {docFields.length === 0 && (
                    <div className="text-center py-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-slate-300 text-xs font-bold italic">
                        لا توجد مستندات مرفوعة بعد
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* -- Containers Section -- */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 flex items-center gap-2 text-lg">
                  <Layers className="text-primary" size={20} /> تفاصيل الحاويات
                  ({containerFields.length})
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    appendContainer({
                      container_number: "",
                      container_type: "40HC",
                    })
                  }
                  className="rounded-xl gap-2 font-bold h-10 px-4 border-primary/20 text-primary"
                >
                  <PlusCircle size={16} /> إضافة حاوية
                </Button>
              </div>

              <div className="space-y-4">
                {containerFields.map((field, index) => (
                  <Card
                    key={field.id}
                    className="p-5 border-slate-100 shadow-sm relative group bg-slate-50/50"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeContainer(index)}
                      className="absolute top-2 left-2 text-slate-300 hover:text-rose-600 h-8 w-8"
                    >
                      <X size={16} />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5 text-right">
                        <Label className="text-[11px] font-black text-slate-500">
                          رقم الحاوية *
                        </Label>
                        <Input
                          {...form.register(
                            `containers.${index}.container_number`,
                          )}
                          className="h-10 rounded-xl bg-white border-none shadow-sm"
                          placeholder="MSCU123..."
                        />
                      </div>
                      <div className="space-y-1.5 text-right">
                        <Label className="text-[11px] font-black text-slate-500">
                          النوع
                        </Label>
                        <Input
                          {...form.register(
                            `containers.${index}.container_type`,
                          )}
                          className="h-10 rounded-xl bg-white border-none shadow-sm"
                        />
                      </div>
                      <div className="space-y-1.5 text-right">
                        <Label className="text-[11px] font-black text-slate-500">
                          الوزن (طن)
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...form.register(`containers.${index}.weight`, {
                            valueAsNumber: true,
                          })}
                          className="h-10 rounded-xl bg-white border-none shadow-sm"
                        />
                      </div>
                      <div className="space-y-1.5 text-right">
                        <Label className="text-[11px] font-black text-slate-500">
                          تاريخ إعادة الفارغ
                        </Label>
                        <Input
                          type="date"
                          {...form.register(
                            `containers.${index}.empty_return_date`,
                          )}
                          className="h-10 rounded-xl bg-white border-none shadow-sm"
                        />
                      </div>
                      <div className="space-y-1.5 text-right">
                        <Label className="text-[11px] font-black text-slate-500">
                          البيان الجمركي
                        </Label>
                        <Input
                          {...form.register(
                            `containers.${index}.customs_declaration_number`,
                          )}
                          className="h-10 rounded-xl bg-white border-none shadow-sm"
                        />
                      </div>
                      <div className="space-y-1.5 text-right">
                        <Label className="text-[11px] font-black text-slate-500">
                          العدد
                        </Label>
                        <Input
                          type="number"
                          {...form.register(`containers.${index}.item_count`, {
                            valueAsNumber: true,
                          })}
                          className="h-10 rounded-xl bg-white border-none shadow-sm"
                        />
                      </div>
                      <div className="col-span-full space-y-1.5 text-right">
                        <Label className="text-[11px] font-black text-slate-500">
                          ملاحظات الحاوية
                        </Label>
                        <Input
                          {...form.register(`containers.${index}.notes`)}
                          className="h-10 rounded-xl bg-white border-none shadow-sm w-full"
                          placeholder="مثلاً: بضاعة قابلة للكسر..."
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                {containerFields.length === 0 && (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                    <p className="text-slate-400 font-bold italic">
                      لم يتم إضافة حاويات بعد
                    </p>
                  </div>
                )}
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
                  form.reset();
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
          <div className="flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
              <AlertTriangle className="text-rose-600" size={32} />
            </div>
            <DialogTitle className="font-black text-slate-900 text-xl">
              {deleteTarget.title}
            </DialogTitle>
            <DialogDescription className="font-bold text-slate-500 py-4">
              {deleteTarget.type === "shipment" ? (
                <>
                  هل أنت متأكد من حذف الشحنة{" "}
                  <strong>
                    {selectedShipment?.bl_number ||
                      `SH-${selectedShipment?.id}`}
                  </strong>
                  ؟ سيتم حذف جميع المستندات المرتبطة. هذا الإجراء لا يمكن
                  التراجع عنه.
                </>
              ) : (
                deleteTarget.description
              )}
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
