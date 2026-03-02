"use client";

import { useEffect, useState, useCallback } from "react";
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
import { cn } from "@/app/lib/utils";
import { apiClient } from "@/app/lib/api-client";
import { toast } from "sonner";

interface Product {
  id: number;
  item_ar_name: string;
  item_en_name?: string;
  company_name: number;
  weight: number;
  price: number;
  typeofitems?: { item_type: string };
  companies?: { company_name: string };
  units?: { unit_name: string };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    item_ar_name: "",
    item_en_name: "",
    company_name: "",
    weight: 0,
    price: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsData, companiesData] = await Promise.all([
        apiClient.getProducts({ q: searchTerm }),
        apiClient.getCompanies(),
      ]);
      if (productsData) setProducts(productsData);
      if (companiesData) setCompanies(companiesData);
    } catch (error) {
      console.error("Failed to fetch products", error);
      toast.error("فشل في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createProduct({
        ...formData,
        company_name: parseInt(formData.company_name),
        weight: Number(formData.weight),
        price: Number(formData.price),
      });
      setIsAddDialogOpen(false);
      setFormData({
        item_ar_name: "",
        item_en_name: "",
        company_name: "",
        weight: 0,
        price: 0,
      });
      fetchData();
      toast.success("تمت إضافة الصنف بنجاح");
    } catch (error) {
      console.error("Error creating product", error);
      toast.error("حدث خطأ أثناء الإضافة");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      await apiClient.updateProduct(selectedProduct.id, {
        ...formData,
        company_name: parseInt(formData.company_name),
        weight: Number(formData.weight),
        price: Number(formData.price),
      });
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      fetchData();
      toast.success("تم تحديث الصنف بنجاح");
    } catch (error) {
      console.error("Error updating product", error);
      toast.error("حدث خطأ أثناء التحديث");
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      await apiClient.deleteProduct(selectedProduct.id);
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      fetchData();
      toast.success("تم حذف الصنف بنجاح");
    } catch (error) {
      console.error("Error deleting product", error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      item_ar_name: product.item_ar_name,
      item_en_name: product.item_en_name || "",
      company_name: product.company_name.toString(),
      weight: product.weight || 0,
      price: product.price || 0,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

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
            onClick={() => fetchData()}
            className="rounded-xl h-10 border-slate-200 text-slate-600 font-medium px-4"
          >
            تحديث البيانات
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl h-10 gap-2 bg-primary shadow-lg shadow-primary/20">
                <Plus size={16} />
                إضافة صنف جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-right text-slate-900">
                  إضافة صنف جديد
                </DialogTitle>
                <DialogDescription className="text-right text-slate-500">
                  أدخل تفاصيل الصنف الجديد ليتم تسجيله في النظام.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate}>
                <div className="grid gap-4 py-4 rtl text-right">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="item_ar_name"
                      className="font-bold text-slate-700"
                    >
                      الاسم بالعربي
                    </Label>
                    <Input
                      id="item_ar_name"
                      value={formData.item_ar_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          item_ar_name: e.target.value,
                        })
                      }
                      className="rounded-xl h-11 bg-slate-50 border-slate-200"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="item_en_name"
                      className="font-bold text-slate-700"
                    >
                      الاسم بالإنجليزي
                    </Label>
                    <Input
                      id="item_en_name"
                      value={formData.item_en_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          item_en_name: e.target.value,
                        })
                      }
                      className="rounded-xl h-11 bg-slate-50 border-slate-200"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="company_id"
                      className="font-bold text-slate-700"
                    >
                      الشركة
                    </Label>
                    <select
                      id="company_id"
                      value={formData.company_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          company_name: e.target.value,
                        })
                      }
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900"
                      required
                    >
                      <option value="">اختر الشركة...</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.company_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="weight"
                        className="font-bold text-slate-700"
                      >
                        الوزن
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            weight: Number(e.target.value),
                          })
                        }
                        className="rounded-xl h-11 bg-slate-50 border-slate-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="price"
                        className="font-bold text-slate-700"
                      >
                        السعر
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price: Number(e.target.value),
                          })
                        }
                        className="rounded-xl h-11 bg-slate-50 border-slate-200"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex-row-reverse sm:justify-start gap-2 pt-4">
                  <Button
                    type="submit"
                    className="rounded-xl px-10 h-11 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ProductStatCard
          title="إجمالي الأصناف"
          value={loading ? "..." : products.length.toString()}
          icon={<Box size={20} />}
          color="blue"
        />
        <ProductStatCard
          title="متوفر حالياً"
          value={loading ? "..." : products.length.toString()}
          icon={<Tag size={20} />}
          color="amber"
          detail="أصناف نشطة"
        />
        <ProductStatCard
          title="فئات المنتجات"
          value={loading ? "..." : "8"}
          icon={<LayoutGrid size={20} />}
          color="emerald"
          detail="تصنيفات النظام"
        />
        <ProductStatCard
          title="الشركات المتعاونة"
          value={loading ? "..." : companies.length.toString()}
          icon={<BarChart2 size={20} />}
          color="rose"
          detail="ملاك البضائع"
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
              placeholder="ابحث عن اسم الصنف..."
              className="pr-10 bg-slate-50 focus-visible:ring-primary/20 rounded-xl h-11 text-xs transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-11 rounded-xl gap-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-slate-100 hover:border-slate-200 px-4"
            >
              <ListFilter size={16} />
              <span>تصفية متقدمة</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/40">
              <TableRow className="border-slate-100 h-12">
                <TableHead className="text-right font-black text-slate-700 text-xs px-6 uppercase tracking-widest">
                  المعرف
                </TableHead>
                <TableHead className="text-right font-black text-slate-700 text-xs px-4 uppercase tracking-widest">
                  اسم الصنف
                </TableHead>
                <TableHead className="text-center font-black text-slate-700 text-xs px-4 uppercase tracking-widest">
                  الشركة المالكة
                </TableHead>
                <TableHead className="text-center font-black text-slate-700 text-xs px-4 uppercase tracking-widest">
                  الوزن / السعر
                </TableHead>
                <TableHead className="text-center font-black text-slate-700 text-xs px-6 uppercase tracking-widest">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow
                    key={product.id}
                    className="hover:bg-slate-50/30 transition-colors border-slate-50 h-[80px] group"
                  >
                    <TableCell className="px-6">
                      <span className="font-bold text-slate-400 text-xs tracking-wider">
                        #{product.id}
                      </span>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-bold text-slate-900 text-sm">
                          {product.item_ar_name}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Badge className="h-5 px-2 py-0 text-[10px] bg-indigo-50 text-indigo-600 font-black border-none">
                            {product.typeofitems?.item_type || "صنف عام"}
                          </Badge>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            /{product.units?.unit_name || "طرد"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center px-4">
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                        {product.companies?.company_name || "غير محدد"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center px-4">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-black text-slate-900">
                          {product.weight} كجم
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                          {product.price} ر.س
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex items-center justify-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(product)}
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
                            className="w-40 rounded-2xl p-2 border-slate-100 shadow-xl"
                          >
                            <DropdownMenuItem className="p-3 text-sm focus:bg-slate-50 rounded-xl gap-3 cursor-pointer">
                              <PackageSearch
                                size={16}
                                className="text-slate-400"
                              />{" "}
                              معاينة
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(product)}
                              className="p-3 text-sm focus:bg-rose-50 text-rose-600 rounded-xl gap-3 cursor-pointer"
                            >
                              <Trash2 size={16} /> حذف
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
                    colSpan={5}
                    className="text-center py-24 text-slate-400"
                  >
                    {loading ? "جاري تحميل الأصناف..." : "لا توجد منتجات مسجلة"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/20 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
              نظام إدارة المخزونv3.0 • {products.length} صنف
            </span>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>البيانات محدثة ومزامنة</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-right text-slate-900">
              تعديل بيانات الصنف
            </DialogTitle>
            <DialogDescription className="text-right text-slate-500">
              قم بتحديث معلومات الصنف واضغط على حفظ.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-4 py-4 rtl text-right">
              <div className="space-y-1.5">
                <Label
                  htmlFor="edit_item_ar_name"
                  className="font-bold text-slate-700"
                >
                  الاسم بالعربي
                </Label>
                <Input
                  id="edit_item_ar_name"
                  value={formData.item_ar_name}
                  onChange={(e) =>
                    setFormData({ ...formData, item_ar_name: e.target.value })
                  }
                  className="rounded-xl h-11 bg-slate-50 border-slate-200"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="edit_item_en_name"
                  className="font-bold text-slate-700"
                >
                  الاسم بالإنجليزي
                </Label>
                <Input
                  id="edit_item_en_name"
                  value={formData.item_en_name}
                  onChange={(e) =>
                    setFormData({ ...formData, item_en_name: e.target.value })
                  }
                  className="rounded-xl h-11 bg-slate-50 border-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="edit_company_id"
                  className="font-bold text-slate-700"
                >
                  الشركة
                </Label>
                <select
                  id="edit_company_id"
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-900"
                  required
                >
                  <option value="">اختر الشركة...</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="edit_weight"
                    className="font-bold text-slate-700"
                  >
                    الوزن
                  </Label>
                  <Input
                    id="edit_weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weight: Number(e.target.value),
                      })
                    }
                    className="rounded-xl h-11 bg-slate-50 border-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="edit_price"
                    className="font-bold text-slate-700"
                  >
                    السعر
                  </Label>
                  <Input
                    id="edit_price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: Number(e.target.value),
                      })
                    }
                    className="rounded-xl h-11 bg-slate-50 border-slate-200"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex-row-reverse sm:justify-start gap-2 pt-4">
              <Button
                type="submit"
                className="rounded-xl px-10 h-11 font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
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
            <div className="h-14 w-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100 rotate-12 transition-transform hover:rotate-0">
              <AlertTriangle className="text-rose-600" size={28} />
            </div>
            <DialogTitle className="text-center font-black text-slate-900 text-xl tracking-tight">
              إزالة الصنف
            </DialogTitle>
            <DialogDescription className="text-center text-slate-500 leading-relaxed py-2 px-4">
              أنت على وشك حذف{" "}
              <span className="font-black text-slate-900">
                "{selectedProduct?.item_ar_name}"
              </span>
              . سوف يختفي من النظام نهائياً. هل أنت متأكد؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-3 mt-6">
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="rounded-xl h-12 w-full sm:flex-1 bg-rose-600 hover:bg-rose-700 font-black shadow-lg shadow-rose-200"
            >
              نعم، إزالة الصنف
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-xl h-12 w-full sm:flex-1 font-bold text-slate-600 border-slate-200 bg-slate-50/50"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
