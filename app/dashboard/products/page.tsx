"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  PackageSearch,
  LayoutGrid,
  ListFilter,
  MoreVertical,
  BarChart2,
  Tag,
  Box,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { cn } from "@/app/lib/utils";

const initialProducts = [
  {
    id: "MAT-001",
    name: "مواد بناء أولية",
    type: "مواد خام",
    unit: "طن",
    count: 250,
    company: "شركة التطوير اللوجستي",
    category: "أسمنت",
  },
  {
    id: "EQP-442",
    name: "معدات طبية متقدمة",
    type: "أجهزة تخصصية",
    unit: "قطعة",
    count: 12,
    company: "مؤسسة الشفاء الدولية",
    category: "رعاية صحية",
  },
  {
    id: "FRN-921",
    name: "أثاث مكتبي فاخر",
    type: "كماليات",
    unit: "طقم",
    count: 85,
    company: "أسواق الرياض المركزية",
    category: "تأثيث",
  },
  {
    id: "CHEM-105",
    name: "مواد تنظيف صناعية",
    type: "مواد كيميائية",
    unit: "لتر",
    count: 1500,
    company: "مصنع الأمان للمواد الكيميائية",
    category: "صيانة",
  },
];

export default function ProductsPage() {
  const [products] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            إدارة المنتجات والأصناف
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            قائمة بالأصناف والمواد المسجلة في النظام والشركات التابعة لها.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl h-10 border-slate-200 text-slate-600 font-medium"
          >
            تحديث البيانات
          </Button>
          <Button className="rounded-xl h-10 gap-2 bg-primary shadow-lg shadow-primary/20">
            <Plus size={16} />
            إضافة صنف جديد
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-tight">
              إجمالي الأصناف
            </span>
            <span className="text-2xl font-black text-slate-900 leading-none tracking-tight tabular-nums">
              1,482
            </span>
          </div>
          <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 shadow-sm">
            <Box size={20} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-tight">
              قيد الطلب
            </span>
            <span className="text-2xl font-black text-slate-900 leading-none tracking-tight tabular-nums">
              42
            </span>
          </div>
          <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100 shadow-sm">
            <Tag size={20} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-tight">
              المواد الخام
            </span>
            <span className="text-2xl font-black text-slate-900 leading-none tracking-tight tabular-nums">
              850
            </span>
          </div>
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100 shadow-sm">
            <LayoutGrid size={20} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md">
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs font-semibold mb-1 uppercase tracking-tight">
              معدل الدوران
            </span>
            <span className="text-2xl font-black text-slate-900 leading-none tracking-tight tabular-nums">
              High
            </span>
          </div>
          <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-100 shadow-sm">
            <BarChart2 size={20} />
          </div>
        </div>
      </div>

      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300">
        <CardHeader className="bg-white border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 py-8 px-6">
          <div className="relative w-full md:w-80">
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <Input
              placeholder="ابحث عن اسم الصنف أو كود المادة..."
              className="pr-10 bg-slate-50 focus-visible:ring-primary/20 rounded-xl h-10 text-xs transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 rounded-xl gap-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200"
            >
              <ListFilter size={16} />
              <span>تصفية متقدمة</span>
            </Button>
            <div className="h-10 px-3 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700">
              <span>عرض الأصناف بـ:</span>
              <select className="bg-transparent border-none focus:outline-none text-primary font-bold">
                <option>جدول</option>
                <option>شبكة</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/40">
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="text-right font-bold text-slate-700 h-11 text-xs">
                  كود المادة
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-11 text-xs">
                  اسم الصنف
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-11 text-xs">
                  نوع المادة
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-11 text-xs">
                  الشركة المالكة
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-11 text-xs text-center">
                  الكمية/العدد
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 h-11 text-xs px-6">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow
                  key={product.id}
                  className="cursor-pointer hover:bg-slate-50/30 transition-colors border-slate-50 h-[70px] group"
                >
                  <TableCell>
                    <span className="font-bold text-slate-400 text-xs tracking-wider">
                      {product.id}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-900 text-sm">
                        {product.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <Badge
                          variant="secondary"
                          className="h-4 px-1.5 py-0 text-[9px] bg-slate-100 text-slate-500 font-bold border-none capitalize"
                        >
                          {product.category}
                        </Badge>
                        <span className="text-[9px] text-slate-400 font-medium">
                          /{product.unit}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-slate-500 font-medium bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                      {product.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-slate-600">
                      {product.company}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={cn(
                        "font-black text-sm tabular-nums",
                        product.count < 50 ? "text-rose-600" : "text-slate-900",
                      )}
                    >
                      {product.count.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="px-6">
                    <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-primary rounded-lg"
                      >
                        <PackageSearch size={16} />
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
                          <DropdownMenuItem className="p-2 text-xs focus:bg-slate-50 rounded-lg gap-2">
                            تعديل الصنف
                          </DropdownMenuItem>
                          <DropdownMenuItem className="p-2 text-xs focus:bg-rose-50 text-rose-600 rounded-lg gap-2">
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="px-6 py-6 border-t border-slate-50 bg-slate-50/10 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              Products Inventory Module v1.0
            </span>
            <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
              <span>تحديث تلقائي مفعل</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
