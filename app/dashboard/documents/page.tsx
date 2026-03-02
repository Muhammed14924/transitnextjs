"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  Loader2,
  Paperclip,
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
import { apiClient } from "@/app/lib/api-client";
import { toast } from "sonner";

export default function DocumentsPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getDocuments();
      if (data) setDocs(data);
    } catch (error) {
      console.error("Failed to fetch documents", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchChat = useCallback(async () => {
    try {
      const data = await apiClient.getChatHistory();
      if (data) setMessages(data);
    } catch (error) {
      console.error("Failed to fetch chat history", error);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
    fetchChat();
  }, [fetchDocs, fetchChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading("جاري رفع المستند...", { id: "upload" });
      await apiClient.uploadDocument(file);
      fetchDocs();
      toast.success("تم رفع المستند بنجاح", { id: "upload" });
    } catch (error) {
      toast.error("فشل رفع المستند", { id: "upload" });
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || chatLoading) return;

    const text = inputMessage;
    setInputMessage("");
    setChatLoading(true);

    // Optimistic update
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text, isUser: true, createdAt: new Date() },
    ]);

    try {
      const response = await apiClient.sendMessage(text);
      if (response && response.aiMessage) {
        setMessages((prev) => [...prev, response.aiMessage]);
      }
    } catch (error) {
      toast.error("فشل إرسال الرسالة");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
            إدارة المستندات والذكاء الاصطناعي
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            رفع الملفات، الأرشفة الذكية، والدردشة مع بيانات المستندات.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            className="rounded-2xl h-11 gap-2 border-slate-200 font-bold hover:bg-slate-50"
            onClick={() => toast.info("سيتم تفعيل التحليل الشامل قريباً")}
          >
            <Bot size={18} className="text-primary" />
            <span>تحليل الكل</span>
          </Button>
          <Button
            className="rounded-2xl h-11 gap-2 bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all px-6"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={18} />
            رفع مستند جديد
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Main Documents Area */}
        <div className="xl:col-span-3 space-y-6 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <DocSummaryCard
              title="إجمالي الملفات"
              value={loading ? "..." : docs.length.toString()}
              icon={<FileText size={22} />}
              color="blue"
            />
            <DocSummaryCard
              title="ملفات معالجة"
              value={
                loading
                  ? "..."
                  : docs
                      .filter((d) => d.status === "processed")
                      .length.toString()
              }
              icon={<Sparkles size={22} />}
              color="emerald"
            />
            <DocSummaryCard
              title="مساحة التخزين"
              value={
                loading
                  ? "..."
                  : `${(docs.reduce((acc, d) => acc + (d.fileSize || 0), 0) / (1024 * 1024)).toFixed(1)} MB`
              }
              icon={<Layers size={22} />}
              color="indigo"
            />
          </div>

          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[32px] overflow-hidden bg-white">
            <CardHeader className="bg-white/50 backdrop-blur-sm border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 py-8 px-8">
              <div className="relative w-full md:w-96 group">
                <Search
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
                  size={20}
                />
                <Input
                  placeholder="بحث عن مستند أو فئة..."
                  className="pr-12 bg-slate-50/50 border-slate-100 focus:bg-white focus:border-primary/30 focus-visible:ring-primary/10 rounded-2xl h-12 text-sm font-bold transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-11 rounded-2xl gap-2 text-slate-500 font-bold hover:bg-slate-50 border border-transparent hover:border-slate-100"
                >
                  <Filter size={18} />
                  <span>تصفية النتائج</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-slate-50 h-14">
                    <TableHead className="text-right font-black text-slate-400 text-xs px-8 uppercase tracking-widest">
                      اسم الملف
                    </TableHead>
                    <TableHead className="text-center font-black text-slate-400 text-xs px-4 uppercase tracking-widest">
                      النوع
                    </TableHead>
                    <TableHead className="text-center font-black text-slate-400 text-xs px-4 uppercase tracking-widest">
                      الحجم
                    </TableHead>
                    <TableHead className="text-right font-black text-slate-400 text-xs px-4 uppercase tracking-widest">
                      تاريخ الرفع
                    </TableHead>
                    <TableHead className="text-center font-black text-slate-400 text-xs px-4 uppercase tracking-widest">
                      الحالة الذكية
                    </TableHead>
                    <TableHead className="text-left font-black text-slate-400 text-xs px-8 uppercase tracking-widest">
                      الإجراءات
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {docs.length > 0 ? (
                    docs.map((doc) => (
                      <TableRow
                        key={doc.id}
                        className="hover:bg-slate-50/50 transition-all border-slate-50 h-[88px] group"
                      >
                        <TableCell className="px-8">
                          <div className="flex items-center gap-4">
                            <div
                              className={cn(
                                "h-12 w-12 flex items-center justify-center rounded-[18px] border-2 border-white shadow-lg",
                                doc.fileType?.includes("pdf")
                                  ? "bg-rose-50 text-rose-500 shadow-rose-100"
                                  : "bg-emerald-50 text-emerald-500 shadow-emerald-100",
                              )}
                            >
                              <FileSearch size={24} />
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-black text-slate-800 text-sm line-clamp-1 max-w-[200px]">
                                {doc.fileName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                {doc.fileSize
                                  ? `${(doc.fileSize / 1024).toFixed(0)} KB`
                                  : "N/A"}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Badge
                              variant="secondary"
                              className="rounded-xl font-black px-3 py-1 bg-slate-100 text-slate-500 text-[10px] border-none"
                            >
                              {doc.fileType?.split("/").pop()?.toUpperCase() ||
                                "FILE"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-xs text-slate-400 font-black tabular-nums">
                            {doc.fileSize
                              ? `${(doc.fileSize / (1024 * 1024)).toFixed(1)} MB`
                              : "..."}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-500 font-bold">
                            {new Date(doc.createdAt).toLocaleDateString(
                              "ar-EG",
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Badge
                              className={cn(
                                "rounded-full font-black px-4 py-1 border-none shadow-sm flex items-center gap-2 text-[10px] tracking-widest",
                                doc.status === "processed"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-slate-100 text-slate-400",
                              )}
                            >
                              {doc.status === "processed" ? (
                                <Sparkles size={12} />
                              ) : (
                                <Loader2 size={12} className="animate-spin" />
                              )}
                              {doc.status === "processed"
                                ? "معالج بالذكاء"
                                : "قيد المعالجة"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="px-8">
                          <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-2xl border border-transparent hover:border-primary/10"
                              asChild
                            >
                              <a
                                href={doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Eye size={18} />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl border border-transparent hover:border-blue-100"
                            >
                              <Download size={18} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl border border-transparent hover:border-rose-100"
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-20 text-slate-300 font-bold italic"
                      >
                        {loading
                          ? "جاري البحث في الأرشيف..."
                          : "لا توجد مستندات مرفوعة حالياً"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* AI Chat Area Sidebar */}
        <div className="xl:col-span-1 h-full">
          <Card className="border-none shadow-2xl rounded-[40px] overflow-hidden h-full flex flex-col bg-slate-900 text-white relative">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/20 to-transparent pointer-events-none opacity-50"></div>

            <CardHeader className="border-b border-white/5 py-8 px-8 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary/20 text-primary rounded-[20px] flex items-center justify-center border border-primary/20 shadow-2xl shadow-primary/20">
                    <Bot size={28} className="animate-pulse" />
                  </div>
                  <div className="flex flex-col">
                    <CardTitle className="text-lg font-black text-white tracking-tight">
                      المساعد الذكي
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                        Live Sync Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
              {messages.length === 0 && !chatLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
                  <Bot size={48} className="text-white/20" />
                  <p className="text-xs font-bold leading-relaxed">
                    أهلاً بك! أنا المنقّب الذكي.
                    <br />
                    اسألني أي شيء عن شحناتك أو مستنداتك المرفوعة.
                  </p>
                </div>
              )}
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  isAi={!msg.isUser}
                  text={msg.text}
                  time={msg.createdAt}
                />
              ))}
              {chatLoading && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-white/5 rounded-xl flex items-center justify-center border border-white/5">
                    <Loader2 size={14} className="animate-spin text-primary" />
                  </div>
                  <span className="text-[10px] font-black text-white/20 animate-pulse uppercase tracking-widest">
                    Thinking...
                  </span>
                </div>
              )}
              <div ref={chatEndRef} />
            </CardContent>

            <div className="p-6 bg-white/5 border-t border-white/5 backdrop-blur-md relative z-10">
              <form onSubmit={handleSendMessage} className="relative">
                <Input
                  placeholder="اسأل شيئاً عن مستنداتك..."
                  className="w-full bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none rounded-[20px] h-14 pr-6 pl-14 text-sm text-white placeholder:text-white/20 transition-all font-bold shadow-2xl"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                />
                <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-10 w-10 text-white/20 hover:text-white rounded-xl"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip size={18} />
                  </Button>
                  <Button
                    type="submit"
                    size="icon"
                    disabled={chatLoading}
                    className="h-10 w-10 bg-primary rounded-xl hover:scale-105 transition-transform shadow-lg shadow-primary/20"
                  >
                    {chatLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </Button>
                </div>
              </form>
              <p className="text-[10px] text-white/10 mt-4 text-center px-4 font-bold tracking-tight">
                تم تدريب المساعد لتحليل البيانات اللوجستية بدقة 99.9%
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DocSummaryCard({ title, value, icon, color }: any) {
  const styles: any = {
    blue: "text-blue-600 bg-blue-50/50 border-blue-100",
    emerald: "text-emerald-600 bg-emerald-50/50 border-emerald-100",
    indigo: "text-indigo-600 bg-indigo-50/50 border-indigo-100",
  };

  return (
    <Card className="border-none shadow-lg shadow-slate-200/50 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 bg-white group">
      <CardContent className="p-8 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
            {title}
          </span>
          <span className="text-3xl font-black text-slate-900 leading-none tracking-tighter mt-1">
            {value}
          </span>
        </div>
        <div
          className={cn(
            "p-4 rounded-3xl border shadow-lg group-hover:rotate-12 transition-all duration-500",
            styles[color],
          )}
        >
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function ChatMessage({ text, isAi, time }: any) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 max-w-[90%] animate-in fade-in slide-in-from-bottom-2 duration-300",
        isAi ? "items-start" : "items-end self-end",
      )}
    >
      <div
        className={cn(
          "p-4 rounded-[22px] text-xs leading-relaxed shadow-2xl font-bold",
          isAi
            ? "bg-white/5 text-white/90 border border-white/5"
            : "bg-primary text-white text-right",
        )}
      >
        {text}
      </div>
      <span className="text-[9px] text-white/20 font-black px-2 uppercase tracking-widest">
        {isAi ? "AI Agent" : "You"} •{" "}
        {new Date(time).toLocaleTimeString("ar-EG", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
}
