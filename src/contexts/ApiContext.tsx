// ApiContext.tsx
import { useState, useCallback, type ReactNode } from 'react';
import type {
  ApiResponse,
  BotResponseData,
  CreateBotPayload,
  CallbackResponseData,
  CreateCallbackPayload,
  ProductResponseData,
  CreateProductPayload,
  ApiDeleteResponse,
  MercadoPagoWebhookPayload,
  MercadoPagoWebhookResponse,
  RunningBot,
  Message, BotStats,
  BotsStats,
  ProductStats,
  TransactionsResponse,
  UpdateBotPayload,
  Transaction,
  BotStatsApiResponse,
  BotWithTransactions,
  ConsolidatedProduct,
  ExpenseCreate,
  ExpenseData,
  PartnerCreate,
  PartnerData,
  NotificationData
} from '../types/api';
import { ApiContext } from './ApiContextValue';
import { limitRequest } from '../utils/requestLimiter';
import { getApiBaseUrl } from '../utils/apiUtils';

// URL base da API - Obtém dinamicamente com base no ambiente (produção ou desenvolvimento)
const API_BASE_URL = getApiBaseUrl();

// URL base da API - Obtém dinamicamente com base no ambiente (produção ou desenvolvimento)

// Função helper para processar objetos Message
const sanitizeMessageFields = (message?: Message): Message | null => {
  if (!message) return null;

  return {
    text: message.text !== undefined ? message.text : undefined,
    banner: Array.isArray(message.banner) ? message.banner.filter(Boolean) : [],
    keyboards: message.keyboards !== undefined ? message.keyboards : undefined,
  };
};

