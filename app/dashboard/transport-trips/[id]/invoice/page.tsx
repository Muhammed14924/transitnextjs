"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { 
  ArrowRight, 
  Save, 
  Plus, 
  Trash2, 
  Package, 
  FileText, 
  Loader2,
  AlertCircle,
  Building,
  User,
  MapPin,
  Calendar,
  Search,
  Check
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { apiClient } from "@/app/lib/api-client";
import { toast } from "sonner";
import { cn } from "@/app/lib/utils";

// --- Types ---
interface CompItem {
  id: number;
  item_ar_name: string;
  item_en_name?: string;
  composite_code?: string;
}

interface Unit {
  id: number;
  unit_name: string;
}

interface WaybillData {
  id: number;
  invoice_num: string;
  sender_company?: { id: number; company_name: string };
  trader?: { trader_name: string };
  destination?: { destination_name: string };
  trip?: { trip_number: string; truck_fare: number };
  loading_date?: string;
  discharge_date?: string;
  invoice_items?: any[];
}

// --- Searchable Item Select Component ---
function SearchableItemSelect({ 
  items, 
  value, 
  onChange, 
  placeholder = "البحث عن صنف..." 
}: { 
  items: CompItem[], 
  value: string, 
  onChange: (val: string) => void,
  placeholder?: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    if (!search) return items.slice(0, 50);
    const s = search.toLowerCase();
    return items.filter(item => 
      item.item_ar_name.toLowerCase().includes(s) || 
      item.item_en_name?.toLowerCase().includes(s) ||
      item.composite_code?.toLowerCase().includes(s)
    ).slice(0, 50);
  }, [items, search]);

  const selectedItem = items.find(i => i.id.toString() === value);

  return (
    <div className="relative">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full h-10 px-3 py-2 text-sm bg-white border rounded-md cursor-pointer hover:border-primary/50 transition-colors"
      >
        <span className={cn("truncate", !selectedItem && "text-muted-foreground")}>
          {selectedItem ? selectedItem.item_ar_name : placeholder}
        </span>
        <Search size={14} className="text-muted-foreground shrink-0 ml-2" />
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-[300px] overflow-hidden flex flex-col">
            <div className="p-2 border-b">
              <Input
                autoFocus
                placeholder="ابحث بالاسم أو الكود..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="overflow-y-auto flex-1">
              {filteredItems.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">لا توجد نتائج</div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onChange(item.id.toString());
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 text-xs cursor-pointer hover:bg-slate-50 transition-colors border-b last:border-0",
                      value === item.id.toString() && "bg-primary/5 text-primary font-bold"
                    )}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span>{item.item_ar_name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{item.composite_code}</span>
                    </div>
                    {value === item.id.toString() && <Check size={12} />}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// --- Main Page ---
export default function InvoiceItemsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [waybill, setWaybill] = useState<WaybillData | null>(null);
  const [products, setProducts] = useState<CompItem[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  const { register, control, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      items: [{ comp_item_id: "", unit_id: "", quantity: 1, notes: "" }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  // Master Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Waybill Details
        const res = await apiClient.getTripWaybillById(id);
        setWaybill(res);

        // 2. Fetch current invoice items and reset form
        const currentItems = await apiClient.getInvoiceItems(id);
        // If the API returns the whole waybill object with invoice_items
        if (currentItems && currentItems.invoice_items && currentItems.invoice_items.length > 0) {
          reset({
            items: currentItems.invoice_items.map((it: { comp_item_id: number; unit_id?: number; quantity: number; notes?: string }) => ({
              comp_item_id: it.comp_item_id.toString(),
              unit_id: it.unit_id?.toString() || "",
              quantity: it.quantity,
              notes: it.notes || ""
            }))
          });
        }

        // 3. Fetch Company Products (Seachable)
        if (res.sender_company_id) {
          const prods = await apiClient.request(`/api/comp_items?companyId=${res.sender_company_id}`);
          setProducts(prods || []);
        }

        // 4. Fetch Units
        const unitsRes = await apiClient.getUnits();
        setUnits(unitsRes || []);

      } catch (error) {
        console.error("Fetch Error:", error);
        toast.error("فشل تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, reset]);

  // Client-side date formatting to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const formattedDate = useMemo(() => {
    if (!mounted || !waybill?.loading_date) return "---";
    try {
      return new Date(waybill.loading_date).toLocaleDateString('ar-SA');
    } catch {
      return "---";
    }
  }, [mounted, waybill?.loading_date]);

  const onSubmit = async (data: any) => {
    try {
      setSaving(true);
      // Filter out empty items
      const validItems = data.items.filter((it: { comp_item_id: string }) => it.comp_item_id);
      
      await apiClient.saveInvoiceItems(id, validItems);
      toast.success("تم حفظ بنود الفاتورة بنجاح");
      router.back();
    } catch (_error) {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-muted-foreground font-bold">جاري تحميل تفاصيل الفاتورة...</p>
      </div>
    );
  }

  if (!waybill) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-200">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold">عذراً، الفاتورة غير موجودة</h2>
        <Button onClick={() => router.back()} className="mt-4 gap-2">
          <ArrowRight size={16} /> العودة للخلف
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 bg-slate-50/80 backdrop-blur-md py-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.back()}
            className="rounded-full h-10 w-10 hover:bg-white hover:shadow-sm"
          >
            <ArrowRight size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="text-primary" /> تفاصيل الفاتورة: {waybill.invoice_num || `INV-${waybill.id}`}
            </h1>
            <p className="text-slate-500 text-sm font-bold mt-1">
              إضافة وتعديل بنود البضائع لهذه البوليصة في النقل البري.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleSubmit(onSubmit)} 
            disabled={saving}
            className="rounded-xl px-8 font-black gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            حفظ البيانات
          </Button>
        </div>
      </div>

      {/* Waybill Master Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MasterInfoCard 
          icon={Building} 
          label="الشركة المرسلة" 
          value={waybill.sender_company?.company_name || "---"} 
          color="blue"
        />
        <MasterInfoCard 
          icon={User} 
          label="التاجر المستلم" 
          value={waybill.trader?.trader_name || "---"} 
          color="emerald"
        />
        <MasterInfoCard 
          icon={MapPin} 
          label="الوجهة النهائية" 
          value={waybill.destination?.destination_name || "---"} 
          color="orange"
        />
        <MasterInfoCard 
          icon={Calendar} 
          label="التاريخ" 
          value={formattedDate} 
          color="indigo"
        />
      </div>

      {/* Detail Form Area */}
      <Card className="rounded-[32px] border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
        <CardHeader className="border-b px-8 py-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <Package className="text-primary" size={20} />
              بنود البضائع (Line Items)
            </CardTitle>
            <Badge variant="outline" className="text-xs px-3 font-mono">
              Total lines: {fields.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-slate-50">
                  <TableHead className="w-[400px] text-right font-black text-slate-400 text-xs px-8 h-12">اسم الصنف (Searchable Product)</TableHead>
                  <TableHead className="w-[120px] font-black text-slate-400 text-xs px-4 h-12 text-center">العدد / الكمية</TableHead>
                  <TableHead className="w-[150px] text-right font-black text-slate-400 text-xs px-4 h-12">الوحدة</TableHead>
                  <TableHead className="text-right font-black text-slate-400 text-xs px-4 h-12">ملاحظات على البند</TableHead>
                  <TableHead className="w-[80px] text-center font-black text-slate-400 text-xs px-8 h-12">حذف</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id} className="group border-slate-50 hover:bg-slate-50/40 transition-colors">
                    <TableCell className="px-8 py-3">
                      <SearchableItemSelect
                        items={products}
                        value={watch(`items.${index}.comp_item_id`)}
                        onChange={(val) => setValue(`items.${index}.comp_item_id`, val)}
                      />
                    </TableCell>
                    <TableCell className="px-2 py-3">
                      <Input
                        type="number"
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        className="h-10 text-center font-bold bg-white rounded-md"
                        placeholder="0"
                        min="1"
                      />
                    </TableCell>
                    <TableCell className="px-2 py-3">
                      <select
                        {...register(`items.${index}.unit_id`)}
                        className="w-full h-10 px-3 text-sm bg-white border rounded-md focus:ring-1 focus:ring-primary outline-none"
                      >
                        <option value="">اختر الوحدة...</option>
                        {units.map(u => (
                          <option key={u.id} value={u.id}>{u.unit_name}</option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="px-2 py-3">
                      <Input
                        {...register(`items.${index}.notes`)}
                        placeholder="تاريخ الصلاحية، تشغيلة..."
                        className="h-10 bg-white rounded-md"
                      />
                    </TableCell>
                    <TableCell className="px-8 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="h-9 w-9 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="p-6 bg-slate-50/50 border-t flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ comp_item_id: "", unit_id: "", quantity: 1, notes: "" })}
              className="rounded-xl px-10 h-11 border-dashed border-2 hover:border-primary hover:text-primary hover:bg-slate-100 transition-all gap-2 font-black"
            >
              <Plus size={18} />
              إضافة بند فاتورة جديد
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Helper Components ---

function MasterInfoCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  const colorMap: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
  };

  return (
    <Card className="border-none shadow-sm rounded-3xl bg-white group overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={cn("p-4 rounded-2xl border transition-transform group-hover:scale-110 duration-500", colorMap[color] || colorMap.blue)}>
            <Icon size={22} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</span>
            <span className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{value}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Badge({ className, variant, children }: { className?: string, variant?: string, children: React.ReactNode }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      variant === "outline" ? "border bg-background text-foreground" : "bg-primary text-primary-foreground",
      className
    )}>
      {children}
    </span>
  );
}
