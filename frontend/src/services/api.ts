import axios from 'axios';
import { 
  ChatResponse, 
  Ticket, 
  KnowledgeArticle, 
  AuditLog, 
  SoftwareItem, 
  DashboardMetrics 
} from '../types';

const API_BASE = '/api';

export const api = {
  // Dashboard
  getDashboard: async (): Promise<DashboardMetrics> => {
    const res = await axios.get(`${API_BASE}/dashboard`);
    return res.data;
  },

  // AI Chat & Self Service
  sendChat: async (user_request: string): Promise<ChatResponse> => {
    const res = await axios.post(`${API_BASE}/chat`, { user_request });
    return res.data;
  },

  // AI Analysis Pipeline
  analyzeRequest: async (user_request: string): Promise<any> => {
    const res = await axios.post(`${API_BASE}/analyze`, { user_request });
    return res.data;
  },

  // Tickets
  getTickets: async (filters?: { status?: string; priority?: string; category?: string }): Promise<Ticket[]> => {
    const res = await axios.get(`${API_BASE}/tickets`, { params: filters });
    return res.data;
  },

  getTicketById: async (ticket_id: string): Promise<Ticket> => {
    const res = await axios.get(`${API_BASE}/tickets/${ticket_id}`);
    return res.data;
  },

  createTicket: async (ticketData: Partial<Ticket>): Promise<Ticket> => {
    const res = await axios.post(`${API_BASE}/tickets`, ticketData);
    return res.data;
  },

  // Knowledge Base
  getKnowledgeArticles: async (): Promise<KnowledgeArticle[]> => {
    const res = await axios.get(`${API_BASE}/knowledge`);
    return res.data;
  },

  getKnowledgeArticleById: async (id: string): Promise<KnowledgeArticle> => {
    const res = await axios.get(`${API_BASE}/knowledge/${id}`);
    return res.data;
  },

  searchKnowledge: async (query: string): Promise<any> => {
    const res = await axios.post(`${API_BASE}/knowledge/search`, { query });
    return res.data;
  },

  // Automation
  executeAutomation: async (action: string, ticket_id: string = "INC001001"): Promise<any> => {
    const res = await axios.post(`${API_BASE}/automation/execute`, { action, ticket_id });
    return res.data;
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
    const res = await axios.get(`${API_BASE}/automation/audit`);
    return res.data;
  },

  // Software Catalog
  getSoftwareCatalog: async (): Promise<SoftwareItem[]> => {
    const res = await axios.get(`${API_BASE}/software`);
    return res.data;
  },

  requestSoftware: async (software_id: string): Promise<any> => {
    const res = await axios.post(`${API_BASE}/software/request`, { software_id });
    return res.data;
  }
};