export const ApiProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Função genérica para lidar com as requisições
  const handleRequest = useCallback(
    async <TResponse,>(requestFunction: () => Promise<TResponse>): Promise<TResponse> => {
      setLoading(true);
      setError(null);
      try {
        const response = await requestFunction();
        return response;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    }, [setLoading, setError]
  );

  // Headers padrão para todas as requisições
  const getDefaultHeaders = () => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  });

  // 2. Adicionar Bot (/bots/create - POST)
  const createBot = useCallback(
    (payload: CreateBotPayload) => {
      // Garantir que todas as propriedades importantes estejam presentes
      const finalPayload = {
        name: payload.name,
        token: payload.token,
        start: sanitizeMessageFields(payload.start),
        remarkets: payload.remarkets || null,
        callbacks: payload.callbacks || [], // Incluindo os callbacks no payload
      };

      // Log para debug
      console.log('Enviando payload para criação de bot:', finalPayload);

      return handleRequest(() =>
        fetch(`${API_BASE_URL}/bots/create`, {
          method: 'POST',
          headers: getDefaultHeaders(),
          body: JSON.stringify(finalPayload),
        }).then((res) => res.json() as Promise<ApiResponse<BotResponseData>>)
      );
    },
    [handleRequest]
  );

  // 20. Atualizar Bot (/bot/update - POST)
  const updateBot = useCallback(
    (payload: UpdateBotPayload) => {      // Garantir que o payload está formatado corretamente
      const finalPayload = {
        id: payload.id,
        name: payload.name,
        token: payload.token,
        start: payload.start ? {
          text: payload.start.text,
          banner: Array.isArray(payload.start.banner) ? payload.start.banner.filter(Boolean) : [],
          keyboards: payload.start.keyboards || []
        } : undefined,
        remarkets: payload.remarkets,
      };

      // Log para debug
      console.log('Enviando payload para atualização de bot:', finalPayload); return handleRequest(() =>
        fetch(`${API_BASE_URL}/bots/update`, {
          method: 'POST',
          headers: getDefaultHeaders(),
          body: JSON.stringify(finalPayload),
        }).then((res) => res.json() as Promise<ApiResponse<BotResponseData>>)
      );
    },
    [handleRequest]
  );

  // 5. Deletar Bot (/bots/delete - POST)
  const deleteBot = useCallback(
    (id: string) =>
      handleRequest(() =>
        fetch(`${API_BASE_URL}/bots/delete`, {
          method: 'POST',
          headers: getDefaultHeaders(),
          body: JSON.stringify({ id }),
        }).then((res) => res.json() as Promise<ApiDeleteResponse>)
      ),
    [handleRequest]
  );  // 3. Listar Todos os Bots (/bots - GET)
  // Função para listar bots com rate limiting
  const listBots = useCallback(
    () => {
      return limitRequest<ApiResponse<BotResponseData[]>>(
        'listBots',
        async () => {
          // Especificando TResponse para handleRequest explicitamente
          return handleRequest<ApiResponse<BotResponseData[]>>(async () => {
            try {
              const httpResponse = await fetch(`${API_BASE_URL}/bots`, {
                cache: 'no-store',
                credentials: 'same-origin',
                headers: getDefaultHeaders()
              });

              if (!httpResponse.ok) {
                let errorBody = 'Failed to read error body';
                try {
                  errorBody = await httpResponse.text();
                } catch (e) {
                  console.error("Failed to read error body from response:", e);
                }
                throw new Error(`HTTP error! status: ${httpResponse.status}, body: ${errorBody}`);
              }

              const responseData = await httpResponse.json() as ApiResponse<BotResponseData[]>;
              return responseData;
            } catch (error) {
              console.error("Erro ao buscar bots:", error);
              if (error instanceof Error) {
                throw error;
              }
              throw new Error(String(error));
            }
          });
        }
      );
    },
    [handleRequest] // limitRequest removido das dependências
  );

  // 13. Obter Bot Específico (/bot - GET)
  const getBot = useCallback(
    (id: string) =>
      handleRequest(() =>
        fetch(`${API_BASE_URL}/bot/${id}`, {
          headers: getDefaultHeaders()
        }).then((res) => res.json() as Promise<ApiResponse<BotResponseData>>)
      ),
    [handleRequest]
  );  // A função listRunningBots foi removida pois o endpoint /bots/running não está mais disponível no backend
  // Para manter compatibilidade com o código existente, vamos retornar um array vazio
  const listRunningBots = useCallback(
    () =>
      Promise.resolve({
        success: true,
        data: [],
        message: "Endpoint desativado",
        status: 200
      } as ApiResponse<RunningBot[]>),
    []
  );

  // 18. Reiniciar Bot (/bots/restart - POST)
  const restartBot = useCallback(
    (id: string) =>
      handleRequest(() =>
        fetch(`${API_BASE_URL}/bots/restart/${id}`, {
          method: 'GET',
          headers: getDefaultHeaders(),
        }).then((res) => res.json() as Promise<ApiResponse<{ bot_id: string; bot_name: string; start_time: number }>>)
      ),
    [handleRequest]
  );

  // 15. Estatísticas de um Bot Específico (/bot/stats - GET)
  const getBotStats = useCallback(
    (id: string) =>
      handleRequest(() =>
        fetch(`${API_BASE_URL}/bots/stats/${id}`, {
          headers: getDefaultHeaders()
        }).then((res) => res.json() as Promise<ApiResponse<BotStats>>)
      ),
    [handleRequest]
  );  // 14. Estatísticas dos Bots (/bots/stats - GET)
  // Modificado para buscar estatísticas individuais de cada bot
  const getBotsStats = useCallback(
    async (): Promise<ApiResponse<BotsStats>> => {
      try {
        setLoading(true);
        setError(null);

        // Primeiro, buscar todos os bots para obter seus IDs
        const botsResponse = await fetch(`${API_BASE_URL}/bots`, {
          headers: getDefaultHeaders()
        }).then((res) => res.json() as Promise<ApiResponse<BotResponseData[]>>);

        if (!botsResponse.data) {
          return {
            message: "Falha ao buscar bots",
            status: 400,
            data: undefined
          };
        }

        // Preparar a estrutura de dados para BotsStats
        const botsStats: BotsStats = {
          total_bots: botsResponse.data.length,
          active_bots: botsResponse.data.filter(bot => bot.running).length,
          inactive_bots: botsResponse.data.filter(bot => !bot.running).length,
          total_sales: 0,
          total_revenue: 0,
          bots_stats: []
        };

        // Para cada bot, buscar suas estatísticas
        await Promise.all(botsResponse.data.map(async (bot) => {
          try {
            if (!bot._id) return; // Ignorar bots sem ID

            // Buscar as estatísticas do bot
            const statsResponse = await fetch(`${API_BASE_URL}/bots/stats/${bot._id}`, {
              headers: getDefaultHeaders()
            }).then((res) => res.json() as Promise<BotStatsApiResponse>);

            // Verificar se a resposta contém dados válidos
            if (statsResponse.data && statsResponse.data.stats) {
              const stats = statsResponse.data.stats;

              // Usar o campo evaluate para o faturamento (valor em reais)
              const revenue = stats.evaluate || 0;
              const salesCount = stats.total || 0;

              console.log(`Bot ${bot.name}: Estatísticas - Vendas: ${salesCount}, Faturamento: R$${revenue}`);

              // Adicionar às estatísticas totais
              botsStats.total_sales += salesCount;
              botsStats.total_revenue += revenue;

              // Adicionar às estatísticas de bots
              botsStats.bots_stats.push({
                bot_id: bot._id,
                bot_name: bot.name,
                sales_count: salesCount,
                revenue: revenue
              });
            }
          } catch (error) {
            console.error(`Erro ao buscar estatísticas do bot ${bot._id}:`, error);
          }
        }));

        return {
          message: "Estatísticas de bots recuperadas com sucesso",
          status: 200,
          data: botsStats
        };
      } catch (error) {
        console.error("Erro ao buscar estatísticas dos bots:", error);
        setError(error instanceof Error ? error : new Error(String(error)));
        return {
          message: "Erro ao buscar estatísticas dos bots",
          status: 500,
          data: undefined
        };
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]);

  // 6. Criar Callback (/callbacks/create - POST)
  const createCallback = useCallback(
    (payload: CreateCallbackPayload) => {
      const finalPayload = {
        title: payload.title,
        message: sanitizeMessageFields(payload.message) as Message,
        premessage: sanitizeMessageFields(payload.premessage),
      };

      return handleRequest(() =>
        fetch(`${API_BASE_URL}/callbacks/create`, {
          method: 'POST',
          headers: getDefaultHeaders(),
          body: JSON.stringify(finalPayload),
        }).then((res) => res.json() as Promise<ApiResponse<CallbackResponseData>>)
      );
    },
    [handleRequest]
  );

  // 22. Atualizar Callback (/callbacks/update - POST)
  const updateCallback = useCallback(
    (id: string, payload: CreateCallbackPayload) => {
      const finalPayload = {
        id,
        title: payload.title,
        message: sanitizeMessageFields(payload.message) as Message,
        premessage: sanitizeMessageFields(payload.premessage),
      };
      
      console.log('Enviando requisição de atualização de callback:', finalPayload);

      return handleRequest(() =>
        fetch(`${API_BASE_URL}/callbacks/update`, {
          method: 'POST',
          headers: getDefaultHeaders(),
          body: JSON.stringify(finalPayload),
        }).then(async (res) => {
          if (!res.ok) {
            console.error('Erro na resposta:', res.status, res.statusText);
            throw new Error(`Erro na resposta: ${res.status} ${res.statusText}`);
          }

          // Verificar se a resposta está vazia
          const text = await res.text();
          if (!text) {
            console.warn('Resposta vazia recebida do servidor');
            // Retornar uma resposta compatível com o tipo ApiResponse
            return { 
              message: 'Operação realizada com sucesso',
              data: payload as unknown as CallbackResponseData, // Usar o payload enviado como dados de retorno
              status: 200 
            };
          }

          try {
            // Tentar analisar como JSON
            const json = JSON.parse(text);
            return json as ApiResponse<CallbackResponseData>;
          } catch (err) {
            console.error('Erro ao analisar resposta JSON:', err);
            throw new Error('Resposta inválida do servidor: não foi possível analisar como JSON');
          }
        })
      );
    },
    [handleRequest]
  );

  // 8. Deletar Callback (/callbacks/delete - POST)
  const deleteCallback = useCallback(
    (id: string) =>
      handleRequest(() =>
        fetch(`${API_BASE_URL}/callbacks/delete`, {
          method: 'POST',
          headers: getDefaultHeaders(),
          body: JSON.stringify({ id }),
        }).then((res) => res.json() as Promise<ApiDeleteResponse>)
      ),
    [handleRequest]
  );

  // 7. Listar Callbacks (/callbacks - GET)
  const listCallbacks = useCallback(
    () =>
      handleRequest(() =>
        fetch(`${API_BASE_URL}/callbacks`, {
          headers: getDefaultHeaders()
        }).then((res) => res.json() as Promise<ApiResponse<CallbackResponseData[]>>)
      ), [handleRequest]
  );

  // 9. Criar Produto (/products/create - POST)
  const createProduct = useCallback(
    (payload: CreateProductPayload) => {
      const finalPayload = {
        name: payload.name,
        price: payload.price,
        message: sanitizeMessageFields(payload.message) as Message,
        qrcode: {
          resize: payload.qrcode.resize,
          cord_x: payload.qrcode.cord_x,
          cord_y: payload.qrcode.cord_y,
          message: sanitizeMessageFields(payload.qrcode.message) as Message,
        },
        approve: {
          message: sanitizeMessageFields(payload.approve.message) as Message,
          action: payload.approve.action,
          data: payload.approve.data,
        },
      };

      return handleRequest(() =>
        fetch(`${API_BASE_URL}/products/create`, {
          method: 'POST',
          headers: getDefaultHeaders(),
          body: JSON.stringify(finalPayload),
        }).then((res) => res.json() as Promise<ApiResponse<ProductResponseData>>)
      );
    },
    [handleRequest]
  );

  // 21. Atualizar Produto (/products/update - POST)
  const updateProduct = useCallback(
    (id: string, payload: CreateProductPayload) => {
      const finalPayload = {
        id,
        name: payload.name,
        price: payload.price,
        message: sanitizeMessageFields(payload.message) as Message,
        qrcode: {
          resize: payload.qrcode.resize,
          cord_x: payload.qrcode.cord_x,
          cord_y: payload.qrcode.cord_y,
          message: sanitizeMessageFields(payload.qrcode.message) as Message,
        },
        approve: {
          message: sanitizeMessageFields(payload.approve.message) as Message,
          action: payload.approve.action,
          data: payload.approve.data,
        },
      };

      return handleRequest(() =>
        fetch(`${API_BASE_URL}/products/update`, {
          method: 'POST',
          headers: getDefaultHeaders(),
          body: JSON.stringify(finalPayload),
        }).then((res) => res.json() as Promise<ApiResponse<ProductResponseData>>)
      );
    },
    [handleRequest]
  );

  // 11. Deletar Produto (/products/delete - POST)
  const deleteProduct = useCallback(
    (id: string) =>
      handleRequest(() =>
        fetch(`${API_BASE_URL}/products/delete`, {
          method: 'POST',
          headers: getDefaultHeaders(),
          body: JSON.stringify({ id }),
        }).then((res) => res.json() as Promise<ApiDeleteResponse>)
      ),
    [handleRequest]
  );

  // 10. Listar Produtos (/products - GET)
  const listProducts = useCallback(
    () =>
      handleRequest(() =>
        fetch(`${API_BASE_URL}/products`, {
          headers: getDefaultHeaders()
        }).then((res) => res.json() as Promise<ApiResponse<ProductResponseData[]>>)
      ),
    [handleRequest]
  );

  // 16. Obter Produto Específico (/product - GET)
  const getProduct = useCallback(
    (id: string) =>
      handleRequest(() =>
        fetch(`${API_BASE_URL}/product/${id}`, {
          headers: getDefaultHeaders()
        }).then((res) => res.json() as Promise<ApiResponse<ProductResponseData>>)
      ),
    [handleRequest]
  );

  // 17. Estatísticas de um Produto (/product/stats - GET)
  const getProductStats = useCallback(
    (id: string) =>
      handleRequest(() =>
        fetch(`${API_BASE_URL}/product/stats/${id}`, {
          headers: getDefaultHeaders()
        }).then((res) => res.json() as Promise<ApiResponse<ProductStats>>)
      ),
    [handleRequest]
  );

  // 12. Webhook Mercado Pago (/webhook/mercadopago - POST)
  const sendMercadoPagoWebhook = useCallback(
    (payload: MercadoPagoWebhookPayload) =>
      handleRequest(() =>
        fetch(`${API_BASE_URL}/webhook/mercadopago`, {
          method: 'POST',
          headers: getDefaultHeaders(),
          body: JSON.stringify(payload),
        }).then((res) => res.json() as Promise<ApiResponse<MercadoPagoWebhookResponse>>)
      ),
    [handleRequest]
  );

  // 19. Listar Transações (/transactions - GET)
  const listTransactions = useCallback(
    (botId: number) => {
      // Se o botId for fornecido, busca transações específicas desse bot
      // Caso contrário, busca todas as transações
      let url = `${API_BASE_URL}/transactions/${botId}`

      const params = new URLSearchParams();

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      return handleRequest(() =>
        fetch(url, {
          headers: getDefaultHeaders()
        }).then((res) => res.json() as Promise<ApiResponse<TransactionsResponse>>)
      );
    },
    [handleRequest]
  );  // Nova função: Buscar transações de todos os bots
  const listAllTransactions = useCallback(async (): Promise<ApiResponse<TransactionsResponse>> => {
    try {
      // Usar o limitRequest para evitar múltiplas requisições para o mesmo endpoint
      const botsResponse = await limitRequest("bots_list", () =>
        fetch(`${API_BASE_URL}/bots`, {
          headers: getDefaultHeaders()
        }).then((res) => res.json() as Promise<ApiResponse<BotResponseData[]>>)
      );

      if (!botsResponse.data || !Array.isArray(botsResponse.data)) {
        console.error("Falha ao buscar bots ou formato inesperado");
        return {
          message: "Falha ao buscar bots",
          status: 400,
          data: {
            total: 0,
            limit: 0,
            offset: 0,
            transactions: []
          }
        };
      }

      console.log(`ApiContext - Total de bots encontrados: ${botsResponse.data.length}`);

      // Preparar resultado consolidado de transações e produtos
      const allTransactions: Transaction[] = [];
      const botsWithTransactions: BotWithTransactions[] = [];

      // Buscar todos os produtos para ter informações completas
      const productsResponse = await limitRequest("products_list", () =>
        fetch(`${API_BASE_URL}/products`, {
          headers: getDefaultHeaders()
        }).then((res) => res.json() as Promise<ApiResponse<ProductResponseData[]>>)
      );

      const productsMap = new Map<string, ProductResponseData>();
      if (productsResponse.data && Array.isArray(productsResponse.data)) {
        productsResponse.data.forEach(product => {
          if (product._id) {
            productsMap.set(product._id, product);
          }
        });
        console.log(`ApiContext - Total de produtos encontrados: ${productsMap.size}`);
      } else {
        console.warn("Nenhum produto encontrado na API");
      }

      // Para cada bot, buscar suas transações sequencialmente
      for (const bot of botsResponse.data) {
        if (!bot._id) continue; // Ignorar bots sem ID

        try {
          console.log(`ApiContext - Buscando transações para bot: ${bot.name} (${bot._id})`);

          // Buscar as transações do bot com limitação de requisição
          const transactionsResponse = await limitRequest(`transactions_${bot._id}`, () =>
            fetch(`${API_BASE_URL}/transactions/${bot._id}`, {
              headers: getDefaultHeaders()
            }).then((res) => res.json() as Promise<ApiResponse<{
              _id: string;
              name: string;
              monthlyTransactions: Array<{
                _id: string;
                created_at: number;
                updated_at: number;
                user: string;
                bot: string;
                product: string;
                status: string;
                payment_id: number;
              }>;
            }>>)
          );

          // Verificar o formato da resposta
          console.log(`ApiContext - Resposta transações do bot ${bot.name}:`,
            JSON.stringify(transactionsResponse).substring(0, 200) + "...");

          // Verificar se a resposta tem o formato esperado de bot com transações mensais
          if (transactionsResponse.data &&
            transactionsResponse.data._id &&
            transactionsResponse.data.monthlyTransactions &&
            Array.isArray(transactionsResponse.data.monthlyTransactions)) {

            const botTransactions = transactionsResponse.data.monthlyTransactions;
            console.log(`ApiContext - Bot ${bot.name}: ${botTransactions.length} transações encontradas`);

            // Transformar transações do formato de resposta para o formato esperado pelo app
            const formattedTransactions = botTransactions.map((transaction: {
              _id: string;
              created_at: number;
              updated_at: number;
              user: string;
              bot: string;
              product: string;
              status: string;
              payment_id: number;
            }) => {
              // Buscar dados do produto no mapa de produtos
              const productData = productsMap.get(transaction.product) || {
                _id: transaction.product,
                name: `Produto ${transaction.product}`,
                price: 0
              };

              // Criar transação formatada
              const formattedTransaction: Transaction = {
                _id: transaction._id,
                created_at: transaction.created_at,
                updated_at: transaction.updated_at,
                bot: {
                  id: bot._id,
                  name: bot.name
                },
                user: {
                  id: transaction.user,
                  telegram_id: 0, // Valor padrão, não temos essa info
                  name: "Usuário" // Valor padrão, não temos essa info
                },
                product: {
                  id: transaction.product,
                  name: productData.name,
                  price: productData.price || 0
                },
                status: transaction.status,
                payment_id: transaction.payment_id
              };

              return formattedTransaction;
            });

            // Adicionar transações ao array geral
            allTransactions.push(...formattedTransactions);

            // Armazenar dados formatados do bot com suas transações
            if (formattedTransactions.length > 0) {
              botsWithTransactions.push({
                _id: bot._id,
                name: bot.name,
                monthlyTransactions: formattedTransactions
              });

              console.log(`ApiContext - Bot ${bot.name} adicionado à lista de bots com transações`);
            }
          } else {
            console.warn(`ApiContext - Formato de resposta inesperado para bot ${bot.name}`);
          }
        } catch (error) {
          console.error(`Erro ao buscar transações do bot ${bot._id}:`, error);
        }
      }

      // Consolidar produtos das transações
      const consolidatedProductsMap = new Map<string, ConsolidatedProduct>();

      // Processar TODOS os produtos das transações, independente do status
      console.log(`ApiContext - Total de transações para processar: ${allTransactions.length}`);

      allTransactions.forEach(transaction => {
        // Verificar se a transação tem produto
        if (!transaction.product?.id) {
          console.log(`ApiContext - Transação sem produto: ${transaction._id}`);
          return;
        }

        const productId = transaction.product.id;
        const existingProduct = consolidatedProductsMap.get(productId);

        // Garantir que o preço seja um número válido
        const price = typeof transaction.product.price === 'number' ?
          transaction.product.price :
          parseFloat(transaction.product.price as unknown as string) || 0;

        // Log para ajudar na depuração
        console.log(`ApiContext - Processando produto: ID: ${productId}, Nome: ${transaction.product.name}, Status: ${transaction.status}, Preço: ${price}`);

        if (existingProduct) {
          existingProduct.count += 1;
          existingProduct.totalRevenue += price;

          // Adicionar contador específico de aprovados apenas se for aprovado
          if (transaction.status === "approved") {
            existingProduct.approvedCount = (existingProduct.approvedCount || 0) + 1;
          }
        } else {
          consolidatedProductsMap.set(productId, {
            id: productId,
            name: transaction.product.name,
            price: price,
            count: 1,
            totalRevenue: price,
            approvedCount: transaction.status === "approved" ? 1 : 0
          });
        }
      });

      // Converter mapa de produtos para array
      const consolidatedProducts = Array.from(consolidatedProductsMap.values());
      console.log(`ApiContext - ${consolidatedProducts.length} produtos consolidados`);

      // Criar resposta consolidada
      const response: ApiResponse<TransactionsResponse> = {
        message: "Transações recuperadas com sucesso",
        status: 200,
        data: {
          total: allTransactions.length,
          limit: allTransactions.length,
          offset: 0,
          transactions: allTransactions,
          botsWithTransactions,
          consolidatedProducts
        }
      };

      return response;
    } catch (error) {
      console.error("Erro ao buscar todas as transações:", error);
      return {
        message: "Erro ao buscar transações",
        status: 500,
        data: {
          total: 0,
          limit: 0,
          offset: 0,
          transactions: []
        }
      };
    }
  }, []);

  // 15. Estatísticas detalhadas de transações por filtro (/bots/stats - POST)
  const getBotStatsDetailed = useCallback(
    async (filter: { bot?: string, status?: 'pending' | 'approved' | 'rejected', dateRange?: { start: number, end: number } }) => {
      try {
        setLoading(true);
        setError(null);

        // Log do filtro para depuração
        console.log("Enviando filtros para /bots/stats:", filter);

        const response = await fetch(`${API_BASE_URL}/bots/stats`, {
          method: 'POST',
          headers: getDefaultHeaders(),
          body: JSON.stringify(filter),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Erro ao buscar estatísticas detalhadas dos bots:", error);
        setError(error as Error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  // Métodos para Despesas

  // Listar todas as despesas
  const getAllExpenses = useCallback(
    () =>
      handleRequest(() =>
        fetch(`${API_BASE_URL}/expenses`, {
          headers: getDefaultHeaders()
        }).then((res) => res.json() as Promise<ApiResponse<ExpenseData[]>>)
      ),
    [handleRequest]
  );

  // Criar uma nova despesa
  const createExpense = useCallback(
    (data: ExpenseCreate) =>
      handleRequest(() =>
        fetch(`${API_BASE_URL}/expenses/create`, {
          method: 'POST',
          headers: getDefaultHeaders(),
          body: JSON.stringify(data)
        }).then((res) => res.json() as Promise<ApiResponse<ExpenseData>>)
      ),
    [handleRequest]
  );

  // Excluir uma despesa
  const deleteExpense = useCallback(
    (id: string) =>
      handleRequest(() =>
        fetch(`${API_BASE_URL}/expenses/delete`, {
          method: 'POST',
          headers: getDefaultHeaders(),
          body: JSON.stringify({ id })
        }).then((res) => res.json() as Promise<ApiDeleteResponse>)
      ),
    [handleRequest]
  );

  // Atualizar status pago de uma despesa
  const updateExpensePaidStatus = useCallback(
    (id: string, paid: boolean) =>
      handleRequest(() =>
        fetch(`${API_BASE_URL}/expenses/${id}/paid`, {
          method: 'POST',
          headers: getDefaultHeaders(),
          body: JSON.stringify({ paid })
        }).then((res) => res.json() as Promise<ApiResponse<ExpenseData>>)
      ),
    [handleRequest]
  );

  // Métodos para Parceiros

  // Listar todos os parceiros
  const getAllPartners = useCallback(
    () =>
      handleRequest(() =>
        fetch(`${API_BASE_URL}/partners`, {
          headers: getDefaultHeaders()
        }).then((res) => res.json() as Promise<ApiResponse<PartnerData[]>>)
      ),
    [handleRequest]
  );

  // Criar um novo parceiro
  const createPartner = useCallback(
    (data: PartnerCreate) =>
      handleRequest(() =>
        fetch(`${API_BASE_URL}/partners/create`, {
          method: 'POST',
          headers: getDefaultHeaders(),
          body: JSON.stringify(data)
        }).then((res) => res.json() as Promise<ApiResponse<PartnerData>>)
      ),
    [handleRequest]
  );

  // Excluir um parceiro
  const deletePartner = useCallback(
    (id: string) =>
      handleRequest(() =>
        fetch(`${API_BASE_URL}/partners/delete`, {
          method: 'POST',
          headers: getDefaultHeaders(),
          body: JSON.stringify({ id })
        }).then((res) => res.json() as Promise<ApiDeleteResponse>)
      ),
    [handleRequest]
  );

  // Métodos para Notificações

  // Listar notificações (todas ou apenas não lidas)
  const listNotifications = useCallback(
    (unreadOnly?: boolean) => {
      const url = unreadOnly 
        ? `${API_BASE_URL}/notifications?unread=true`
        : `${API_BASE_URL}/notifications`;
      
      return handleRequest(() =>
        fetch(url, {
          headers: getDefaultHeaders()
        }).then((res) => res.json() as Promise<ApiResponse<NotificationData[]>>)
      );
    },
    [handleRequest]
  );

  // Marcar uma notificação como lida
  const markNotificationAsRead = useCallback(
    (id: string) =>
      handleRequest(() =>
        fetch(`${API_BASE_URL}/notifications/read/${id}`, {
          method: 'POST',
          headers: getDefaultHeaders(),
        }).then((res) => res.json() as Promise<ApiResponse<any>>)
      ),
    [handleRequest]
  );

  // Marcar todas as notificações como lidas
  const markAllNotificationsAsRead = useCallback(
    () =>
      handleRequest(() =>
        fetch(`${API_BASE_URL}/notifications/read/all`, {
          method: 'POST',
          headers: getDefaultHeaders(),
        }).then((res) => res.json() as Promise<ApiResponse<any>>)
      ),
    [handleRequest]
  );

  // Deletar uma notificação
  const deleteNotification = useCallback(
    (id: string) =>
      handleRequest(() =>
        fetch(`${API_BASE_URL}/notifications/${id}`, {
          method: 'DELETE',
          headers: getDefaultHeaders(),
        }).then((res) => res.json() as Promise<ApiDeleteResponse>)
      ),
    [handleRequest]
  );

  return (
    <ApiContext.Provider
      value={{
        // Bot
        createBot,
        updateBot,
        deleteBot,
        listBots,
        getBot,
        listRunningBots,
        getBotStatsDetailed,
        restartBot,
        getBotStats,
        getBotsStats,

        // Callback
        createCallback,
        updateCallback,
        deleteCallback,
        listCallbacks,

        // Produto
        createProduct,
        updateProduct,
        deleteProduct,
        listProducts,
        getProduct,
        getProductStats,

        // Despesas
        getAllExpenses,
        createExpense,
        deleteExpense,
        updateExpensePaidStatus,

        // Parceiros
        getAllPartners,
        createPartner,
        deletePartner,

        // Webhook
        sendMercadoPagoWebhook,

        // Transações
        listTransactions,
        listAllTransactions,

        // Notificações
        listNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,

        // Estado
        loading,
        error,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};
