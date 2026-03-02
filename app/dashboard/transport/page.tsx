"use client";

import { useState } from "react";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
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

const initialTransport = [
  {
    id: "VH-701",
    plate: "أ ب ج 1234",
    type: "شاحنة ثقيلة",
    driver: "محمد العتيبي",
    status: "في رحلة",
    location: "طريق الرياض - الدمام",
    lastMaintenance: "2024-02-15",
    fuel: "75%",
  },
  {
    id: "VH-902",
    plate: "د هـ و 5678",
    type: "شاحنة مبردة",
    driver: "سعد الشهري",
    status: "متاح",
    location: "مستودعات جدة",
    lastMaintenance: "2024-03-01",
    fuel: "100%",
  },
  {
    id: "VH-405",
    plate: "س ش ص 9012",
    type: "ناقلة مواد سائلة",
    driver: "يوسف خليل",
    status: "في صيانة",
    location: "ورشة الرياض المركزية",
    lastMaintenance: "2024-03-24",
    fuel: "20%",
  },
  {
    id: "VH-118",
    plate: "ق ر ش 2468",
    type: "شاحنة حاويات",
    driver: "فهد الدوسري",
    status: "في رحلة",
    location: "ميناء الملك عبد العزيز",
    lastMaintenance: "2024-01-20",
    fuel: "45%",
  },
];

export default function TransportPage() {
  const [transportData] = useState(initialTransport);
  const [searchTerm, setSearchTerm] = useState("");

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
          value="48"
          icon={<Truck className="text-blue-600" size={18} />}
          color="blue"
        />
        <TransportStatCard
          title="مركبات نشطة"
          value="32"
          icon={<Activity className="text-emerald-600" size={18} />}
          color="emerald"
        />
        <TransportStatCard
          title="تحت الصيانة"
          value="6"
          icon={<Settings2 className="text-amber-600" size={18} />}
          color="amber"
        />
        <TransportStatCard
          title="الأمان والسلامة"
          value="98%"
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
              className="h-10 rounded-xl gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              سجل الصيانة
            </Button>
            <Button
              variant="outline"
              className="h-10 rounded-xl gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              عرض الخارطة
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
                  النوع
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-10 text-xs">
                  السائق
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-10 text-xs">
                  الحالة
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-10 text-xs">
                  الموقع الحالي
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-10 text-xs text-center">
                  الوقود
                </TableHead>
                <TableHead className="text-left font-bold text-slate-700 h-10 px-6">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transportData.map((vh) => (
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
                        {vh.plate}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                        {vh.id}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-600 font-medium text-xs bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 shadow-inner inline-block">
                      {vh.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7 border border-slate-100 shadow-sm">
                        <AvatarFallback className="bg-primary/5 text-primary text-[10px] uppercase font-bold">
                          {vh.driver.substring(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-slate-700 inline-block">
                        {vh.driver}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "rounded-full font-bold px-3 py-0 h-6 border-none shadow-sm flex items-center gap-1.5 w-fit",
                        vh.status === "في رحلة"
                          ? "bg-blue-100 text-blue-700"
                          : vh.status === "متاح"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700",
                      )}
                    >
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          vh.status === "في رحلة"
                            ? "bg-blue-700"
                            : vh.status === "متاح"
                              ? "bg-emerald-700"
                              : "bg-amber-700",
                        )}
                      ></div>
                      {vh.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin size={14} className="text-primary/40 shrink-0" />
                      <span className="truncate max-w-[120px]">
                        {vh.location}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden border border-slate-200 shadow-inner">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            parseInt(vh.fuel) < 30
                              ? "bg-rose-500"
                              : "bg-emerald-500",
                          )}
                          style={{ width: vh.fuel }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-black text-slate-600 tabular-nums flex items-center gap-1 whitespace-nowrap">
                        <Fuel size={10} className="text-slate-300" /> {vh.fuel}
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
                          <DropdownMenuItem className="p-2 gap-2 focus:bg-slate-50 rounded-lg text-xs">
                            سجل المهام
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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
