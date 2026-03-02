"use client";

import { useState } from "react";
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

const initialCompanies = [
  {
    id: "COMP-001",
    name: "شركة التطوير اللوجستي",
    category: "نقل بري",
    location: "الرياض، الملز",
    phone: "011-234-5678",
    email: "info@logidev.sa",
    status: "نشط",
    shipments: 42,
    rating: 4.8,
  },
  {
    id: "COMP-002",
    name: "مؤسسة النور للاستيراد",
    category: "تجارة عامة",
    location: "جدة، حي الشاطئ",
    phone: "012-987-6543",
    email: "contact@alnoor.com",
    status: "نشط",
    shipments: 128,
    rating: 4.5,
  },
  {
    id: "COMP-003",
    name: "مجموعة الصناعات العربية",
    category: "تصنيع ومواد خام",
    location: "الجبيل الصناعية",
    phone: "013-444-1111",
    email: "supply@arabind.sa",
    status: "غير نشط",
    shipments: 15,
    rating: 3.9,
  },
  {
    id: "COMP-004",
    name: "ناقلات الخليج السريعة",
    category: "شحن بحري",
    location: "الدمام، ميناء الملك عبد العزيز",
    phone: "013-888-2222",
    email: "ops@gulfexpress.sa",
    status: "نشط",
    shipments: 89,
    rating: 4.9,
  },
];

export default function CompaniesPage() {
  const [companies] = useState(initialCompanies);
  const [searchTerm, setSearchTerm] = useState("");

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
          value="156"
          icon={<Building2 className="text-blue-600" size={20} />}
          detail="+5 شركات هذا الشهر"
        />
        <CompanyStatCard
          title="شركات نشطة حالياً"
          value="142"
          icon={<ShieldCheck className="text-emerald-600" size={20} />}
          detail="91% من الإجمالي"
        />
        <CompanyStatCard
          title="أكثر القطاعات طلباً"
          value="نقل المواد"
          icon={<Briefcase className="text-amber-600" size={20} />}
          detail="بزيادة 15% عاقد"
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
                  القطاع
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
                <TableHead className="text-right font-bold text-slate-700 h-12 text-center">
                  إجمالي الشحنات
                </TableHead>
                <TableHead className="text-left font-bold text-slate-700 h-12 px-6">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow
                  key={company.id}
                  className="hover:bg-slate-50/50 transition-colors border-slate-100 h-16 group"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 rounded-xl border border-slate-100">
                        <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs uppercase">
                          {company.name.substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">
                          {company.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium tracking-tight uppercase">
                          {company.id}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="rounded-lg h-6 border-slate-200 text-slate-500 font-medium text-xs"
                    >
                      {company.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin size={14} className="text-slate-300" />
                      <span>{company.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        <Phone size={12} className="text-slate-400" />
                        <span dir="ltr">{company.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Mail size={12} className="text-slate-400" />
                        <span>{company.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "rounded-full font-bold px-3 py-0 h-6 border-none",
                        company.status === "نشط"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {company.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-1 font-bold text-slate-700">
                      <TrendingUp size={14} className="text-emerald-500" />
                      {company.shipments}
                    </div>
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
              ))}
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
