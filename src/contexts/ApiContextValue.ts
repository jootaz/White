// ApiContextValue.ts
import { createContext } from "react";
import type {
  ApiDeleteResponse,
  ApiResponse,
  BotResponseData,
  BotStats,
  BotsStats,
  CallbackResponseData,
  CreateBotPayload,
  CreateCallbackPayload,
  CreateProductPayload,
  ExpenseCreate,
  ExpenseData,
  MercadoPagoWebhookPayload,
  MercadoPagoWebhookResponse,
  NotificationData,
  PartnerCreate,
  PartnerData,
  ProductResponseData,
  ProductStats,
  RunningBot, Transaction, TransactionsResponse,
  UpdateBotPayload
} from "../types/api";

// Define o tipo do valor do contexto
export interface ApiContextType {
  // Funções para manipulação de bots
  createBot: (payload: CreateBotPayload) => Promise<ApiResponse<BotResponseData>>;
  updateBot: (payload: UpdateBotPayload) => Promise<ApiResponse<BotResponseData>>;
  deleteBot: (id: string) => Promise<ApiDeleteResponse>;
  listBots: () => Promise<ApiResponse<BotResponseData[]>>;
  getBot: (id: string) => Promise<ApiResponse<BotResponseData>>;
  listRunningBots: () => Promise<ApiResponse<RunningBot[]>>;
  restartBot: (id: string) => Promise<ApiResponse<{ bot_id: string; bot_name: string; start_time: number }>>;
  getBotStats: (id: string) => Promise<ApiResponse<BotStats>>;
  getBotsStats: () => Promise<ApiResponse<BotsStats>>;
  getBotStatsDetailed: (filter: { bot?: string, status?: 'pending' | 'approved' | 'rejected', dateRange?: { start: number, end: number } }) => Promise<ApiResponse<Transaction[]>>;
  // Funções para manipulação de callbacks
  createCallback: (payload: CreateCallbackPayload) => Promise<ApiResponse<CallbackResponseData>>;
  updateCallback: (id: string, payload: CreateCallbackPayload) => Promise<ApiResponse<CallbackResponseData>>;
  deleteCallback: (id: string) => Promise<ApiDeleteResponse>;
  listCallbacks: () => Promise<ApiResponse<CallbackResponseData[]>>;
  // Funções para manipulação de produtos
  createProduct: (payload: CreateProductPayload) => Promise<ApiResponse<ProductResponseData>>;
  updateProduct: (id: string, payload: CreateProductPayload) => Promise<ApiResponse<ProductResponseData>>;
  deleteProduct: (id: string) => Promise<ApiDeleteResponse>;
  listProducts: () => Promise<ApiResponse<ProductResponseData[]>>;
  getProduct: (id: string) => Promise<ApiResponse<ProductResponseData>>;
  getProductStats: (id: string) => Promise<ApiResponse<ProductStats>>;

  // Funções para manipulação de despesas
  getAllExpenses: () => Promise<ApiResponse<ExpenseData[]>>;
  createExpense: (data: ExpenseCreate) => Promise<ApiResponse<ExpenseData>>;
  deleteExpense: (id: string) => Promise<ApiDeleteResponse>;
  updateExpensePaidStatus: (id: string, paid: boolean) => Promise<ApiResponse<ExpenseData>>;

  // Funções para manipulação de parceiros
  getAllPartners: () => Promise<ApiResponse<PartnerData[]>>;
  createPartner: (data: PartnerCreate) => Promise<ApiResponse<PartnerData>>;
  deletePartner: (id: string) => Promise<ApiDeleteResponse>;

  // Webhook
  sendMercadoPagoWebhook: (payload: MercadoPagoWebhookPayload) => Promise<ApiResponse<MercadoPagoWebhookResponse>>;

  // Transações
  listTransactions: (botId: number) => Promise<ApiResponse<TransactionsResponse>>;
  listAllTransactions: () => Promise<ApiResponse<TransactionsResponse>>;

  // Notificações
  listNotifications: (unreadOnly?: boolean) => Promise<ApiResponse<NotificationData[]>>;
  markNotificationAsRead: (id: string) => Promise<ApiResponse<any>>;
  markAllNotificationsAsRead: () => Promise<ApiResponse<any>>;
  deleteNotification: (id: string) => Promise<ApiDeleteResponse>;

  // Estado
  loading: boolean;
  error: Error | null;
}

// Cria o contexto com valor inicial
export const ApiContext = createContext<ApiContextType>({} as ApiContextType);
