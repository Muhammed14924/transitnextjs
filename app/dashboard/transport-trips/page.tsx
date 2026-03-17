"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus,
  Search,
  Truck,
  Calendar,
  Trash2,
  ChevronDown,
  ChevronUp,
  Package,
  User,
  X,
  Save,
  Loader2,
  FileUp,
  FileText,
  Upload,
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
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { apiClient } from "@/app/lib/api-client";
import { toast } from "sonner";
import { cn } from "@/app/lib/utils";

const tripSchema = z.object({
  trip_number: z.string().optional(),
  loading_date: z.string().optional(),
  driver_name: z.string().optional(),
  driver_phone: z.string().optional(),
  plate_front: z.string().optional(),
  plate_back: z.string().optional(),
  gate_id: z.union([z.string(), z.number()]).optional(),
  transport_company_id: z.union([z.string(), z.number()]).optional(),
  sort_num: z.union([z.string(), z.number()]).optional(),
  discharge_date: z.string().optional(),
  truck_fare: z.union([z.string(), z.number()]).optional(),
  notes: z.string().optional(),
  waybills: z
    .array(
      z.object({
        sender_company_id: z.union([z.string(), z.number()]).optional(),
        trader_id: z.union([z.string(), z.number()]).optional(),
        destination_id: z.union([z.string(), z.number()]).optional(),
        container_id: z.union([z.string(), z.number()]).optional(),
        quantity: z.union([z.string(), z.number()]).optional(),
        weight: z.union([z.string(), z.number()]).optional(),
        notes: z.string().optional(),
      }),
    )
    .optional(),
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
    .optional(),
});

type TripFormData = z.infer<typeof tripSchema>;

interface TransportTrip {
  id: number;
  trip_number: string | null;
  loading_date: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  plate_front: string | null;
  plate_back: string | null;
  gate_id: number | null;
  transport_company_id: number | null;
  sort_num: number | null;
  discharge_date: string | null;
  truck_fare: number | null;
  notes: string | null;
  status: string;
  isActive: boolean;
  gate?: { id: number; gate_name: string; gate_code: string | null } | null;
  transport_company?: { id: number; trans_name: string } | null;
  waybills?: TripWaybill[];
  documents?: {
    id: number;
    file_url: string;
    file_name: string;
    document_type: string;
    document_number?: string;
  }[];
}

interface TripWaybill {
  id: number;
  trip_id: number;
  sender_company_id: number | null;
  trader_id: number | null;
  destination_id: number | null;
  container_id: number | null;
  invoice_num: string | null;
  quantity: number | null;
  weight: number | null;
  allocated_fare: number | null;
  notes: string | null;
  sender_company?: {
    id: number;
    company_name: string;
    company_code: string;
  } | null;
  trader?: { id: number; trader_name: string; trader_code: string } | null;
  destination?: { id: number; destination_name: string } | null;
  container?: {
    id: number;
    container_number: string;
    container_type: string | null;
  } | null;
}

interface Company {
  id: number;
  company_name: string;
  company_code: string;
}

interface Trader {
  id: number;
  trader_name: string;
  trader_code: string;
}

interface Destination {
  id: number;
  destination_name: string;
}

interface Container {
  id: number;
  container_number: string;
  container_type: string | null;
}

interface Gate {
  id: number;
  gate_name: string;
  gate_code: string | null;
}

interface TransportCompany {
  id: number;
  trans_name: string;
}

