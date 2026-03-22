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
  Edit,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
  gate_id: z.union([z.string(), z.number(), z.null()]).optional(),
  transport_company_id: z.union([z.string(), z.number(), z.null()]).optional(),
  sort_num: z.union([z.string(), z.number(), z.null()]).optional(),
  discharge_date: z.string().optional().nullable(),
  truck_fare: z.union([z.string(), z.number(), z.null()]).optional(),
  notes: z.string().optional().nullable(),
  route_type: z.string().optional(),
  source_company_id: z.union([z.string(), z.number(), z.null()]).optional(),
  source_shipment_id: z.union([z.string(), z.number(), z.null()]).optional(),
  source_container_id: z.union([z.string(), z.number(), z.null()]).optional(),
  source_depot_id: z.union([z.string(), z.number(), z.null()]).optional(),
  destination_depot_id: z.union([z.string(), z.number(), z.null()]).optional(),
  waybills: z
    .array(
      z.object({
        trader_id: z.union([z.string(), z.number()]).optional(),
        destination_id: z.union([z.string(), z.number()]).optional(),
        sender_company_id: z.union([z.string(), z.number()]).optional(),
        receipt_num: z
          .string()
          .length(5, "رقم الوصل يجب أن يكون 5 أرقام")
          .optional()
          .or(z.literal("")),
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
  route_type: string | null;
  source_company_id: number | null;
  source_shipment_id: number | null;
  source_container_id: number | null;
  source_depot_id: number | null;
  destination_depot_id: number | null;
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
  source_company?: { id: number; company_name: string } | null;
  source_container?: {
    id: number;
    container_number: string;
    container_type: string | null;
  } | null;
  source_shipment?: {
    id: number;
    bl_number: string;
    sender_company_id: number | null;
    containers?: Container[];
  } | null;
  source_depot?: { id: number; depot_name: string } | null;
  destination_depot?: { id: number; depot_name: string } | null;
}

interface TripWaybill {
  id: number;
  trip_id: number;
  trader_id: number | null;
  destination_id: number | null;
  sender_company_id?: number | null;
  invoice_num: string | null;
  receipt_num: string | null;
  quantity: number | null;
  weight: number | null;
  allocated_fare: number | null;
  notes: string | null;
  trader?: { id: number; trader_name: string; trader_code: string } | null;
  destination?: { id: number; destination_name: string } | null;
  sender_company?: { id: number; company_name: string } | null;
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

interface Shipment {
  id: number;
  bl_number: string;
  sender_company_id?: number | null;
  status?: string;
  containers?: Container[];
}

interface Gate {
  id: number;
  gate_name: string;
  gate_code: string | null;
}

interface Depot {
  id: number;
  depot_name: string;
}

interface TransportCompany {
  id: number;
  trans_name: string;
}

export default function TransportTripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<TransportTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TransportTrip | null>(null);
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
  const [gates, setGates] = useState<Gate[]>([]);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [arrivedShipments, setArrivedShipments] = useState<Shipment[]>([]);
  const [transportCompanies, setTransportCompanies] = useState<
    TransportCompany[]
  >([]);

  const [submitting, setSubmitting] = useState(false);

  // ========= Delete Confirmation Dialog State =========
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "trip" | "waybill" | "document" | null;
    id: number | null;
    parentId?: number | null;
    title: string;
    description: string;
  }>({ type: null, id: null, title: "", description: "" });

  const confirmDelete = async () => {
    if (!deleteTarget.type || !deleteTarget.id) return;
    try {
      if (deleteTarget.type === "trip") {
        await apiClient.deleteTransportTrip(deleteTarget.id!);
        toast.success("تم حذف الرحلة بنجاح");
      } else if (deleteTarget.type === "waybill") {
        await apiClient.deleteTripWaybill(deleteTarget.id!);
        toast.success("تم حذف البوليصة بنجاح");
      } else if (deleteTarget.type === "document" && deleteTarget.parentId) {
        await apiClient.deleteTransportTripDocument(
          deleteTarget.parentId,
          deleteTarget.id!,
        );
        toast.success("تم حذف المستند بنجاح");
      }
      fetchTrips();
    } catch (error) {
      console.error("Delete error", error);
      toast.error("حدث خطأ أثناء الحذف");
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteTarget({ type: null, id: null, title: "", description: "" });
    }
  };

  // Edit form state
  const [editForm, setEditForm] = useState({
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
    status: "DISPATCHED",
    route_type: "FACTORY",
    source_company_id: "",
    source_shipment_id: "",
    source_container_id: "",
    source_depot_id: "",
    destination_depot_id: "",
  });
  const { register, control, handleSubmit, reset, watch } =
    useForm<TripFormData>({
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
        route_type: "FACTORY",
        source_company_id: "",
        source_shipment_id: "",
        source_container_id: "",
        source_depot_id: "",
        destination_depot_id: "",
        waybills: [],
        documents: [],
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "waybills",
  });

  const routeType = watch("route_type");

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
        depotsRes,
      ] = await Promise.all([
        apiClient.getCompanies(),
        apiClient.getTraders(),
        apiClient.getDestinations(),
        apiClient.getGates(),
        apiClient.getTransportCompanies(),
        apiClient.getDepots(),
      ]);

      setCompanies(companiesRes || []);
      setTraders(tradersRes || []);
      setDestinations(destinationsRes || []);
      setGates(gatesRes || []);
      setDepots(depotsRes || []);
      setTransportCompanies(transportCompaniesRes || []);

      try {
        const res = await apiClient.getShipments({ limit: 100 });
        const shipmentsData = res?.shipments || [];
        const arrived = shipmentsData.filter(
          (s: Shipment) =>
            s.status === "ARRIVED" ||
            s.status === "وصلت المينا" ||
            s.status === "IN_TRANSIT" ||
            s.status === "في الطريق",
        );
        setArrivedShipments(arrived);
      } catch {
        console.log("No shipments found");
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
        route_type: data.route_type || null,
        source_company_id: data.source_company_id
          ? parseInt(data.source_company_id.toString())
          : null,
        source_shipment_id: data.source_shipment_id
          ? parseInt(data.source_shipment_id.toString())
          : null,
        source_container_id: data.source_container_id
          ? parseInt(data.source_container_id.toString())
          : null,
        source_depot_id: data.source_depot_id
          ? parseInt(data.source_depot_id.toString())
          : null,
        destination_depot_id: data.destination_depot_id
          ? parseInt(data.destination_depot_id.toString())
          : null,
        documents: data.documents || [],
      };

      // First create the trip
      const trip = await apiClient.createTransportTrip(tripPayload);

      // Then create waybills if any
      if (data.waybills && data.waybills.length > 0) {
        for (const waybill of data.waybills) {
          if (waybill.trader_id) {
            await apiClient.createTripWaybill({
              trip_id: trip.id,
              trader_id: waybill.trader_id
                ? parseInt(waybill.trader_id.toString())
                : null,
              destination_id: waybill.destination_id
                ? parseInt(waybill.destination_id.toString())
                : null,
              sender_company_id:
                data.route_type === "PORT" && data.source_shipment_id
                  ? arrivedShipments.find(
                      (s) =>
                        s.id.toString() === data.source_shipment_id?.toString(),
                    )?.sender_company_id || null
                  : waybill.sender_company_id
                    ? parseInt(waybill.sender_company_id.toString())
                    : null,
              quantity: waybill.quantity
                ? parseInt(waybill.quantity.toString())
                : null,
              weight: waybill.weight
                ? parseFloat(waybill.weight.toString())
                : null,
              receipt_num: waybill.receipt_num || null,
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

  const handleDeleteTrip = (tripId: number) => {
    setDeleteTarget({
      type: "trip",
      id: tripId,
      title: "تأكيد حذف الرحلة",
      description:
        "هل أنت متأكد من حذف هذه الرحلة؟ سيتم حذف جميع المستندات والبوالص المرتبطة بها.",
    });
    setIsDeleteDialogOpen(true);
  };

  const toggleExpand = (tripId: number) => {
    setExpandedTrip(expandedTrip === tripId ? null : tripId);
  };

  const STATUS_LABELS: Record<string, string> = {
    DISPATCHED: "مُرسلة",
    AT_BORDER: "في المعبر",
    DELIVERED: "تم التسليم",
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DISPATCHED: "bg-blue-50 text-blue-600 border-blue-200",
      AT_BORDER: "bg-amber-50 text-amber-600 border-amber-200",
      DELIVERED: "bg-emerald-50 text-emerald-600 border-emerald-200",
    };
    return (
      <Badge
        className={cn("border", styles[status] || "bg-gray-50 text-gray-600")}
      >
        {STATUS_LABELS[status] || status}
      </Badge>
    );
  };

  const openEditDialog = (trip: TransportTrip) => {
    setSelectedTrip(trip);
    setEditForm({
      trip_number: trip.trip_number || "",
      loading_date: trip.loading_date
        ? new Date(trip.loading_date).toISOString().split("T")[0]
        : "",
      driver_name: trip.driver_name || "",
      driver_phone: trip.driver_phone || "",
      plate_front: trip.plate_front || "",
      plate_back: trip.plate_back || "",
      gate_id: trip.gate_id?.toString() || "",
      transport_company_id: trip.transport_company_id?.toString() || "",
      sort_num: trip.sort_num?.toString() || "",
      discharge_date: trip.discharge_date
        ? new Date(trip.discharge_date).toISOString().split("T")[0]
        : "",
      truck_fare: trip.truck_fare?.toString() || "",
      notes: trip.notes || "",
      status: trip.status || "DISPATCHED",
      route_type: trip.route_type || "FACTORY",
      source_company_id: trip.source_company_id?.toString() || "",
      source_shipment_id: trip.source_shipment_id?.toString() || "",
      source_container_id: trip.source_container_id?.toString() || "",
      source_depot_id: trip.source_depot_id?.toString() || "",
      destination_depot_id: trip.destination_depot_id?.toString() || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip) return;
    setSubmitting(true);
    try {
      const payload = {
        trip_number: editForm.trip_number || null,
        loading_date: editForm.loading_date
          ? new Date(editForm.loading_date).toISOString()
          : null,
        driver_name: editForm.driver_name || null,
        driver_phone: editForm.driver_phone || null,
        plate_front: editForm.plate_front || null,
        plate_back: editForm.plate_back || null,
        gate_id: editForm.gate_id ? parseInt(editForm.gate_id) : null,
        transport_company_id: editForm.transport_company_id
          ? parseInt(editForm.transport_company_id)
          : null,
        sort_num: editForm.sort_num ? parseInt(editForm.sort_num) : null,
        discharge_date: editForm.discharge_date
          ? new Date(editForm.discharge_date).toISOString()
          : null,
        truck_fare: editForm.truck_fare
          ? parseFloat(editForm.truck_fare)
          : null,
        notes: editForm.notes || null,
        status: editForm.status,
        route_type: editForm.route_type || null,
        source_company_id: editForm.source_company_id
          ? parseInt(editForm.source_company_id)
          : null,
        source_shipment_id: editForm.source_shipment_id
          ? parseInt(editForm.source_shipment_id)
          : null,
        source_container_id: editForm.source_container_id
          ? parseInt(editForm.source_container_id)
          : null,
        source_depot_id: editForm.source_depot_id
          ? parseInt(editForm.source_depot_id)
          : null,
        destination_depot_id: editForm.destination_depot_id
          ? parseInt(editForm.destination_depot_id)
          : null,
      };
      await apiClient.updateTransportTrip(selectedTrip.id, payload);
      setIsEditDialogOpen(false);
      await fetchTrips();
      toast.success("تم تحديث بيانات الرحلة بنجاح");
    } catch (error) {
      console.error("Error updating trip", error);
      toast.error("حدث خطأ أثناء التحديث");
    } finally {
      setSubmitting(false);
    }
  };

  // ========= Waybill Edit State & Handlers =========
  const [isEditWaybillOpen, setIsEditWaybillOpen] = useState(false);
  const [selectedWaybill, setSelectedWaybill] = useState<{
    id: number;
    trip_id: number;
    sender_company_id?: number | null;
    trader_id?: number | null;
    destination_id?: number | null;
    quantity?: number | null;
    weight?: number | null;
    notes?: string | null;
  } | null>(null);
  const [waybillEditForm, setWaybillEditForm] = useState({
    sender_company_id: "",
    trader_id: "",
    destination_id: "",
    receipt_num: "",
    quantity: "",
    weight: "",
    notes: "",
  });

  const openEditWaybillDialog = (waybill: {
    id: number;
    trip_id: number;
    sender_company_id?: number | null;
    trader_id?: number | null;
    destination_id?: number | null;
    receipt_num?: string | null;
    quantity?: number | null;
    weight?: number | null;
    notes?: string | null;
  }) => {
    setSelectedWaybill(waybill);
    setWaybillEditForm({
      sender_company_id: waybill.sender_company_id?.toString() || "",
      trader_id: waybill.trader_id?.toString() || "",
      destination_id: waybill.destination_id?.toString() || "",
      receipt_num: waybill.receipt_num || "",
      quantity: waybill.quantity?.toString() || "",
      weight: waybill.weight?.toString() || "",
      notes: waybill.notes || "",
    });
    setIsEditWaybillOpen(true);
  };

  const handleUpdateWaybill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWaybill) return;
    setSubmitting(true);
    try {
      await apiClient.updateTripWaybill(selectedWaybill.id, {
        trader_id: waybillEditForm.trader_id
          ? parseInt(waybillEditForm.trader_id)
          : null,
        destination_id: waybillEditForm.destination_id
          ? parseInt(waybillEditForm.destination_id)
          : null,
        sender_company_id: waybillEditForm.sender_company_id
          ? parseInt(waybillEditForm.sender_company_id)
          : null,
        quantity: waybillEditForm.quantity
          ? parseInt(waybillEditForm.quantity)
          : null,
        weight: waybillEditForm.weight
          ? parseFloat(waybillEditForm.weight)
          : null,
        receipt_num: waybillEditForm.receipt_num || null,
        notes: waybillEditForm.notes || null,
      });
      setIsEditWaybillOpen(false);
      await fetchTrips();
      toast.success("تم تحديث البوليصة بنجاح");
    } catch (error) {
      console.error("Error updating waybill", error);
      toast.error("حدث خطأ أثناء تحديث البوليصة");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWaybill = (waybillId: number, tripId: number) => {
    setDeleteTarget({
      type: "waybill",
      id: waybillId,
      parentId: tripId,
      title: "تأكيد حذف البوليصة",
      description:
        "هل أنت متأكد من حذف هذه البوليصة؟ لا يمكن التراجع عن هذا الإجراء.",
    });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTripDocument = (docId: number, tripId: number) => {
    setDeleteTarget({
      type: "document",
      id: docId,
      parentId: tripId,
      title: "تأكيد حذف المستند",
      description:
        "هل أنت متأكد من حذف هذا المستند؟ لا يمكن التراجع عن هذا الإجراء.",
    });
    setIsDeleteDialogOpen(true);
  };

  // ========= Add Waybill to Existing Trip =========
  const [isAddWaybillOpen, setIsAddWaybillOpen] = useState(false);
  const [addWaybillTripId, setAddWaybillTripId] = useState<number | null>(null);
  const [addWaybillForm, setAddWaybillForm] = useState({
    sender_company_id: "",
    trader_id: "",
    destination_id: "",
    receipt_num: "",
    quantity: "",
    weight: "",
    notes: "",
  });

  const openAddWaybillDialog = (tripId: number) => {
    const parentTrip = trips.find((t) => t.id === tripId);
    setAddWaybillTripId(tripId);
    setAddWaybillForm({
      sender_company_id:
        parentTrip?.route_type === "PORT" &&
        parentTrip.source_shipment?.sender_company_id
          ? parentTrip.source_shipment.sender_company_id.toString()
          : "",
      trader_id: "",
      destination_id: "",
      receipt_num: "",
      quantity: "",
      weight: "",
      notes: "",
    });
    setIsAddWaybillOpen(true);
  };

  const handleAddWaybill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addWaybillTripId) return;
    setSubmitting(true);
    try {
      await apiClient.createTripWaybill({
        trip_id: addWaybillTripId,
        trader_id: addWaybillForm.trader_id
          ? parseInt(addWaybillForm.trader_id)
          : null,
        destination_id: addWaybillForm.destination_id
          ? parseInt(addWaybillForm.destination_id)
          : null,
        sender_company_id: addWaybillForm.sender_company_id
          ? parseInt(addWaybillForm.sender_company_id)
          : null,
        quantity: addWaybillForm.quantity
          ? parseInt(addWaybillForm.quantity)
          : null,
        weight: addWaybillForm.weight
          ? parseFloat(addWaybillForm.weight)
          : null,
        receipt_num: addWaybillForm.receipt_num || null,
        notes: addWaybillForm.notes || null,
      });
      setIsAddWaybillOpen(false);
      await fetchTrips();
      toast.success("تم إضافة البوليصة بنجاح");
    } catch (error) {
      console.error("Error adding waybill", error);
      toast.error("حدث خطأ أثناء إضافة البوليصة");
    } finally {
      setSubmitting(false);
    }
  };

  // ========= Add Document to Existing Trip =========
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [addDocTripId, setAddDocTripId] = useState<number | null>(null);
  const [addDocForm, setAddDocForm] = useState({
    document_type: "البيان الجمركي",
    document_number: "",
  });
  const [addDocFile, setAddDocFile] = useState<File | null>(null);
  const [isUploadingAddDoc, setIsUploadingAddDoc] = useState(false);

  const openAddDocDialog = (tripId: number) => {
    setAddDocTripId(tripId);
    setAddDocForm({ document_type: "البيان الجمركي", document_number: "" });
    setAddDocFile(null);
    setIsAddDocOpen(true);
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addDocTripId || !addDocFile) {
      toast.error("يرجى اختيار ملف أولاً");
      return;
    }
    setIsUploadingAddDoc(true);
    try {
      const uploadResult = await apiClient.uploadToS3(addDocFile);
      if (!uploadResult?.fileUrl) throw new Error("Upload failed");

      await apiClient.request(
        `/api/transport-trips/${addDocTripId}/documents`,
        {
          method: "POST",
          body: JSON.stringify({
            document_type: addDocForm.document_type,
            document_number: addDocForm.document_number || null,
            file_url: uploadResult.fileUrl,
            file_name: addDocFile.name,
          }),
        },
      );
      setIsAddDocOpen(false);
      await fetchTrips();
      toast.success("تم رفع المستند بنجاح");
    } catch (error) {
      console.error("Error adding document", error);
      toast.error("حدث خطأ أثناء رفع المستند");
    } finally {
      setIsUploadingAddDoc(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="text-primary" /> إدارة النقل البري
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
              {/* Route Type & Destination Section (Moved to top) */}
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-4">
                <h3 className="font-bold text-sm text-primary border-b border-primary/10 pb-2">
                  مسار الرحلة والوجهة
                </h3>

                <div className="space-y-2">
                  <Label className="text-xs font-bold">نوع المسار</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        reset({ ...watch(), route_type: "FACTORY" })
                      }
                      className={cn(
                        "py-2 px-3 rounded-xl text-xs font-bold transition-all border",
                        routeType === "FACTORY"
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:border-primary/50",
                      )}
                    >
                      مصنع (Factory)
                    </button>
                    <button
                      type="button"
                      onClick={() => reset({ ...watch(), route_type: "PORT" })}
                      className={cn(
                        "py-2 px-3 rounded-xl text-xs font-bold transition-all border",
                        routeType === "PORT"
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:border-primary/50",
                      )}
                    >
                      ميناء (Port)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        reset({ ...watch(), route_type: "INTERNAL_DEPOT" })
                      }
                      className={cn(
                        "py-2 px-3 rounded-xl text-xs font-bold transition-all border",
                        routeType === "INTERNAL_DEPOT"
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:border-primary/50",
                      )}
                    >
                      مستودع داخلي
                    </button>
                  </div>
                </div>

                {routeType === "PORT" && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold">
                        الشحنة البحرية (وصلت المينا)
                      </Label>
                      <select
                        {...register("source_shipment_id")}
                        className="w-full h-10 rounded-xl border border-gray-200 px-3 bg-white"
                      >
                        <option value="">اختر الشحنة</option>
                        {arrivedShipments.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.bl_number}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold">الحاوية</Label>
                      <select
                        {...register("source_container_id")}
                        className="w-full h-10 rounded-xl border border-gray-200 px-3 bg-white"
                        disabled={!watch("source_shipment_id")}
                      >
                        <option value="">اختر الحاوية</option>
                        {arrivedShipments
                          .find(
                            (s) =>
                              s.id.toString() ===
                              watch("source_shipment_id")?.toString(),
                          )
                          ?.containers?.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.container_number} ({c.container_type})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                )}

                {routeType === "INTERNAL_DEPOT" && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold">
                        المستودع المصدر
                      </Label>
                      <select
                        {...register("source_depot_id")}
                        className="w-full h-10 rounded-xl border border-gray-200 px-3 bg-white"
                      >
                        <option value="">اختر المستودع</option>
                        {depots.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.depot_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold">مستودع الوجهة</Label>
                      <select
                        {...register("destination_depot_id")}
                        className="w-full h-10 rounded-xl border border-gray-200 px-3 bg-white"
                      >
                        <option value="">اختر المستودع</option>
                        {depots.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.depot_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

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
                    <Label className="text-xs font-bold">هاتف السائق</Label>
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
                      لوحة السيارة (أمامية)
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
                      لوحة المقطورة (خلفية)
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
                    <Label className="text-xs font-bold">المعبر الحدودي</Label>
                    <select
                      {...register("gate_id")}
                      className="w-full h-10 rounded-xl border border-gray-200 px-3"
                    >
                      <option value="">اختر المعبر</option>
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
                    <Label className="text-xs font-bold">كلفة الشحن ($)</Label>
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
                  {docFields.map((doc, index) => (
                    <div
                      key={`doc-${index}`}
                      className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-primary/20 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                          <FileText size={18} className="text-indigo-500" />
                        </div>
                        <div className="flex flex-col min-w-0 text-right">
                          <span className="text-sm font-bold text-slate-700 truncate block">
                            {String(doc.file_name || "مستند بدون اسم")}
                          </span>
                          <div className="flex items-center justify-end gap-2 mt-0.5">
                            <Badge
                              variant="outline"
                              className="text-[9px] py-0 px-1.5 rounded-full border-slate-100 font-bold"
                            >
                              {DOCUMENT_TYPES.find(
                                (t) =>
                                  t.value === String(doc.document_type || ""),
                              )?.label || String(doc.document_type || "")}
                            </Badge>
                            {doc.document_number && (
                              <span className="text-[10px] text-slate-400">
                                #{String(doc.document_number)}
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
                          onClick={() =>
                            window.open(String(doc.file_url || ""), "_blank")
                          }
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
                                  "هل أنت متأكد من حذف هذا المستند نهائياً؟",
                                )
                              ) {
                                try {
                                  removeDoc(index);
                                  toast.success("تم حذف المستند بنجاح");
                                } catch {
                                  toast.error("فشل حذف المستند");
                                }
                              }
                            } else {
                              if (doc.file_url) {
                                await apiClient
                                  .deleteFromS3(String(doc.file_url))
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
                        receipt_num: "",
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

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold">
                          الشركة المصدرة
                        </Label>
                        {routeType === "PORT" && watch("source_shipment_id") ? (
                          <div className="w-full h-9 rounded-lg border border-slate-100 px-2 text-sm bg-slate-50 flex items-center font-bold text-slate-600">
                            {companies.find(
                              (c) =>
                                c.id ===
                                arrivedShipments.find(
                                  (s) =>
                                    s.id.toString() ===
                                    watch("source_shipment_id")?.toString(),
                                )?.sender_company_id,
                            )?.company_name || "—"}
                          </div>
                        ) : (
                          <select
                            {...register(
                              `waybills.${index}.sender_company_id` as const,
                            )}
                            className="w-full h-9 rounded-lg border border-slate-200 px-2 text-sm"
                          >
                            <option value="">اختر الشركة</option>
                            {companies.map((company) => (
                              <option key={company.id} value={company.id}>
                                {company.company_name}
                              </option>
                            ))}
                          </select>
                        )}
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
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold">
                          رقم الوصل (5 أرقام)
                        </Label>
                        <Input
                          {...register(
                            `waybills.${index}.receipt_num` as const,
                          )}
                          placeholder="00000"
                          maxLength={5}
                          className="rounded-lg h-9"
                          dir="ltr"
                        />
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

      {/* Edit Trip Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent
          className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-right">
              تعديل بيانات الرحلة
            </DialogTitle>
            <DialogDescription className="text-right text-slate-500">
              قم بتعديل بيانات الرحلة ثم اضغط حفظ
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-2">
            {/* Route Type & Destination Section (Moved to top) */}
            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-4">
              <h3 className="font-bold text-sm text-primary border-b border-primary/10 pb-2">
                مسار الرحلة والوجهة
              </h3>

              <div className="space-y-2">
                <Label className="text-xs font-bold">نوع المسار</Label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEditForm({ ...editForm, route_type: "FACTORY" })
                    }
                    className={cn(
                      "py-2 px-3 rounded-xl text-xs font-bold transition-all border",
                      editForm.route_type === "FACTORY"
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-primary/50",
                    )}
                  >
                    مصنع (Factory)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditForm({ ...editForm, route_type: "PORT" })
                    }
                    className={cn(
                      "py-2 px-3 rounded-xl text-xs font-bold transition-all border",
                      editForm.route_type === "PORT"
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-primary/50",
                    )}
                  >
                    ميناء (Port)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditForm({ ...editForm, route_type: "INTERNAL_DEPOT" })
                    }
                    className={cn(
                      "py-2 px-3 rounded-xl text-xs font-bold transition-all border",
                      editForm.route_type === "INTERNAL_DEPOT"
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:border-primary/50",
                    )}
                  >
                    مستودع داخلي
                  </button>
                </div>
              </div>

              {editForm.route_type === "PORT" && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">
                      الشحنة البحرية (وصلت المينا)
                    </Label>
                    <select
                      value={editForm.source_shipment_id}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          source_shipment_id: e.target.value,
                        })
                      }
                      className="w-full h-10 rounded-xl border border-gray-200 px-3 bg-white text-sm"
                    >
                      <option value="">اختر الشحنة</option>
                      {arrivedShipments.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.bl_number}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">الحاوية</Label>
                    <select
                      value={editForm.source_container_id}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          source_container_id: e.target.value,
                        })
                      }
                      className="w-full h-10 rounded-xl border border-gray-200 px-3 bg-white text-sm"
                      disabled={!editForm.source_shipment_id}
                    >
                      <option value="">اختر الحاوية</option>
                      {arrivedShipments
                        .find(
                          (s) =>
                            s.id.toString() === editForm.source_shipment_id,
                        )
                        ?.containers?.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.container_number} ({c.container_type})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              {editForm.route_type === "INTERNAL_DEPOT" && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">المستودع المصدر</Label>
                    <select
                      value={editForm.source_depot_id}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          source_depot_id: e.target.value,
                        })
                      }
                      className="w-full h-10 rounded-xl border border-gray-200 px-3 bg-white text-sm"
                    >
                      <option value="">اختر المستودع</option>
                      {depots.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.depot_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold">مستودع الوجهة</Label>
                    <select
                      value={editForm.destination_depot_id}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          destination_depot_id: e.target.value,
                        })
                      }
                      className="w-full h-10 rounded-xl border border-gray-200 px-3 bg-white text-sm"
                    >
                      <option value="">اختر الوجهة</option>
                      {depots.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.depot_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Trip Details Section */}
            <div className="bg-slate-50 p-4 rounded-2xl space-y-4">
              <h3 className="font-bold text-sm text-slate-700 border-b pb-2">
                بيانات الرحلة
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="font-bold text-sm">رقم الرحلة</Label>
                  <Input
                    value={editForm.trip_number}
                    onChange={(e) =>
                      setEditForm({ ...editForm, trip_number: e.target.value })
                    }
                    className="rounded-xl"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="font-bold text-sm">تاريخ التحميل</Label>
                  <Input
                    type="date"
                    value={editForm.loading_date}
                    onChange={(e) =>
                      setEditForm({ ...editForm, loading_date: e.target.value })
                    }
                    className="rounded-xl"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="font-bold text-sm">اسم السائق</Label>
                  <Input
                    value={editForm.driver_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, driver_name: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="font-bold text-sm">هاتف السائق</Label>
                  <Input
                    value={editForm.driver_phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, driver_phone: e.target.value })
                    }
                    className="rounded-xl"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="font-bold text-sm">
                    لوحة السيارة (أمامية)
                  </Label>
                  <Input
                    value={editForm.plate_front}
                    onChange={(e) =>
                      setEditForm({ ...editForm, plate_front: e.target.value })
                    }
                    className="rounded-xl"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="font-bold text-sm">
                    لوحة المقطورة (خلفية)
                  </Label>
                  <Input
                    value={editForm.plate_back}
                    onChange={(e) =>
                      setEditForm({ ...editForm, plate_back: e.target.value })
                    }
                    className="rounded-xl"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="font-bold text-sm">المعبر الحدودي</Label>
                  <select
                    value={editForm.gate_id}
                    onChange={(e) =>
                      setEditForm({ ...editForm, gate_id: e.target.value })
                    }
                    className="w-full border border-input rounded-xl px-3 py-2 text-sm bg-background"
                  >
                    <option value="">-- اختر المعبر --</option>
                    {gates.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.gate_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="font-bold text-sm">شركة النقل</Label>
                  <select
                    value={editForm.transport_company_id}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        transport_company_id: e.target.value,
                      })
                    }
                    className="w-full border border-input rounded-xl px-3 py-2 text-sm bg-background"
                  >
                    <option value="">-- اختر الشركة --</option>
                    {transportCompanies.map((tc) => (
                      <option key={tc.id} value={tc.id}>
                        {tc.trans_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label className="font-bold text-sm">ترتيب الدور</Label>
                  <Input
                    type="number"
                    value={editForm.sort_num}
                    onChange={(e) =>
                      setEditForm({ ...editForm, sort_num: e.target.value })
                    }
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="font-bold text-sm">تاريخ التفريغ</Label>
                  <Input
                    type="date"
                    value={editForm.discharge_date}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        discharge_date: e.target.value,
                      })
                    }
                    className="rounded-xl"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="font-bold text-sm">كلفة الشحن ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.truck_fare}
                    onChange={(e) =>
                      setEditForm({ ...editForm, truck_fare: e.target.value })
                    }
                    className="rounded-xl"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="font-bold text-sm">الحالة</Label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({ ...editForm, status: e.target.value })
                    }
                    className="w-full border border-input rounded-xl px-3 py-2 text-sm bg-background"
                  >
                    <option value="DISPATCHED">مُرسلة</option>
                    <option value="AT_BORDER">في المعبر</option>
                    <option value="DELIVERED">تم التسليم</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="font-bold text-sm">ملاحظات</Label>
              <textarea
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm({ ...editForm, notes: e.target.value })
                }
                rows={2}
                className="w-full border border-input rounded-xl px-3 py-2 text-sm bg-background resize-none"
                placeholder="أي ملاحظات إضافية..."
              />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="rounded-xl"
              >
                إلغاء
              </Button>
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
                حفظ التعديلات
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Waybill Dialog */}
      <Dialog open={isEditWaybillOpen} onOpenChange={setIsEditWaybillOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-right">
              تعديل بيانات البوليصة
            </DialogTitle>
            <DialogDescription className="text-right text-slate-500">
              قم بتعديل بيانات البوليصة ثم اضغط حفظ
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateWaybill} className="space-y-4 pt-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="font-bold text-sm">الشركة المصدرة</Label>
                <select
                  value={waybillEditForm.sender_company_id}
                  onChange={(e) =>
                    setWaybillEditForm({
                      ...waybillEditForm,
                      sender_company_id: e.target.value,
                    })
                  }
                  className="w-full border border-input rounded-xl px-3 py-2 text-sm bg-background"
                >
                  <option value="">-- اختر الشركة --</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="font-bold text-sm">التاجر</Label>
                <select
                  value={waybillEditForm.trader_id}
                  onChange={(e) =>
                    setWaybillEditForm({
                      ...waybillEditForm,
                      trader_id: e.target.value,
                    })
                  }
                  className="w-full border border-input rounded-xl px-3 py-2 text-sm bg-background"
                >
                  <option value="">-- اختر التاجر --</option>
                  {traders.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.trader_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="font-bold text-sm">رقم الوصل (5 أرقام)</Label>
                <Input
                  value={waybillEditForm.receipt_num}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 5);
                    setWaybillEditForm({
                      ...waybillEditForm,
                      receipt_num: val,
                    });
                  }}
                  placeholder="00000"
                  className="rounded-xl"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="font-bold text-sm">الوجهة</Label>
              <select
                value={waybillEditForm.destination_id}
                onChange={(e) =>
                  setWaybillEditForm({
                    ...waybillEditForm,
                    destination_id: e.target.value,
                  })
                }
                className="w-full border border-input rounded-xl px-3 py-2 text-sm bg-background"
              >
                <option value="">-- اختر الوجهة --</option>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.destination_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="font-bold text-sm">الوزن (كغ)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={waybillEditForm.weight}
                  onChange={(e) =>
                    setWaybillEditForm({
                      ...waybillEditForm,
                      weight: e.target.value,
                    })
                  }
                  className="rounded-xl"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1">
                <Label className="font-bold text-sm">العدد</Label>
                <Input
                  type="number"
                  value={waybillEditForm.quantity}
                  onChange={(e) =>
                    setWaybillEditForm({
                      ...waybillEditForm,
                      quantity: e.target.value,
                    })
                  }
                  className="rounded-xl"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="font-bold text-sm">ملاحظات</Label>
              <textarea
                value={waybillEditForm.notes}
                onChange={(e) =>
                  setWaybillEditForm({
                    ...waybillEditForm,
                    notes: e.target.value,
                  })
                }
                rows={2}
                className="w-full border border-input rounded-xl px-3 py-2 text-sm bg-background resize-none"
                placeholder="أي ملاحظات..."
              />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditWaybillOpen(false)}
                className="rounded-xl"
              >
                إلغاء
              </Button>
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
                حفظ التعديلات
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Waybill Dialog */}
      <Dialog open={isAddWaybillOpen} onOpenChange={setIsAddWaybillOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-right">
              إضافة بوليصة جديدة
            </DialogTitle>
            <DialogDescription className="text-right text-slate-500">
              أدخل بيانات البوليصة للرحلة الحالية
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddWaybill} className="space-y-4 pt-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="font-bold text-sm">الشركة المصدرة</Label>
                {trips.find((t) => t.id === addWaybillTripId)?.route_type ===
                "PORT" ? (
                  <div className="w-full h-10 border border-slate-100 rounded-xl px-3 flex items-center bg-slate-50 text-slate-600 font-bold text-xs overflow-hidden">
                    {companies.find(
                      (c) =>
                        c.id.toString() === addWaybillForm.sender_company_id,
                    )?.company_name || "—"}
                  </div>
                ) : (
                  <select
                    value={addWaybillForm.sender_company_id}
                    onChange={(e) =>
                      setAddWaybillForm({
                        ...addWaybillForm,
                        sender_company_id: e.target.value,
                      })
                    }
                    className="w-full border border-input rounded-xl px-3 py-2 text-sm bg-background"
                  >
                    <option value="">-- اختر الشركة --</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id.toString()}>
                        {company.company_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="space-y-1">
                <Label className="font-bold text-sm">التاجر</Label>
                <select
                  value={addWaybillForm.trader_id}
                  onChange={(e) =>
                    setAddWaybillForm({
                      ...addWaybillForm,
                      trader_id: e.target.value,
                    })
                  }
                  className="w-full border border-input rounded-xl px-3 py-2 text-sm bg-background"
                >
                  <option value="">-- اختر التاجر --</option>
                  {traders.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.trader_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="font-bold text-sm">رقم الوصل (5 أرقام)</Label>
                <Input
                  value={addWaybillForm.receipt_num}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 5);
                    setAddWaybillForm({ ...addWaybillForm, receipt_num: val });
                  }}
                  placeholder="00000"
                  className="rounded-xl"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <Label className="font-bold text-sm">الوجهة</Label>
                <select
                  value={addWaybillForm.destination_id}
                  onChange={(e) =>
                    setAddWaybillForm({
                      ...addWaybillForm,
                      destination_id: e.target.value,
                    })
                  }
                  className="w-full border border-input rounded-xl px-3 py-2 text-sm bg-background"
                >
                  <option value="">-- اختر الوجهة --</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.destination_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="font-bold text-sm">الوزن (كغ)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={addWaybillForm.weight}
                  onChange={(e) =>
                    setAddWaybillForm({
                      ...addWaybillForm,
                      weight: e.target.value,
                    })
                  }
                  className="rounded-xl"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1">
                <Label className="font-bold text-sm">العدد</Label>
                <Input
                  type="number"
                  value={addWaybillForm.quantity}
                  onChange={(e) =>
                    setAddWaybillForm({
                      ...addWaybillForm,
                      quantity: e.target.value,
                    })
                  }
                  className="rounded-xl"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="font-bold text-sm">ملاحظات</Label>
              <textarea
                value={addWaybillForm.notes}
                onChange={(e) =>
                  setAddWaybillForm({
                    ...addWaybillForm,
                    notes: e.target.value,
                  })
                }
                rows={2}
                className="w-full border border-input rounded-xl px-3 py-2 text-sm bg-background resize-none"
                placeholder="أي ملاحظات..."
              />
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddWaybillOpen(false)}
                className="rounded-xl"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-xl gap-2"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                إضافة بوليصة
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Document Dialog */}
      <Dialog open={isAddDocOpen} onOpenChange={setIsAddDocOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-right">
              رفع مستند جديد
            </DialogTitle>
            <DialogDescription className="text-right text-slate-500">
              اختر الملف وادخل بيانات المستند
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddDocument} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="font-bold text-sm">نوع المستند</Label>
              <select
                value={addDocForm.document_type}
                onChange={(e) =>
                  setAddDocForm({
                    ...addDocForm,
                    document_type: e.target.value,
                  })
                }
                className="w-full border border-input rounded-xl px-3 py-2 text-sm bg-background"
              >
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="font-bold text-sm">رقم المستند (اختياري)</Label>
              <Input
                value={addDocForm.document_number}
                onChange={(e) =>
                  setAddDocForm({
                    ...addDocForm,
                    document_number: e.target.value,
                  })
                }
                className="rounded-xl"
                dir="ltr"
              />
            </div>
            <div className="space-y-1">
              <Label className="font-bold text-sm">الملف</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  onChange={(e) => setAddDocFile(e.target.files?.[0] || null)}
                  className="rounded-xl"
                />
                <FileUp size={18} className="text-slate-400" />
              </div>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDocOpen(false)}
                className="rounded-xl"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isUploadingAddDoc}
                className="rounded-xl gap-2"
              >
                {isUploadingAddDoc ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Upload size={16} />
                )}
                رفع وحفظ
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
              <p className="text-xs text-slate-500">مُرسلة</p>
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
                <TableHead className="text-right whitespace-nowrap"></TableHead>
                <TableHead className="text-center font-bold whitespace-nowrap">
                  رقم الرحلة
                </TableHead>
                <TableHead className="text-center font-bold whitespace-nowrap">
                  ت. التحميل
                </TableHead>
                <TableHead className="text-center font-bold whitespace-nowrap">
                  المسار
                </TableHead>
                <TableHead className="text-center font-bold whitespace-nowrap">
                  المعبر
                </TableHead>
                <TableHead className="text-center font-bold whitespace-nowrap">
                  شركة النقل
                </TableHead>
                <TableHead className="text-center font-bold whitespace-nowrap">
                  السائق
                </TableHead>
                <TableHead className="text-center font-bold whitespace-nowrap">
                  الهاتف
                </TableHead>
                <TableHead className="text-center font-bold whitespace-nowrap">
                  لوحة (أمامية)
                </TableHead>
                <TableHead className="text-center font-bold whitespace-nowrap">
                  لوحة (خلفية)
                </TableHead>
                <TableHead className="text-center font-bold whitespace-nowrap">
                  الدور
                </TableHead>
                <TableHead className="text-center font-bold whitespace-nowrap">
                  ت. التفريغ
                </TableHead>
                <TableHead className="text-center font-bold whitespace-nowrap">
                  كلفة ($)
                </TableHead>
                <TableHead className="text-center font-bold whitespace-nowrap">
                  الحالة
                </TableHead>
                <TableHead className="text-center font-bold whitespace-nowrap">
                  إجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={16} className="text-center py-8">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : trips.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={16}
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
                        <TableCell className="text-center">
                          <span className="font-bold whitespace-nowrap">
                            {trip.trip_number || `TRIP-${trip.id}`}
                          </span>
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap">
                          {trip.loading_date
                            ? new Date(trip.loading_date).toLocaleDateString(
                                "ar-SA",
                              )
                            : "—"}
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-bold",
                              trip.route_type === "FACTORY"
                                ? "bg-amber-100 text-amber-700"
                                : trip.route_type === "PORT"
                                  ? "bg-blue-100 text-blue-700"
                                  : trip.route_type === "INTERNAL_DEPOT"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-700",
                            )}
                          >
                            {trip.route_type === "FACTORY"
                              ? "مصنع"
                              : trip.route_type === "PORT"
                                ? "ميناء"
                                : trip.route_type === "INTERNAL_DEPOT"
                                  ? "مستودع داخلي"
                                  : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap text-sm">
                          {trip.gate?.gate_name || "—"}
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap text-sm">
                          {trip.transport_company?.trans_name || "—"}
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap text-sm">
                          <div className="flex items-center justify-center gap-1.5">
                            <User size={14} className="text-slate-400" />
                            <span className="font-bold text-slate-800">
                              {trip.driver_name || "—"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell
                          className="text-center whitespace-nowrap font-mono text-xs"
                          dir="ltr"
                        >
                          {trip.driver_phone || "—"}
                        </TableCell>
                        <TableCell
                          className="text-center whitespace-nowrap font-mono text-xs"
                          dir="ltr"
                        >
                          {trip.plate_front || "—"}
                        </TableCell>
                        <TableCell
                          className="text-center whitespace-nowrap font-mono text-xs"
                          dir="ltr"
                        >
                          {trip.plate_back || "—"}
                        </TableCell>
                        <TableCell className="text-center font-bold text-sm">
                          {trip.sort_num || "—"}
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap text-sm">
                          {trip.discharge_date
                            ? new Date(trip.discharge_date).toLocaleDateString(
                                "ar-SA",
                              )
                            : "—"}
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap">
                          <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                            {trip.truck_fare
                              ? Number(trip.truck_fare).toLocaleString()
                              : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap">
                          {getStatusBadge(trip.status)}
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap">
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(trip)}
                              className="h-8 w-8 text-blue-500 hover:bg-blue-50"
                            >
                              <Edit size={16} />
                            </Button>
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
                          <TableCell colSpan={11} className="bg-slate-50 p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-sm flex items-center gap-2">
                                  <Package size={16} />
                                  البوالص ({trip.waybills?.length || 0})
                                </h4>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openAddWaybillDialog(trip.id)}
                                  className="h-7 rounded-xl gap-1 text-xs border-primary/30 text-primary hover:bg-primary/5"
                                >
                                  <Plus size={12} /> إضافة بوليصة
                                </Button>
                              </div>
                              {trip.waybills && trip.waybills.length > 0 ? (
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-white">
                                      <TableHead className="text-right text-xs">
                                        الشركة المصدرة
                                      </TableHead>
                                      <TableHead className="text-right text-xs">
                                        التاجر
                                      </TableHead>
                                      <TableHead className="text-right text-xs">
                                        الوجهة
                                      </TableHead>
                                      <TableHead className="text-center text-xs">
                                        رقم الوصل
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
                                      <TableHead className="text-center text-xs">
                                        إجراءات
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
                                          {waybill.receipt_num || "—"}
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
                                        <TableCell className="text-center">
                                          <div className="flex justify-center gap-1">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                router.push(
                                                  `/dashboard/transport-trips/${waybill.id}/invoice`,
                                                )
                                              }
                                              className="h-7 px-2 rounded-lg text-[10px] gap-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition-all font-black"
                                              title="إضافة وتعديل بنود الفاتورة"
                                            >
                                              <FileText size={12} />
                                              الفاتورة
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() =>
                                                openEditWaybillDialog(waybill)
                                              }
                                              className="h-7 w-7 text-blue-500 hover:bg-blue-50"
                                            >
                                              <Edit size={13} />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={() =>
                                                handleDeleteWaybill(
                                                  waybill.id,
                                                  trip.id,
                                                )
                                              }
                                              className="h-7 w-7 text-rose-500 hover:bg-rose-50"
                                            >
                                              <Trash2 size={13} />
                                            </Button>
                                          </div>
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
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-bold text-sm flex items-center gap-2">
                                    <FileText size={16} />
                                    المستندات ({trip.documents?.length || 0})
                                  </h4>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openAddDocDialog(trip.id)}
                                    className="h-7 rounded-xl gap-1 text-xs border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                                  >
                                    <Plus size={12} /> رفع مستند
                                  </Button>
                                </div>
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
                                            onClick={() =>
                                              window.open(
                                                doc.file_url,
                                                "_blank",
                                              )
                                            }
                                            className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg"
                                          >
                                            <Search size={14} />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                              handleDeleteTripDocument(
                                                doc.id,
                                                trip.id,
                                              )
                                            }
                                            className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg"
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
                    </React.Fragment>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ==================== Custom Delete Confirmation Dialog ==================== */}
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
              {deleteTarget.description}
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
