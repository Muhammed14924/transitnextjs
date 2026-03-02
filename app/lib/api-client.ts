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
}

export const apiClient = new ApiClient();
