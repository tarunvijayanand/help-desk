export interface RAGSource {
  title: string;
  source: string;
  chunk: string;
  score: number;
}

export interface Ticket {
  ticket_id: string;
  subject: string;
  user_request: string;
  intent: string;
  category: string;
  subcategory: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4' | string;
  impact: string;
  urgency: string;
  assignment_group: string;
  summary: string;
  suggested_resolution: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Escalated' | string;
  ai_status: string;
  confidence: number;
  servicenow_id: string;
  servicenow_mode: string;
  rag_sources: RAGSource[];
  created_at: string;
  updated_at: string;
}

export interface ChatResponse {
  user_request: string;
  ai_response: string;
  workflow_type: 'Knowledge Question' | 'Incident' | 'Service Request' | 'Automatable Issue' | string;
  intent: string;
  category: string;
  subcategory: string;
  priority: string;
  impact: string;
  urgency: string;
  assignment_group: string;
  summary: string;
  suggested_resolution: string;
  confidence: number;
  has_sufficient_context: boolean;
  unsupported: boolean;
  human_escalation_required: boolean;
  automation_allowed: boolean;
  automation_action: string | null;
  requested_software?: string;
  rag_sources: RAGSource[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  filename: string;
  short_description: string;
  content: string;
}

export interface AuditLog {
  id?: string;
  timestamp: string;
  action: string;
  ticket_id: string;
  status: string;
  result: string;
  actor: string;
  mode: string;
  details: Record<string, any>;
}

export interface SoftwareItem {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  pre_approved: boolean;
}

export interface DashboardMetrics {
  kpis: {
    total_tickets: number;
    open_tickets: number;
    ai_resolved: number;
    escalated: number;
    software_requests: number;
    automation_success: number;
  };
  charts: {
    status_distribution: Array<{ name: string; value: number }>;
    priority_distribution: Array<{ name: string; value: number }>;
    ai_vs_human: Array<{ name: string; value: number }>;
  };
  recent_tickets: Ticket[];
}
