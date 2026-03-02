"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Users,
  CreditCard,
  ShoppingBag,
  MoreVertical,
  History,
  TrendingUp,
  MapPin,
  Mail,
  Phone,
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
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { cn } from "@/app/lib/utils";

const initialTraders = [
  {
    id: "TRD-01",
    name: "سالم المنصور",
    city: "الرياض",
    phone: "055-123-4567",
    email: "salem@example.sa",
    totalDeals: 124,
    status: "مميز",
    lastDeal: "2024-03-20",
  },
  {
    id: "TRD-02",
    name: "عمر الراجحي",
    city: "جدة",
    phone: "050-987-6543",
    email: "omar@traders.com",
    totalDeals: 85,
    status: "نشط",
    lastDeal: "2024-03-24",
  },
  {
    id: "TRD-03",
    name: "خالد بن فهد",
    city: "جيزان",
    phone: "053-444-5555",
    email: "khaled@sa.sa",
    totalDeals: 12,
    status: "جديد",
    lastDeal: "2024-03-25",
  },
];

export default function TradersPage() {
  const [traders] = useState(initialTraders);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            إدارة التجار والموردين
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            متابعة سجلات التجار، الصفقات المنفذة، والعلاقات التجارية.
          </p>
        </div>
        <Button className="rounded-xl h-10 gap-2 bg-primary shadow-lg shadow-primary/20">
          <Plus size={16} />
          إضافة تاجر جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TraderSummaryCard
          title="إجمالي التجار"
          value="842"
          icon={<Users className="text-blue-600" size={18} />}
          trend="+12 جديد"
          border="border-blue-100"
        />
        <TraderSummaryCard
          title="إجمالي المعاملات"
          value="1.5M"
          icon={<ShoppingBag className="text-emerald-600" size={18} />}
          trend="+4.2% نمو"
          border="border-emerald-100"
        />
        <TraderSummaryCard
          title="المدفوعات الآجلة"
          value="284K"
          icon={<CreditCard className="text-amber-600" size={18} />}
          trend="-10% انخفاض"
          border="border-amber-100"
        />
      </div>

      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="bg-white border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 px-6">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <Input
              placeholder="بحث باسم التاجر أو الكود..."
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
              تحميل السجل
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100">
                <TableHead className="text-right font-bold text-slate-700 h-10 text-xs">
                  كود التاجر
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-10 text-xs">
                  الاسم
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-10 text-xs text-center">
                  الموقع
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-10 text-xs">
                  معلومات التواصل
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-10 text-xs">
                  الحالة
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-10 text-xs text-center">
                  إجمالي المعاملات
                </TableHead>
                <TableHead className="text-left font-bold text-slate-700 h-10 px-6">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {traders.map((trader) => (
                <TableRow
                  key={trader.id}
                  className="hover:bg-slate-50/20 transition-colors border-slate-50 h-[70px] group text-sm"
                >
                  <TableCell>
                    <span className="font-bold text-slate-400 text-xs tracking-wider">
                      {trader.id}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 rounded-full border border-slate-100 bg-white">
                        <AvatarFallback className="text-[10px] text-primary font-black uppercase">
                          {trader.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-bold text-slate-900 inline-block">
                        {trader.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-1 text-slate-500 font-medium">
                      <MapPin size={12} className="text-primary/40" />
                      <span className="text-xs">{trader.city}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        <Phone size={12} className="text-slate-300" />
                        <span dir="ltr" className="font-medium">
                          {trader.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Mail size={12} className="text-slate-300" />
                        <span className="truncate max-w-[120px]">
                          {trader.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "rounded-full font-bold px-2.5 py-0 h-6 border-none shadow-sm",
                        trader.status === "مميز"
                          ? "bg-amber-100 text-amber-700"
                          : trader.status === "نشط"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700",
                      )}
                    >
                      {trader.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-1 text-slate-900 font-black tabular-nums">
                      <TrendingUp size={14} className="text-emerald-500" />
                      {trader.totalDeals}
                    </div>
                  </TableCell>
                  <TableCell className="px-6">
                    <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-primary rounded-lg border border-transparent hover:border-slate-100"
                      >
                        <History size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-blue-600 rounded-lg"
                      >
                        <Plus size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 rounded-lg"
                      >
                        <MoreVertical size={16} />
                      </Button>
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

function TraderSummaryCard({ title, value, icon, trend, border }: any) {
  return (
    <Card
      className={cn(
        "border shadow-sm rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-500",
        border,
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {title}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 leading-none tracking-tight tabular-nums">
                {value}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 shadow-sm">
                {trend}
              </span>
            </div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm text-slate-600">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
