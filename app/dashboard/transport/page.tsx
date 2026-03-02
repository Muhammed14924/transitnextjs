"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Search,
  Truck,
  User,
  MapPin,
  Calendar,
  MoreVertical,
  Activity,
  ShieldCheck,
  Fuel,
  Settings2,
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
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { cn } from "@/app/lib/utils";
import { apiClient } from "@/app/lib/api-client";

export default function TransportPage() {
  const [transportData, setTransportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTransport = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getTransport(searchTerm);
      if (data) {
        setTransportData(data);
      }
    } catch (error) {
      console.error("Failed to fetch transport", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchTransport();
  }, [fetchTransport]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            بيانات النقل والمركبات
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            متابعة الأسطول، السائقين، وحالة الصيانة الدورية.
          </p>
        </div>
        <Button className="rounded-xl h-10 gap-2 bg-primary shadow-lg shadow-primary/20">
          <Plus size={16} />
          إضافة مركبة للأسطول
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <TransportStatCard
          title="إجمالي الأسطول"
          value={loading ? "..." : transportData.length.toString()}
          icon={<Truck className="text-blue-600" size={18} />}
          color="blue"
        />
        <TransportStatCard
          title="مركبات نشطة"
          value={loading ? "..." : transportData.length.toString()}
          icon={<Activity className="text-emerald-600" size={18} />}
          color="emerald"
        />
        <TransportStatCard
          title="بوابة العبور"
          value={loading ? "..." : transportData[0]?.gates?.gate_name || "N/A"}
          icon={<Settings2 className="text-amber-600" size={18} />}
          color="amber"
        />
        <TransportStatCard
          title="الأمان والسلامة"
          value="100%"
          icon={<ShieldCheck className="text-blue-600" size={18} />}
          color="blue"
        />
      </div>

      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="bg-white border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 py-6">
          <div className="relative w-full md:w-80">
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <Input
              placeholder="بحث برقم اللوحة، اسم السائق، أو النوع..."
              className="pr-10 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 rounded-xl h-10 text-xs transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => fetchTransport()}
              className="h-10 rounded-xl gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              تحديث البيانات
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/40">
              <TableRow className="border-slate-100">
                <TableHead className="text-right font-bold text-slate-700 h-10 text-xs">
                  رقم اللوحة
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-10 text-xs">
                  السائق
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-10 text-xs">
                  رقم الهاتف
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-10 text-xs">
                  الحالة
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-10 text-xs">
                  البوابة
                </TableHead>
                <TableHead className="text-left font-bold text-slate-700 h-10 px-6">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transportData.length > 0 ? (
                transportData.map((vh) => (
                  <TableRow
                    key={vh.id}
                    className="cursor-pointer hover:bg-slate-50/30 transition-colors border-slate-50 h-[70px] group text-sm"
                  >
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span
                          className="font-bold text-slate-900 border border-slate-300 px-1.5 py-0.5 rounded bg-white shadow-sm w-fit inline-block tracking-widest text-xs"
                          dir="ltr"
                        >
                          {vh.plate_number_ar} | {vh.plate_number_en}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                          TR-{vh.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 border border-slate-100 shadow-sm">
                          <AvatarFallback className="bg-primary/5 text-primary text-[10px] uppercase font-bold">
                            {vh.driver_name?.substring(0, 1) || "D"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-slate-700 inline-block">
                          {vh.driver_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className="text-xs text-slate-500 font-medium tabular-nums"
                        dir="ltr"
                      >
                        {vh.driver_number}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full font-bold px-3 py-0 h-6 border-none shadow-sm flex items-center gap-1.5 w-fit bg-emerald-100 text-emerald-700",
                        )}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-700"></div>
                        نشط/مستمر
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin
                          size={14}
                          className="text-primary/40 shrink-0"
                        />
                        <span className="truncate max-w-[120px]">
                          {vh.gates?.gate_name || "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-primary rounded-lg"
                        >
                          <User size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-blue-600 rounded-lg"
                        >
                          <Calendar size={16} />
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
                            className="w-32 rounded-xl"
                          >
                            <DropdownMenuItem className="p-2 gap-2 focus:bg-slate-50 rounded-lg text-xs">
                              تعديل البيانات
                            </DropdownMenuItem>
                            <DropdownMenuItem className="p-2 gap-2 focus:bg-rose-50 text-rose-600 rounded-lg text-xs">
                              حذف المركبة
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
                    colSpan={6}
                    className="text-center py-20 text-slate-400"
                  >
                    {loading
                      ? "جاري تحميل المركبات..."
                      : "لا توجد مركبات مسجلة"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function TransportStatCard({ title, value, icon, color }: any) {
  const styles: any = {
    blue: "text-blue-600 bg-blue-50 border-blue-100 shadow-blue-100/50",
    emerald:
      "text-emerald-600 bg-emerald-50 border-emerald-100 shadow-emerald-100/50",
    amber: "text-amber-600 bg-amber-50 border-amber-100 shadow-amber-100/50",
  };

  return (
    <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <CardContent className="p-5 flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
            {title}
          </span>
          <span className="text-2xl font-black text-slate-900 leading-none tracking-tight tabular-nums">
            {value}
          </span>
        </div>
        <div className={cn("p-2.5 rounded-xl border shadow-sm", styles[color])}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
