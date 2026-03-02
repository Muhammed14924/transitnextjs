"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { cn } from "@/app/lib/utils";
import { apiClient } from "@/app/lib/api-client";

export default function TradersPage() {
  const [traders, setTraders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTraders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getTraders(searchTerm);
      if (data) {
        setTraders(data);
      }
    } catch (error) {
      console.error("Failed to fetch traders", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchTraders();
  }, [fetchTraders]);

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
          value={loading ? "..." : traders.length.toString()}
          icon={<Users className="text-blue-600" size={18} />}
          trend="نشط"
          border="border-blue-100"
        />
        <TraderSummaryCard
          title="إجمالي المعاملات"
          value={
            loading
              ? "..."
              : traders
                  .reduce((acc, t) => acc + (t._count?.trans_2 || 0), 0)
                  .toString()
          }
          icon={<ShoppingBag className="text-emerald-600" size={18} />}
          trend="تراكمي"
          border="border-emerald-100"
        />
        <TraderSummaryCard
          title="أحدث تاجر"
          value={loading ? "..." : traders[0]?.trader_name || "لا يوجد"}
          icon={<CreditCard className="text-amber-600" size={18} />}
          trend="جديد"
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
              onClick={() => fetchTraders()}
              className="h-10 rounded-xl gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              تحديث البيانات
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
                <TableHead className="text-right font-bold text-slate-700 h-10 text-xs text-center">
                  الاسم
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
              {traders.length > 0 ? (
                traders.map((trader) => (
                  <TableRow
                    key={trader.id}
                    className="hover:bg-slate-50/20 transition-colors border-slate-50 h-[70px] group text-sm"
                  >
                    <TableCell>
                      <span className="font-bold text-slate-400 text-xs tracking-wider">
                        {trader.trader_code || `TRD-${trader.id}`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-center">
                        <Avatar className="h-8 w-8 rounded-full border border-slate-100 bg-white">
                          <AvatarFallback className="text-[10px] text-primary font-black uppercase">
                            {trader.trader_name?.substring(0, 2) || "TR"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-slate-900 inline-block">
                          {trader.trader_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                          <Phone size={12} className="text-slate-300" />
                          <span dir="ltr" className="font-medium">
                            N/A
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Mail size={12} className="text-slate-300" />
                          <span className="truncate max-w-[120px]">N/A</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full font-bold px-2.5 py-0 h-6 border-none shadow-sm bg-emerald-100 text-emerald-700",
                        )}
                      >
                        نشط
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-1 text-slate-900 font-black tabular-nums">
                        <TrendingUp size={14} className="text-emerald-500" />
                        {trader._count?.trans_2 || 0} عملية
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
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-20 text-slate-400"
                  >
                    {loading ? "جاري تحميل التجار..." : "لا يوجد تجار مسجلين"}
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
