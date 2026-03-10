# Setup Instructions: Integrate n8n Webhook for Shipment Documents

Dear AI Assistant, we have successfully configured SeaweedFS and the n8n instance. We now need to trigger the n8n webhook immediately after a shipment document is successfully uploaded and its record is created in the database.

## Step 1: Locate Document Creation API
Locate the API route responsible for inserting a new record into the `shipment_documents` table. (This should be the route called by the Document Management Modal in `app/dashboard/shipments/page.tsx` after the file is uploaded to S3).

## Step 2: Implement Webhook Trigger
Modify the POST handler of that API route to include a fetch request to the n8n Webhook right AFTER the `prisma.shipment_documents.create()` call.

Here are the exact details for the Webhook:
* **URL:** `https://n8n.bifasyria.com/webhook-test/process-shipment-doc`
* **Method:** `POST`
* **Headers:** `{"Content-Type": "application/json"}`
* **Payload (Body):** The payload MUST include the following data from the newly created document:
  ```json
  {
    "documentId": newDocument.id,
    "shipmentId": newDocument.shipment_id,
    "documentType": newDocument.document_type,
    "fileUrl": newDocument.file_url,
    "fileName": newDocument.file_name
  }

Make sure to wrap the fetch call in a try...catch block so that if the webhook fails (e.g., n8n is down), it does not crash the app or prevent the user from seeing a "Upload Successful" message. Just log the webhook error to the console.

Step 3: Verify Frontend
Ensure that the Document Management Modal in app/dashboard/shipments/page.tsx correctly hits this updated API endpoint after getting the S3 URL from /api/upload-s3.
