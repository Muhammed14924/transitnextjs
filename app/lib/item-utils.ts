import { prisma } from "@/app/lib/db";

/**
 * Re-sequences all items for a specific company to remove gaps in item_code and internal_code.
 * Also updates the composite_code accordingly.
 */
export async function resequenceItems(companyId: number) {
  // 1. Get company configuration
  const company = await prisma.companies.findUnique({
    where: { id: companyId },
    select: { company_code: true, first_internal_serial: true }
  });

  if (!company) return;

  // 2. Fetch all items for the company ordered by their current item_code
  // We use item_code as the primary sort, then fallback to id to keep the original creation order
  const items = await prisma.comp_items.findMany({
    where: { company_name: companyId },
    include: { typeofitems: true },
    orderBy: [
      { item_code: "asc" },
      { id: "asc" }
    ]
  });

  // 3. Iteratively update items to ensure continuous sequence
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const newItemCode = i + 1;
    const newInternalCode = company.first_internal_serial + i;
    
    const typeCode = item.typeofitems?.typecode || "000";
    const formattedItemCode = String(newItemCode).padStart(4, "0");
    const newCompositeCode = `${company.company_code}-${typeCode}-${formattedItemCode}`;

    // Only update if something changed to save DB operations
    if (
      item.item_code !== newItemCode || 
      item.internal_code !== newInternalCode || 
      item.composite_code !== newCompositeCode
    ) {
      await prisma.comp_items.update({
        where: { id: item.id },
        data: {
          item_code: newItemCode,
          internal_code: newInternalCode,
          composite_code: newCompositeCode
        }
      });
    }
  }
}
