# Comprehensive Restructuring of Transit Shipments Module (Manual Entry + S3 Integration)

Dear AI Assistant, we are pivoting the architectural design of the `transit_shipments` module. We are moving away from immediate AI extraction and focusing on a robust manual-entry "Master-Detail" relational architecture. 

Please execute the following changes sequentially:

## STEP 1: Update Prisma Schema
Open `prisma/schema.prisma` and make the following structural changes:

1. **Modify `transit_shipments` model:**
   - **KEEP:** `id`, `bl_number` (make it the ONLY required string field), `shipping_company`, `sender_company_id`, `port_of_loading`, `port_of_discharge`, `status`, `arrival_date`, `isActive`, `createdAt`, `updatedAt`, and its relations to ports/companies.
   - **REMOVE:** `shipment_number`, `total_containers`, `containers_numbers`, `total_gross_weight`. (These belong to the container level now).
   - **ADD:** `expected_discharge_date` (DateTime? @db.Date), and `free_time_days` (Int? @default(14)).
   - **ADD RELATION:** `containers shipment_containers[]`

2. **Create `shipment_containers` model:**
   ```prisma
   model shipment_containers {
     id                         Int       @id @default(autoincrement())
     shipment_id                Int
     container_number           String    @db.VarChar(50)
     container_type             String?   @db.VarChar(20) // e.g., '20', '40', '40HC'
     weight                     Decimal?  @db.Decimal(12, 2)
     empty_return_date          DateTime? @db.Date
     customs_declaration_number String?   @db.VarChar(50) // Replaces old shipment_number
     hs_code                    String?   @db.VarChar(50) // HS Code / GITP
     
     shipment                   transit_shipments @relation(fields: [shipment_id], references: [id], onDelete: Cascade)
     items                      container_items[]
   }


Create container_items model (Junction table):

Code snippet
model container_items {
  id               Int       @id @default(autoincrement())
  container_id     Int
  comp_item_id     Int       // Relation to your existing comp_items table

  container        shipment_containers @relation(fields: [container_id], references: [id], onDelete: Cascade)
  comp_item        comp_items          @relation(fields: [comp_item_id], references: [id])
}
After updating the schema, run npx prisma db push to sync the database.

STEP 2: Revamp the "Add Shipment" Frontend Form
Navigate to the component responsible for creating new transit shipments (likely in app/dashboard/shipments/page.tsx or its child components).

Master Form (Shipment Info):

The form MUST have bl_number as the only strictly required input (Zod validation).

Add inputs for the new fields: expected_discharge_date and free_time_days.

S3 Integration: Embed a file upload dropzone directly into this master form to upload the "Bill of Lading" document. It should hit the /api/upload-s3 endpoint.

Detail Form (Containers Array):

Implement a dynamic form array (e.g., using useFieldArray from react-hook-form).

Add a "➕ Add Container" button.

When clicked, it should present a sub-form/modal containing: Container Number, Type (20/40), Weight, Empty Return Date, Customs Declaration Number, and HS Code.

Items Selector: Inside the container sub-form, include a multi-select dropdown fetching data from /api/comp_items so the user can tag multiple existing items to this specific container.

STEP 3: Update the Backend API (app/api/shipments/route.ts)
Update the POST route to handle nested creation:

Receive the master shipment data, the array of containers (with their attached item IDs), and the uploaded S3 fileUrl for the Bill of Lading.

Use Prisma's create with include to wrap everything in a single transaction:

Create the transit_shipments record.

Nested create the shipment_containers and their nested container_items.

Nested create a record in shipment_documents linking the newly uploaded Bill of Lading S3 URL to this shipment.

Please ensure the UI uses modern standard components (Tailwind + Shadcn UI if available in the project) and provides clear success/error toast notifications.