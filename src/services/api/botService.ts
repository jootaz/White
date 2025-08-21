// Serviço para interação com a API de Bots
import type { BotStats } from '../../types/api';

export interface BotCreateParams {
  name: string;
  token: string;
  partner?: string; // ID do parceiro (opcional)
  chat_log?: string;
  start?: {
    text: string;
    banner: string[];
    keyboards: Array<{ name: string; text: string }>;
  };
  remarkets?: {
    start: string;
    product: string;
    payment: string;
  };
}

export interface BotResponse {
  _id: string;
  name: string;
  token: string;
  partner?: string; // ID do parceiro (opcional)
  chat_log: string;
  start?: {
    text: string;
    banner: string[];
    keyboards: Array<{ name: string; text: string }>;
  };
  remarkets?: {
    start: string;
    product: string;
    payment: string;
  };
  running?: boolean;
  startTime?: number;
}

export interface CallbackCreateParams {
  title: string;
  message: {
    text: string;
    banner: string[];
    keyboards: Array<{ name: string; text: string }>;
  };
  premessage?: {
    text: string;
    banner: string[];
  };
}

export interface ProductCreateParams {
  name: string;
  price: number;
  message: {
    text: string;
    banner: string[];
    keyboards: Array<{ name: string; text: string }>;
  };
  qrcode: {
    resize: number;
    cord_x: number;
    cord_y: number;
    message: {
      text: string;
    };
  };
  approve: {
    message: {
      text: string;
      banner: string[];
    };
    action: string;
    data: string;
  };
}

export interface MercadoPagoWebhookPayload {
  id: string;
  live_mode: boolean;
  type: string;
  date_created: string;
  user_id: number;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}

// O endereço da API deve usar o proxy local em desenvolvimento e URL direta em produção
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1');
const API_BASE_URL = isDevelopment ? '/api' : 'https://api.systemwhite.com.br';

// Bot endpoints
export const botService = {
  // Listar todos os bots
  getAllBots: async (): Promise<BotResponse[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/bots`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Erro ao buscar bots:', error);
      return [];
    }
  },

  // Nova função para buscar estatísticas de todos os bots
  getAllBotStatistics: async (): Promise<BotStats[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/bots/statistics`); // Endpoint hipotético
      // Assumindo que a API retorna um objeto com uma propriedade "data" contendo o array de BotStats
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Erro ao buscar estatísticas dos bots:', error);
      return [];
    }
  },

  // Listar bots em execução
  getRunningBots: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bots/running`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Erro ao buscar bots em execução:', error);
      return [];
    }
  },

  // Criar um novo bot
  createBot: async (botData: BotCreateParams) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bots/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(botData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao criar bot:', error);
      throw error;
    }
  },

  // Atualizar um bot existente
  updateBot: async (id: string, botData: Partial<BotCreateParams>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bots/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...botData }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar bot:', error);
      throw error;
    }
  },

  // Iniciar/Reiniciar um bot
  startBot: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bots/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao iniciar bot:', error);
      throw error;
    }
  },

  // Parar um bot
  stopBot: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bots/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao parar bot:', error);
      throw error;
    }
  },

  // Deletar um bot
  deleteBot: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bots/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao deletar bot:', error);
      throw error;
    }
  }
};

// Callback endpoints
export const callbackService = {
  // Listar todos os callbacks
  getAllCallbacks: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/callbacks`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Erro ao buscar callbacks:', error);
      return [];
    }
  },

  // Criar novo callback
  createCallback: async (callbackData: CallbackCreateParams) => {
    try {
      const response = await fetch(`${API_BASE_URL}/callbacks/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callbackData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao criar callback:', error);
      throw error;
    }
  },

  // Atualizar um callback existente
  updateCallback: async (id: string, callbackData: Partial<CallbackCreateParams>) => {
    try {
      console.log(`[botService] Enviando atualização para callback ${id}:`, callbackData);
      
      const response = await fetch(`${API_BASE_URL}/callbacks/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...callbackData }),
      });

      // Importamos dinamicamente para evitar problemas de dependência circular
      const { processApiResponse } = await import('../../utils/apiResponseUtils');
      
      // Usar a nova função utilitária para processar a resposta
      return processApiResponse(response, callbackData);
    } catch (error) {
      console.error('[botService] Erro ao atualizar callback:', error);
      throw error;
    }
  },

  // Deletar um callback
  deleteCallback: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/callbacks/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao deletar callback:', error);
      throw error;
    }
  }
};

// Products endpoints
export const productService = {
  // Listar todos os produtos
  getAllProducts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
  },

  // Criar novo produto
  createProduct: async (productData: ProductCreateParams) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    }
  },

  // Atualizar um produto existente
  updateProduct: async (id: string, productData: Partial<ProductCreateParams>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...productData }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    }
  },

  // Deletar um produto
  deleteProduct: async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    }
  }
};

// Webhook endpoints
export const webhookService = {
  // Webhook do Mercado Pago
  mercadoPagoWebhook: async (webhookData: MercadoPagoWebhookPayload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/webhook/mercadopago`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao processar webhook do Mercado Pago:', error);
      throw error;
    }
  }
};