export default function TransportTripsPage() {
  const [trips, setTrips] = useState<TransportTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [expandedTrip, setExpandedTrip] = useState<number | null>(null);

  const [selectedDocType, setSelectedDocType] = useState("البيان الجمركي");
  const [selectedDocNumber, setSelectedDocNumber] = useState("");
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const DOCUMENT_TYPES = [
    { value: "البيان الجمركي", label: "البيان الجمركي" },
    { value: "أخرى", label: "أخرى" },
  ];

  const [companies, setCompanies] = useState<Company[]>([]);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [gates, setGates] = useState<Gate[]>([]);
  const [transportCompanies, setTransportCompanies] = useState<
    TransportCompany[]
  >([]);

  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
  } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      trip_number: "",
      loading_date: "",
      driver_name: "",
      driver_phone: "",
      plate_front: "",
      plate_back: "",
      gate_id: "",
      transport_company_id: "",
      sort_num: "",
      discharge_date: "",
      truck_fare: "",
      notes: "",
      waybills: [],
      documents: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "waybills",
  });

  const {
    fields: docFields,
    append: appendDoc,
    remove: removeDoc,
  } = useFieldArray({
    control,
    name: "documents",
  });

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingDoc(true);
    try {
      const res = await apiClient.uploadToS3(file);
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

  const fetchDropdownData = useCallback(async () => {
    try {
      const [
        companiesRes,
        tradersRes,
        destinationsRes,
        gatesRes,
        transportCompaniesRes,
      ] = await Promise.all([
        apiClient.getCompanies(),
        apiClient.getTraders(),
        apiClient.getDestinations(),
        apiClient.getGates(),
        apiClient.getTransportCompanies(),
      ]);

      setCompanies(companiesRes || []);
      setTraders(tradersRes || []);
      setDestinations(destinationsRes || []);
      setGates(gatesRes || []);
      setTransportCompanies(transportCompaniesRes || []);

      // Fetch containers from shipments
      try {
        const shipments = await apiClient.getShipments({ limit: 100 });
        const allContainers: Container[] = [];
        shipments?.forEach((shipment: any) => {
          if (shipment.containers) {
            allContainers.push(...shipment.containers);
          }
        });
        setContainers(allContainers);
      } catch (e) {
        console.log("No containers found");
      }
    } catch (error) {
      console.error("Failed to fetch dropdown data", error);
    }
  }, []);

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getTransportTrips();
      if (data) {
        setTrips(data);
      }
    } catch (error) {
      console.error("Failed to fetch trips", error);
      toast.error("فشل في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
    fetchDropdownData();
  }, [fetchTrips, fetchDropdownData]);

  const onSubmit = async (data: TripFormData) => {
    setSubmitting(true);
    try {
      const tripPayload = {
        trip_number: data.trip_number || null,
        loading_date: data.loading_date
          ? new Date(data.loading_date).toISOString()
          : null,
        driver_name: data.driver_name || null,
        driver_phone: data.driver_phone || null,
        plate_front: data.plate_front || null,
        plate_back: data.plate_back || null,
        gate_id: data.gate_id ? parseInt(data.gate_id.toString()) : null,
        transport_company_id: data.transport_company_id
          ? parseInt(data.transport_company_id.toString())
          : null,
        sort_num: data.sort_num ? parseInt(data.sort_num.toString()) : null,
        discharge_date: data.discharge_date
          ? new Date(data.discharge_date).toISOString()
          : null,
        truck_fare: data.truck_fare
          ? parseFloat(data.truck_fare.toString())
          : null,
        notes: data.notes || null,
        documents: data.documents || [],
      };

      // First create the trip
      const trip = await apiClient.createTransportTrip(tripPayload);

      // Then create waybills if any
      if (data.waybills && data.waybills.length > 0) {
        for (const waybill of data.waybills) {
          if (waybill.sender_company_id || waybill.trader_id) {
            await apiClient.createTripWaybill({
              trip_id: trip.id,
              sender_company_id: waybill.sender_company_id
                ? parseInt(waybill.sender_company_id.toString())
                : null,
              trader_id: waybill.trader_id
                ? parseInt(waybill.trader_id.toString())
                : null,
              destination_id: waybill.destination_id
                ? parseInt(waybill.destination_id.toString())
                : null,
              container_id: waybill.container_id
                ? parseInt(waybill.container_id.toString())
                : null,
              quantity: waybill.quantity
                ? parseInt(waybill.quantity.toString())
                : null,
              weight: waybill.weight
                ? parseFloat(waybill.weight.toString())
                : null,
              notes: waybill.notes || null,
            });
          }
        }
      }

      setIsAddDialogOpen(false);
      reset();
      fetchTrips();
      toast.success("تمت إضافة الرحلة بنجاح");
    } catch (error) {
      console.error("Error creating trip", error);
      toast.error("حدث خطأ أثناء الإضافة");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTrip = async (tripId: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه الرحلة؟")) return;
    try {
      await apiClient.deleteTransportTrip(tripId);
      fetchTrips();
      toast.success("تم حذف الرحلة بنجاح");
    } catch (error) {
      console.error("Error deleting trip", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const toggleExpand = (tripId: number) => {
    setExpandedTrip(expandedTrip === tripId ? null : tripId);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DISPATCHED: "bg-blue-50 text-blue-600 border-blue-200",
      AT_BORDER: "bg-amber-50 text-amber-600 border-amber-200",
      DELIVERED: "bg-emerald-50 text-emerald-600 border-emerald-200",
    };
    const labels: Record<string, string> = {
      DISPATCHED: "مُ dispatched",
      AT_BORDER: "في المعبر",
      DELIVERED: "تم التسليم",
    };
    return (
      <Badge
        className={cn("border", styles[status] || "bg-gray-50 text-gray-600")}
      >
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
            إدارة النقل البري
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            إدارة رحلات الشاحنين والبضائع (Master-Detail)
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-11 gap-2 bg-primary shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all px-6">
              <Plus size={18} />
              إضافة رحلة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-[32px] p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-right">
                إضافة رحلة شاحنة جديدة
              </DialogTitle>
              <DialogDescription className="text-right">
                أدخل بيانات الرحلة والمعلومات المتعلقة بها
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Trip Details Section */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-4">
                <h3 className="font-bold text-sm text-slate-700 border-b pb-2">
                  بيانات الرحلة
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">رقم الرحلة</Label>
                    <Input
                      {...register("trip_number")}
                      placeholder="اختياري"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">تاريخ التحميل</Label>
                    <Input
                      type="date"
                      {...register("loading_date")}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">اسم السائق</Label>
                    <Input
                      {...register("driver_name")}
                      placeholder="اسم السائق"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">رقم الهاتف</Label>
                    <Input
                      {...register("driver_phone")}
                      placeholder="رقم الهاتف"
                      className="rounded-xl"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">
                      لوحة القيادة (أمام)
                    </Label>
                    <Input
                      {...register("plate_front")}
                      placeholder="1234"
                      className="rounded-xl"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">
                      لوحة القيادة (خلف)
                    </Label>
                    <Input
                      {...register("plate_back")}
                      placeholder="ABC"
                      className="rounded-xl"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">البوابة</Label>
                    <select
                      {...register("gate_id")}
                      className="w-full h-10 rounded-xl border border-gray-200 px-3"
                    >
                      <option value="">اختر البوابة</option>
                      {gates.map((gate) => (
                        <option key={gate.id} value={gate.id}>
                          {gate.gate_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">شركة النقل</Label>
                    <select
                      {...register("transport_company_id")}
                      className="w-full h-10 rounded-xl border border-gray-200 px-3"
                    >
                      <option value="">اختر الشركة</option>
                      {transportCompanies.map((tc) => (
                        <option key={tc.id} value={tc.id}>
                          {tc.trans_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">ترتيب الدور</Label>
                    <Input
                      type="number"
                      {...register("sort_num")}
                      placeholder="0"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">تاريخ التفريغ</Label>
                    <Input
                      type="date"
                      {...register("discharge_date")}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">مبلغ الشاحنة</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register("truck_fare")}
                      placeholder="0.00"
                      className="rounded-xl"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold">ملاحظات</Label>
                  <Input
                    {...register("notes")}
                    placeholder="ملاحظات إضافية"
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* -- Multi Document Upload Section -- */}
              <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-4 text-right">
                <Label className="font-bold text-sm text-slate-700 flex items-center gap-2 border-b pb-2">
                  <FileUp size={18} className="text-primary" /> مستندات الشحنة
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
                      placeholder="رقم المستند..."
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

                <div className="space-y-3 mt-4">
                  {docFields.map((doc: Record<string, unknown>, index: number) => (
                    <div
                      key={doc.id as string}
                      className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-primary/20 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                          <FileText size={18} className="text-indigo-500" />
                        </div>
                        <div className="flex flex-col min-w-0 text-right">
                          <span className="text-sm font-bold text-slate-700 truncate block">
                            {doc.file_name || "مستند بدون اسم"}
                          </span>
                          <div className="flex items-center justify-end gap-2 mt-0.5">
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
                              if (
                                confirm(
                                  "هل أنت متأكد من حذف هذا المستند نهائياً؟ سيتم حذفه من السيرفر أيضاً."
                                )
                              ) {
                                try {
                                  // Call delete API (will add later if needed)
                                  removeDoc(index);
                                  toast.success("تم حذف المستند بنجاح");
                                } catch {
                                  toast.error("فشل حذف المستند");
                                }
                              }
                            } else {
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

              {/* Waybills Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-700 border-b pb-2">
                    البضائع / البوالص ({fields.length})
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        sender_company_id: undefined,
                        trader_id: undefined,
                        destination_id: undefined,
                        container_id: undefined,
                        quantity: undefined,
                        weight: undefined,
                        notes: "",
                      })
                    }
                    className="rounded-xl gap-1"
                  >
                    <Plus size={16} /> إضافة بوليصة
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">
                        بوليصة #{index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="h-6 w-6 text-rose-500 hover:bg-rose-50"
                      >
                        <X size={14} />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold">
                          الشركة المُرسلة
                        </Label>
                        <select
                          {...register(
                            `waybills.${index}.sender_company_id` as const,
                          )}
                          className="w-full h-9 rounded-lg border border-slate-200 px-2 text-sm"
                        >
                          <option value="">اختر الشركة</option>
                          {companies.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.company_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold">التاجر</Label>
                        <select
                          {...register(`waybills.${index}.trader_id` as const)}
                          className="w-full h-9 rounded-lg border border-slate-200 px-2 text-sm"
                        >
                          <option value="">اختر التاجر</option>
                          {traders.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.trader_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold">الوجهة</Label>
                        <select
                          {...register(
                            `waybills.${index}.destination_id` as const,
                          )}
                          className="w-full h-9 rounded-lg border border-slate-200 px-2 text-sm"
                        >
                          <option value="">اختر الوجهة</option>
                          {destinations.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.destination_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold">
                          الحمولة (كغ)
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`waybills.${index}.weight` as const)}
                          placeholder="0"
                          className="rounded-lg h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold">العدد</Label>
                        <Input
                          type="number"
                          {...register(`waybills.${index}.quantity` as const)}
                          placeholder="0"
                          className="rounded-lg h-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold">
                        الحاوية (اختياري)
                      </Label>
                      <select
                        {...register(`waybills.${index}.container_id` as const)}
                        className="w-full h-9 rounded-lg border border-slate-200 px-2 text-sm"
                      >
                        <option value="">اختر حاوية</option>
                        {containers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.container_number} ({c.container_type})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter className="flex-row-reverse gap-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl gap-2"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  حفظ الرحلة
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    reset();
                    setIsAddDialogOpen(false);
                  }}
                  className="rounded-xl"
                >
                  إلغاء
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Truck className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500">إجمالي الرحلات</p>
              <p className="text-xl font-bold">{trips.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Package className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500">إجمالي البوالص</p>
              <p className="text-xl font-bold">
                {trips.reduce((sum, t) => sum + (t.waybills?.length || 0), 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Truck className="text-emerald-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500">مُ dispatched</p>
              <p className="text-xl font-bold">
                {trips.filter((t) => t.status === "DISPATCHED").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl bg-white shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Calendar className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500">في المعبر</p>
              <p className="text-xl font-bold">
                {trips.filter((t) => t.status === "AT_BORDER").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trips Table */}
      <Card className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Search className="text-slate-400" size={18} />
            <Input
              placeholder="بحث في الرحلات..."
              className="max-w-sm rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-right"></TableHead>
                <TableHead className="text-right font-bold">
                  رقم الرحلة
                </TableHead>
                <TableHead className="text-right font-bold">التاريخ</TableHead>
                <TableHead className="text-right font-bold">السائق</TableHead>
                <TableHead className="text-right font-bold">اللوحات</TableHead>
                <TableHead className="text-right font-bold">الكلفة</TableHead>
                <TableHead className="text-right font-bold">الحالة</TableHead>
                <TableHead className="text-center font-bold">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : trips.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-slate-400"
                  >
                    لا توجد رحلات مسجلة
                  </TableCell>
                </TableRow>
              ) : (
                trips
                  .filter((trip) => {
                    if (!searchTerm) return true;
                    const search = searchTerm.toLowerCase();
                    return (
                      trip.trip_number?.toLowerCase().includes(search) ||
                      trip.driver_name?.toLowerCase().includes(search) ||
                      trip.plate_front?.toLowerCase().includes(search) ||
                      trip.plate_back?.toLowerCase().includes(search)
                    );
                  })
                  .map((trip) => (
                    <React.Fragment key={trip.id}>
                      <TableRow className="hover:bg-slate-50">
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleExpand(trip.id)}
                            className="h-8 w-8"
                          >
                            {expandedTrip === trip.id ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold">
                            {trip.trip_number || `TRIP-${trip.id}`}
                          </span>
                        </TableCell>
                        <TableCell>
                          {trip.loading_date
                            ? new Date(trip.loading_date).toLocaleDateString(
                                "ar-SA",
                              )
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-slate-400" />
                            <span>{trip.driver_name || "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {trip.plate_front} {trip.plate_back}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono">
                            {trip.truck_fare
                              ? Number(trip.truck_fare).toLocaleString()
                              : "—"}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(trip.status)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteTrip(trip.id)}
                              className="h-8 w-8 text-rose-500 hover:bg-rose-50"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedTrip === trip.id && (
                        <TableRow key={`${trip.id}-waybills`}>
                          <TableCell colSpan={8} className="bg-slate-50 p-4">
                            <div className="space-y-3">
                              <h4 className="font-bold text-sm flex items-center gap-2">
                                <Package size={16} />
                                البوالص ({trip.waybills?.length || 0})
                              </h4>
                              {trip.waybills && trip.waybills.length > 0 ? (
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-white">
                                      <TableHead className="text-right text-xs">
                                        الشركة
                                      </TableHead>
                                      <TableHead className="text-right text-xs">
                                        التاجر
                                      </TableHead>
                                      <TableHead className="text-right text-xs">
                                        الوجهة
                                      </TableHead>
                                      <TableHead className="text-center text-xs">
                                        الوزن
                                      </TableHead>
                                      <TableHead className="text-center text-xs">
                                        العدد
                                      </TableHead>
                                      <TableHead className="text-center text-xs">
                                        القسط
                                      </TableHead>
                                      <TableHead className="text-center text-xs">
                                        الفاتورة
                                      </TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {trip.waybills.map((waybill) => (
                                      <TableRow
                                        key={waybill.id}
                                        className="bg-white"
                                      >
                                        <TableCell className="text-xs">
                                          {waybill.sender_company
                                            ?.company_name || "—"}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                          {waybill.trader?.trader_name || "—"}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                          {waybill.destination
                                            ?.destination_name || "—"}
                                        </TableCell>
                                        <TableCell className="text-center text-xs font-mono">
                                          {waybill.weight
                                            ? Number(
                                                waybill.weight,
                                              ).toLocaleString()
                                            : "—"}
                                        </TableCell>
                                        <TableCell className="text-center text-xs">
                                          {waybill.quantity || "—"}
                                        </TableCell>
                                        <TableCell className="text-center text-xs font-mono text-emerald-600">
                                          {waybill.allocated_fare
                                            ? Number(
                                                waybill.allocated_fare,
                                              ).toLocaleString()
                                            : "—"}
                                        </TableCell>
                                        <TableCell className="text-center text-xs font-mono">
                                          {waybill.invoice_num || "—"}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : (
                                <p className="text-sm text-slate-400 text-center py-4">
                                  لا توجد بوالص لهذه الرحلة
                                </p>
                              )}
                              {/* Documents Section in Expanded Row */}
                              <div className="mt-4 pt-4 border-t border-slate-200">
                                <h4 className="font-bold text-sm flex items-center gap-2 mb-3">
                                  <FileText size={16} />
                                  المستندات ({trip.documents?.length || 0})
                                </h4>
                                {trip.documents && trip.documents.length > 0 ? (
                                  <div className="flex flex-wrap gap-3">
                                    {trip.documents.map((doc) => (
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
                                              {doc.document_type}
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
                                            onClick={() => window.open(doc.file_url, '_blank')}
                                            className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg"
                                          >
                                            <Search size={14} />
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
                    </React.Fragment>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
