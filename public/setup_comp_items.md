# Setup Instructions: Advanced Company Items (Products) Table

Dear AI Assistant, please execute the following steps to refactor the `comp_items` table. This involves complex ERP logic for auto-generating internal serials, composite item codes, and handling Parent-Child product relationships (Item Variants).

## Step 1: Update Prisma Schema and Migrate
1. Open `prisma/schema.prisma`.
2. Find the existing `comp_items` model and replace it with this code:

```prisma
model comp_items {
  id               Int       @id @default(autoincrement())
  
  // -- الحقول المولدة آلياً --
  internal_code    Int       // التسلسل الداخلي (مثال: 1000001)
  item_code        Int       // ترتيب المنتج ضمن الشركة (1, 2, 3...)
  composite_code   String?   @unique @db.VarChar(50) // الكود المركب (مثال: 001-015-0005)
  
  // -- البيانات الأساسية --
  item_ar_name     String    @db.VarChar(100)
  item_en_name     String?   @db.VarChar(100)
  price            Decimal?  @default(0.00) @db.Decimal(10, 2)
  weight           Decimal?  @default(0) @db.Decimal(10, 2)
  package          String?   @db.VarChar(50)
  packet_weight    Decimal?  @default(0) @db.Decimal(10, 2)
  image            String?   @db.VarChar(255)
  date_exp         DateTime? @db.Date
  GTIP             Int?
  
  // -- نظام المنتجات الفرعية والرئيسية --
  ismain_item      Boolean   @default(false)
  main_item        Int?      // ID المنتج الرئيسي (يُترك فارغاً إذا كان هو الرئيسي)
  
  // -- حقول الحالة --
  isActive         Boolean   @default(true)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  // -- المفاتيح الأجنبية --
  company_name     Int       // يمثل company_id لكن احتفظنا بالاسم القديم لعدم كسر القاعدة
  item_type        Int?
  unit             Int       @default(1)

  // -- العلاقات --
  companies        companies     @relation(fields: [company_name], references: [id], onDelete: NoAction, onUpdate: NoAction)
  typeofitems      typeofitems?  @relation(fields: [item_type], references: [id], onDelete: NoAction, onUpdate: NoAction)
  units            units         @relation(fields: [unit], references: [id], onDelete: NoAction, onUpdate: NoAction)
  
  parent_item      comp_items?   @relation("ItemVariants", fields: [main_item], references: [id])
  variants         comp_items[]  @relation("ItemVariants")

  codes_tables     codes_tables[]
  material_codes   material_codes[]

  @@index([company_name])
  @@index([item_type])
  @@index([unit])
  @@index([main_item])
}

Run the migration:

Bash
npx prisma migrate dev --name enhance_comp_items_erp_logic
Step 2: Create Backend API Routes
Overwrite or create files in app/api/comp_items/.

File 1: app/api/comp_items/route.ts (Contains the ERP generation logic)

TypeScript
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function GET() {
  try {
    const items = await prisma.comp_items.findMany({
      include: {
        companies: true,
        typeofitems: true,
        units: true,
        parent_item: true, // جلب بيانات المنتج الرئيسي إن وجد
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Error fetching items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "GUEST") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    let {
      item_ar_name, item_en_name, company_name, item_type, unit,
      price, weight, package: pkg, packet_weight, ismain_item, main_item, isActive
    } = body;

    // 1. Fetch Company Info
    const company = await prisma.companies.findUnique({ where: { id: parseInt(company_name) } });
    if (!company) throw new Error("Company not found");

    // 2. Fetch Item Type Info
    let typeCode = "000";
    if (item_type) {
      const typeInfo = await prisma.typeofitems.findUnique({ where: { id: parseInt(item_type) } });
      if (typeInfo) typeCode = typeInfo.typecode;
    }

    // 3. Generate internal_code
    const lastInternalCodeItem = await prisma.comp_items.findFirst({
      where: { company_name: parseInt(company_name) },
      orderBy: { internal_code: "desc" }
    });
    
    const internal_code = lastInternalCodeItem && lastInternalCodeItem.internal_code 
      ? lastInternalCodeItem.internal_code + 1 
      : company.first_internal_serial;

    // 4. Generate item_code (Sequence within company)
    const lastItemCode = await prisma.comp_items.findFirst({
      where: { company_name: parseInt(company_name) },
      orderBy: { item_code: "desc" }
    });
    
    const item_code = lastItemCode && lastItemCode.item_code ? lastItemCode.item_code + 1 : 1;

    // 5. Build composite_code: CompanyCode - TypeCode - ItemCode(4 digits)
    const formattedItemCode = String(item_code).padStart(4, '0');
    const composite_code = `${company.company_code}-${typeCode}-${formattedItemCode}`;

    // Create item
    const newItem = await prisma.comp_items.create({
      data: {
        item_ar_name,
        item_en_name: item_en_name || null,
        company_name: parseInt(company_name),
        item_type: item_type ? parseInt(item_type) : null,
        unit: unit ? parseInt(unit) : 1,
        price: price ? parseFloat(price) : 0,
        weight: weight ? parseFloat(weight) : 0,
        package: pkg || null,
        packet_weight: packet_weight ? parseFloat(packet_weight) : 0,
        ismain_item: ismain_item || false,
        main_item: (!ismain_item && main_item) ? parseInt(main_item) : null,
        internal_code,
        item_code,
        composite_code,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: { companies: true, typeofitems: true, units: true }
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    console.error("Error creating item:", error);
    return NextResponse.json({ error: error.message || "Error creating item" }, { status: 500 });
  }
}
File 2: app/api/comp_items/[id]/route.ts

TypeScript
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/db";
import { getCurrentUser } from "@/app/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "GUEST") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { item_ar_name, item_en_name, price, weight, package: pkg, packet_weight, isActive, ismain_item, main_item } = body;

    const updatedItem = await prisma.comp_items.update({
      where: { id: Number(params.id) },
      data: {
        item_ar_name,
        item_en_name: item_en_name || null,
        price: price ? parseFloat(price) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        package: pkg || null,
        packet_weight: packet_weight ? parseFloat(packet_weight) : undefined,
        ismain_item: ismain_item !== undefined ? ismain_item : undefined,
        main_item: (!ismain_item && main_item) ? parseInt(main_item) : null,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    return NextResponse.json({ error: "Error updating item" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role === "GUEST") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.comp_items.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Cannot delete item. It has dependencies." }, { status: 500 });
  }
}
Step 3: Update Frontend Dashboard Page
Overwrite app/dashboard/company-items/page.tsx with this code:

TypeScript
"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, PackageSearch, Layers, Box, Link as LinkIcon } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { Badge } from "@/app/components/ui/badge";
import { apiClient } from "@/app/lib/api-client";
import { toast } from "sonner";

export default function CompanyItemsPage() {
  const [data, setData] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const initialAddState = {
    item_ar_name: "", item_en_name: "", company_name: "", item_type: "", unit: "1",
    price: 0, weight: 0, package: "", packet_weight: 0, ismain_item: true, main_item: "", isActive: true
  };

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addData, setAddData] = useState(initialAddState);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editData, setEditData] = useState<any>(initialAddState);

  const fetchData = async () => {
    try {
      const [itemsRes, compRes, typesRes, unitsRes] = await Promise.all([
        apiClient.getCompItems(),
        apiClient.getCompanies(),
        apiClient.getTypeofitems(),
        apiClient.getUnits()
      ]);
      setData(itemsRes || []);
      setCompanies(compRes || []);
      setTypes(typesRes || []);
      setUnits(unitsRes || []);
    } catch (e) { toast.error("فشل جلب البيانات"); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addData.company_name) return toast.error("يجب اختيار الشركة");
    try {
      await apiClient.createCompItem(addData);
      toast.success("تم إنشاء الصنف وتوليد الأكواد بنجاح");
      setIsAddOpen(false);
      setAddData(initialAddState);
      fetchData();
    } catch (e: any) { toast.error(e.message || "خطأ في الإضافة"); }
  };

  const handleEditClick = (item: any) => {
    setEditData({
      ...item,
      company_name: item.company_name.toString(),
      item_type: item.item_type?.toString() || "",
      unit: item.unit?.toString() || "1",
      main_item: item.main_item?.toString() || ""
    });
    setIsEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.updateCompItem(editData.id, editData);
      toast.success("تم التعديل بنجاح");
      setIsEditOpen(false);
      fetchData();
    } catch (e) { toast.error("خطأ في التعديل"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      await apiClient.deleteCompItem(id);
      toast.success("تم الحذف بنجاح");
      fetchData();
    } catch (e) { toast.error("خطأ في الحذف"); }
  };

  // فلترة المنتجات الرئيسية للشركة المختارة لتظهر في قائمة "منتج فرعي من"
  const availableMainItems = data.filter(item => 
    item.company_name.toString() === addData.company_name && item.ismain_item === true
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2"><PackageSearch className="text-primary"/> إدارة الأصناف والمنتجات</h1>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary rounded-xl px-6"><Plus size={16} /> إضافة صنف جديد</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl p-6 text-right" dir="rtl">
            <DialogHeader><DialogTitle className="text-xl font-bold border-b pb-4">إضافة صنف جديد للشركة</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-6 pt-2">
              
              {/* قسم التبعية والشركة */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label className="font-bold text-blue-800">الشركة الموردة *</Label>
                  <select required value={addData.company_name} onChange={(e) => setAddData({ ...addData, company_name: e.target.value })} className="flex h-10 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm">
                    <option value="">-- اختر الشركة --</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                  </select>
                </div>
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label className="font-bold text-blue-800">نوع الصنف (لتوليد الكود)</Label>
                  <select value={addData.item_type} onChange={(e) => setAddData({ ...addData, item_type: e.target.value })} className="flex h-10 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm">
                    <option value="">-- اختر النوع --</option>
                    {types.map(t => <option key={t.id} value={t.id}>{t.item_type}</option>)}
                  </select>
                </div>
              </div>

              {/* قسم اسم الصنف */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">اسم الصنف (عربي) *</Label>
                  <Input required value={addData.item_ar_name} onChange={(e) => setAddData({ ...addData, item_ar_name: e.target.value })} className="rounded-xl" placeholder="عصير مانجو..." />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">اسم الصنف (أجنبي)</Label>
                  <Input value={addData.item_en_name} onChange={(e) => setAddData({ ...addData, item_en_name: e.target.value })} className="rounded-xl text-left" dir="ltr" />
                </div>
              </div>

              {/* قسم المنتج الرئيسي أو الفرعي */}
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 space-y-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="ismain" checked={addData.ismain_item} onChange={(e) => setAddData({ ...addData, ismain_item: e.target.checked, main_item: "" })} className="w-4 h-4 rounded text-primary" />
                  <Label htmlFor="ismain" className="font-bold cursor-pointer text-emerald-900">هذا هو صنف أساسي (رئيسي)</Label>
                </div>
                
                {!addData.ismain_item && (
                  <div className="space-y-2">
                    <Label className="font-bold flex items-center gap-2 text-emerald-800"><LinkIcon size={14}/> هذا الصنف نكهة/فرع تابع للمنتج الأساسي:</Label>
                    <select required={!addData.ismain_item} value={addData.main_item} onChange={(e) => setAddData({ ...addData, main_item: e.target.value })} className="flex h-10 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm">
                      <option value="">-- اختر المنتج الأساسي --</option>
                      {availableMainItems.map(m => <option key={m.id} value={m.id}>{m.item_ar_name}</option>)}
                    </select>
                    {availableMainItems.length === 0 && addData.company_name && <p className="text-xs text-rose-500">لا يوجد منتجات رئيسية لهذه الشركة بعد.</p>}
                  </div>
                )}
              </div>

              {/* التفاصيل اللوجستية */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">الوحدة</Label>
                  <select value={addData.unit} onChange={(e) => setAddData({ ...addData, unit: e.target.value })} className="flex h-10 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm">
                    {units.map(u => <option key={u.id} value={u.id}>{u.unit_name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">التعبئة (Package)</Label>
                  <Input value={addData.package} onChange={(e) => setAddData({ ...addData, package: e.target.value })} className="rounded-xl" placeholder="6x24" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">الوزن (صنف)</Label>
                  <Input type="number" step="0.01" value={addData.weight} onChange={(e) => setAddData({ ...addData, weight: parseFloat(e.target.value) || 0 })} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">وزن الطرد</Label>
                  <Input type="number" step="0.01" value={addData.packet_weight} onChange={(e) => setAddData({ ...addData, packet_weight: parseFloat(e.target.value) || 0 })} className="rounded-xl" />
                </div>
              </div>

              <Button type="submit" className="w-full rounded-xl mt-4">حفظ وتوليد الأكواد آلياً</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="text-right font-bold py-4">الشركة</TableHead>
                  <TableHead className="text-right font-bold py-4">الكود المركب</TableHead>
                  <TableHead className="text-right font-bold py-4">تسلسل داخلي</TableHead>
                  <TableHead className="text-right font-bold py-4">اسم الصنف</TableHead>
                  <TableHead className="text-right font-bold py-4">النوع / التعبئة</TableHead>
                  <TableHead className="text-right font-bold py-4">التصنيف</TableHead>
                  <TableHead className="text-center font-bold py-4 w-[100px]">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8">جاري التحميل...</TableCell></TableRow>
                ) : data.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-slate-500">لا توجد أصناف</TableCell></TableRow>
                ) : (
                  data.map((item: any) => (
                    <TableRow key={item.id} className={!item.ismain_item ? "bg-slate-50/30" : ""}>
                      <TableCell className="font-bold text-blue-900">{item.companies?.company_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-sm bg-indigo-50 border-indigo-200 text-indigo-700">
                          {item.composite_code || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-emerald-700">{item.internal_code}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-bold text-gray-900">{item.item_ar_name}</p>
                          {!item.ismain_item && item.parent_item && (
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><LinkIcon size={10}/> فرع من: {item.parent_item.item_ar_name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {item.typeofitems?.item_type || "—"} <br/>
                        <span className="text-xs text-slate-400" dir="ltr">{item.package}</span>
                      </TableCell>
                      <TableCell>
                        {item.ismain_item 
                          ? <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">أساسي</Badge> 
                          : <Badge variant="secondary" className="text-slate-600">فرعي (نكهة)</Badge>}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(item)} className="text-blue-500 hover:bg-blue-50 h-8 w-8"><Edit size={16} /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-rose-500 hover:bg-rose-50 h-8 w-8"><Trash2 size={16} /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}