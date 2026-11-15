const API_BASE_URL = '/api';

class ApiService {
  getToken() {
    return localStorage.getItem('supportdesk_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('supportdesk_token', token);
    } else {
      localStorage.removeItem('supportdesk_token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      ...this.getHeaders(),
      ...(options.headers || {})
    };

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      
      // Auto logout on 401 for protected endpoints
      if (response.status === 401 && !endpoint.startsWith('/auth/login')) {
        this.setToken(null);
        localStorage.removeItem('supportdesk_user');
        window.dispatchEvent(new Event('auth-logout'));
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = (data && (data.detail || data.message)) || `Request failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      console.error(`API Error on ${endpoint}:`, err);
      throw err;
    }
  }

  // Auth Endpoints
  async register(name, email, password, role = 'customer') {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });
  }

  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
      localStorage.removeItem('supportdesk_user');
    }
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async updateProfile(name, email) {
    return this.request('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ name, email })
    });
  }

  // Subscriptions & Billing
  async getPlans() {
    return this.request('/plans');
  }

  async getMySubscription() {
    return this.request('/subscriptions/me');
  }

  async changeSubscription(planId) {
    return this.request('/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId })
    });
  }

  async cancelSubscription(reason = 'Customer requested cancellation') {
    return this.request('/subscriptions/me/cancel', {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }

  async getBillingHistory() {
    return this.request('/billing');
  }

  // Support Tickets
  async listTickets(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.priority && filters.priority !== 'All') params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);
    
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/tickets${queryStr}`);
  }

  async getTicket(ticketId) {
    return this.request(`/tickets/${ticketId}`);
  }

  async createTicket(ticketData) {
    return this.request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData)
    });
  }

  async addTicketMessage(ticketId, message, isInternalNote = false) {
    return this.request(`/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message, is_internal_note: isInternalNote })
    });
  }

  async updateTicket(ticketId, updateData) {
    return this.request(`/tickets/${ticketId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });
  }

  // AI Chat & Assistance
  async chatWithAI(message, conversationId = null) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversation_id: conversationId })
    });
  }

  async getAIConversations() {
    return this.request('/ai/conversations');
  }

  async getAIConversationMessages(convId) {
    return this.request(`/ai/conversations/${convId}/messages`);
  }

  async clearAIConversation(convId) {
    return this.request(`/ai/conversations/${convId}`, { method: 'DELETE' });
  }

  async summarizeTicket(ticketId) {
    return this.request(`/ai/tickets/${ticketId}/summarize`, {
      method: 'POST',
      body: JSON.stringify({ ticket_id: ticketId })
    });
  }

  async suggestResponse(ticketId) {
    return this.request(`/ai/tickets/${ticketId}/suggest-response`, {
      method: 'POST',
      body: JSON.stringify({ ticket_id: ticketId })
    });
  }

  // Knowledge Base
  async listArticles(params = {}) {
    const searchParams = new URLSearchParams();
    if (params.category && params.category !== 'All') searchParams.append('category', params.category);
    if (params.search) searchParams.append('search', params.search);
    if (params.status) searchParams.append('status_filter', params.status);

    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request(`/knowledge-base${queryStr}`);
  }

  async getArticle(articleId) {
    return this.request(`/knowledge-base/${articleId}`);
  }

  async createArticle(data) {
    return this.request('/knowledge-base', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateArticle(articleId, data) {
    return this.request(`/knowledge-base/${articleId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async deleteArticle(articleId) {
    return this.request(`/knowledge-base/${articleId}`, {
      method: 'DELETE'
    });
  }

  // Dashboards
  async getCustomerDashboard() {
    return this.request('/dashboard');
  }

  async getAgentDashboard() {
    return this.request('/agent/dashboard');
  }

  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  // Admin Management
  async listAdminUsers(role = null, search = null) {
    const params = new URLSearchParams();
    if (role && role !== 'All') params.append('role', role);
    if (search) params.append('search', search);
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/admin/users${queryStr}`);
  }

  async updateUserRole(userId, newRole) {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role: newRole })
    });
  }

  async getAuditLogs(limit = 50, action = null) {
    const params = new URLSearchParams();
    params.append('limit', limit);
    if (action) params.append('action', action);
    return this.request(`/admin/audit-logs?${params.toString()}`);
  }

  async createPlan(planData) {
    return this.request('/admin/plans', {
      method: 'POST',
      body: JSON.stringify(planData)
    });
  }

  async updatePlan(planId, planData) {
    return this.request(`/admin/plans/${planId}`, {
      method: 'PATCH',
      body: JSON.stringify(planData)
    });
  }
}

export const api = new ApiService();
