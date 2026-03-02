"use client";

import { useState, useEffect, useCallback } from "react";
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

// Removing unused initialShipments

import { apiClient } from "@/app/lib/api-client";

export default function ShipmentsPage() {
  const [shipmentsData, setShipmentsData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    shipment_number: "",
    container_number: "",
    goods_description: "",
    status: "في الطريق",
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
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchShipments();
  }, [searchTerm]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createShipment(formData);
      setIsAddDialogOpen(false);
      fetchShipments();
    } catch (error) {
      console.error("Error creating shipment", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            إدارة الشحنات
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            تتبع وإدارة جميع الشحنات وعمليات النقل النشطة.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl h-10 gap-2 border-slate-200"
          >
            <Download size={16} />
            تصدير البيانات
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="rounded-xl h-10 gap-2 bg-primary shadow-lg shadow-primary/20"
              >
                <Plus size={16} />
                إضافة شحنة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-right">
                  إضافة شحنة جديدة
                </DialogTitle>
                <DialogDescription className="text-right">
                  أدخل تفاصيل الشحنة الجديدة للتسجيل في النظام.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate}>
                <div className="grid gap-4 py-4 rtl">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="shipment_number" className="text-right">
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
                      className="col-span-3 rounded-lg"
                      placeholder="SHP-..."
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="container_number" className="text-right">
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
                      className="col-span-3 rounded-lg"
                      placeholder="CONT-..."
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="goods_description" className="text-right">
                      الوصف
                    </Label>
                    <Input
                      id="goods_description"
                      value={formData.goods_description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          goods_description: e.target.value,
                        })
                      }
                      className="col-span-3 rounded-lg"
                      placeholder="وصف البضائع"
                    />
                  </div>
                </div>
                <DialogFooter className="flex-row-reverse sm:justify-start gap-2 pt-4">
                  <Button type="submit" className="rounded-xl px-8">
                    حفظ الشحنة
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="rounded-xl"
                  >
                    إلغاء
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Summary Mini-Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MiniStatsCard
          title="نشط حالياً"
          value="124"
          detail="+3 من الأمس"
          color="blue"
        />
        <MiniStatsCard
          title="بانتظار الجمرك"
          value="18"
          detail="شحنة واحدة متأخرة"
          color="amber"
        />
        <MiniStatsCard
          title="تم تسليمه اليوم"
          value="45"
          detail="100% نجاح التسليم"
          color="emerald"
        />
        <MiniStatsCard
          title="إجمالي القيمة"
          value="1.2M"
          detail="ريال سعودي"
          color="indigo"
        />
      </div>

      {/* Main Content Table Container */}
      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
        <CardHeader className="bg-white border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 py-6">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <Input
              placeholder="بحث برقم الشحنة، العميل، أو المسار..."
              className="pr-10 bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20 rounded-xl h-11 text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-10 rounded-xl gap-2 border-slate-200 text-slate-600"
            >
              <Filter size={16} />
              <span>تصفية</span>
            </Button>
            <div className="h-10 px-3 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-500">
              <span>ترتيب حسب:</span>
              <select className="bg-transparent border-none focus:outline-none text-slate-900 font-bold">
                <option>الأحدث</option>
                <option>الأقدم</option>
                <option>الأهمية</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/30">
              <TableRow className="border-slate-100">
                <TableHead className="text-right font-bold text-slate-700 h-12">
                  رقم التتبع
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-12">
                  العميل
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-12">
                  المسار (من - إلى)
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-12">
                  التاريخ
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-12">
                  الحالة
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-12">
                  الأولوية
                </TableHead>
                <TableHead className="text-left font-bold text-slate-700 h-12 px-6">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipmentsData.length > 0 ? (
                shipmentsData.map((shipment) => (
                  <TableRow
                    key={shipment.id}
                    className="hover:bg-slate-50/50 transition-colors border-slate-100 h-16 group"
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-primary text-sm tracking-wide">
                          {shipment.shipment_number || `TR-${shipment.id}`}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                          <Layers size={10} />
                          <span>
                            {shipment.quantity ? Number(shipment.quantity) : 0}{" "}
                            طرد
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-slate-700 text-sm truncate max-w-[150px] inline-block">
                        {shipment.companies?.company_name || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="font-medium">
                          {shipment.origin || "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                        <Calendar size={14} className="opacity-50" />
                        <span>
                          {shipment.shipping_date
                            ? new Date(
                                shipment.shipping_date,
                              ).toLocaleDateString("ar-SA")
                            : "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full font-bold px-3 py-0.5 h-7 border-none shadow-sm flex items-center gap-1.5 w-fit",
                          shipment.status === "في الطريق"
                            ? "bg-blue-100 text-blue-700"
                            : shipment.status === "تم التوصيل"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700",
                        )}
                      >
                        {shipment.status === "في الطريق" && <Truck size={12} />}
                        {shipment.status === "تم التوصيل" && (
                          <CheckCircle2 size={12} />
                        )}
                        {shipment.status === "معلق" && <Clock size={12} />}
                        {shipment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                        <span className="text-xs font-bold text-slate-600">
                          عادي
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit size={16} />
                        </Button>
                        <DropdownMenu dir="rtl">
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 rounded-lg"
                            >
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-40 rounded-xl"
                          >
                            <DropdownMenuItem
                              onClick={() =>
                                apiClient
                                  .deleteShipment(shipment.id)
                                  .then(fetchShipments)
                              }
                              className="gap-2 focus:bg-rose-50 text-rose-600 rounded-lg p-2 text-sm"
                            >
                              <Trash2 size={14} /> حذف السجل
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-slate-400"
                  >
                    {loading ? "جاري التحميل..." : "لا توجد شحنات"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="px-6 py-6 border-t border-slate-50 bg-slate-50/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-medium">
              عرض{" "}
              <span className="text-slate-900 font-bold">
                {shipmentsData.length}
              </span>{" "}
              من أصل <span className="text-slate-900 font-bold">{total}</span>{" "}
              شحنة نشطة
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-400"
                disabled
              >
                <Eye size={14} className="rotate-180" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg bg-primary text-white text-xs font-bold border-none"
              >
                1
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:bg-slate-200 text-xs font-bold transition-all"
              >
                2
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:bg-slate-200 text-xs font-bold transition-all"
              >
                3
              </Button>
              <span className="text-slate-300 text-xs px-1">...</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg text-slate-500 hover:bg-slate-200 text-xs font-bold transition-all"
              >
                12
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <Filter size={14} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MiniStatsCard({
  title,
  value,
  detail,
  color,
}: {
  title: string;
  value: string;
  detail: string;
  color: "blue" | "amber" | "emerald" | "indigo";
}) {
  const styles: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
  };

  return (
    <div
      className={cn(
        "p-4 rounded-2xl border flex flex-col gap-1 shadow-sm transition-all hover:scale-[1.02] duration-300",
        styles[color],
      )}
    >
      <span className="text-xs font-semibold opacity-70">{title}</span>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-black tabular-nums tracking-tight">
          {value}
        </span>
        <span className="text-[10px] font-bold opacity-60 bg-white/50 px-1.5 py-0.5 rounded-full border border-current/10 truncate">
          {detail}
        </span>
      </div>
    </div>
  );
}
