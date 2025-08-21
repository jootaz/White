// Types para a API do SystemWhite
import { z } from 'zod';

// Tipos base
export type InputFile = string | File; // Pode ser URL (string) ou arquivo

export interface Keyboard {
  name: string;
  text: string;
}

export interface Message {
  banner?: string[] | InputFile[];
  text?: string;
  keyboards?: Keyboard[];
}

// Tipos para Despesas e Parceiros
export interface ExpenseCreate {
  name: string;
  type: 'Parceria' | 'Desenvolvimento' | 'Design';
  value: number;
  partner_id?: string; // ID do parceiro, obrigatório para despesas de Parceria
  partner_name?: string; // Nome do parceiro, opcional mas recomendado para melhor exibição
}

export interface ExpenseData {
  _id: string;
  name: string;
  type: 'Parceria' | 'Desenvolvimento' | 'Design';
  value: number;
  partner_id?: string; // ID do parceiro, obrigatório para despesas de Parceria
  partner_name?: string; // Nome do parceiro, obrigatório para despesas de Parceria
  paid?: boolean; // Status se foi pago ou não
  created_at: number; // Timestamp em milissegundos
  updated_at?: number; // Timestamp em milissegundos (opcional)
}

export interface PartnerCreate {
  name: string;
}

export interface PartnerData {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos para Bot
export interface CreateBotPayload {
  name: string;
  token: string;
  partner?: string; // ID do parceiro, opcional
  start?: Message;
  remarkets?: {
    start: string;
    product: string;
  };
  callbacks?: string[]; // Alterado para array de IDs de callbacks
}

export interface UpdateBotPayload {
  id: string;
  name?: string;
  token?: string;
  chat_log?: string;
  start?: Message;
  remarkets?: {
    start?: string;
    product?: string;
    payment?: string;
  };
}

export interface BotResponseData {
  _id: string;
  name: string;
  token?: string;
  chat_log?: string;
  start?: Message;
  remarkets?: {
    start?: string;
    product?: string;
    payment?: string;
  };
  running?: boolean;
  startTime?: number;
}

export interface RunningBot {
  id: string;
  name: string;
  startTime: number;
}

export interface BotStats {
  bot_id: string;
  bot_name: string;
  is_running: boolean;
  start_time?: number;
  total_users: number;
  active_users: number;
  sales: {
    total_count: number;
    approved_count: number;
    pending_count: number;
    total_revenue: number;
  };
  products_sold: {
    product_id: string;
    product_name: string;
    sales_count: number;
    revenue: number;
  }[];
}

export interface BotsStats {
  total_bots: number;
  active_bots: number;
  inactive_bots: number;
  total_sales: number;
  total_revenue: number;
  bots_stats: {
    bot_id: string;
    bot_name: string;
    sales_count: number;
    revenue: number;
  }[];
}

// Tipos para Callback
export interface CreateCallbackPayload {
  title: string;
  message: Message;
  premessage?: Message;
}

export interface CallbackResponseData {
  _id: string;
  title: string;
  message: Message;
  premessage?: Message;
}

// Tipos para Produto
export interface QRCode {
  resize: number;
  cord_x: number;
  cord_y: number;
  message: Message;
}

export interface Approve {
  message: Message;
  action: string;
  data: string;
}

export interface CreateProductPayload {
  name: string;
  price: number;
  message: Message;
  qrcode: QRCode;
  approve: Approve;
}

export interface ProductResponseData {
  _id: string;
  name: string;
  price: number;
  message: Message;
  qrcode: QRCode;
  approve: Approve;
}

export interface ProductStats {
  product_id: string;
  product_name: string;
  price: number;
  total_sales: number;
  total_revenue: number;
  sales_by_bot: {
    bot_id: string;
    bot_name: string;
    sales_count: number;
    revenue: number;
  }[];
}

// Tipo para Webhook do Mercado Pago
export interface MercadoPagoWebhookPayload {
  id: string;
  live_mode: boolean;
  type: string;
  date_created: string; // ISO Date String
  user_id: number;
  api_version: string;
  action: string;
  data: {
    id: string; // ID do pagamento
  };
}

// Tipo para resposta do Webhook
export interface MercadoPagoWebhookResponse {
  message?: string;
}

// Tipo para Transações
export interface Transaction {
  _id: string;
  created_at: number;
  updated_at: number;
  bot: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    telegram_id: number;
    name: string;
  };
  product: {
    id: string;
    name: string;
    price: number;
  };
  status: string;
  payment_id: number;
}

