// Serviço para interação com a API de Despesas e Parcerias
import { getApiBaseUrl } from '../../utils/apiUtils';

export interface PartnerCreateParams {
  name: string;
}

export interface ExpenseCreateParams {
  name: string;
  type: 'Parceria' | 'Desenvolvimento' | 'Design';
  value: number;
  partner?: string; // ID do parceiro, opcional
}

export interface PartnerResponse {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseResponse {
  _id: string;
  name: string;
  type: 'Parceria' | 'Desenvolvimento' | 'Design';
  value: number;
  partner?: string; // ID do parceiro, opcional
  createdAt: string;
  updatedAt: string;
}

// O endereço da API deve usar o proxy local em desenvolvimento e URL direta em produção
const API_BASE_URL = getApiBaseUrl();

// Configuração de cabeçalhos padrão para a API
const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

// Expense endpoints
export const expenseService = {
  // Listar todas as despesas
  getAllExpenses: async (): Promise<ExpenseResponse[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Erro ao buscar despesas:", error);
      throw error;
    }
  },

  // Criar uma nova despesa
  createExpense: async (params: ExpenseCreateParams): Promise<ExpenseResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/create`, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Erro ao criar despesa:", error);
      throw error;
    }
  },

  // Excluir uma despesa
  deleteExpense: async (id: string): Promise<{ success: boolean }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/delete`, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: data.success };
    } catch (error) {
      console.error("Erro ao excluir despesa:", error);
      throw error;
    }
  },
};

// Partner endpoints
export const partnerService = {
  // Listar todos os parceiros
  getAllPartners: async (): Promise<PartnerResponse[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/partners`, {
        headers: getDefaultHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Erro ao buscar parceiros:", error);
      throw error;
    }
  },

  // Criar um novo parceiro
  createPartner: async (params: PartnerCreateParams): Promise<PartnerResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/partners/create`, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Erro ao criar parceiro:", error);
      throw error;
    }
  },

  // Excluir um parceiro
  deletePartner: async (id: string): Promise<{ success: boolean }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/partners/delete`, {
        method: 'POST',
        headers: getDefaultHeaders(),
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: data.success };
    } catch (error) {
      console.error("Erro ao excluir parceiro:", error);
      throw error;
    }
  },
};
