"use client";

import { ReactNode } from "react";
import {
  TrendingUp,
  TrendingDown,
  Truck,
  Building2,
  PackageCheck,
  Clock,
  ArrowUpRight,
  MoreVertical,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { cn } from "@/app/lib/utils";

const chartData = [
  { name: "يناير", total: 4000, active: 2400 },
  { name: "فبراير", total: 3000, active: 1398 },
  { name: "مارس", total: 2000, active: 9800 },
  { name: "أبريل", total: 2780, active: 3908 },
  { name: "مايو", total: 1890, active: 4800 },
  { name: "يونيو", total: 2390, active: 3800 },
];

const barData = [
  { name: "الشركة أ", value: 400 },
  { name: "الشركة ب", value: 300 },
  { name: "الشركة ج", value: 300 },
  { name: "الشركة د", value: 200 },
  { name: "الشركة هـ", value: 278 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1"];

const recentShipments = [
  {
    id: "SHP-001",
    customer: "شركة النور للتجارة",
    item: "معدات بناء ثقيلة",
    status: "في الطريق",
    date: "2024-03-24",
    amount: "15,400 ر.س",
  },
  {
    id: "SHP-002",
    customer: "مؤسسة الخليج الدولية",
    item: "أجهزة كهربائية منزلية",
    status: "تم التوصيل",
    date: "2024-03-23",
    amount: "8,250 ر.س",
  },
  {
    id: "SHP-003",
    customer: "مصنع الرياض للبلاستيك",
    item: "مواد خام صناعية",
    status: "معلق",
    date: "2024-03-22",
    amount: "22,100 ر.س",
  },
  {
    id: "SHP-004",
    customer: "أسواق النهضة الغذائية",
    item: "مواد غذائية مجمدة",
    status: "في الطريق",
    date: "2024-03-21",
    amount: "12,800 ر.س",
  },
];

import { useEffect, useState } from "react";
import { apiClient } from "@/app/lib/api-client";

// ... keep existing imports ...

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalShipments: 0,
    activeTransport: 0,
    totalCompanies: 0,
    pendingShipments: 0,
    shipmentHistory: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  const [recentShipmentsData, setRecentShipmentsData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [statsData, shipmentsData] = await Promise.all([
          apiClient.getDashboardStats(),
          apiClient.getShipments({ limit: 10 }),
        ]);

        if (statsData) setStats(statsData);
        if (shipmentsData) setRecentShipmentsData(shipmentsData.shipments);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            لوحة التحكم العامة
          </h1>
          <p className="text-slate-500 mt-1">
            مرحباً بك مجدداً، إليك ملخص نشاط النظام لليوم.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200">
            تحميل تقرير
          </Button>
          <Button className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
            إضافة شحنة جديدة
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="إجمالي الشحنات"
          value={loading ? "..." : stats.totalShipments.toLocaleString()}
          icon={<Truck className="text-blue-600" size={20} />}
          trend="+12% من الشهر الماضي"
          trendUp={true}
          bg="bg-blue-50"
          border="border-blue-100"
        />
        <StatsCard
          title="النقل النشط"
          value={loading ? "..." : stats.activeTransport.toLocaleString()}
          icon={<Clock className="text-amber-600" size={20} />}
          trend="+5% تزايد في النشاط"
          trendUp={true}
          bg="bg-amber-50"
          border="border-amber-100"
        />
        <StatsCard
          title="الشركات المسجلة"
          value={loading ? "..." : stats.totalCompanies.toLocaleString()}
          icon={<Building2 className="text-emerald-600" size={20} />}
          trend="+3 شركات جديدة"
          trendUp={true}
          bg="bg-emerald-50"
          border="border-emerald-100"
        />
        <StatsCard
          title="شحنات قيد الانتظار"
          value={loading ? "..." : stats.pendingShipments.toLocaleString()}
          icon={<PackageCheck className="text-rose-600" size={20} />}
          trend="-2% أقل من الأسبوع الماضي"
          trendUp={false}
          bg="bg-rose-50"
          border="border-rose-100"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Chart */}
        <Card className="xl:col-span-2 border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-slate-50">
            <div>
              <CardTitle className="text-lg font-bold">
                إحصائيات الشحن
              </CardTitle>
              <CardDescription>
                تحليل حجم الشحن الشهري للسنة الحالية
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge
                variant="secondary"
                className="bg-primary/5 text-primary border-none text-[10px]"
              >
                يومياً
              </Badge>
              <Badge
                variant="outline"
                className="text-slate-400 border-slate-100 text-[10px]"
              >
                شهرياً
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={
                    stats.shipmentHistory.length > 0
                      ? stats.shipmentHistory
                      : chartData
                  }
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E2E8F0"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Second Chart / Side Content */}
        <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-6 border-b border-slate-50">
            <CardTitle className="text-lg font-bold">توزيع الشركات</CardTitle>
            <CardDescription>أكثر 5 شركات تفاعلاً مع النظام</CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ left: -20, right: 30 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#F1F5F9"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip cursor={{ fill: "#F8FAFC" }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {barData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">معدل الإنجاز العام</span>
                <span className="font-bold text-emerald-600">88%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[88%] rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Shipments Table */}
      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-slate-50 space-y-0">
          <div>
            <CardTitle className="text-lg font-bold">آخر الشحنات</CardTitle>
            <CardDescription>
              آخر 10 عمليات شحن تم تسجيلها في النظام
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <Input
                placeholder="بحث..."
                className="h-9 pr-9 w-40 md:w-60 border-slate-200 rounded-lg text-xs"
              />
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
              <MoreVertical size={18} className="text-slate-400" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-[100px] text-right font-bold text-slate-700">
                  رقم الشحنة
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700">
                  الشركة
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700">
                  البيان
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700">
                  التاريخ
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700">
                  الحالة
                </TableHead>
                <TableHead className="text-left font-bold text-slate-700">
                  القيمة
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentShipmentsData.length > 0 ? (
                recentShipmentsData.map((shipment) => (
                  <TableRow
                    key={shipment.id}
                    className="cursor-pointer hover:bg-slate-50/80 transition-colors border-slate-50"
                  >
                    <TableCell className="font-semibold text-primary">
                      SHP-{shipment.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px] bg-slate-100">
                            {shipment.companies?.company_name?.[0] || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {shipment.companies?.company_name || "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {shipment.goods_description || "N/A"}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {shipment.shipping_date
                        ? new Date(shipment.shipping_date).toLocaleDateString(
                            "ar-SA",
                          )
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full font-medium px-2 py-0 h-6 border-none",
                          shipment.status === "في الطريق"
                            ? "bg-blue-50 text-blue-600"
                            : shipment.status === "تم التوصيل"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-amber-50 text-amber-600",
                        )}
                      >
                        <div
                          className={cn(
                            "w-1.5 h-1.5 rounded-full ml-1.5",
                            shipment.status === "في الطريق"
                              ? "bg-blue-600"
                              : shipment.status === "تم التوصيل"
                                ? "bg-emerald-600"
                                : "bg-amber-600",
                          )}
                        ></div>
                        {shipment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-left font-bold">
                      {shipment.weight ? `${shipment.weight} كجم` : "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-slate-400"
                  >
                    {loading ? "جاري تحميل البيانات..." : "لا توجد شحنات مسجلة"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="p-4 bg-slate-50/30 border-t border-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              عرض 4 من أصل 1,284 شحنة
            </span>
            <Button
              variant="link"
              className="text-primary text-xs font-bold gap-1 p-0 h-auto"
            >
              عرض المزيد <ArrowUpRight size={14} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
  trend,
  trendUp,
  bg,
  border,
}: {
  title: string;
  value: string;
  icon: ReactNode;
  trend: string;
  trendUp: boolean;
  bg: string;
  border: string;
}) {
  return (
    <Card
      className={cn(
        "border shadow-sm rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300",
        border,
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2.5 rounded-xl shadow-sm", bg)}>{icon}</div>
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
              trendUp
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-600",
            )}
          >
            {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendUp ? "15%" : "2%"}
          </div>
        </div>
        <div className="space-y-1">
          <CardTitle className="text-2xl font-black text-slate-900">
            {value}
          </CardTitle>
          <p className="text-sm font-medium text-slate-500">{title}</p>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-50">
          <p className="text-xs text-slate-400">{trend}</p>
        </div>
      </CardContent>
    </Card>
  );
}
