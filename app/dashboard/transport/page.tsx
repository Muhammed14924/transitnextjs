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
  Settings2,
  Edit,
  Trash2,
  AlertTriangle,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
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
import { toast } from "sonner";

interface Transport {
  id: number;
  driver: string;
  driver_num: string;
  plate_front: string;
  plate_back: string;
  transport_company: number;
  gate: number;
  gates?: { gate_name: string };
  download_date?: string;
}

export default function TransportPage() {
  const [transportData, setTransportData] = useState<Transport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTransport, setSelectedTransport] = useState<Transport | null>(
    null,
  );

  const [formData, setFormData] = useState({
    driver: "",
    driver_num: "",
    plate_front: "",
    plate_back: "",
    transport_company: "",
    gate: "",
  });

  const fetchTransport = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getTransport(searchTerm);
      if (data) {
        setTransportData(data);
      }
    } catch (error) {
      console.error("Failed to fetch transport", error);
      toast.error("فشل في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchTransport();
  }, [fetchTransport]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createTransport({
        ...formData,
        transport_company: parseInt(formData.transport_company),
        gate: parseInt(formData.gate),
      });
      setIsAddDialogOpen(false);
      setFormData({
        driver: "",
        driver_num: "",
        plate_front: "",
        plate_back: "",
        transport_company: "",
        gate: "",
      });
      fetchTransport();
      toast.success("تمت إضافة المركبة بنجاح");
    } catch (error) {
      console.error("Error creating transport", error);
      toast.error("حدث خطأ أثناء الإضافة");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTransport) return;
    try {
      await apiClient.updateTransport(selectedTransport.id, {
        ...formData,
        transport_company: parseInt(formData.transport_company),
        gate: parseInt(formData.gate),
      });
      setIsEditDialogOpen(false);
      setSelectedTransport(null);
      fetchTransport();
      toast.success("تم تحديث بيانات المركبة");
    } catch (error) {
      console.error("Error updating transport", error);
      toast.error("حدث خطأ أثناء التحديث");
    }
  };

  const handleDelete = async () => {
    if (!selectedTransport) return;
    try {
      await apiClient.deleteTransport(selectedTransport.id);
      setIsDeleteDialogOpen(false);
      setSelectedTransport(null);
      fetchTransport();
      toast.success("تم حذف المركبة من الأسطول");
    } catch (error) {
      console.error("Error deleting transport", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const openEditDialog = (vh: Transport) => {
    setSelectedTransport(vh);
    setFormData({
      driver: vh.driver,
      driver_num: vh.driver_num,
      plate_front: vh.plate_front,
      plate_back: vh.plate_back,
      transport_company: vh.transport_company.toString(),
      gate: vh.gate.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (vh: Transport) => {
    setSelectedTransport(vh);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
            بيانات النقل والأساطيل
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            متابعة دقيقة لحركة الشاحنات، السائقين، والعبور عبر بوابات الميناء.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-11 gap-2 bg-primary shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all px-6">
              <Plus size={18} />
              إضافة مركبة للأسطول
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-[32px] p-8 border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-right text-slate-900 tracking-tight">
                إضافة مركبة جديدة
              </DialogTitle>
              <DialogDescription className="text-right text-slate-500 font-medium">
                سجل بيانات المركبة والسائق لإتمام عمليات العبور.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="grid gap-5 py-6 rtl text-right">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="driver"
                    className="font-black text-slate-700 text-xs uppercase tracking-widest"
                  >
                    اسم السائق
                  </Label>
                  <Input
                    id="driver"
                    value={formData.driver}
                    onChange={(e) =>
                      setFormData({ ...formData, driver: e.target.value })
                    }
                    className="rounded-2xl h-12 bg-slate-50 border-slate-100 focus:bg-white focus:ring-primary/20 transition-all font-bold"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="driver_num"
                      className="font-black text-slate-700 text-xs uppercase tracking-widest"
                    >
                      رقم الهاتف
                    </Label>
                    <Input
                      id="driver_num"
                      value={formData.driver_num}
                      onChange={(e) =>
                        setFormData({ ...formData, driver_num: e.target.value })
                      }
                      className="rounded-2xl h-12 bg-slate-50 border-slate-100 font-bold"
                      placeholder="05xxxxxxx"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="gate"
                      className="font-black text-slate-700 text-xs uppercase tracking-widest"
                    >
                      البوابة (ID)
                    </Label>
                    <Input
                      id="gate"
                      type="number"
                      value={formData.gate}
                      onChange={(e) =>
                        setFormData({ ...formData, gate: e.target.value })
                      }
                      className="rounded-2xl h-12 bg-slate-50 border-slate-100 font-bold"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="plate_front"
                      className="font-black text-slate-700 text-xs uppercase tracking-widest"
                    >
                      اللوحة (أمام)
                    </Label>
                    <Input
                      id="plate_front"
                      value={formData.plate_front}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          plate_front: e.target.value,
                        })
                      }
                      className="rounded-2xl h-12 bg-slate-50 border-slate-100 font-bold text-center"
                      placeholder="1234 ABC"
                      dir="ltr"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="plate_back"
                      className="font-black text-slate-700 text-xs uppercase tracking-widest"
                    >
                      اللوحة (خلف)
                    </Label>
                    <Input
                      id="plate_back"
                      value={formData.plate_back}
                      onChange={(e) =>
                        setFormData({ ...formData, plate_back: e.target.value })
                      }
                      className="rounded-2xl h-12 bg-slate-50 border-slate-100 font-bold text-center"
                      placeholder="1234 ABC"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="transport_company"
                    className="font-black text-slate-700 text-xs uppercase tracking-widest"
                  >
                    شركة النقل (ID)
                  </Label>
                  <Input
                    id="transport_company"
                    type="number"
                    value={formData.transport_company}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transport_company: e.target.value,
                      })
                    }
                    className="rounded-2xl h-12 bg-slate-50 border-slate-100 font-bold"
                    required
                  />
                </div>
              </div>
              <DialogFooter className="flex-row-reverse sm:justify-start gap-3 pt-4">
                <Button
                  type="submit"
                  className="rounded-2xl px-12 h-12 font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20"
                >
                  تسجيل المركبة
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="rounded-2xl h-12 px-8 font-bold text-slate-400"
                >
                  إلغاء
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <TransportStatCard
          title="إجمالي الأسطول"
          value={loading ? "..." : transportData.length.toString()}
          icon={<Truck className="text-blue-600" size={20} />}
          color="blue"
          detail="شاحنة مسجلة"
        />
        <TransportStatCard
          title="مركبات نشطة"
          value={loading ? "..." : transportData.length.toString()}
          icon={<Activity className="text-emerald-600" size={20} />}
          color="emerald"
          detail="في مهمة حالية"
        />
        <TransportStatCard
          title="آخر البوابات"
          value={loading ? "..." : transportData[0]?.gates?.gate_name || "N/A"}
          icon={<Settings2 className="text-amber-600" size={20} />}
          color="amber"
          detail="تحديث مباشر"
        />
        <TransportStatCard
          title="الأمان والسلامة"
          value="100%"
          icon={<ShieldCheck className="text-blue-600" size={20} />}
          color="blue"
          detail="سجل نظيف"
        />
      </div>

      <Card className="border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 border-none bg-white">
        <CardHeader className="bg-white/50 backdrop-blur-sm border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 py-10 px-8">
          <div className="relative w-full md:w-96 group">
            <Search
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors"
              size={20}
            />
            <Input
              placeholder="بحث برقم اللوحة أو اسم السائق..."
              className="pr-12 bg-slate-50/50 border-slate-100 focus:bg-white focus:border-primary/30 focus-visible:ring-primary/10 rounded-2xl h-12 text-sm font-bold transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => fetchTransport()}
              className="h-12 rounded-2xl gap-3 border-slate-100 text-slate-600 font-black px-6 bg-white hover:bg-slate-50 shadow-sm"
            >
              <Activity size={18} className="text-emerald-500" />
              تحديث مباشر
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-50 h-14">
                <TableHead className="text-right font-black text-slate-400 text-xs px-8 uppercase tracking-widest">
                  بيانات اللوحة
                </TableHead>
                <TableHead className="text-right font-black text-slate-400 text-xs px-4 uppercase tracking-widest">
                  السائق
                </TableHead>
                <TableHead className="text-right font-black text-slate-400 text-xs px-4 uppercase tracking-widest">
                  التواصل
                </TableHead>
                <TableHead className="text-center font-black text-slate-400 text-xs px-4 uppercase tracking-widest">
                  الحالة
                </TableHead>
                <TableHead className="text-center font-black text-slate-400 text-xs px-4 uppercase tracking-widest">
                  البوابة
                </TableHead>
                <TableHead className="text-center font-black text-slate-400 text-xs px-8 uppercase tracking-widest">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transportData.length > 0 ? (
                transportData.map((vh) => (
                  <TableRow
                    key={vh.id}
                    className="hover:bg-slate-50/50 transition-all border-slate-50 h-[88px] group"
                  >
                    <TableCell className="px-8">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 bg-slate-900 text-white rounded-lg px-2.5 py-1.5 w-fit shadow-lg shadow-slate-200">
                          <span
                            className="font-black text-sm tracking-widest"
                            dir="ltr"
                          >
                            {vh.plate_front} | {vh.plate_back}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter flex items-center gap-1 px-1">
                          <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                          ID: TR-{vh.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-slate-100 shadow-sm rounded-2xl">
                          <AvatarFallback className="bg-primary/5 text-primary text-xs uppercase font-black">
                            {vh.driver?.substring(0, 2) || "D"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-black text-slate-800 text-sm">
                          {vh.driver}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <span
                        className="text-xs text-slate-500 font-black tabular-nums bg-slate-100 px-3 py-1 rounded-full"
                        dir="ltr"
                      >
                        {vh.driver_num}
                      </span>
                    </TableCell>
                    <TableCell className="text-center px-4">
                      <Badge
                        className={cn(
                          "rounded-full font-black text-[10px] px-4 py-1.5 border-none shadow-sm flex items-center gap-2 w-fit mx-auto bg-emerald-50 text-emerald-600",
                        )}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        نشط حالياً
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center px-4">
                      <div className="inline-flex items-center gap-2 text-xs text-slate-900 font-black bg-white border border-slate-100 px-3 py-1.5 rounded-xl shadow-sm">
                        <MapPin size={14} className="text-primary" />
                        <span>{vh.gates?.gate_name || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-8">
                      <div className="flex items-center justify-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(vh)}
                          className="h-10 w-10 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all"
                        >
                          <Edit size={18} />
                        </Button>
                        <DropdownMenu dir="rtl">
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 text-slate-400 hover:bg-slate-100 rounded-2xl"
                            >
                              <MoreVertical size={18} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 rounded-[24px] p-2 border-slate-100 shadow-2xl"
                          >
                            <DropdownMenuItem className="p-3 text-sm font-bold focus:bg-slate-50 rounded-xl gap-3 cursor-pointer">
                              <User size={16} className="text-slate-400" /> ملف
                              السائق
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(vh)}
                              className="p-3 text-sm font-bold focus:bg-rose-50 text-rose-600 rounded-xl gap-3 cursor-pointer"
                            >
                              <Trash2 size={16} /> حذف السجل
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
                    className="text-center py-32 text-slate-400"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-20 w-20 bg-slate-50 rounded-[32px] flex items-center justify-center border-2 border-slate-100 border-dashed animate-pulse">
                        <Truck size={40} className="text-slate-200" />
                      </div>
                      <p className="font-bold text-slate-300 uppercase tracking-widest text-xs">
                        {loading
                          ? "جاري الاستعلام عن الأسطول..."
                          : "لا توجد حافلات مسجلة"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[32px] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-right text-slate-900 tracking-tight">
              تعديل بيانات المركبة
            </DialogTitle>
            <DialogDescription className="text-right text-slate-500 font-medium">
              قم بتحديث معلومات المركبة والسائق واضغط على حفظ.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-5 py-6 rtl text-right">
              <div className="space-y-1.5">
                <Label
                  htmlFor="edit_driver"
                  className="font-black text-slate-700 text-xs uppercase tracking-widest"
                >
                  اسم السائق
                </Label>
                <Input
                  id="edit_driver"
                  value={formData.driver}
                  onChange={(e) =>
                    setFormData({ ...formData, driver: e.target.value })
                  }
                  className="rounded-2xl h-12 bg-slate-50 border-slate-100 font-bold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="edit_driver_num"
                    className="font-black text-slate-700 text-xs uppercase tracking-widest"
                  >
                    رقم الهاتف
                  </Label>
                  <Input
                    id="edit_driver_num"
                    value={formData.driver_num}
                    onChange={(e) =>
                      setFormData({ ...formData, driver_num: e.target.value })
                    }
                    className="rounded-2xl h-12 bg-slate-50 border-slate-100 font-bold"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="edit_gate"
                    className="font-black text-slate-700 text-xs uppercase tracking-widest"
                  >
                    البوابة (ID)
                  </Label>
                  <Input
                    id="edit_gate"
                    type="number"
                    value={formData.gate}
                    onChange={(e) =>
                      setFormData({ ...formData, gate: e.target.value })
                    }
                    className="rounded-2xl h-12 bg-slate-50 border-slate-100 font-bold"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="edit_plate_front"
                    className="font-black text-slate-700 text-xs uppercase tracking-widest"
                  >
                    اللوحة (أمام)
                  </Label>
                  <Input
                    id="edit_plate_front"
                    value={formData.plate_front}
                    onChange={(e) =>
                      setFormData({ ...formData, plate_front: e.target.value })
                    }
                    className="rounded-2xl h-12 bg-slate-50 border-slate-100 font-bold text-center"
                    dir="ltr"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="edit_plate_back"
                    className="font-black text-slate-700 text-xs uppercase tracking-widest"
                  >
                    اللوحة (خلف)
                  </Label>
                  <Input
                    id="edit_plate_back"
                    value={formData.plate_back}
                    onChange={(e) =>
                      setFormData({ ...formData, plate_back: e.target.value })
                    }
                    className="rounded-2xl h-12 bg-slate-50 border-slate-100 font-bold text-center"
                    dir="ltr"
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex-row-reverse sm:justify-start gap-3 pt-4">
              <Button
                type="submit"
                className="rounded-2xl px-12 h-12 font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20"
              >
                حفظ التغييرات
              </Button>
              <Button
                variant="ghost"
                type="button"
                onClick={() => setIsEditDialogOpen(false)}
                className="rounded-2xl h-12 px-8 font-bold text-slate-400"
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-[32px] p-8 border-none shadow-2xl">
          <DialogHeader>
            <div className="h-16 w-16 bg-rose-50 rounded-[24px] flex items-center justify-center mx-auto mb-6 border border-rose-100 -rotate-3 transition-transform hover:rotate-0">
              <AlertTriangle className="text-rose-600" size={32} />
            </div>
            <DialogTitle className="text-center font-black text-slate-900 text-2xl tracking-tighter">
              حذف من الأسطول
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500 font-bold leading-relaxed py-4 px-2">
              هل أنت متأكد من حذف السجل الخاص بـ{" "}
              <span className="font-black text-slate-900">
                "{selectedTransport?.driver}"
              </span>
              ؟ لن يكون بالإمكان استعادة هذه البيانات.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3 mt-4">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="rounded-2xl h-14 w-full sm:flex-1 bg-rose-600 hover:bg-rose-700 font-black shadow-xl shadow-rose-100 transition-all active:scale-95"
            >
              نعم، قم بالحذف
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-2xl h-14 w-full sm:flex-1 font-black text-slate-500 border-slate-100 bg-slate-50/50 hover:bg-slate-100 transition-all"
            >
              إلغاء الحذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TransportStatCard({ title, value, icon, color, detail }: any) {
  const styles: any = {
    blue: "text-blue-600 bg-blue-50/50 border-blue-100 shadow-blue-100/20",
    emerald:
      "text-emerald-600 bg-emerald-50/50 border-emerald-100 shadow-emerald-100/20",
    amber: "text-amber-600 bg-amber-50/50 border-amber-100 shadow-amber-100/20",
  };

  return (
    <Card className="border-none shadow-lg shadow-slate-200/50 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 bg-white group">
      <CardContent className="p-8 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
            {title}
          </span>
          <span className="text-3xl font-black text-slate-900 leading-none tracking-tighter tabular-nums mt-1">
            {value}
          </span>
          {detail && (
            <span className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-1.5 group-hover:text-primary transition-colors">
              <div className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-primary"></div>
              {detail}
            </span>
          )}
        </div>
        <div
          className={cn(
            "p-4 rounded-3xl border shadow-lg shadow-inner group-hover:rotate-12 transition-all duration-500",
            styles[color],
          )}
        >
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
