// app/lib/api-client.ts

class ApiClient {
  async request(endpoint: string, options: RequestInit = {}) {
    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
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

  async createShipment(data: any) {
    return this.request("/api/shipments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getShipmentById(id: number | string) {
    return this.request(`/api/shipments/${id}`);
  }

  async updateShipment(id: number | string, data: any) {
    return this.request(`/api/shipments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
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

  async createCompany(data: any) {
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

  async createProduct(data: any) {
    return this.request("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Transport
  async getTransport(q?: string) {
    const url = q
      ? `/api/transport?q=${encodeURIComponent(q)}`
      : "/api/transport";
    return this.request(url);
  }

  async createTransport(data: any) {
    return this.request("/api/transport", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Traders
  async getTraders(q?: string) {
    const url = q ? `/api/traders?q=${encodeURIComponent(q)}` : "/api/traders";
    return this.request(url);
  }

  async createTrader(data: any) {
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

  async inviteUser(data: any) {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
