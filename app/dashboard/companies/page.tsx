"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Building2,
  MapPin,
  Calculator,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/app/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";
import { apiClient } from "@/app/lib/api-client";
import { toast } from "sonner";
import { usePermissions } from "@/app/hooks/use-permissions";
import { PERMISSIONS } from "@/app/lib/permissions";
import { useRouter } from "next/navigation";

interface Company {
  id: number;
  company_name: string;
  compen: string | null;
  place: string | null;
  isActive: boolean;
  company_code: string;
  Sequence1: number;
  Sequence2: number;
  first_internal_serial: number;
  logo: string | null;
  createdAt?: string;
}

export default function CompaniesPage() {
  const { hasPermission, loading: permLoading } = usePermissions();
  const router = useRouter();
  const [data, setData] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!permLoading && !hasPermission(PERMISSIONS.VIEW_COMPANY)) {
      router.push("/dashboard");
    }
  }, [hasPermission, permLoading, router]);

  // Add State (Requires expected_invoices for calculation)
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addData, setAddData] = useState({
    company_name: "",
    compen: "",
    place: "",
    expected_invoices: 1000,
    isActive: true,
    logo: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Edit State (Sequences are read-only)
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState({
    id: 0,
    company_name: "",
    compen: "",
    place: "",
    isActive: true,
    company_code: "",
    Sequence1: 0,
    Sequence2: 0,
    first_internal_serial: 0,
    logo: "",
  });
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);

  const fetchData = async () => {
    try {
      const res = await apiClient.getCompanies();
      setData(res || []);
    } catch {
      toast.error("فشل جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!addData.company_name.trim()) {
      toast.error("يرجى إدخال اسم الشركة بالعربي");
      return;
    }

    try {
      let uploadedLogoUrl = addData.logo;
      if (logoFile) {
        const uploadRes = await apiClient.uploadFile(logoFile);
        if (uploadRes && uploadRes.url) {
          uploadedLogoUrl = uploadRes.url;
        }
      }

      await apiClient.createCompany({ ...addData, logo: uploadedLogoUrl });
      toast.success("تم الإضافة وتوليد التسلسلات بنجاح");
      setIsAddOpen(false);
      setAddData({
        company_name: "",
        compen: "",
        place: "",
        expected_invoices: 1000,
        isActive: true,
        logo: "",
      });
      setLogoFile(null);
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "خطأ في الإضافة أو تعارض في التسلسل";
      toast.error(message);
    }
  };

  const handleEditClick = (item: Company) => {
    setEditData({
      id: item.id,
      company_name: item.company_name || "",
      compen: item.compen || "",
      place: item.place || "",
      isActive: item.isActive !== undefined ? item.isActive : true,
      company_code: item.company_code,
      Sequence1: item.Sequence1,
      Sequence2: item.Sequence2,
      first_internal_serial: item.first_internal_serial,
      logo: item.logo || "",
    });
    setEditLogoFile(null);
    setIsEditOpen(true);
  };

  const handleEdit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editData.company_name.trim()) {
      toast.error("يرجى إدخال اسم الشركة بالعربي");
      return;
    }

    try {
      let uploadedLogoUrl = editData.logo;
      if (editLogoFile) {
        const uploadRes = await apiClient.uploadFile(editLogoFile);
        if (uploadRes && uploadRes.url) {
          uploadedLogoUrl = uploadRes.url;
        }
      }

      await apiClient.updateCompany(editData.id, {
        company_name: editData.company_name,
        compen: editData.compen,
        place: editData.place,
        isActive: editData.isActive,
        logo: uploadedLogoUrl,
      });
      toast.success("تم التعديل بنجاح");
      setIsEditOpen(false);
      setEditLogoFile(null);
      fetchData();
    } catch {
      toast.error("خطأ في التعديل");
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "هل أنت متأكد من الحذف؟ تحذير: قد يؤدي هذا لتدمير تسلسل الفواتير إذا لم يتم التعامل معه بحذر!",
      )
    )
      return;
    try {
      await apiClient.deleteCompany(id);
      toast.success("تم الحذف بنجاح");
      fetchData();
    } catch {
      toast.error("لا يمكن الحذف لوجود ارتباطات سابقة.");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="text-primary" /> إدارة الشركات الموردة
        </h1>
        {hasPermission(PERMISSIONS.CREATE_COMPANY) && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary rounded-xl px-6">
                <Plus size={16} /> إضافة شركة
              </Button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-2xl p-6 text-right"
              dir="rtl"
            >
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  إضافة شركة وتوليد تسلسل
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">اسم الشركة (عربي)</Label>
                    <Input
                      value={addData.company_name}
                      onChange={(e) =>
                        setAddData({ ...addData, company_name: e.target.value })
                      }
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">الاسم (إنجليزي)</Label>
                    <Input
                      value={addData.compen}
                      onChange={(e) =>
                        setAddData({ ...addData, compen: e.target.value })
                      }
                      className="rounded-xl"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">الدولة / الموقع</Label>
                  <div className="relative">
                    <MapPin
                      className="absolute right-3 top-3 text-gray-400"
                      size={16}
                    />
                    <Input
                      value={addData.place}
                      onChange={(e) =>
                        setAddData({ ...addData, place: e.target.value })
                      }
                      className="rounded-xl pr-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">شعار الشركة (Logo)</Label>
                  <Input
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="rounded-xl"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl space-y-3">
                  <Label className="font-bold text-blue-900 flex items-center gap-2">
                    <Calculator size={16} /> إعدادات تسلسل الفواتير للسنة الحالية
                  </Label>
                  <div className="space-y-2">
                    <Label className="text-sm text-blue-800">
                      العدد المتوقع للفواتير/السيارات (لتخصيص المجال)
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={addData.expected_invoices}
                      onChange={(e) =>
                        setAddData({
                          ...addData,
                          expected_invoices: parseInt(e.target.value) || 0,
                        })
                      }
                      className="rounded-xl bg-white"
                    />
                    <p className="text-xs text-blue-600">
                      سيقوم النظام تلقائياً بتوليد كود الشركة، وحجز أرقام
                      الفواتير، وبدء تسلسل الأصناف.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={addData.isActive}
                    onChange={(e) =>
                      setAddData({ ...addData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-primary"
                  />
                  <Label htmlFor="isActive" className="font-bold cursor-pointer">
                    الشركة مفعلة
                  </Label>
                </div>
                <Button
                  type="button"
                  onClick={handleAdd}
                  className="w-full rounded-xl mt-4"
                >
                  إضافة وتوليد التسلسل
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-2xl p-6 text-right"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              تعديل بيانات الشركة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-3 gap-2 pb-2">
              <div className="bg-slate-50 p-2 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">كود الشركة</p>
                <p className="font-mono font-bold text-sm">
                  {editData.company_code}
                </p>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">
                  مجال الفواتير المحجوز
                </p>
                <p className="font-mono font-bold text-sm text-primary">
                  {editData.Sequence1} - {editData.Sequence2}
                </p>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">تسلسل الأصناف</p>
                <p className="font-mono font-bold text-sm text-emerald-600">
                  {editData.first_internal_serial}
                </p>
              </div>
            </div>
            <p className="text-xs text-rose-500 text-center mb-4">
              ملاحظة: الأرقام التسلسلية غير قابلة للتعديل للحفاظ على النظام
              المالي.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">الاسم (عربي)</Label>
                <Input
                  value={editData.company_name}
                  onChange={(e) =>
                    setEditData({ ...editData, company_name: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">الاسم (إنجليزي)</Label>
                <Input
                  value={editData.compen}
                  onChange={(e) =>
                    setEditData({ ...editData, compen: e.target.value })
                  }
                  className="rounded-xl"
                  dir="ltr"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold">الموقع</Label>
              <div className="relative">
                <MapPin
                  className="absolute right-3 top-3 text-gray-400"
                  size={16}
                />
                <Input
                  value={editData.place}
                  onChange={(e) =>
                    setEditData({ ...editData, place: e.target.value })
                  }
                  className="rounded-xl pr-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold">تحديث شعار الشركة</Label>
              <Input
                type="file"
                accept="image/jpeg, image/png, image/webp"
                onChange={(e) => setEditLogoFile(e.target.files?.[0] || null)}
                className="rounded-xl"
              />
              {editData.logo && !editLogoFile && (
                <p className="text-xs text-slate-500 mt-1">
                  الشركة تمتلك شعار حالياً، ارفع ملف جديد لتغييره.
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="editIsActive"
                checked={editData.isActive}
                onChange={(e) =>
                  setEditData({ ...editData, isActive: e.target.checked })
                }
                className="w-4 h-4 rounded text-primary"
              />
              <Label
                htmlFor="editIsActive"
                className="font-bold cursor-pointer"
              >
                الشركة مفعلة
              </Label>
            </div>
            <Button
              type="button"
              onClick={handleEdit}
              className="w-full rounded-xl mt-4"
            >
              حفظ التعديلات
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="rounded-2xl border-none shadow-sm bg-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="text-right font-bold py-4">
                  #
                </TableHead>
                <TableHead className="text-right font-bold py-4">
                  الكود
                </TableHead>
                <TableHead className="text-right font-bold py-4">
                  الشعار
                </TableHead>
                <TableHead className="text-right font-bold py-4">
                  اسم الشركة
                </TableHead>
                <TableHead className="text-right font-bold py-4">
                   الاسم (لاتيني)
                </TableHead>
                <TableHead className="text-right font-bold py-4">
                  الموقع
                </TableHead>
                <TableHead className="text-center font-bold py-4">
                  بداية التسلسل
                </TableHead>
                <TableHead className="text-center font-bold py-4">
                  نهاية التسلسل
                </TableHead>
                <TableHead className="text-center font-bold py-4">
                  تسلسل الأصناف
                </TableHead>
                <TableHead className="text-center font-bold py-4">
                  الحالة
                </TableHead>
                <TableHead className="text-center font-bold py-4">
                  تاريخ الإضافة
                </TableHead>
                <TableHead className="text-center font-bold py-4 w-[100px]">
                  إجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={12}
                    className="text-center py-8 text-slate-500"
                  >
                    لا توجد شركات
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item: Company) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs text-slate-400">
                      {item.id}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="font-mono text-sm bg-slate-50"
                      >
                        {item.company_code}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.logo ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                          <Image
                            src={item.logo}
                            alt={item.company_name}
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-bold text-gray-900">
                      {item.company_name}
                    </TableCell>
                    <TableCell className="text-gray-500 font-mono text-sm">
                      {item.compen || "—"}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {item.place || "—"}
                    </TableCell>
                    <TableCell className="text-center font-mono text-blue-700 font-medium">
                      {item.Sequence1}
                    </TableCell>
                    <TableCell className="text-center font-mono text-blue-700 font-medium">
                      {item.Sequence2}
                    </TableCell>
                    <TableCell className="text-center font-mono text-emerald-600 bg-emerald-50 rounded-lg">
                      {item.first_internal_serial}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.isActive ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                          نشط
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-500">
                          غير نشط
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-xs text-slate-500 whitespace-nowrap">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString("ar-EG") : "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center items-center gap-2">
                        {hasPermission(PERMISSIONS.EDIT_COMPANY) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(item)}
                            className="text-blue-500 hover:bg-blue-50"
                          >
                            <Edit size={16} />
                          </Button>
                        )}
                        {hasPermission(PERMISSIONS.DELETE_COMPANY) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                            className="text-rose-500 hover:bg-rose-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
