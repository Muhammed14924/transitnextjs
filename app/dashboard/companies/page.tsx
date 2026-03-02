"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Search,
  Building2,
  MapPin,
  Phone,
  Mail,
  MoreVertical,
  ExternalLink,
  Edit,
  Trash2,
  Globe,
  Briefcase,
  TrendingUp,
  ShieldCheck,
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

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getCompanies(searchTerm);
      if (data) {
        setCompanies(data);
      }
    } catch (error) {
      console.error("Failed to fetch companies", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            إدارة الشركات
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            إدارة بيانات العملاء، الموردين، وشركات النقل المتعاقد معها.
          </p>
        </div>
        <Button className="rounded-xl h-10 gap-2 bg-primary shadow-lg shadow-primary/20">
          <Plus size={16} />
          إضافة شركة جديدة
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CompanyStatCard
          title="إجمالي الشركات"
          value={loading ? "..." : companies.length.toString()}
          icon={<Building2 className="text-blue-600" size={20} />}
          detail="قائمة الشركات المسجلة"
        />
        <CompanyStatCard
          title="شركات نشطة حالياً"
          value={loading ? "..." : companies.length.toString()}
          icon={<ShieldCheck className="text-emerald-600" size={20} />}
          detail="جاهزة للعمل"
        />
        <CompanyStatCard
          title="أحدث الشركات"
          value={loading ? "..." : companies[0]?.company_name || "لا يوجد"}
          icon={<Briefcase className="text-amber-600" size={20} />}
          detail="آخر إضافة لنظام"
        />
      </div>

      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 py-6">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <Input
              placeholder="بحث باسم الشركة، الموقع، أو البريد الإلكتروني..."
              className="pr-10 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 rounded-xl h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-10 rounded-xl border-slate-200 text-slate-600"
            >
              تصفية حسب القطاع
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100">
                <TableHead className="text-right font-bold text-slate-700 h-12">
                  اسم الشركة
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-12">
                  الشحنات/المنتجات
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-12">
                  الموقع
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-12">
                  التواصل
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-12">
                  الحالة
                </TableHead>
                <TableHead className="text-left font-bold text-slate-700 h-12 px-6">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.length > 0 ? (
                companies.map((company) => (
                  <TableRow
                    key={company.id}
                    className="hover:bg-slate-50/50 transition-colors border-slate-100 h-16 group"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 rounded-xl border border-slate-100">
                          <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs uppercase">
                            {company.company_name?.substring(0, 2) || "CO"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm">
                            {company.company_name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium tracking-tight uppercase">
                            {company.company_code}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center gap-1 font-bold text-slate-700">
                        <TrendingUp size={14} className="text-emerald-500" />
                        {company._count?.transit_shipments || 0} شحنة /{" "}
                        {company._count?.comp_items || 0} صنف
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin size={14} className="text-slate-300" />
                        <span>{company.place}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                          <Phone size={12} className="text-slate-400" />
                          <span dir="ltr">N/A</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <Mail size={12} className="text-slate-400" />
                          <span>N/A</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full font-bold px-3 py-0 h-6 border-none bg-emerald-50 text-emerald-600",
                        )}
                      >
                        نشط
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-primary rounded-lg"
                        >
                          <ExternalLink size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-blue-600 rounded-lg"
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
                            <DropdownMenuItem className="gap-2 p-2 text-sm focus:bg-slate-50 rounded-lg">
                              <Globe size={14} /> زيارة الموقع
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 p-2 text-sm focus:bg-rose-50 text-rose-600 rounded-lg">
                              <Trash2 size={14} /> حذف الشركة
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
                      ? "جاري تحميل البيانات..."
                      : "لا توجد شركات حالياً"}
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

function CompanyStatCard({ title, value, icon, detail }: any) {
  return (
    <Card className="border-slate-100 shadow-sm rounded-2xl hover:shadow-md transition-all duration-300 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            {icon}
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 font-medium">{title}</span>
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {value}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold mt-1">
              {detail}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
