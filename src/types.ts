export interface Vendor {
  id: string;
  email: string;
  geminiApiKey?: string;
  plan: 'free' | 'premium';
  createdAt: any;
}

export interface ChatbotTheme {
  primaryColor: string;
  welcomeMessage: string;
  avatarUrl: string;
}

export interface Chatbot {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  systemPrompt: string;
  theme: ChatbotTheme;
  createdAt: any;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: any;
}

export interface AnalyticsData {
  date: string;
  messages: number;
  sessions: number;
}
