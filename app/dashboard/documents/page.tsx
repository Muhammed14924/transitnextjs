"use client";

import { useState } from "react";
import {
  FileText,
  FileSearch,
  Upload,
  Bot,
  Search,
  MoreVertical,
  Download,
  Eye,
  Trash2,
  Filter,
  Layers,
  Sparkles,
  Send,
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
import { cn } from "@/app/lib/utils";

const initialDocs = [
  {
    id: "DOC-2024-001",
    name: "فاتورة شحن - شركة النور.pdf",
    type: "PDF",
    size: "2.4 MB",
    uploadedAt: "2024-03-25",
    category: "فواتير",
    status: "معالج بالذكاء الاصطناعي",
  },
  {
    id: "DOC-2024-002",
    name: "قائمة المنتجات السنوية.xlsx",
    type: "Excel",
    size: "1.2 MB",
    uploadedAt: "2024-03-24",
    category: "جداول بيانات",
    status: "غير معالج",
  },
  {
    id: "DOC-2024-003",
    name: "عقد توريد مع مؤسسة الخليج.pdf",
    type: "PDF",
    size: "4.8 MB",
    uploadedAt: "2024-03-22",
    category: "عقود",
    status: "معالج بالذكاء الاصطناعي",
  },
];

export default function DocumentsPage() {
  const [docs] = useState(initialDocs);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            إدارة المستندات والذكاء الاصطناعي
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            رفع الملفات، الأرشفة الذكية، والدردشة مع بيانات المستندات.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-xl h-10 gap-2 border-slate-200"
          >
            <Bot size={18} className="text-primary" />
            <span>تحليل الكل</span>
          </Button>
          <Button className="rounded-xl h-10 gap-2 bg-primary shadow-lg shadow-primary/20">
            <Upload size={16} />
            رفع مستند جديد
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Documents Area */}
        <div className="xl:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DocSummaryCard
              title="إجمالي الملفات"
              value="156"
              icon={<FileText size={20} className="text-blue-500" />}
              color="blue"
            />
            <DocSummaryCard
              title="ملفات معالجة"
              value="128"
              icon={<Sparkles size={20} className="text-emerald-500" />}
              color="emerald"
            />
            <DocSummaryCard
              title="مساحة التخزين"
              value="1.2 GB"
              icon={<Layers size={20} className="text-indigo-500" />}
              color="indigo"
            />
          </div>

          <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="bg-white border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 py-8 px-6">
              <div className="relative w-full md:w-80">
                <Search
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <Input
                  placeholder="بحث عن مستند أو فئة..."
                  className="pr-10 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 rounded-xl h-10 text-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 rounded-xl gap-2 text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200"
                >
                  <Filter size={16} />
                  <span>تصفية</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/40">
                  <TableRow className="border-slate-100">
                    <TableHead className="text-right font-bold text-slate-700 h-11 text-xs px-6">
                      اسم الملف
                    </TableHead>
                    <TableHead className="text-right font-bold text-slate-700 h-11 text-xs">
                      النوع
                    </TableHead>
                    <TableHead className="text-right font-bold text-slate-700 h-11 text-xs">
                      الحجم
                    </TableHead>
                    <TableHead className="text-right font-bold text-slate-700 h-11 text-xs">
                      تاريخ الرفع
                    </TableHead>
                    <TableHead className="text-right font-bold text-slate-700 h-11 text-xs">
                      الحالة الذكية
                    </TableHead>
                    <TableHead className="text-left font-bold text-slate-700 h-11 px-6">
                      الإجراءات
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {docs.map((doc) => (
                    <TableRow
                      key={doc.id}
                      className="cursor-pointer hover:bg-slate-50/30 transition-colors border-slate-50 h-[70px] group text-sm"
                    >
                      <TableCell className="px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "h-10 w-10 flex items-center justify-center rounded-xl",
                              doc.type === "PDF"
                                ? "bg-rose-50 text-rose-500"
                                : "bg-emerald-50 text-emerald-500",
                            )}
                          >
                            <FileSearch size={20} />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-slate-900 line-clamp-1">
                              {doc.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                              {doc.category}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="rounded-lg h-5 px-1.5 py-0 text-[10px] font-bold bg-slate-100 text-slate-500 uppercase"
                        >
                          {doc.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-400 font-medium">
                          {doc.size}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-500 font-medium">
                          {doc.uploadedAt}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            "rounded-full font-bold px-3 py-0 h-6 border-none shadow-sm flex items-center gap-1.5 w-fit text-[10px]",
                            doc.status === "معالج بالذكاء الاصطناعي"
                              ? "bg-primary/10 text-primary"
                              : "bg-slate-100 text-slate-400",
                          )}
                        >
                          {doc.status === "معالج بالذكاء الاصطناعي" && (
                            <Sparkles size={10} />
                          )}
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-primary rounded-lg"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-blue-600 rounded-lg"
                          >
                            <Download size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-rose-600 rounded-lg"
                          >
                            <Trash2 size={16} />
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

        {/* AI Chat Area Sidebar */}
        <div className="xl:col-span-1">
          <Card className="border-slate-100 shadow-xl rounded-2xl overflow-hidden h-full flex flex-col bg-slate-900 text-white">
            <CardHeader className="border-b border-white/5 py-6 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/20 text-primary rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/20">
                    <Bot size={22} className="animate-bounce-slow" />
                  </div>
                  <div className="flex flex-col">
                    <CardTitle className="text-base font-bold text-white">
                      المساعد الذكي
                    </CardTitle>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-[10px] text-emerald-400 font-bold">
                        متصل ببياناتك
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/40 hover:text-white rounded-lg"
                >
                  <MoreVertical size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[500px] scrollbar-hide">
              <ChatMessage
                isAi
                text="مرحباً خالد! أنا مساعدك الذكي. يمكنني مساعدتك في البحث في المستندات المرفوعة، تلخيص العقود، أو استخراج بيانات من الفواتير. كيف يمكنني خدمتك اليوم؟"
              />
              <ChatMessage text="هل يمكنك تلخيص عقد توريد مؤسسة الخليج؟" />
              <ChatMessage
                isAi
                text="بالتأكيد! عقد توريد مؤسسة الخليج (DOC-2024-003) يتضمن توريد 500 طن من الأسمنت المقاوم للرطوبة، بإجمالي مبلغ 450,000 ريال سعودي. تاريخ انتهاء التوريد هو 30 يونيو 2024."
              />
              <div className="flex justify-center">
                <Badge
                  variant="outline"
                  className="text-[9px] text-white/30 border-white/10 uppercase font-black tracking-widest px-2"
                >
                  Generated by AI Assistant
                </Badge>
              </div>
            </CardContent>
            <div className="p-4 bg-white/5 border-t border-white/5">
              <div className="relative">
                <input
                  placeholder="اسأل شيئاً عن مستنداتك..."
                  className="w-full bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none rounded-2xl py-3 px-4 pr-12 text-sm text-white placeholder:text-white/20 transition-all font-medium"
                />
                <Button
                  size="icon"
                  className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 bg-primary rounded-xl hover:scale-105 transition-transform"
                >
                  <Send size={14} />
                </Button>
              </div>
              <p className="text-[9px] text-white/20 mt-3 text-center px-4 font-bold">
                الذكاء الاصطناعي قد يخطئ في بعض الأحيان، يرجى التحقق من
                المعلومات المهمة.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DocSummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "blue" | "emerald" | "indigo";
}) {
  const styles: Record<string, string> = {
    blue: "bg-blue-50/5 text-blue-500 border-blue-100/10",
    emerald: "bg-emerald-50/5 text-emerald-500 border-emerald-100/10",
    indigo: "bg-indigo-50/5 text-indigo-500 border-indigo-100/10",
  };

  return (
    <div
      className={cn(
        "p-5 rounded-2xl border flex flex-col gap-2 transition-all hover:scale-[1.02] duration-300 shadow-sm",
        styles[color],
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">
          {title}
        </span>
        <div className="p-2 rounded-lg bg-white/5 border border-white/5">
          {icon}
        </div>
      </div>
      <span className="text-3xl font-black text-slate-900 tracking-tight tabular-nums">
        {value}
      </span>
    </div>
  );
}

function ChatMessage({ text, isAi }: { text: string; isAi?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 max-w-[90%]",
        isAi ? "items-start" : "items-end self-end",
      )}
    >
      <div
        className={cn(
          "p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm font-medium",
          isAi
            ? "bg-white/5 text-white/90 border border-white/5"
            : "bg-primary text-white text-right",
        )}
      >
        {text}
      </div>
      <span className="text-[9px] text-white/20 font-bold px-2">
        {isAi ? "المنقّب الذكي" : "أنت"} • الآن
      </span>
    </div>
  );
}
