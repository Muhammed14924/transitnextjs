"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Trash2,
  Edit,
  PackageSearch,
  Link as LinkIcon,
  Box,
  Tag,
  BarChart2,
  Image as ImageIcon,
  AlertTriangle,
  RefreshCw,
  Upload,
  Layers,
  Search,
  CopyPlus,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Factory,
  ListFilter
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/app/lib/utils";
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
  DialogFooter,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/app/components/ui/select";
import { apiClient } from "@/app/lib/api-client";
import { toast } from "sonner";
import { usePermissions } from "@/app/hooks/use-permissions";
import { PERMISSIONS } from "@/app/lib/permissions";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/app/components/ui/checkbox";
import { DeleteConfirmDialog } from "@/app/components/ui/delete-dialog";

export default function CompanyItemsPage() {
  const { hasPermission, loading: permLoading } = usePermissions();
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!permLoading && !hasPermission(PERMISSIONS.VIEW_COMP_ITEM)) {
      router.push("/dashboard");
    }
  }, [hasPermission, permLoading, router]);

  const initialAddState = {
    item_ar_name: "",
    item_en_name: "",
    company_name: "",
    item_type: "",
    unit: "1",
    price: 0,
    weight: 0,
    package: "",
    packet_weight: 0,
    date_exp: "",
    GTIP: "",
    image: "",
    manufacturer_code: "",
    ismain_item: true,
    main_item: "",
    isActive: true,
  };

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addData, setAddData] = useState(initialAddState);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState<any>(initialAddState);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [selectedTypeId, setSelectedTypeId] = useState<string>("all");

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageIds = currentData.map((item: any) => item.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...currentPageIds])));
    } else {
      const currentPageIds = currentData.map((item: any) => item.id);
      setSelectedIds(selectedIds.filter(id => !currentPageIds.includes(id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsDeletingBulk(true);
    try {
      await apiClient.deleteCompItems(selectedIds);
      toast.success(`تم حذف ${selectedIds.length} أصناف بنجاح`);
      setSelectedIds([]);
      setIsBulkDeleteDialogOpen(false);
      fetchData();
    } catch (_e) {
      toast.error("حدث خطأ أثناء الحذف المتعدد");
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const sortedCompanies = useMemo(() => {
    return companies
      .map(c => ({
        ...c,
        count: data.filter((item: any) => item.company_name.toString() === c.id.toString()).length
      }))
      .filter(c => c.count > 0)
      .sort((a,b) => b.count - a.count)
      .slice(0, 15);
  }, [companies, data]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Add flavors state
  const [isAddFlavorsOpen, setIsAddFlavorsOpen] = useState(false);
  const [selectedMainItemForFlavors, setSelectedMainItemForFlavors] = useState<any>(null);
  const [flavorsList, setFlavorsList] = useState<{name: string, generatedName: string}[]>([]);
  const [flavorInput, setFlavorInput] = useState("");
  const [isSavingFlavors, setIsSavingFlavors] = useState(false);

  const generateFlavorName = (mainName: string, flavor: string) => {
    const match = mainName.match(/^(.*?)(\s*\d+.*)$/);
    if (match) {
       return `${match[1].trim()} ${flavor} ${match[2].trim()}`;
    }
    return `${mainName} ${flavor}`;
  };

  const handleAddFlavor = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!flavorInput.trim() || !selectedMainItemForFlavors) return;
    const generatedName = generateFlavorName(selectedMainItemForFlavors.item_ar_name, flavorInput.trim());
    setFlavorsList([...flavorsList, { name: flavorInput.trim(), generatedName }]);
    setFlavorInput("");
  };

  const handleRemoveFlavor = (index: number) => {
    setFlavorsList(flavorsList.filter((_, i) => i !== index));
  };

  const handleSaveFlavors = async () => {
    if (flavorsList.length === 0 || !selectedMainItemForFlavors) return;
    setIsSavingFlavors(true);
    try {
      for (const flavor of flavorsList) {
         const payload = {
            item_ar_name: flavor.generatedName,
            item_en_name: selectedMainItemForFlavors.item_en_name || "",
            company_name: selectedMainItemForFlavors.company_name,
            item_type: selectedMainItemForFlavors.item_type || null,
            unit: selectedMainItemForFlavors.unit,
            price: selectedMainItemForFlavors.price,
            weight: selectedMainItemForFlavors.weight,
            package: selectedMainItemForFlavors.package,
            packet_weight: selectedMainItemForFlavors.packet_weight,
            date_exp: selectedMainItemForFlavors.date_exp,
            GTIP: selectedMainItemForFlavors.GTIP,
            image: selectedMainItemForFlavors.image,
            manufacturer_code: null,
            ismain_item: false,
            main_item: selectedMainItemForFlavors.id,
            isActive: true
         };
         await apiClient.createCompItem(payload);
      }
      toast.success("تم إضافة النكهات بنجاح");
      setIsAddFlavorsOpen(false);
      setFlavorsList([]);
      fetchData();
    } catch (_e: any) {
      toast.error("حدث خطأ أثناء حفظ النكهات");
    } finally {
      setIsSavingFlavors(false);
    }
  };

  const filteredData = data.filter((item: any) => {
    // 1. Search filter
    const searchStr = searchTerm.toLowerCase().trim();
    const matchesSearch = !searchStr || (
      item.item_ar_name?.toLowerCase().includes(searchStr) ||
      item.item_en_name?.toLowerCase().includes(searchStr) ||
      item.composite_code?.toLowerCase().includes(searchStr) ||
      item.internal_code?.toString().includes(searchStr) ||
      item.manufacturer_code?.toLowerCase().includes(searchStr) ||
      item.companies?.company_name?.toLowerCase().includes(searchStr)
    );

    // 2. Company filter
    const matchesCompany = selectedCompanyId === "all" || item.company_name.toString() === selectedCompanyId;

    // 3. Type filter
    const matchesType = selectedTypeId === "all" || item.item_type?.toString() === selectedTypeId;

    return matchesSearch && matchesCompany && matchesType;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchData = async () => {
    try {
      const [itemsRes, compRes, typesRes, unitsRes] = await Promise.all([
        apiClient.getCompItems(),
        apiClient.getCompanies(),
        apiClient.getTypeofitems(),
        apiClient.getUnits(),
      ]);
      setData(itemsRes || []);
      setCompanies(compRes || []);
      setTypes(typesRes || []);
      setUnits(unitsRes || []);
    } catch (_e) {
      toast.error("فشل جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e?: any) => {
    if (e) e.preventDefault();
    if (!addData.company_name) return toast.error("يجب اختيار الشركة");
    if (!addData.item_ar_name.trim()) return toast.error("يجب إدخال اسم الصنف");
    try {
      let uploadedImageUrl = addData.image;
      if (imageFile) {
        const uploadRes = await apiClient.uploadToS3(imageFile);
        if (uploadRes && uploadRes.fileUrl) {
          uploadedImageUrl = uploadRes.fileUrl;
        }
      }

      await apiClient.createCompItem({ ...addData, image: uploadedImageUrl });
      toast.success("تم إنشاء الصنف وتوليد الأكواد بنجاح");
      setIsAddOpen(false);
      setAddData(initialAddState);
      setImageFile(null);
      fetchData();
    } catch (e: any) {
      toast.error(e.message || "خطأ في الإضافة");
    }
  };

  const handleEditClick = (item: any) => {
    setEditData({
      ...item,
      company_name: item.company_name.toString(),
      item_type: item.item_type?.toString() || "",
      unit: item.unit?.toString() || "1",
      main_item: item.main_item?.toString() || "",
      date_exp: item.date_exp
        ? new Date(item.date_exp).toISOString().split("T")[0]
        : "",
      GTIP: item.GTIP || "",
      image: item.image || "",
      manufacturer_code: item.manufacturer_code || "",
    });
    setEditImageFile(null);
    setIsEditOpen(true);
  };

  const handleEdit = async (e?: any) => {
    if (e) e.preventDefault();
    if (!editData.item_ar_name.trim())
      return toast.error("يجب إدخال اسم الصنف");
    try {
      let uploadedImageUrl = editData.image;
      if (editImageFile) {
        const uploadRes = await apiClient.uploadToS3(editImageFile);
        if (uploadRes && uploadRes.fileUrl) {
          uploadedImageUrl = uploadRes.fileUrl;
        }
      }

      await apiClient.updateCompItem(editData.id, {
        ...editData,
        image: uploadedImageUrl,
      });
      toast.success("تم التعديل بنجاح");
      setIsEditOpen(false);
      setEditImageFile(null);
      fetchData();
    } catch (_e) {
      toast.error("خطأ في التعديل");
    }
  };

  const openDeleteDialog = (id: number, name: string) => {
    setDeleteTarget({ id, name });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.deleteCompItem(deleteTarget.id);
      toast.success("تم الحذف بنجاح");
      setIsDeleteDialogOpen(false);
      setDeleteTarget(null);
      fetchData();
    } catch (_e) {
      toast.error("خطأ في الحذف");
    }
  };

  const handleDelete = async (id: number) => {
    const item = data.find((d) => d.id === id);
    openDeleteDialog(id, item?.item_ar_name || "هذا الصنف");
  };

  // filter main items for selected company to show in parent item list
  const availableMainItems = data.filter(
    (item) =>
      item.company_name.toString() === addData.company_name &&
      item.ismain_item === true,
  );

  const availableMainItemsForEdit = data.filter(
    (item) =>
      item.company_name.toString() === editData.company_name &&
      item.ismain_item === true &&
      item.id !== editData.id, // don't show self as parent
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PackageSearch className="text-primary" /> إدارة الأصناف والمنتجات
        </h1>
        {hasPermission(PERMISSIONS.CREATE_COMP_ITEM) && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary rounded-xl px-6">
                <Plus size={16} /> إضافة صنف جديد
              </Button>
            </DialogTrigger>
            <DialogContent
              className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl p-6 text-right"
              dir="rtl"
            >
              <DialogHeader>
                <DialogTitle className="text-xl font-bold border-b pb-4 text-right">
                  إضافة صنف جديد للشركة
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-2">
                {/* Company & Type */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label className="font-bold text-blue-800">
                      الشركة الموردة *
                    </Label>
                    <select
                      value={addData.company_name}
                      onChange={(e) =>
                        setAddData({ ...addData, company_name: e.target.value })
                      }
                      className="flex h-10 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    >
                      <option value="">-- اختر الشركة --</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.company_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label className="font-bold text-blue-800">
                      نوع الصنف (لتوليد الكود)
                    </Label>
                    <select
                      value={addData.item_type}
                      onChange={(e) =>
                        setAddData({ ...addData, item_type: e.target.value })
                      }
                      className="flex h-10 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    >
                      <option value="">-- اختر النوع --</option>
                      {types.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.item_type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Names */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">اسم الصنف (عربي) *</Label>
                    <Input
                      value={addData.item_ar_name}
                      onChange={(e) =>
                        setAddData({ ...addData, item_ar_name: e.target.value })
                      }
                      className="rounded-xl"
                      placeholder="عصير مانجو..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">اسم الصنف (أجنبي)</Label>
                    <Input
                      value={addData.item_en_name}
                      onChange={(e) =>
                        setAddData({ ...addData, item_en_name: e.target.value })
                      }
                      className="rounded-xl text-left"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">كود المنتج (المصنع)</Label>
                    <Input
                      value={addData.manufacturer_code}
                      onChange={(e) =>
                        setAddData({
                          ...addData,
                          manufacturer_code: e.target.value,
                        })
                      }
                      className="rounded-xl"
                      placeholder="Ref Code..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">السعر</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={addData.price}
                      onChange={(e) =>
                        setAddData({
                          ...addData,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">تاريخ الصلاحية</Label>
                    <Input
                      type="date"
                      value={addData.date_exp}
                      onChange={(e) =>
                        setAddData({ ...addData, date_exp: e.target.value })
                      }
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Parent/Child status */}
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="ismain"
                      checked={addData.ismain_item}
                      onChange={(e) =>
                        setAddData({
                          ...addData,
                          ismain_item: e.target.checked,
                          main_item: "",
                        })
                      }
                      className="w-4 h-4 rounded text-primary"
                    />
                    <Label
                      htmlFor="ismain"
                      className="font-bold cursor-pointer text-emerald-900"
                    >
                      صنف أساسي (رئيسي)
                    </Label>
                  </div>

                  {!addData.ismain_item && (
                    <div className="space-y-2">
                      <Label className="font-bold flex items-center gap-2 text-emerald-800">
                        <LinkIcon size={14} /> هذا الصنف نكهة/فرع تابع للمنتج
                        الأساسي:
                      </Label>
                      <select
                        value={addData.main_item}
                        onChange={(e) =>
                          setAddData({ ...addData, main_item: e.target.value })
                        }
                        className="flex h-10 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      >
                        <option value="">-- اختر المنتج الأساسي --</option>
                        {availableMainItems.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.item_ar_name}
                          </option>
                        ))}
                      </select>
                      {availableMainItems.length === 0 &&
                        addData.company_name && (
                          <p className="text-xs text-rose-500">
                            لا يوجد منتجات رئيسية لهذه الشركة بعد.
                          </p>
                        )}
                    </div>
                  )}
                </div>

                {/* Logistic details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">الوحدة</Label>
                    <select
                      value={addData.unit}
                      onChange={(e) =>
                        setAddData({ ...addData, unit: e.target.value })
                      }
                      className="flex h-10 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    >
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.unit_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">التعبئة</Label>
                    <Input
                      value={addData.package}
                      onChange={(e) =>
                        setAddData({ ...addData, package: e.target.value })
                      }
                      className="rounded-xl"
                      placeholder="6x24"
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">الوزن</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={addData.weight}
                      onChange={(e) =>
                        setAddData({
                          ...addData,
                          weight: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">الوزن القائم</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={addData.packet_weight}
                      onChange={(e) =>
                        setAddData({
                          ...addData,
                          packet_weight: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">رمز التعرفة (GTIP)</Label>
                    <Input
                      type="number"
                      value={addData.GTIP}
                      onChange={(e) =>
                        setAddData({ ...addData, GTIP: e.target.value })
                      }
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Product Image Section */}
                <div className="space-y-4">
                  <Label className="font-bold text-slate-700 flex items-center gap-2">
                    <ImageIcon size={16} /> صورة المنتج
                  </Label>
                  
                  <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 hover:bg-slate-50 hover:border-primary/30 transition-all group relative overflow-hidden">
                    {imageFile || addData.image ? (
                      <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-4 ring-slate-50">
                        <div className="aspect-video relative overflow-hidden flex items-center justify-center bg-slate-100">
                          <img 
                            src={imageFile ? URL.createObjectURL(imageFile) : addData.image} 
                            alt="Preview" 
                            className="w-full h-full object-contain" 
                          />
                        </div>
                        <div className="p-3 border-t bg-slate-50 flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-500 truncate max-w-[200px]">
                            {imageFile ? imageFile.name : "صورة المنتج الحالية"}
                          </span>
                          <div className="flex gap-2">
                             <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 rounded-full border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 shadow-sm"
                              onClick={() => {
                                setImageFile(null);
                                setAddData({...addData, image: ""});
                              }}
                              title="حذف الصورة"
                            >
                              <Trash2 size={14} />
                            </Button>
                            <label className="h-8 w-8 flex items-center justify-center bg-white border border-slate-200 text-blue-500 rounded-full cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm" title="تعديل الصورة">
                              <RefreshCw size={14} />
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/jpeg, image/png, image/webp"
                                onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <label className="w-full cursor-pointer py-10 flex flex-col items-center gap-3">
                        <div className="h-16 w-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:scale-110 transition-all text-slate-400 group-hover:text-primary group-hover:shadow-md">
                          <Upload size={28} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-slate-700">اضغط هنا لرفع صورة المنتج</p>
                          <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, WEBP (بحد أقصى 5MB)</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/jpeg, image/png, image/webp"
                          onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
                        />
                      </label>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleAdd}
                  className="w-full rounded-xl mt-4"
                >
                  حفظ وتوليد الأكواد آلياً
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl p-6 text-right"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold border-b pb-4 text-right">
              تعديل بيانات الصنف
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-2 pb-2">
              <div className="bg-slate-50 p-2 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">تسلسل داخلي</p>
                <p className="font-mono font-bold text-sm text-emerald-700">
                  {editData.internal_code}
                </p>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg text-center">
                <p className="text-xs text-slate-500 mb-1">الكود المركب</p>
                <p className="font-mono font-bold text-sm text-indigo-700">
                  {editData.composite_code || "—"}
                </p>
              </div>
            </div>

            {/* Company & Type */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="font-bold text-blue-800">
                  الشركة الموردة (لا يمكن التغيير)
                </Label>
                <select
                  disabled
                  value={editData.company_name}
                  className="flex h-10 w-full rounded-xl border border-input bg-slate-100 px-3 py-2 text-sm outline-none cursor-not-allowed"
                >
                  <option value="">-- اختر الشركة --</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label className="font-bold text-blue-800">
                  نوع الصنف (التغيير يحدث الكود)
                </Label>
                <select
                  value={editData.item_type}
                  onChange={(e) =>
                    setEditData({ ...editData, item_type: e.target.value })
                  }
                  className="flex h-10 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                >
                  <option value="">-- اختر النوع --</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.item_type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Names */}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">اسم الصنف (عربي)</Label>
                <Input
                  value={editData.item_ar_name}
                  onChange={(e) =>
                    setEditData({ ...editData, item_ar_name: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">اسم الصنف (أجنبي)</Label>
                <Input
                  value={editData.item_en_name || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, item_en_name: e.target.value })
                  }
                  className="rounded-xl text-left"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">كود المنتج (المصنع)</Label>
                <Input
                  value={editData.manufacturer_code}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      manufacturer_code: e.target.value,
                    })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">السعر</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editData.price || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">تاريخ الصلاحية</Label>
                <Input
                  type="date"
                  value={editData.date_exp || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, date_exp: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Parent/Child status */}
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsmain"
                  checked={editData.ismain_item}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      ismain_item: e.target.checked,
                      main_item: "",
                    })
                  }
                  className="w-4 h-4 rounded text-primary"
                />
                <Label
                  htmlFor="editIsmain"
                  className="font-bold cursor-pointer text-emerald-900"
                >
                  صنف أساسي (رئيسي)
                </Label>
              </div>

              {!editData.ismain_item && (
                <div className="space-y-2">
                  <Label className="font-bold flex items-center gap-2 text-emerald-800">
                    <LinkIcon size={14} /> هذا الصنف نكهة/فرع تابع للمنتج
                    الأساسي:
                  </Label>
                  <select
                    value={editData.main_item}
                    onChange={(e) =>
                      setEditData({ ...editData, main_item: e.target.value })
                    }
                    className="flex h-10 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  >
                    <option value="">-- اختر المنتج الأساسي --</option>
                    {availableMainItemsForEdit.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.item_ar_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">الوحدة</Label>
                <select
                  value={editData.unit}
                  onChange={(e) =>
                    setEditData({ ...editData, unit: e.target.value })
                  }
                  className="flex h-10 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.unit_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold">التعبئة</Label>
                <Input
                  value={editData.package || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, package: e.target.value })
                  }
                  className="rounded-xl"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">الوزن</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editData.weight || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      weight: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">الوزن القائم</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editData.packet_weight || 0}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      packet_weight: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">رمز التعرفة (GTIP)</Label>
                <Input
                  type="number"
                  value={editData.GTIP || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, GTIP: e.target.value })
                  }
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Product Image Section (Edit) */}
            <div className="space-y-4">
              <Label className="font-bold text-slate-700 flex items-center gap-2">
                <ImageIcon size={16} /> صورة المنتج
              </Label>
              
              <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 hover:bg-slate-50 hover:border-primary/30 transition-all group relative overflow-hidden">
                {editImageFile || editData.image ? (
                  <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-4 ring-slate-50">
                    <div className="aspect-video relative overflow-hidden flex items-center justify-center bg-slate-100">
                      <img 
                        src={editImageFile ? URL.createObjectURL(editImageFile) : editData.image} 
                        alt="Preview" 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                    <div className="p-3 border-t bg-slate-50 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500 truncate max-w-[200px]">
                        {editImageFile ? editImageFile.name : "صورة المنتج الحالية"}
                      </span>
                      <div className="flex gap-2">
                         <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full border-rose-200 text-rose-500 hover:bg-rose-50 hover:border-rose-300 shadow-sm"
                          onClick={() => {
                            setEditImageFile(null);
                            setEditData({...editData, image: ""});
                          }}
                          title="حذف الصورة"
                        >
                          <Trash2 size={14} />
                        </Button>
                        <label className="h-8 w-8 flex items-center justify-center bg-white border border-slate-200 text-blue-500 rounded-full cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm" title="تعديل الصورة">
                          <RefreshCw size={14} />
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/jpeg, image/png, image/webp"
                            onChange={(e) => setEditImageFile(e.target.files?.[0] || null)} 
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="w-full cursor-pointer py-10 flex flex-col items-center gap-3">
                    <div className="h-16 w-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:scale-110 transition-all text-slate-400 group-hover:text-primary group-hover:shadow-md">
                      <Upload size={28} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-700">اضغط هنا لتحديث صورة المنتج</p>
                      <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, WEBP (بحد أقصى 5MB)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/jpeg, image/png, image/webp"
                      onChange={(e) => setEditImageFile(e.target.files?.[0] || null)} 
                    />
                  </label>
                )}
              </div>
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
                الصنف مفعل
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ProductStatCard
          title="إجمالي الأصناف"
          value={loading ? "..." : data.length.toString()}
          icon={<Box size={20} />}
          color="blue"
        />
        <ProductStatCard
          title="متوفر حالياً"
          value={
            loading
              ? "..."
              : data.filter((item: any) => item.isActive).length.toString()
          }
          icon={<Tag size={20} />}
          color="amber"
          detail="أصناف نشطة"
        />
        <ProductStatCard
          title="الشركات المتعاونة"
          value={loading ? "..." : companies.length.toString()}
          icon={<BarChart2 size={20} />}
          color="rose"
          detail="ملاك البضائع"
        />
        <ProductStatCard
          title="فئات المنتجات"
          value={loading ? "..." : types.length.toString()}
          icon={<Layers size={20} />}
          color="emerald"
          detail="تصنيفات متنوعة"
        />
      </div>

      <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          {!loading && !searchTerm && sortedCompanies.length > 0 && (
            <div className="p-4 bg-slate-50/30 border-b space-y-3">
              <div className="flex items-center gap-2 text-slate-500">
                <Filter size={14} className="text-primary/70" />
                <span className="text-[11px] font-bold uppercase tracking-wider">الوصول السريع حسب الشركة:</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide no-scrollbar">
                <Badge 
                  variant={selectedCompanyId === "all" ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-4 py-2 rounded-xl transition-all whitespace-nowrap border-slate-200 shadow-sm",
                    selectedCompanyId === "all" ? "bg-primary text-white" : "bg-white hover:bg-slate-50 text-slate-600 border-dashed"
                  )}
                  onClick={() => {
                    setSelectedCompanyId("all");
                    setCurrentPage(1);
                  }}
                >
                  جميع الشركات ({data.length})
                </Badge>
                {sortedCompanies.map((c) => (
                  <Badge 
                    key={c.id}
                    variant={selectedCompanyId === c.id.toString() ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer px-4 py-2 rounded-xl transition-all whitespace-nowrap border-slate-200 group relative",
                      selectedCompanyId === c.id.toString() 
                        ? "bg-primary text-white shadow-md pr-6" 
                        : "bg-white hover:bg-slate-100 text-slate-600 border-solid"
                    )}
                    onClick={() => {
                      setSelectedCompanyId(c.id.toString());
                      setCurrentPage(1);
                    }}
                  >
                    {c.company_name} ({c.count})
                    {selectedCompanyId === c.id.toString() && (
                      <X 
                        size={10} 
                        className="mr-2 inline hover:text-rose-200 transition-colors" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCompanyId("all");
                        }} 
                      />
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-b bg-slate-50/50 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
               {/* Search Box */}
              <div className="relative w-full max-w-sm">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  placeholder="بحث سريع بأي معلومة..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pr-10 bg-white border-slate-200 focus-visible:ring-primary/20 rounded-xl"
                />
              </div>

              {/* Filters Group */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Reset Filters Icon */}
                {(selectedCompanyId !== "all" || selectedTypeId !== "all" || searchTerm) && (
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                       setSearchTerm("");
                       setSelectedCompanyId("all");
                       setSelectedTypeId("all");
                       setCurrentPage(1);
                    }}
                    className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg h-10 w-10 ring-1 ring-rose-100"
                    title="تصفية الكل"
                   >
                     <RefreshCw size={16} />
                   </Button>
                )}

                {/* Company Select */}
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedCompanyId}
                    onValueChange={(val) => {
                      setSelectedCompanyId(val);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[180px] h-10 rounded-xl border-slate-200 bg-white font-medium text-slate-700">
                      <div className="flex items-center gap-2 truncate">
                        <Factory size={14} className="text-primary/70 shrink-0" />
                        <SelectValue placeholder="اختر الشـركة" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      <SelectItem value="all" className="font-bold">كل الشـركات</SelectItem>
                      {companies.map((c: any) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Select */}
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedTypeId}
                    onValueChange={(val) => {
                      setSelectedTypeId(val);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200 bg-white font-medium text-slate-700">
                      <div className="flex items-center gap-2 truncate">
                        <ListFilter size={14} className="text-primary/70 shrink-0" />
                        <SelectValue placeholder="فـرز النوع" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      <SelectItem value="all" className="font-bold">كل الأنواع</SelectItem>
                      {types.map((t: any) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.item_type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Active Filters Result Count */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                 <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 mr-1 shadow-sm">
                    <Filter size={12} />
                    <span className="text-xs font-black">النتائج: {filteredData.length}</span>
                 </div>
                 
                 {selectedCompanyId !== "all" && (
                    <Badge variant="outline" className="px-3 py-1.5 text-[11px] gap-2 bg-blue-50/50 text-blue-700 border-blue-200/50 rounded-lg">
                      <Factory size={10} />
                      {companies.find(c => c.id.toString() === selectedCompanyId)?.company_name}
                      <X size={10} className="cursor-pointer hover:text-rose-500" onClick={() => setSelectedCompanyId("all")} />
                    </Badge>
                 )}

                  {selectedTypeId !== "all" && (
                    <Badge variant="outline" className="px-3 py-1.5 text-[11px] gap-2 bg-emerald-50/50 text-emerald-700 border-emerald-200/50 rounded-lg">
                      <ListFilter size={10} />
                      {types.find(t => t.id.toString() === selectedTypeId)?.item_type}
                      <X size={10} className="cursor-pointer hover:text-rose-500" onClick={() => setSelectedTypeId("all")} />
                    </Badge>
                 )}

                 {searchTerm && (
                    <Badge variant="outline" className="px-3 py-1.5 text-[11px] gap-2 bg-amber-50/50 text-amber-700 border-amber-200/50 rounded-lg">
                      <Search size={10} />
                      البحث: {searchTerm}
                      <X size={10} className="cursor-pointer hover:text-rose-500" onClick={() => setSearchTerm("")} />
                    </Badge>
                 )}
              </div>
            </div>
          </div>

          {/* Selection Actions Bar */}
          {selectedIds.length > 0 && (
            <div className="bg-primary/5 border-b p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-3">
                <Badge variant="default" className="bg-primary hover:bg-primary font-bold px-3 py-1">
                  {selectedIds.length} صنف مختار
                </Badge>
                <span className="text-sm font-bold text-primary">يمكنك تنفيذ إجراءات مجمعة على الأصناف المحددة</span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="rounded-xl font-bold gap-2 px-4 shadow-sm"
                  onClick={() => setIsBulkDeleteDialogOpen(true)}
                  disabled={loading || isDeletingBulk}
                >
                  <Trash2 size={16} />
                  حذف المحدد
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl font-bold bg-white"
                  onClick={() => setSelectedIds([])}
                >
                  إلغاء التحديد
                </Button>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="w-12 text-center py-4">
                    <Checkbox
                      checked={currentData.length > 0 && currentData.every((item: any) => selectedIds.includes(item.id))}
                      onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                      aria-label="Select all"
                      className="border-slate-300"
                    />
                  </TableHead>
                  <TableHead className="text-center font-bold py-4 whitespace-nowrap">
                    الشركة
                  </TableHead>
                  <TableHead className="text-center font-bold py-4 whitespace-nowrap">
                    الكود المركب
                  </TableHead>
                  <TableHead className="text-center font-bold py-4 whitespace-nowrap">
                    تسلسل داخلي
                  </TableHead>
                  <TableHead className="text-center font-bold py-4 whitespace-nowrap">
                    رقم الصنف
                  </TableHead>
                  <TableHead className="text-center font-bold py-4 whitespace-nowrap">
                    الصورة
                  </TableHead>
                  <TableHead className="text-center font-bold py-4 whitespace-nowrap">
                    الاسم (عربي)
                  </TableHead>
                  <TableHead className="text-center font-bold py-4 whitespace-nowrap">
                    الاسم (أجنبي)
                  </TableHead>
                  <TableHead className="text-center font-bold py-4 whitespace-nowrap">
                    كود المصنع
                  </TableHead>
                  <TableHead className="text-center font-bold py-4 whitespace-nowrap">
                    النوع
                  </TableHead>
                  <TableHead className="text-center font-bold py-4 whitespace-nowrap">
                    الوحدة
                  </TableHead>
                  <TableHead className="text-center font-bold py-4 whitespace-nowrap">
                    التعبئة
                  </TableHead>
                  <TableHead className="text-center font-bold py-4 whitespace-nowrap">
                    الوزن
                  </TableHead>
                  <TableHead className="text-center font-bold py-4 whitespace-nowrap">
                    الوزن القائم
                  </TableHead>
                  <TableHead className="text-center font-bold py-4 whitespace-nowrap">
                    السعر
                  </TableHead>
                  <TableHead className="text-center font-bold py-4 whitespace-nowrap">
                    صلاحية
                  </TableHead>
                  <TableHead className="text-center font-bold py-4 whitespace-nowrap">
                    GTIP
                  </TableHead>
                  <TableHead className="text-center font-bold py-4 whitespace-nowrap">
                    المرجع (الأب)
                  </TableHead>
                  <TableHead className="text-center font-bold py-4 whitespace-nowrap">
                    أساسي/فرعي
                  </TableHead>
                  <TableHead className="text-center font-bold py-4 whitespace-nowrap">
                    الحالة
                  </TableHead>
                  <TableHead className="text-center font-bold py-4 whitespace-nowrap">
                    إجراءات
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={20} className="text-center py-8">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={20}
                      className="text-center py-8 text-slate-500"
                    >
                      لا توجد نتائج بحث تطابق &quot;{searchTerm}&quot;
                    </TableCell>
                  </TableRow>
                ) : (
                  currentData.map((item: any) => (
                    <TableRow
                      key={item.id}
                      className={cn(
                        !item.ismain_item ? "bg-slate-50/30" : "",
                        selectedIds.includes(item.id) ? "bg-primary/5" : ""
                      )}
                    >
                      <TableCell className="text-center">
                         <Checkbox 
                           checked={selectedIds.includes(item.id)}
                           onCheckedChange={() => toggleSelect(item.id)}
                           className="border-slate-300"
                         />
                      </TableCell>
                      <TableCell className="font-bold text-blue-900 whitespace-nowrap text-center">
                         {item.companies?.company_name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        <Badge
                          variant="outline"
                          className="font-mono text-sm bg-indigo-50 border-indigo-200 text-indigo-700"
                        >
                          {item.composite_code || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-emerald-700 whitespace-nowrap text-center">
                        {item.internal_code}
                      </TableCell>
                      <TableCell className="font-mono text-slate-700 whitespace-nowrap text-center">
                        {item.item_code}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        {item.image ? (
                          <div className="w-10 h-10 mx-auto rounded overflow-hidden border border-slate-200 bg-white flex items-center justify-center">
                            <Image
                              src={item.image}
                              alt={item.item_ar_name}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 mx-auto rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300">
                            <ImageIcon size={16} />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-bold text-gray-900 whitespace-nowrap text-center">
                        {item.item_ar_name}
                      </TableCell>
                      <TableCell
                        className="text-gray-700 whitespace-nowrap text-center"
                        dir="ltr"
                      >
                        {item.item_en_name || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-blue-600 whitespace-nowrap text-center">
                        {item.manufacturer_code || "—"}
                      </TableCell>
                      <TableCell className="text-gray-600 whitespace-nowrap text-center">
                        {item.typeofitems?.item_type || "—"}
                      </TableCell>
                      <TableCell className="text-gray-600 whitespace-nowrap text-center">
                        {item.units?.unit_name || "—"}
                      </TableCell>
                      <TableCell
                        className="font-mono text-gray-600 whitespace-nowrap text-center"
                        dir="ltr"
                      >
                        {item.package || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-gray-600 whitespace-nowrap text-center">
                        {item.weight || 0}
                      </TableCell>
                      <TableCell className="font-mono text-gray-600 whitespace-nowrap text-center">
                        {item.packet_weight || 0}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        <span className="font-bold text-emerald-700">
                          {item.price
                            ? `$${parseFloat(item.price).toFixed(2)}`
                            : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        {item.date_exp
                          ? new Date(item.date_exp).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell className="font-mono text-indigo-600 whitespace-nowrap text-center">
                        {item.GTIP || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        {!item.ismain_item && item.parent_item ? (
                          <span className="text-slate-600 flex items-center justify-center gap-1">
                            <LinkIcon size={12} />{" "}
                            {item.parent_item.item_ar_name}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        {item.ismain_item ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                            أساسي
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-slate-600">
                            فرعي (نكهة)
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        {item.isActive ? (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                            فعال
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            غير فعال
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center sticky left-0 bg-white shadow-[-2px_0_5px_rgba(0,0,0,0.05)]">
                        <div className="flex justify-center items-center gap-2">
                          {item.ismain_item && hasPermission(PERMISSIONS.CREATE_COMP_ITEM) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedMainItemForFlavors(item);
                                setFlavorsList([]);
                                setFlavorInput("");
                                setIsAddFlavorsOpen(true);
                              }}
                              className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 h-8 w-8 rounded-lg"
                              title="إضافة نكهات"
                            >
                              <CopyPlus size={16} />
                            </Button>
                          )}
                          {hasPermission(PERMISSIONS.EDIT_COMP_ITEM) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(item)}
                              className="text-blue-500 hover:bg-blue-50 h-8 w-8 cursor-pointer"
                            >
                              <Edit size={16} />
                            </Button>
                          )}
                          {hasPermission(PERMISSIONS.DELETE_COMP_ITEM) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item.id)}
                              className="text-rose-500 hover:bg-rose-50 h-8 w-8 cursor-pointer"
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
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <div className="text-sm text-slate-500 font-medium">
                عرض {((currentPage - 1) * itemsPerPage) + 1} إلى {Math.min(currentPage * itemsPerPage, filteredData.length)} من أصل {filteredData.length} صنف
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border-slate-200 h-9"
                >
                  <ChevronRight size={16} className="ml-1" />
                  السابق
                </Button>
                <div className="text-sm font-bold text-emerald-700 mx-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                  {currentPage} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl border-slate-200 h-9"
                >
                  التالي
                  <ChevronLeft size={16} className="mr-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent
          className="sm:max-w-[420px] rounded-[32px] p-8 border-none shadow-2xl"
          dir="rtl"
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
              <AlertTriangle className="text-rose-600" size={32} />
            </div>
            <DialogTitle className="font-black text-slate-900 text-xl">
              حذف الصنف
            </DialogTitle>
            <DialogDescription className="font-bold text-slate-500 py-4">
              هل أنت متأكد من حذف الصنف{" "}
              <strong className="text-slate-900">{deleteTarget?.name}</strong>？
              هذا الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </div>
          <DialogFooter className="gap-3 mt-4 flex sm:justify-center">
            <Button
              onClick={confirmDelete}
              className="rounded-2xl h-12 flex-1 bg-rose-600 font-bold hover:bg-rose-700 transition-colors"
            >
              نعم، احذف
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-2xl h-12 flex-1 font-bold"
            >
              تراجع
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Flavors Dialog */}
      <Dialog open={isAddFlavorsOpen} onOpenChange={setIsAddFlavorsOpen}>
        <DialogContent
          className="sm:max-w-[500px] h-[90vh] md:h-auto max-h-[90vh] rounded-[32px] p-0 border-none shadow-2xl flex flex-col overflow-hidden bg-white"
          dir="rtl"
        >
          <div className="bg-white border-b border-slate-100 p-6 flex flex-col gap-2 relative shrink-0">
            <DialogTitle className="font-black text-slate-800 text-2xl">
              إضافة نكهات للصنف
            </DialogTitle>
            <DialogDescription className="font-bold text-slate-500 text-base">
              أدخل النكهات وسيتم توريث خصائص الصنف الأساسي لها
            </DialogDescription>
            {selectedMainItemForFlavors && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-100/50 border border-slate-200">
                <p className="text-xs font-bold text-slate-500 mb-1">الصنف الأساسي:</p>
                <p className="text-base text-emerald-700 font-bold">{selectedMainItemForFlavors.item_ar_name}</p>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col gap-6">
            <form onSubmit={handleAddFlavor} className="flex gap-2">
              <Input
                placeholder="اسم النكهة (مثال: تفاح، برتقال)"
                value={flavorInput}
                onChange={(e) => setFlavorInput(e.target.value)}
                className="flex-1 rounded-2xl bg-white border-slate-200 focus-visible:ring-emerald-500/20"
              />
              <Button type="submit" variant="default" className="rounded-2xl shrink-0 gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Plus size={16} /> إضافة للنكهات
              </Button>
            </form>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-700 flex items-center justify-between">
                <span>قائمة النكهات المراد إضافتها</span>
                <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs">{flavorsList.length}</span>
              </h4>
              {flavorsList.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-medium">
                  لم تقم بتحديد أية نكهات بعد
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {flavorsList.map((flavor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all hover:border-emerald-200">
                      <div className="flex flex-col flex-1 truncate pl-3">
                        <span className="font-bold text-emerald-700 text-sm mb-1 truncate">{flavor.name}</span>
                        <span className="text-xs text-slate-500 truncate" title={flavor.generatedName}>الاسم: {flavor.generatedName}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFlavor(index)}
                        className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 shrink-0 rounded-lg transition-colors"
                      >
                        <XCircle size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="bg-white border-t border-slate-100 p-6 flex gap-3 shrink-0">
            <Button
              onClick={handleSaveFlavors}
              disabled={flavorsList.length === 0 || isSavingFlavors}
              className="flex-1 border-none rounded-2xl h-12 shadow-md hover:shadow-lg transition-all bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSavingFlavors ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  جاري الحفظ...
                </span>
              ) : (
                "تأكيد الانشاء والحفظ"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAddFlavorsOpen(false)}
              className="rounded-2xl h-12 border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
              disabled={isSavingFlavors}
            >
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <DeleteConfirmDialog
         open={isBulkDeleteDialogOpen}
         onOpenChange={setIsBulkDeleteDialogOpen}
         title="حذف مجمع للأصناف"
         itemName={`${selectedIds.length} أصناف مختارة`}
         onConfirm={handleBulkDelete}
      />
    </div>
  );
}

function ProductStatCard({ title, value, icon, color, detail }: any) {
  const colorMap: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between transition-all hover:shadow-md hover:-translate-y-1 duration-300">
      <div className="flex flex-col">
        <span className="text-slate-400 text-[10px] font-black mb-1.5 uppercase tracking-widest leading-none">
          {title}
        </span>
        <span className="text-2xl font-black text-slate-900 leading-none tracking-tight tabular-nums">
          {value}
        </span>
        {detail && (
          <span className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
            {detail}
          </span>
        )}
      </div>
      <div
        className={cn(
          "h-12 w-12 rounded-2xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-110",
          colorMap[color],
        )}
      >
        {icon}
      </div>
    </div>
  );
}