// Interface para um produto consolidado
export interface ConsolidatedProduct {
  id: string;
  name: string;
  price: number;
  count: number;         // Total de transações com este produto
  totalRevenue: number;  // Receita total deste produto
  approvedCount?: number; // Número de transações aprovadas para este produto
}

// Interface para um bot com suas transações
export interface BotWithTransactions {
  _id: string;
  name: string;
  monthlyTransactions: Transaction[];
}

export interface TransactionsResponse {
  total: number;
  limit: number;
  offset: number;
  transactions: Transaction[];
  // Campos adicionais para otimização
  botsWithTransactions?: BotWithTransactions[];
  consolidatedProducts?: ConsolidatedProduct[];
}

// Tipos de Resposta da API Genéricos
export interface ApiResponse<T> {
  message: string;
  data?: T;
  status: number;
}

export interface ApiDeleteResponse {
  message: string;
  status: number;
}

// Schemas de Validação Zod
export const KeyboardSchema = z.object({
  name: z.string().min(1, "O nome do teclado é obrigatório"),
  text: z.string().min(1, "O texto do teclado é obrigatório"),
});

export const InputFileSchema = z.union([
  z.string().url("URL inválida para o arquivo"),
  z.custom<File>((val) => val instanceof File, "Deve ser um objeto File")
]);

export const MessageSchema = z.object({
  banner: z.array(InputFileSchema).optional(),
  text: z.string().optional(),
  keyboards: z.array(KeyboardSchema).optional(),
});

export const CreateCallbackPayloadSchema = z.object({ // Movido para cima para referência
  title: z.string().min(1, "O título do callback é obrigatório"),
  message: MessageSchema,
  premessage: MessageSchema.optional()
});

export const QRCodeSchema = z.object({ // Movido para cima para referência
  resize: z.number(),
  cord_x: z.number(),
  cord_y: z.number(),
  message: MessageSchema,
});

export const ApproveSchema = z.object({ // Movido para cima para referência
  message: MessageSchema,
  action: z.string(),
  data: z.string()
});

export const CreateProductPayloadSchema = z.object({ // Movido para cima para referência
  name: z.string().min(1, "O nome do produto é obrigatório"),
  price: z.number().positive("O preço deve ser um número positivo"),
  message: MessageSchema,
  qrcode: QRCodeSchema,
  approve: ApproveSchema,
});

export const CreateBotPayloadSchema = z.object({
  name: z.string().min(1, "O nome do bot é obrigatório"),
  token: z.string().min(1, "O token é obrigatório"),
  chat_log: z.string().min(1, "O chat_log é obrigatório").optional(),
  start: MessageSchema.optional(),
  remarkets: z.object({
    start: z.string().optional(),
    product: z.string().optional(),
    payment: z.string().optional()
  }).optional(),
  callbacks: z.array(z.string()).optional(), // Alterado para array de IDs de callbacks
});

export const UpdateBotPayloadSchema = z.object({
  id: z.string().min(1, "ID do bot é obrigatório"),
  name: z.string().min(1, "O nome do bot é obrigatório").optional(),
  token: z.string().min(1, "O token é obrigatório").optional(),
  chat_log: z.string().min(1, "O chat_log é obrigatório").optional(),
  start: MessageSchema.optional(),
  remarkets: z.object({
    start: z.string().optional(),
    product: z.string().optional(),
    payment: z.string().optional()
  }).optional()
});

export const MercadoPagoWebhookPayloadSchema = z.object({
  id: z.string().min(1, "ID do webhook é obrigatório"),
  live_mode: z.boolean(),
  type: z.string().min(1, "Tipo do evento é obrigatório"),
  date_created: z.string().datetime("Data de criação inválida"),
  user_id: z.number(),
  api_version: z.string(),
  action: z.string(),
  data: z.object({
    id: z.string().min(1, "ID dos dados é obrigatório"),
  }),
});

export interface BotStatsApiResponse {
  message: string;
  data: {
    _id: string;
    name: string;
    stats: {
      approved: number;
      pending: number;
      rejected: number;
      total: number;
      evaluate: number;
    }
  };
  status: number;
}

// Tipos para Notificações
export interface NotificationData {
  _id: string;
  bot_id: string;
  bot_name: string;
  error_message: string;
  error_type: string;
  timestamp: number;
  read: boolean; // Campo correto da API
  created_at: number;
}
