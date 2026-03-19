# Refactoring Transport Module: Moving Route/Source Logic to Trip Level (TMS Standard)

Dear AI Assistant, the user has provided a brilliant architectural correction. The "Source" and "Route Type" define the physical Truck Trip, NOT the individual Waybills. A truck is dispatched for a specific mission (from a Factory, from a Port Container, or from a Depot to a Depot), and all waybills inside it inherit this origin.

Please refactor the database, API, and UI sequentially:

## STEP 1: Refactor Prisma Schema
Open `prisma/schema.prisma` and make these changes:

**1. Update `transport_trips`:**
Add the route type and the conditional source/destination fields.
```prisma
// Add inside transport_trips:
route_type            String?   @db.VarChar(50) // E.g., 'DIRECT_FACTORY', 'TRANSIT_PORT', 'INTERNAL_DEPOT'

// Conditional Sources based on route_type:
source_company_id     Int?
source_container_id   Int?
source_depot_id       Int?
destination_depot_id  Int?      // Main destination for the truck

// Relations (ensure to add inverse arrays in the respective models):
source_company        companies?           @relation("TripSourceCompany", fields: [source_company_id], references: [id])
source_container      shipment_containers? @relation("TripSourceContainer", fields: [source_container_id], references: [id])
source_depot          depots?              @relation("TripSourceDepot", fields: [source_depot_id], references: [id])
destination_depot     depots?              @relation("TripDestinationDepot", fields: [destination_depot_id], references: [id])
(Ensure companies, shipment_containers, and depots models get the inverse relations like transport_trips transport_trips[] @relation("TripSourceCompany") etc.)

2. Clean up trip_waybills:
Remove the source-related fields from the waybill, as it now inherits them from the Trip.

REMOVE: sender_company_id, container_id, sender_depot_id (and their relations).

Keep trader_id, destination_id, weight, quantity, invoice_num, etc.

Run npx prisma db push.

STEP 2: Refactor Frontend Dynamic Form (Add Transport Trip)
In the UI where a user creates a new transport trip (app/dashboard/transport/page.tsx or its modal):

Trip Master Form (The Route Selector):

Add a Select/Radio group for route_type (Factory, Port/Container, Internal Depot).

Use watch from react-hook-form to conditionally render the source fields:

If FACTORY: Show Combobox for source_company_id.

If PORT: Show Combobox for source_container_id (fetching from maritime containers).

If INTERNAL_DEPOT: Show Comboboxes for source_depot_id AND destination_depot_id.

Ensure these fields are prominent at the TOP of the form before adding waybills.

Waybills Array (Details):

The Waybill sub-form is now much cleaner! It only needs: trader_id, destination_id, weight, quantity, and notes.

STEP 3: Backend Invoice Generation Logic
In the POST /api/transport-trips/route.ts (handling the creation of the trip and nested waybills):
Generate the invoice_num for each waybill based on the TRIP's source sequence.

If route_type === 'DIRECT_FACTORY', fetch Sequence1 from the companies table using source_company_id, increment it, and assign it to the waybill's invoice_num.

If route_type === 'INTERNAL_DEPOT', fetch Sequence1 from the depots table using source_depot_id, increment it, and assign it to the waybill.
(Wrap this in a Prisma $transaction to ensure sequence integrity).

Please ensure the UI dynamically toggles the inputs based on the selected route_type using clean conditional rendering.