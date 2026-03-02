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

interface Company {
  id: number;
  company_name: string;
  company_code: string;
  place: string;
  _count?: {
    transit_shipments: number;
    comp_items: number;
  };
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const [formData, setFormData] = useState({
    company_name: "",
    company_code: "",
    place: "",
  });

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getCompanies(searchTerm);
      if (data) {
        setCompanies(data);
      }
    } catch (error) {
      console.error("Failed to fetch companies", error);
      toast.error("فشل في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createCompany(formData);
      setIsAddDialogOpen(false);
      setFormData({ company_name: "", company_code: "", place: "" });
      fetchCompanies();
      toast.success("تمت إضافة الشركة بنجاح");
    } catch (error) {
      console.error("Error creating company", error);
      toast.error("حدث خطأ أثناء الإضافة");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;
    try {
      await apiClient.updateCompany(selectedCompany.id, formData);
      setIsEditDialogOpen(false);
      setSelectedCompany(null);
      setFormData({ company_name: "", company_code: "", place: "" });
      fetchCompanies();
      toast.success("تم تحديث بيانات الشركة");
    } catch (error) {
      console.error("Error updating company", error);
      toast.error("حدث خطأ أثناء التحديث");
    }
  };

  const handleDelete = async () => {
    if (!selectedCompany) return;
    try {
      await apiClient.deleteCompany(selectedCompany.id);
      setIsDeleteDialogOpen(false);
      setSelectedCompany(null);
      fetchCompanies();
      toast.success("تم حذف الشركة بنجاح");
    } catch (error) {
      console.error("Error deleting company", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const openEditDialog = (company: Company) => {
    setSelectedCompany(company);
    setFormData({
      company_name: company.company_name,
      company_code: company.company_code,
      place: company.place,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteDialogOpen(true);
  };

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
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl h-10 gap-2 bg-primary shadow-lg shadow-primary/20">
              <Plus size={16} />
              إضافة شركة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-right text-slate-900">
                إضافة شركة جديدة
              </DialogTitle>
              <DialogDescription className="text-right text-slate-500">
                أدخل تفاصيل الشركة الجديدة ليتم تسجيلها في النظام.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="grid gap-5 py-6 rtl">
                <div className="space-y-2">
                  <Label
                    htmlFor="company_name"
                    className="text-right block font-bold text-slate-700"
                  >
                    اسم الشركة
                  </Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-primary/20"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="company_code"
                    className="text-right block font-bold text-slate-700"
                  >
                    كود الشركة
                  </Label>
                  <Input
                    id="company_code"
                    value={formData.company_code}
                    onChange={(e) =>
                      setFormData({ ...formData, company_code: e.target.value })
                    }
                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-primary/20"
                    placeholder="مثال: ABC"
                    maxLength={10}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="place"
                    className="text-right block font-bold text-slate-700"
                  >
                    الموقع
                  </Label>
                  <Input
                    id="place"
                    value={formData.place}
                    onChange={(e) =>
                      setFormData({ ...formData, place: e.target.value })
                    }
                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-primary/20"
                    required
                  />
                </div>
              </div>
              <DialogFooter className="flex-row-reverse sm:justify-start gap-2 pt-2">
                <Button
                  type="submit"
                  className="rounded-xl px-10 h-11 bg-primary hover:bg-primary/90"
                >
                  حفظ
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="rounded-xl h-11 px-6"
                >
                  إلغاء
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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

      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="bg-white border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 py-8 px-6">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <Input
              placeholder="بحث باسم الشركة، الموقع..."
              className="pr-10 bg-slate-50 border-slate-200 focus-visible:ring-primary/20 rounded-xl h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => fetchCompanies()}
              className="h-11 rounded-xl border-slate-200 text-slate-600 px-6 font-medium bg-white hover:bg-slate-50"
            >
              تحديث البيانات
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 h-12">
                <TableHead className="text-right font-bold text-slate-700 px-6">
                  اسم الشركة
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 px-4">
                  الشحنات/الأصناف
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 px-4">
                  الموقع
                </TableHead>
                <TableHead className="text-right font-bold text-slate-700 px-4">
                  الحالة
                </TableHead>
                <TableHead className="text-center font-bold text-slate-700 px-6">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.length > 0 ? (
                companies.map((company) => (
                  <TableRow
                    key={company.id}
                    className="hover:bg-slate-50/50 transition-colors border-slate-100 h-[72px] group"
                  >
                    <TableCell className="px-6 font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 rounded-xl border border-slate-100 shadow-sm">
                          <AvatarFallback className="bg-primary/5 text-primary font-black text-xs uppercase">
                            {company.company_name?.substring(0, 2) || "CO"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm">
                            {company.company_name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold tracking-tight uppercase">
                            #{company.company_code}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="inline-flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <TrendingUp size={12} className="text-emerald-500" />
                          {company._count?.transit_shipments || 0} شحنة
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {company._count?.comp_items || 0} صنف مسجل
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <MapPin size={14} className="text-slate-300" />
                        <span>{company.place}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <Badge className="rounded-full font-bold px-3 py-0.5 h-6 border-none bg-emerald-50 text-emerald-600 shadow-sm">
                        نشط
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex items-center justify-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(company)}
                          className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                        >
                          <Edit size={16} />
                        </Button>
                        <DropdownMenu dir="rtl">
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-slate-400 hover:bg-slate-100 rounded-xl"
                            >
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 rounded-2xl p-2 border-slate-100 shadow-xl"
                          >
                            <DropdownMenuItem className="gap-3 p-3 text-sm focus:bg-slate-50 rounded-xl cursor-pointer">
                              <Globe size={16} className="text-slate-400" />{" "}
                              زيارة الموقع
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(company)}
                              className="gap-3 p-3 text-sm focus:bg-rose-50 text-rose-600 rounded-xl cursor-pointer"
                            >
                              <Trash2 size={16} /> حذف الشركة
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-24">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 border-dashed">
                        <Building2 size={32} className="text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-medium text-sm">
                        {loading
                          ? "جاري تحميل البيانات..."
                          : "لا توجد شركات مسجلة حالياً"}
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
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-right text-slate-900">
              تعديل بيانات الشركة
            </DialogTitle>
            <DialogDescription className="text-right text-slate-500">
              قم بتحديث المعلومات اللازمة واضغط على حفظ التغييرات.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-5 py-6 rtl">
              <div className="space-y-2">
                <Label
                  htmlFor="edit_company_name"
                  className="text-right block font-bold text-slate-700"
                >
                  اسم الشركة
                </Label>
                <Input
                  id="edit_company_name"
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-primary/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit_company_code"
                  className="text-right block font-bold text-slate-700"
                >
                  كود الشركة
                </Label>
                <Input
                  id="edit_company_code"
                  value={formData.company_code}
                  onChange={(e) =>
                    setFormData({ ...formData, company_code: e.target.value })
                  }
                  className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-primary/20"
                  maxLength={10}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="edit_place"
                  className="text-right block font-bold text-slate-700"
                >
                  الموقع
                </Label>
                <Input
                  id="edit_place"
                  value={formData.place}
                  onChange={(e) =>
                    setFormData({ ...formData, place: e.target.value })
                  }
                  className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-primary/20"
                  required
                />
              </div>
            </div>
            <DialogFooter className="flex-row-reverse sm:justify-start gap-2 pt-2">
              <Button
                type="submit"
                className="rounded-xl px-10 h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                حفظ التغييرات
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsEditDialogOpen(false)}
                className="rounded-xl h-11 px-6"
              >
                إلغاء
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <div className="h-12 w-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <AlertTriangle className="text-rose-600" size={24} />
            </div>
            <DialogTitle className="text-center font-bold text-slate-900 text-xl">
              تأكيد الحذف
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500 leading-relaxed py-2">
              هل أنت متأكد من رغبتك في حذف شركة{" "}
              <span className="font-bold text-slate-900">
                "{selectedCompany?.company_name}"
              </span>
              ؟
              <br />
              هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="rounded-xl h-11 w-full sm:flex-1 bg-rose-600 hover:bg-rose-700 font-bold"
            >
              نعم، قم بالحذف
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-xl h-11 w-full sm:flex-1 font-medium text-slate-600 border-slate-200"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CompanyStatCard({ title, value, icon, detail }: any) {
  return (
    <Card className="border-slate-100 shadow-sm rounded-2xl hover:shadow-md transition-all duration-300 overflow-hidden bg-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
            {icon}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              {title}
            </span>
            <span className="text-2xl font-black text-slate-900 tracking-tight leading-none mt-1">
              {value}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
              {detail}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
