// app/lib/api-client.ts
//const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
class ApiClient {
  async request(endpoint: string, options: RequestInit = {}) {
    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (!isFormData && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const config: RequestInit = {
      ...options,
      headers,
      // هذا السطر مهم جداً لإرسال التوكن (Cookies) مع كل طلب
      credentials: "include",
    };

    const response = await fetch(endpoint, config);

    if (response.status === 401) return null;

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "حدث خطأ أثناء الاتصال بالخادم");
    }

    return response.json();
  }

  async getCurrentUser() {
    return this.request("/api/auth/me");
  }

  async logout() {
    return this.request("/api/auth/logout", { method: "POST" });
  }

  // Upload
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return this.request("/api/upload", {
      method: "POST",
      body: formData,
    });
  }

  // Dashboard Stats
  async getDashboardStats() {
    return this.request("/api/dashboard/stats");
  }

  // Shipments
  async getShipments(params?: {
    limit?: number;
    offset?: number;
    status?: string;
    q?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) searchParams.append(key, value.toString());
      });
    }
    return this.request(`/api/shipments?${searchParams.toString()}`);
  }

  async createShipment(data: Record<string, unknown>) {
    return this.request("/api/shipments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getShipmentById(id: number | string) {
    return this.request(`/api/shipments/${id}`);
  }

  async updateShipment(id: number | string, data: Record<string, unknown>) {
    return this.request(`/api/shipments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async getShipmentDocuments(shipmentId: number | string) {
    return this.request(`/api/shipments/${shipmentId}/documents`);
  }

  async createShipmentDocument(shipmentId: number | string, data: Record<string, unknown>) {
    return this.request(`/api/shipments/${shipmentId}/documents`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteShipmentDocument(shipmentId: number | string, docId: number | string) {
    return this.request(`/api/shipments/${shipmentId}/documents/${docId}`, {
      method: "DELETE",
    });
  }

  async uploadToS3(file: File, folder?: string) {
    const formData = new FormData();
    formData.append("file", file);
    
    let url = "/api/upload-s3";
    if (folder) {
      url += `?folder=${encodeURIComponent(folder)}`;
    }

    // Don't set Content-Type header for FormData - browser sets it with boundary
    return this.request(url, {
      method: "POST",
      body: formData,
    });
  }

  async deleteFromS3(fileUrl: string) {
    return this.request(`/api/upload-s3?fileUrl=${encodeURIComponent(fileUrl)}`, {
      method: "DELETE",
    });
  }

  async getShippingCompanies() {
    return this.request("/api/transport-companies");
  }

  async deleteShipment(id: number | string) {
    return this.request(`/api/shipments/${id}`, {
      method: "DELETE",
    });
  }

  // Companies
  async getCompanies(q?: string) {
    const url = q
      ? `/api/companies?q=${encodeURIComponent(q)}`
      : "/api/companies";
    return this.request(url);
  }

  async createCompany(data: Record<string, unknown>) {
    return this.request("/api/companies", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Products
  async getProducts(params?: { companyId?: number; q?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.companyId)
      searchParams.append("companyId", params.companyId.toString());
    if (params?.q) searchParams.append("q", params.q);
    return this.request(`/api/products?${searchParams.toString()}`);
  }

  async createProduct(data: Record<string, unknown>) {
    return this.request("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }


  // Traders
  async getTraders(q?: string) {
    const url = q ? `/api/traders?q=${encodeURIComponent(q)}` : "/api/traders";
    return this.request(url);
  }

  async createTrader(data: Record<string, unknown>) {
    return this.request("/api/traders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Users
  async getUsers(q?: string) {
    const url = q ? `/api/user?q=${encodeURIComponent(q)}` : "/api/user";
    return this.request(url);
  }

  async createUser(data: Record<string, unknown>) {
    return this.request("/api/user", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: Record<string, unknown>) {
    return this.request(`/api/user/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/api/user/${id}`, {
      method: "DELETE",
    });
  }

  async updateUserRole(userId: string, role: string) {
    return this.request(`/api/user/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  }

  // Generic Update/Delete for modularity
  async updateCompany(id: number | string, data: Record<string, unknown>) {
    return this.request(`/api/companies/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteCompany(id: number | string) {
    return this.request(`/api/companies/${id}`, {
      method: "DELETE",
    });
  }

  async updateProduct(id: number | string, data: Record<string, unknown>) {
    return this.request(`/api/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }


  async updateTrader(id: number | string, data: Record<string, unknown>) {
    return this.request(`/api/traders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteTrader(id: number | string) {
    return this.request(`/api/traders/${id}`, {
      method: "DELETE",
    });
  }

  // Phase 3: Documents & AI Chat
  async getDocuments() {
    return this.request("/api/documents");
  }

  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return fetch("/api/documents", {
      method: "POST",
      body: formData,
    });
  }

  async deleteDocument(id: string) {
    return this.request(`/api/documents/${id}`, {
      method: "DELETE",
    });
  }

  async getChatHistory() {
    return this.request("/api/chat");
  }

  async sendMessage(text: string) {
    return this.request("/api/chat", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  }

  // Phase 4: Master Data
  async getDepots() {
    return this.request("/api/depots");
  }
  async createDepot(data: Record<string, unknown>) {
    return this.request("/api/depots", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async updateDepot(id: string | number, data: Record<string, unknown>) {
    return this.request(`/api/depots/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
  async deleteDepot(id: string | number) {
    return this.request(`/api/depots/${id}`, { method: "DELETE" });
  }

  async getGates() {
    return this.request("/api/gates");
  }
  async createGate(data: Record<string, unknown>) {
    return this.request("/api/gates", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async updateGate(id: string | number, data: Record<string, unknown>) {
    return this.request(`/api/gates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
  async deleteGate(id: string | number) {
    return this.request(`/api/gates/${id}`, { method: "DELETE" });
  }

  async getPorts() {
    return this.request("/api/ports");
  }
  async createPort(data: Record<string, unknown>) {
    return this.request("/api/ports", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async updatePort(id: string | number, data: Record<string, unknown>) {
    return this.request(`/api/ports/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
  async deletePort(id: string | number) {
    return this.request(`/api/ports/${id}`, { method: "DELETE" });
  }

  async getTypeofitems() {
    return this.request("/api/typeofitems");
  }
  async createTypeofitem(data: Record<string, unknown>) {
    return this.request("/api/typeofitems", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async updateTypeofitem(id: string | number, data: Record<string, unknown>) {
    return this.request(`/api/typeofitems/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
  async deleteTypeofitem(id: string | number) {
    return this.request(`/api/typeofitems/${id}`, { method: "DELETE" });
  }

  async getCompItems() {
    return this.request("/api/comp_items");
  }
  async createCompItem(data: Record<string, unknown>) {
    return this.request("/api/comp_items", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  async updateCompItem(id: string | number, data: Record<string, unknown>) {
    return this.request(`/api/comp_items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
  async deleteCompItem(id: string | number) {
    return this.request(`/api/comp_items/${id}`, { method: "DELETE" });
  }
  async deleteCompItems(ids: number[]) {
    return this.request("/api/comp_items", {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    });
  }

  // --- Transport Companies ---
  getTransportCompanies() {
    return this.request("/api/transport-companies");
  }
  createTransportCompany(data: Record<string, unknown>) {
    return this.request("/api/transport-companies", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  updateTransportCompany(id: number, data: Record<string, unknown>) {
    return this.request(`/api/transport-companies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  deleteTransportCompany(id: number) {
    return this.request(`/api/transport-companies/${id}`, { method: "DELETE" });
  }

  // --- Destinations ---
  getDestinations() {
    return this.request("/api/destinations");
  }
  createDestination(data: Record<string, unknown>) {
    return this.request("/api/destinations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  updateDestination(id: number, data: Record<string, unknown>) {
    return this.request(`/api/destinations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  deleteDestination(id: number) {
    return this.request(`/api/destinations/${id}`, { method: "DELETE" });
  }


  // --- Units ---
  getUnits() {
    return this.request("/api/units");
  }
  createUnit(data: Record<string, unknown>) {
    return this.request("/api/units", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  updateUnit(id: number, data: Record<string, unknown>) {
    return this.request(`/api/units/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  deleteUnit(id: number) {
    return this.request(`/api/units/${id}`, { method: "DELETE" });
  }

  // --- Sub-Companies ---
  getSubCompanies(companyId?: number | string) {
    const url = companyId
      ? `/api/sub-companies?companyId=${companyId}`
      : "/api/sub-companies";
    return this.request(url);
  }
  createSubCompany(data: Record<string, unknown>) {
    return this.request("/api/sub-companies", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  updateSubCompany(id: number | string, data: Record<string, unknown>) {
    return this.request(`/api/sub-companies/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
  deleteSubCompany(id: number | string) {
    return this.request(`/api/sub-companies/${id}`, { method: "DELETE" });
  }

  // --- Transport Trips (Land Transport) ---
  getTransportTrips(params?: { status?: string; gateId?: number; transportCompanyId?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.gateId) searchParams.append("gateId", params.gateId.toString());
    if (params?.transportCompanyId) searchParams.append("transportCompanyId", params.transportCompanyId.toString());
    return this.request(`/api/transport-trips?${searchParams.toString()}`);
  }
  getTransportTripById(id: number | string) {
    return this.request(`/api/transport-trips/${id}`);
  }
  createTransportTrip(data: Record<string, unknown>) {
    return this.request("/api/transport-trips", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  updateTransportTrip(id: number | string, data: Record<string, unknown>) {
    return this.request(`/api/transport-trips/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
  deleteTransportTrip(id: number | string) {
    return this.request(`/api/transport-trips/${id}`, { method: "DELETE" });
  }

  deleteTransportTripDocument(tripId: number | string, docId: number | string) {
    return this.request(`/api/transport-trips/${tripId}/documents/${docId}`, {
      method: "DELETE",
    });
  }

  // --- Trip Waybills (Land Transport) ---
  getTripWaybills(params?: { tripId?: number; traderId?: number; senderCompanyId?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.tripId) searchParams.append("tripId", params.tripId.toString());
    if (params?.traderId) searchParams.append("traderId", params.traderId.toString());
    if (params?.senderCompanyId) searchParams.append("senderCompanyId", params.senderCompanyId.toString());
    return this.request(`/api/trip-waybills?${searchParams.toString()}`);
  }
  getTripWaybillById(id: number | string) {
    return this.request(`/api/trip-waybills/${id}`);
  }
  createTripWaybill(data: Record<string, unknown>) {
    return this.request("/api/trip-waybills", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  updateTripWaybill(id: number | string, data: Record<string, unknown>) {
    return this.request(`/api/trip-waybills/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
  deleteTripWaybill(id: number | string) {
    return this.request(`/api/trip-waybills/${id}`, { method: "DELETE" });
  }

  // --- Invoice Items (Waybill Line Items) ---
  getInvoiceItems(waybillId: number | string) {
    return this.request(`/api/trip-waybills/${waybillId}/invoice-items`);
  }
  saveInvoiceItems(waybillId: number | string, items: Record<string, unknown>[]) {
    return this.request(`/api/trip-waybills/${waybillId}/invoice-items`, {
      method: "POST",
      body: JSON.stringify({ items }),
    });
  }
  deleteInvoiceItems(waybillId: number | string) {
    return this.request(`/api/trip-waybills/${waybillId}/invoice-items`, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient();
