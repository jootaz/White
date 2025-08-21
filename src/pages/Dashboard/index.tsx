import { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Chip, IconButton, Select, MenuItem, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ProductResponseData as ApiProductResponseData } from '../../types/api'; // Importamos apenas o tipo que precisamos e renomeamos para evitar conflito
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LaunchIcon from '@mui/icons-material/Launch';
import RefreshIcon from '@mui/icons-material/Refresh';

// Interfaces globais para o componente
interface ChartDataPoint {
  name: string;
  lucros: number;
  gastos: number;
}

// Definimos um tipo para as transações da API
interface ApiTransaction {
  _id: string;
  created_at: number;
  updated_at: number;
  bot: string;
  user: string;
  product: string;
  status: string;
  payment_id: number;
}

// Novas importações para DatePicker
// Removidas pois não são mais necessárias com a nova interface de seleção

// Importações dos novos ícones
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';


// Importando utilitários para filtragem de datas
import { filterTransactionsFromReferenceDate } from '../../utils/dateUtils';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MaisInfoIcon from '../../assets/MaisInfo.svg';

// Importação dos modais
import RankingBotsModal from '../../components/RankingBotsModal';
import VendasDetalhadasModal from '../../components/VendasDetalhadasModal';
import BotTransacoesModal from '../../components/BotTransacoesModal';

import ProdutoTransacoesModal from '../../components/ProdutoTransacoesModal';

// Removemos o botService e vamos usar o hook useApi
import { useApi } from '../../hooks/useApi';

// Use the imported type instead of creating a duplicate
type ProductResponseData = ApiProductResponseData;

export function Dashboard() {
  const api = useApi();

  // State variables for modals
  const [vendasModalOpen, setVendasModalOpen] = useState(false);
  const [selectedBotId, setSelectedBotId] = useState<string>('');
  const [showProductsTab, setShowProductsTab] = useState<boolean>(false);
  const [botTransacoesModalOpen, setBotTransacoesModalOpen] = useState(false);
  const [currentBotId, setCurrentBotId] = useState<string>('');
  // Estado para controlar o modal de ranking de bots
  const [rankingBotsModalOpen, setRankingBotsModalOpen] = useState(false);
  const [allBotsSorted, setAllBotsSorted] = useState<{ bot_id: string, bot_name: string, sales_count: number, revenue: number }[]>([]);
  // Estado para controlar o modal de transações de produtos
  const [produtoTransacoesModalOpen, setProdutoTransacoesModalOpen] = useState(false);
  const [currentProdutoId, setCurrentProdutoId] = useState<string>('');
  const [showAllProducts, setShowAllProducts] = useState(false);

  const [totalBots, setTotalBots] = useState(0);
  const [activeBots, setActiveBots] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalDailyRevenue, setTotalDailyRevenue] = useState(0);
  const [totalAnnualRevenue, setTotalAnnualRevenue] = useState(0);
  const [totalSalesCount, setTotalSalesCount] = useState(0);
  const [totalApprovedSales, setTotalApprovedSales] = useState(0);
  const [totalPendingSales, setTotalPendingSales] = useState(0);
  const [totalCancelledSales, setTotalCancelledSales] = useState(0);
  const [loading, setLoading] = useState(true);
  // Interface para estatísticas agregadas de produtos
  interface ProductAggregatedStats {
    product_id: string;
    product_name: string;
    total_revenue: number;
    total_sales: number;
    approved_sales?: number;
    is_approved_any?: boolean;
  }

  const [lineChartData, setLineChartData] = useState<ChartDataPoint[]>([]);
  const [campeaoDeVendasBot, setCampeaoDeVendasBot] = useState<{ bot_id: string, bot_name: string, sales_count: number, revenue: number } | null>(null); const [top3Bots, setTop3Bots] = useState<{ bot_id: string, bot_name: string, sales_count: number, revenue: number }[]>([]);
  const [campeaoDeVendasProduto, setCampeaoDeVendasProduto] = useState<ProductAggregatedStats | null>(null); const [top3Produtos, setTop3Produtos] = useState<ProductAggregatedStats[]>([]);  // Estado para armazenar as transações
  const [monthlyData, setMonthlyData] = useState<ChartDataPoint[]>([]);
  const [dailyData, setDailyData] = useState<ChartDataPoint[]>([]);
  const [annualData, setAnnualData] = useState<ChartDataPoint[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'diario' | 'mensal' | 'anual'>('mensal');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());


  // Método atualizado para abrir modal de vendas sem filtrar por bot (mostrar todas as vendas)
  const handleOpenVendasModal = () => {
    setSelectedBotId('');
    setShowProductsTab(false);
    setVendasModalOpen(true);
  };  // Método para abrir modal de vendas de um bot específico
  // Comentado pois não está mais em uso após a implementação do modal de transações de bot
  // Este handler era usado para abrir o modal de vendas detalhadas filtrado por bot
  // Agora usamos handleOpenBotTransacoesModal para mostrar as transações específicas de cada bot
  // const handleOpenVendasModalByBot = (botId: string) => {
  //   setSelectedBotId(botId);
  //   setShowProductsTab(false);
  //   setVendasModalOpen(true);
  // };

  // Este método foi removido pois não está mais sendo usado
  // O handleOpenProdutoTransacoesModal é chamado diretamente nos handlers que precisam abrir o modal de produtos
  // Handlers para o modal de transações de produtos
  const handleOpenProdutoTransacoesModal = (produtoId?: string) => {
    console.log("[DEBUG Dashboard] Abrindo modal de produtos, produtoId:", produtoId);

    // Primeiro fechamos o modal caso esteja aberto
    // para forçar uma reinicialização limpa
    if (produtoTransacoesModalOpen) {
      setProdutoTransacoesModalOpen(false);

      // Configuramos os estados após fechar
      setTimeout(() => {
        if (produtoId) {
          setCurrentProdutoId(produtoId);
          setShowAllProducts(false);
        } else {
          setCurrentProdutoId('');
          setShowAllProducts(true);
        }

        // Depois reabrimos o modal
        console.log("[DEBUG Dashboard] Definindo modal como aberto (após fechar)");
        setProdutoTransacoesModalOpen(true);
      }, 300);
    } else {
      // Se o modal não estava aberto, podemos simplesmente definir os estados
      if (produtoId) {
        setCurrentProdutoId(produtoId);
        setShowAllProducts(false);
      } else {
        setCurrentProdutoId('');
        setShowAllProducts(true);
      }

      console.log("[DEBUG Dashboard] Definindo modal como aberto (primeira abertura)");
      setProdutoTransacoesModalOpen(true);
    }
  };
  const handleCloseProdutoTransacoesModal = () => {
    console.log("[DEBUG Dashboard] Fechando modal de produtos");
    // Primeiro fechamos o modal
    setProdutoTransacoesModalOpen(false);

    // Depois limpamos os estados com um pequeno delay
    // para garantir que o modal já fechou completamente
    setTimeout(() => {
      setCurrentProdutoId('');
      setShowAllProducts(false);
    }, 200);
  };

  const handleCloseVendasModal = () => setVendasModalOpen(false);

  // Handlers para o modal de ranking completo de bots
  const handleOpenRankingBotsModal = () => setRankingBotsModalOpen(true);
  const handleCloseRankingBotsModal = () => setRankingBotsModalOpen(false);

  // Handlers para o modal de transações de bot
  const handleOpenBotTransacoesModal = (botId: string) => {
    setCurrentBotId(botId);
    setBotTransacoesModalOpen(true);
  }; const handleCloseBotTransacoesModal = () => {
    setBotTransacoesModalOpen(false);
    // Limpa o botId atual ao fechar o modal
    // Isso ajuda a evitar render desnecessário quando abrir o modal novamente
    setCurrentBotId('');
  };

  // Função para obter o valor de faturamento de acordo com o período selecionado
  const getFaturamentoByPeriod = (): number => {
    // Usar sempre o período selecionado pelo usuário
    console.log("[DEBUG] getFaturamentoByPeriod - Período selecionado:", selectedPeriod,
      "Mês/Ano:", selectedMonth + 1, "/", selectedYear);

    switch (selectedPeriod) {
      case 'diario':
        return totalDailyRevenue;
      case 'mensal':
        return totalRevenue;
      case 'anual':
        return totalAnnualRevenue;
      default:
        return totalRevenue;
    }
  };

  const refreshDashboard = () => {
    fetchDashboardData();
  };
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Buscar todos os bots
      const allBotsResponse = await api.listBots();
      const allBots = allBotsResponse.data || [];
      setTotalBots(allBots.length);

      // Determinar bots ativos e inativos baseado no status
      const activeBotsCount = allBots.filter(bot => bot.running === true).length;
      setActiveBots(activeBotsCount);

      // 2. Configurar filtros de data baseados no mês/ano selecionado
      const targetDate = new Date(selectedYear, selectedMonth, 1);
      const now = Date.now();

      // Período de 30 dias para dados históricos, mas centrado na data selecionada
      const fifteenDaysBefore = new Date(targetDate);
      fifteenDaysBefore.setDate(targetDate.getDate() - 15);

      const fifteenDaysAfter = new Date(targetDate);
      fifteenDaysAfter.setDate(targetDate.getDate() + 15);

      // 3. Buscar estatísticas detalhadas
      const detailedStatsResponse = await api.getBotStatsDetailed({
        dateRange: {
          start: fifteenDaysBefore.getTime(),
          end: fifteenDaysAfter.getTime() > now ? now : fifteenDaysAfter.getTime()
        }
      });

      console.log("Estatísticas detalhadas:", detailedStatsResponse);

      if (detailedStatsResponse.data && detailedStatsResponse.status === 200) {      // 4. Buscar todos os produtos para ter informações completas
        const productsResponse = await api.listProducts();
        const productsMap = new Map<string, ProductResponseData>();

        if (productsResponse.data && Array.isArray(productsResponse.data)) {
          productsResponse.data.forEach(product => {
            if (product._id) {
              productsMap.set(product._id, product);
            }
          });
          console.log(`Dashboard - Total de produtos encontrados: ${productsMap.size}`);
        } else {
          console.warn("Nenhum produto encontrado na API");
        }
        // 5. Processar os stats e criar um mapa de produtos vendidos
        const { data } = detailedStatsResponse;

        // Anteriormente filtrava transações a partir de 25/06/2025, agora mostra todas as transações
        const filteredData = filterTransactionsFromReferenceDate(data);
        console.log(`[INFO] Mostrando todas as transações: ${filteredData.length} de ${data.length} transações`);

        const productCountMap = new Map<string, { count: number, totalRevenue: number, product: string }>();

        let approvedCount = 0;
        let pendingCount = 0;
        let cancelledCount = 0;

        // Data de referência para filtrar transações baseada no mês/ano selecionado
        const referenceDate = new Date(selectedYear, selectedMonth, 1);
        console.log("[DEBUG] Data de referência para filtrar transações:", referenceDate.toLocaleDateString('pt-BR'));

        // Data do dia para filtrar transações do primeiro dia do mês selecionado
        const startOfDay = new Date(selectedYear, selectedMonth, 1, 0, 0, 0, 0).getTime();
        const endOfDay = new Date(selectedYear, selectedMonth, 1, 23, 59, 59, 999).getTime();

        console.log("[DEBUG] Período do dia de referência:",
          new Date(startOfDay).toLocaleString('pt-BR'), "até", new Date(endOfDay).toLocaleString('pt-BR'));

        // Data do mês da data selecionada
        const startOfMonth = new Date(selectedYear, selectedMonth, 1).getTime();
        const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999).getTime();

        console.log("[DEBUG] Períodos para filtrar transações:");
        console.log("- Dia:", new Date(startOfDay).toLocaleDateString('pt-BR'), "a", new Date(endOfDay).toLocaleDateString('pt-BR'));
        console.log("- Mês:", new Date(startOfMonth).toLocaleDateString('pt-BR'), "a", new Date(endOfMonth).toLocaleDateString('pt-BR'));

        // Variáveis para armazenar faturamento do dia e do mês
        let dailyRevenue = 0;
        let monthlyRevenue = 0;

        // Processar transações do endpoint detalhado
        if (Array.isArray(filteredData)) {
          filteredData.forEach(transaction => {
            // Contar transações por status
            if (transaction.status === 'approved') {
              approvedCount++;
            } else if (transaction.status === 'pending') {
              pendingCount++;
            } else {
              cancelledCount++;
            }

            // Adicionar produto à contagem
            if (transaction.product) {
              const productId = typeof transaction.product === 'string' ?
                transaction.product :
                transaction.product.id;

              // Verificar se já temos este produto no mapa
              if (productCountMap.has(productId)) {
                const productData = productCountMap.get(productId)!;
                productData.count += 1;

                // Adicionar ao faturamento se for aprovado
                if (transaction.status === 'approved') {
                  // Buscar o preço do produto
                  const productInfo = productsMap.get(productId);
                  if (productInfo) {
                    const price = typeof productInfo.price === 'number' ?
                      productInfo.price :
                      parseFloat(productInfo.price as unknown as string) || 0;

                    productData.totalRevenue += price;                  // Verificar se é do dia selecionado
                    const transactionTime = transaction.created_at;
                    if (transactionTime >= startOfDay && transactionTime <= endOfDay) {
                      dailyRevenue += price;
                    }

                    // Verificar se é do mês da data selecionada
                    if (transactionTime >= startOfMonth && transactionTime <= endOfMonth) {
                      monthlyRevenue += price;
                    }
                  }
                }

                productCountMap.set(productId, productData);
              } else {
                // Primeira ocorrência deste produto
                const isApproved = transaction.status === 'approved';

                // Buscar o preço do produto
                const productInfo = productsMap.get(productId);
                const price = productInfo && isApproved ?
                  (typeof productInfo.price === 'number' ?
                    productInfo.price :
                    parseFloat(productInfo.price as unknown as string) || 0)
                  : 0;

                productCountMap.set(productId, {
                  count: 1,
                  totalRevenue: isApproved ? price : 0,
                  product: productId
                });

                // Adicionar às métricas se aprovado
                if (isApproved) {

                  // Verificar se é do dia selecionado
                  const transactionTime = transaction.created_at;
                  if (transactionTime >= startOfDay && transactionTime <= endOfDay) {
                    dailyRevenue += price;
                  }

                  // Verificar se é do mês da data selecionada
                  if (transactionTime >= startOfMonth && transactionTime <= endOfMonth) {
                    monthlyRevenue += price;
                  }
                }
              }
            }
          });
        }

        // 6. Atualizar estados
        setTotalRevenue(monthlyRevenue); // Muda para faturamento mensal da data selecionada
        setTotalDailyRevenue(dailyRevenue);
        // setTotalWeeklyRevenue(weeklyRevenue); // Comentado pois será definido pelo processamento do gráfico
        setTotalSalesCount(approvedCount + pendingCount + cancelledCount);
        setTotalApprovedSales(approvedCount);
        setTotalPendingSales(pendingCount);
        setTotalCancelledSales(cancelledCount);

        // 7. Calcular estatísticas por bot
        const botStatsMap = new Map();

        // Processar transações para estatísticas de bot
        if (Array.isArray(filteredData)) {
          filteredData.forEach(transaction => {
            if (!transaction.bot) return;

            const botId = typeof transaction.bot === 'string' ?
              transaction.bot :
              transaction.bot?.id;
            const isApproved = transaction.status === 'approved';

            // Encontrar o bot correspondente
            const botInfo = allBots.find(b => b._id === botId);
            if (!botInfo) return;

            // Encontrar o preço do produto
            let price = 0;
            if (isApproved && transaction.product) {
              const productId = typeof transaction.product === 'string' ?
                transaction.product :
                transaction.product.id;
              const productInfo = productsMap.get(productId);
              if (productInfo) {
                price = typeof productInfo.price === 'number' ?
                  productInfo.price :
                  parseFloat(productInfo.price as unknown as string) || 0;
              }
            }

            // Obter ou criar estatísticas para este bot
            const botStats = botStatsMap.get(botId) || {
              bot_id: botId,
              bot_name: botInfo.name || 'Bot desconhecido',
              sales_count: 0,
              revenue: 0
            };

            // Incrementar apenas se aprovado
            if (isApproved) {
              botStats.sales_count++;
              botStats.revenue += price;
            }

            botStatsMap.set(botId, botStats);
          });
        }
        // Converter para array e ordenar por receita
        const botsSorted = Array.from(botStatsMap.values())
          .sort((a, b) => b.revenue - a.revenue);

        // Definir o campeão de vendas (bot com maior receita)
        if (botsSorted.length > 0) {
          setCampeaoDeVendasBot(botsSorted[0]);
        }

        // Definir o top 3 bots
        setTop3Bots(botsSorted.slice(0, 3));

        // Armazenar a lista completa de bots ordenados para o modal de ranking
        setAllBotsSorted(botsSorted);

        // Criar dados do gráfico para os bots
        const graphData = botsSorted.map(bot => ({
          name: bot.bot_name,
          lucros: bot.revenue,
          gastos: 0, // Assumimos gastos como 0 por enquanto
        }));
        setLineChartData(graphData);

        // 8. Calcular estatísticas de produtos com base no mapa de produtos
        const productStats: ProductAggregatedStats[] = [];

        // Converter o mapa de produtos para estatísticas agregadas
        productCountMap.forEach((data, productId) => {
          const productInfo = productsMap.get(productId);

          if (productInfo) {
            productStats.push({
              product_id: productId,
              product_name: productInfo.name,
              total_revenue: data.totalRevenue,
              total_sales: data.count,
              approved_sales: Math.floor(data.totalRevenue / (typeof productInfo.price === 'number' ? productInfo.price : parseFloat(String(productInfo.price)) || 1)), // Estimativa baseada no preço
              is_approved_any: data.totalRevenue > 0
            });
          }
        });

        if (productStats.length > 0) {
          // Ordenar produtos por receita e filtrar apenas os que têm vendas aprovadas
          const sortedProducts = [...productStats]
            .filter(p => p.approved_sales && p.approved_sales > 0 && p.is_approved_any)
            .sort((a, b) => b.total_revenue - a.total_revenue);

          // Definir o produto campeão e top 3
          if (sortedProducts.length > 0) {
            setCampeaoDeVendasProduto(sortedProducts[0]);
            setTop3Produtos(sortedProducts.slice(0, 3));
          } else {
            setCampeaoDeVendasProduto(null);
            setTop3Produtos([]);
          }
        }
        console.log(`Dashboard - Total de vendas por status: Aprovadas=${approvedCount}, Pendentes=${pendingCount}, Canceladas=${cancelledCount}`);

        // Processar dados para os gráficos diretamente        // Não vamos tentar converter para o tipo Transaction, mas sim processar os dados diretamente

        // Convertemos os dados para o formato esperado pelas funções de processamento
        const apiTransactions = Array.isArray(filteredData) ? filteredData.map(t => ({
          _id: t._id,
          created_at: t.created_at,
          updated_at: t.updated_at,
          bot: typeof t.bot === 'string' ? t.bot : (t.bot ? String(t.bot.id) : ''),
          user: typeof t.user === 'string' ? t.user : (t.user ? String(t.user.id) : ''),
          product: typeof t.product === 'string' ? t.product : (t.product ? String(t.product.id) : ''),
          status: t.status,
          payment_id: t.payment_id
        })) : [];
        // Data de referência para os gráficos (baseada no mês/ano selecionado)
        const targetDate = new Date(selectedYear, selectedMonth, selectedDay);
        console.log(`[DEBUG] Data de referência atualizada para: ${targetDate.toLocaleDateString('pt-BR')} (Dia: ${selectedDay}, Mês: ${selectedMonth + 1}, Ano: ${selectedYear})`);

        // Criar os dados do gráfico mensal com base na data selecionada
        const monthlyDataResult = processRawDataForMonthlyChart(apiTransactions, productsMap, targetDate);
        setMonthlyData(monthlyDataResult.chartData);

        // Criar os dados do gráfico diário com base na data selecionada
        const dailyDataResult = processRawDataForDailyChart(apiTransactions, productsMap, targetDate);
        setDailyData(dailyDataResult.chartData);

        // Criar os dados do gráfico anual
        const annualDataResult = processRawDataForAnnualChart(apiTransactions, productsMap, selectedYear);
        setAnnualData(annualDataResult.chartData);

        // Atualizar os valores totais baseados no período selecionado
        switch (selectedPeriod) {
          case 'mensal':
            setTotalRevenue(monthlyDataResult.totalRevenue);
            break;
          case 'diario':
            setTotalDailyRevenue(dailyDataResult.totalRevenue);
            break;
          case 'anual':
            setTotalAnnualRevenue(annualDataResult.totalRevenue);
            break;
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados para o dashboard:", error);
      resetarDadosDashboard();
    } finally {
      setLoading(false);
    }
  };  // Removemos as funções de processamento antigas que foram substituídas pelas novas  // Função auxiliar para resetar todos os dados do dashboard quando não há dados válidos
  const resetarDadosDashboard = () => {
    setTotalRevenue(0);
    setTotalDailyRevenue(0);
    setTotalAnnualRevenue(0);
    setTotalSalesCount(0);
    setActiveBots(0);
    setCampeaoDeVendasBot(null);
    setTop3Bots([]);
    setCampeaoDeVendasProduto(null);
    setTop3Produtos([]);
    setMonthlyData([]);
    setDailyData([]);
    setAnnualData([]);
  };
  // Efeito para carregar dados ao montar componente ou quando mês/ano/dia/período mudarem
  useEffect(() => {
    console.log("[DEBUG] Parâmetros mudaram - Dia:", selectedDay, "Mês:", selectedMonth + 1, "Ano:", selectedYear, "Período:", selectedPeriod);
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay, selectedMonth, selectedYear, selectedPeriod]);

  // Renderização do componente
  return (
    <Box sx={{ p: { xs: 2, sm: 2, marginTop: 50 } }}>
      <Box sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        mb: 3,
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography variant="h4" fontWeight={700} color="#fff" fontSize={{ xs: "1.5rem", sm: "2rem" }}>
          Dashboard
        </Typography>
        <Box sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "flex-start",
          gap: 2,
          width: { xs: "100%", sm: "auto" }
        }}>
          {/* Botão de atualizar */}
          <Box sx={{ display: "flex", alignItems: "center", width: { xs: "100%", sm: "auto" }, justifyContent: { xs: "space-between", sm: "flex-end" } }}>
            <Typography variant="body2" color="#8fa3c8" sx={{ display: { xs: "block", sm: "none" } }}>Atualizar</Typography>
            <IconButton
              color="primary"
              onClick={refreshDashboard}
              sx={{
                bgcolor: '#2a3756',
                color: '#8fa3c8',
                '&:hover': { bgcolor: '#3a4766' }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Box>

          <Box
            display="flex"
            alignItems="center"
            sx={{
              bgcolor: '#0a0909ff',
              p: '4px 8px',
              borderRadius: 2,
              flexWrap: { xs: "wrap", sm: "nowrap" },
              width: { xs: "100%", sm: "auto" },
              justifyContent: { xs: "space-between", sm: "flex-end" },
              gap: 1
            }}
          >
            {/* Seletor de Ano */}
            <Select
              size="small"
              value={selectedYear}
              onChange={(e) => {
                const year = e.target.value as number;
                setSelectedYear(year);
                console.log("[DEBUG] Ano selecionado mudou para:", year);
              }}
              variant="outlined"
              sx={{
                bgcolor: '#2a3756',
                color: '#e0e0e0',
                fontSize: '0.875rem',
                minWidth: { xs: "70px", sm: "70px" },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                '& .MuiSelect-icon': { color: '#8fa3c8' },
                '& .MuiSelect-select': { p: '6px 12px' }
              }}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                <MenuItem key={year} value={year} sx={{ fontSize: '0.875rem' }}>
                  {year}
                </MenuItem>
              ))}
            </Select>

            {/* Seletor de Mês */}
            <Select
              size="small"
              value={selectedMonth}
              onChange={(e) => {
                const month = e.target.value as number;
                setSelectedMonth(month);
                // Ajustar o dia selecionado se ele não existir no novo mês
                const daysInNewMonth = new Date(selectedYear, month + 1, 0).getDate();
                if (selectedDay > daysInNewMonth) {
                  setSelectedDay(daysInNewMonth);
                }
                console.log("[DEBUG] Mês selecionado mudou para:", month + 1);
              }}
              variant="outlined"
              sx={{
                bgcolor: '#2a3756',
                color: '#e0e0e0',
                fontSize: '0.875rem',
                flex: { xs: 1, sm: "initial" },
                minWidth: { xs: "120px", sm: "100px" },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                '& .MuiSelect-icon': { color: '#8fa3c8' },
                '& .MuiSelect-select': { p: '6px 12px' }
              }}
            >
              <MenuItem value={0} sx={{ fontSize: '0.875rem' }}>Janeiro</MenuItem>
              <MenuItem value={1} sx={{ fontSize: '0.875rem' }}>Fevereiro</MenuItem>
              <MenuItem value={2} sx={{ fontSize: '0.875rem' }}>Março</MenuItem>
              <MenuItem value={3} sx={{ fontSize: '0.875rem' }}>Abril</MenuItem>
              <MenuItem value={4} sx={{ fontSize: '0.875rem' }}>Maio</MenuItem>
              <MenuItem value={5} sx={{ fontSize: '0.875rem' }}>Junho</MenuItem>
              <MenuItem value={6} sx={{ fontSize: '0.875rem' }}>Julho</MenuItem>
              <MenuItem value={7} sx={{ fontSize: '0.875rem' }}>Agosto</MenuItem>
              <MenuItem value={8} sx={{ fontSize: '0.875rem' }}>Setembro</MenuItem>
              <MenuItem value={9} sx={{ fontSize: '0.875rem' }}>Outubro</MenuItem>
              <MenuItem value={10} sx={{ fontSize: '0.875rem' }}>Novembro</MenuItem>
              <MenuItem value={11} sx={{ fontSize: '0.875rem' }}>Dezembro</MenuItem>
            </Select>

            {/* Seletor de Dia (apenas quando período for diário) */}
            {selectedPeriod === 'diario' && (
              <Select
                size="small"
                value={selectedDay}
                onChange={(e) => {
                  const day = e.target.value as number;
                  setSelectedDay(day);
                  console.log("[DEBUG] Dia selecionado mudou para:", day);
                }}
                variant="outlined"
                sx={{
                  bgcolor: '#2a3756',
                  color: '#e0e0e0',
                  fontSize: '0.875rem',
                  minWidth: { xs: "60px", sm: "60px" },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                  '& .MuiSelect-icon': { color: '#8fa3c8' },
                  '& .MuiSelect-select': { p: '6px 12px' }
                }}
              >
                {Array.from({ length: new Date(selectedYear, selectedMonth + 1, 0).getDate() }, (_, i) => i + 1).map(day => (
                  <MenuItem key={day} value={day} sx={{ fontSize: '0.875rem' }}>
                    {day}
                  </MenuItem>
                ))}
              </Select>
            )}

            {/* Seletor de Período */}
            <Select
              size="small"
              value={selectedPeriod}
              onChange={(e) => {
                console.log("[DEBUG] Período selecionado mudou para:", e.target.value);
                setSelectedPeriod(e.target.value as 'diario' | 'mensal' | 'anual');
              }}
              variant="outlined"
              sx={{
                bgcolor: '#2a3756',
                color: '#e0e0e0',
                fontSize: '0.875rem',
                borderRadius: 1,
                minWidth: { xs: "85px", sm: "auto" },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                '& .MuiSelect-icon': { color: '#8fa3c8' },
                '& .MuiSelect-select': { p: '6px 12px', pr: '24px' }
              }}
            >
              <MenuItem value="diario" sx={{ fontSize: '0.875rem' }}>Diário</MenuItem>
              <MenuItem value="mensal" sx={{ fontSize: '0.875rem' }}>Mensal</MenuItem>
              <MenuItem value="anual" sx={{ fontSize: '0.875rem' }}>Anual</MenuItem>
            </Select>
          </Box>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Coluna da Esquerda (Cards Menores e Gráfico) */}
          <Grid item xs={12} lg={8}>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {/* Card Faturamento */}
              <Grid item xs={12} sm={6}>
                <Paper sx={{
                  p: { xs: '12px 16px', sm: '16px 20px' },
                  bgcolor: '#0a0909ff',
                  color: '#fff',
                  borderRadius: 3,
                  position: 'relative',
                  height: '100%',
                  overflow: 'hidden'
                }}>
                  {/* Botão de adicionar removido, pois o modal foi desativado */}
                  <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 1.5 }} mb={1}>
                    <AttachMoneyIcon
                    sx={{
                    width: 35,
                    height: 35,
                    color: '#1a45a3ff' // azul chique
                    }}
                    aria-label="Faturamento"
                    />
                    <Typography fontWeight={500} fontSize="0.9rem">Faturamento</Typography>
                  </Box>
                  <Typography variant="h5" fontWeight={700} mb={0.5} fontSize={{ xs: '1.25rem', sm: '1.5rem' }}>
                    R$ {getFaturamentoByPeriod().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="body2" color="#adb5bd" fontSize="0.8rem">
                    Bots Ativos: {activeBots}/{totalBots}
                  </Typography>
                </Paper>
              </Grid>
              {/* Card Vendas */}
              <Grid item xs={12} sm={6}>
                <Paper sx={{
                  p: { xs: '12px 16px', sm: '16px 20px' },
                  bgcolor: '#0a0909ff',
                  color: '#fff',
                  borderRadius: 3,
                  position: 'relative',
                  height: '100%',
                  overflow: 'hidden'
                }}>
                  <IconButton
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8, color: '#8fa3c8' }}
                    onClick={handleOpenVendasModal}
                  >
                    <AddCircleOutlineIcon fontSize="small" />
                  </IconButton>
                  <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 1.5 }} mb={1}>
                   <ShoppingCartIcon
                    sx={{
                    width: 30,
                    height: 30,
                    color: '#1a45a3ff' // azul sofisticado
                    }}
                    />
                    <Typography fontWeight={500} fontSize="0.9rem">Vendas</Typography>
                  </Box>
                  <Typography variant="h5" fontWeight={700} mb={0.5} fontSize={{ xs: '1.25rem', sm: '1.5rem' }}>
                    {totalSalesCount}
                  </Typography>
                  <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'row', sm: 'column' },
                    flexWrap: 'wrap',
                    gap: { xs: '8px', sm: '2px' },
                    mt: 0.5,
                    justifyContent: { xs: 'space-between', sm: 'flex-start' }
                  }}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      minWidth: { xs: '45%', sm: 'auto' }
                    }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#14CA74' }} />
                      <Typography variant="body2" color="#e0e0e0" fontSize="0.8rem" whiteSpace="nowrap">
                        Aprovadas: <strong>{totalApprovedSales}</strong>
                      </Typography>
                    </Box>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      minWidth: { xs: '45%', sm: 'auto' }
                    }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F9B556' }} />
                      <Typography variant="body2" color="#e0e0e0" fontSize="0.8rem" whiteSpace="nowrap">
                        Pendentes: <strong>{totalPendingSales}</strong>
                      </Typography>
                    </Box>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      minWidth: { xs: '45%', sm: 'auto' }
                    }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#FF5A65' }} />
                      <Typography variant="body2" color="#e0e0e0" fontSize="0.8rem" whiteSpace="nowrap">
                        Canceladas: <strong>{totalCancelledSales}</strong>
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              {/* Card Visão Geral - Faturamento Total (Gráfico) */}
              <Grid item xs={12}>
                <Paper sx={{
                  p: { xs: '12px', sm: '20px' },
                  bgcolor: '#0a0909ff',
                  color: '#fff',
                  borderRadius: 3,
                  height: 'auto',
                  overflow: 'hidden'
                }}>
                  <Box
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    mb={2}
                    gap={1}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={{ xs: 1, sm: 0 }}>
                      <img
                        src={MaisInfoIcon}
                        alt="Mais Informações"
                        style={{
                          width: '24px',
                          height: '24px',
                          color: '#8fa3c8'
                        }}
                      />
                      <Typography
                        fontWeight={500}
                        fontSize="0.9rem"
                        sx={{
                          whiteSpace: { xs: 'normal', sm: 'nowrap' },
                          overflowWrap: 'break-word',
                          wordBreak: 'break-word'
                        }}
                      >
                        Visão Geral - Faturamento {
                          selectedPeriod === 'anual'
                            ? `Anual (${selectedYear})`
                            : selectedPeriod === 'mensal'
                              ? `Mensal (${['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][selectedMonth]} ${selectedYear})`
                              : `Diário (${selectedDay}/${selectedMonth + 1}/${selectedYear})`
                        }
                      </Typography>
                    </Box>
                    <Select
                      size="small"
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value as 'diario' | 'mensal' | 'anual')}
                      variant="outlined"
                      sx={{
                        bgcolor: '#243253ff',
                        color: '#e0e0e0',
                        fontSize: '0.875rem',
                        borderRadius: 1,
                        width: { xs: '100%', sm: 'auto' },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                        '& .MuiSelect-icon': { color: '#8fa3c8' },
                        '& .MuiSelect-select': { p: '6px 12px', pr: '24px' }
                      }}
                    >
                      <MenuItem value="diario" sx={{ fontSize: '0.875rem' }}>Diário</MenuItem>
                      <MenuItem value="mensal" sx={{ fontSize: '0.875rem' }}>Mensal</MenuItem>
                      <MenuItem value="anual" sx={{ fontSize: '0.875rem' }}>Anual</MenuItem>
                    </Select>
                  </Box>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    mb={0.5}
                    fontSize={{ xs: '1.25rem', sm: '1.5rem', md: '2rem' }}
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: { xs: 'flex-start', sm: 'center' },
                      gap: { xs: 1, sm: 0 }
                    }}
                  >
                    R$ {getFaturamentoByPeriod().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <Chip
                      label="0%"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(0, 0, 0, 0.2)',
                        color: '#4caf50',
                        ml: { xs: 0, sm: 1 },
                        fontWeight: 600,
                        borderRadius: '6px',
                        height: '20px',
                        '.MuiChip-label': { p: '0 6px' }
                      }}
                      icon={<span style={{ color: '#4caf50', fontSize: '0.9em' }}>↑</span>}
                    />
                  </Typography>

                  <Box
                    height={{ xs: 250, sm: 300, md: 350 }}
                    mt={2}
                    sx={{
                      overflowX: 'auto',
                      overflowY: 'hidden',
                      '&::-webkit-scrollbar': { height: '8px' },
                      '&::-webkit-scrollbar-thumb': { backgroundColor: '#2a3756', borderRadius: '4px' },
                      '&::-webkit-scrollbar-track': { backgroundColor: '#181f2a' }
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%" minWidth={500}>
                      <LineChart
                        data={
                          // Usar dados baseados no período selecionado
                          selectedPeriod === 'anual'
                            ? (annualData.length > 0 ? annualData : [])
                            : selectedPeriod === 'mensal'
                              ? (monthlyData.length > 0 ? monthlyData : lineChartData)
                              : (dailyData.length > 0 ? dailyData : [])
                        }
                        margin={{ top: 10, right: 10, bottom: 5, left: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="name"
                          stroke="#9ca3af"
                          tick={{ fontSize: 12 }}
                          tickMargin={8}
                        />
                        <YAxis
                          stroke="#9ca3af"
                          tick={{ fontSize: 12 }}
                          width={60}
                          tickFormatter={(value) => `R$ ${value}`}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }}
                          itemStyle={{ color: '#e5e7eb' }}
                          labelStyle={{ color: '#9ca3af' }}
                          formatter={(value: number | string) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, undefined]}
                        />
                        <Legend
                          wrapperStyle={{ color: '#e5e7eb', fontSize: '12px', paddingTop: '10px' }}
                          verticalAlign="bottom"
                          height={36}
                        />
                        <Line
                          type="monotone"
                          dataKey="lucros"
                          stroke="#09ff00ff"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                          name="Lucros"
                        />
                        <Line
                          type="monotone"
                          dataKey="gastos"
                          stroke="#f00a0aff"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                          name="Gastos"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          {/* Coluna da Direita (Cards de Informação) */}
          <Grid item xs={12} lg={4}>
            <Grid container spacing={3} direction="column">
              {/* Card Campeão de Vendas */}
              <Grid item>
                <Paper
                  sx={{
                    p: '16px 20px',
                    bgcolor: '#0a0909ff',
                    border: '1px solid #2a3756',
                    color: '#fff',
                    borderRadius: 3,
                    position: 'relative',
                    cursor: 'pointer',
                    '&:hover': { borderColor: '#4a5976' }
                  }}
                  onClick={() => campeaoDeVendasBot && handleOpenBotTransacoesModal(campeaoDeVendasBot.bot_id)}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 'rgba(0, 0, 0, 0.15)',
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1.5}>
                    <MonetizationOnIcon
                    sx={{
                    fontSize: 30,
                    color: '#1a45a3ff', // azul escuro refinado
                    }}
                    />
                    <Box>
                    {/* Conteúdo ao lado do ícone */}
                    </Box>
                    </Box>
                    </Box>
                    <Typography fontWeight={500} color="#ffffffff" fontSize="0.875rem">Campeão de vendas</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography variant="h6" fontWeight={700} fontSize="1.1rem">{campeaoDeVendasBot?.bot_name || 'N/A'}</Typography>
                  </Box>
                  <Typography variant="body2" color="#adb5bd" fontSize="0.9rem">
                    {campeaoDeVendasBot ? `R$ ${campeaoDeVendasBot.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${campeaoDeVendasBot.sales_count} vendas)` : 'R$ 0,00'}
                  </Typography>
                </Paper>
              </Grid>
              {/* Card Vendas dos Bots */}
              <Grid item>                <Paper
                sx={{
                  p: '16px 20px',
                  bgcolor: '#0a0909ff',
                  border: '1px solid #2a3756',
                  color: '#fff',
                  borderRadius: 3,
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#4a5976',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                  }
                }}
                onClick={handleOpenRankingBotsModal}
              >
                <Typography fontWeight={500} color="#ffffffff" mb={2} fontSize="0.875rem">Top 3 Bots</Typography>
                {top3Bots.length > 0 ? top3Bots.map((bot, index) => (
                  <Box
                    key={bot.bot_id || index}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={index === top3Bots.length - 1 ? 0 : 1.5}
                    sx={{
                      fontSize: '0.875rem',
                      py: 0.5,
                      px: 1,
                      borderRadius: 1,
                      bgcolor:index === 0 ? '#243d72ff' :         // 1º lugar – azul chique profundo
                              index === 1 ? '#6e84b679' :         // 2º lugar – azul clássico (com opacidade)
                              index === 2 ? '#6ca0dc86' :    
                              'transparent'
                    }} onClick={(e) => {
                      e.stopPropagation();
                      handleOpenBotTransacoesModal(bot.bot_id);
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography
                        sx={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          color: '#fff',
                          bgcolor: index === 0 ? '#00000071' :
                            index === 1 ? '#00000071' :
                              index === 2 ? '#00000071' : 'transparent'
                        }}
                      >
                        {index + 1}
                      </Typography>
                      <Typography color="#e0e0e0" fontSize="inherit">{bot.bot_name || `Bot ${index + 1}`}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Typography color="#adb5bd" fontSize="inherit" fontWeight={index === 0 ? 'bold' : 'normal'}>
                        R$ {bot.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  </Box>
                )) : (
                  <Typography color="#adb5bd" fontSize="0.875rem" textAlign="center" py={2}>
                    Nenhum dado de vendas disponível.
                  </Typography>
                )}
              </Paper>
              </Grid>
              {/* Card Mais Conversões -> Produto Campeão de Vendas */}
              <Grid item>
                <Paper
                  sx={{
                    p: '16px 20px',
                    bgcolor: '#0a0909ff',
                    border: '1px solid #2a3756',
                    color: '#fff',
                    borderRadius: 3,
                    position: 'relative',
                    cursor: 'pointer',
                    '&:hover': { borderColor: '#4a5976' }
                  }}
                  onClick={() => campeaoDeVendasProduto && handleOpenProdutoTransacoesModal(campeaoDeVendasProduto.product_id)}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 'rgba(0, 0, 0, 0.15)',
                      }}
                    >
                      <CheckCircleIcon
                    fontSize="medium"
                    sx={{
                    color: '#1a45a3ff', // azul elegante
                    width: 28,
                    height: 28
                    }}
                    />
                    </Box>
                    <Typography fontWeight={500} color="#ffffffff" fontSize="0.875rem">Produto Campeão</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography variant="h6" fontWeight={700} fontSize="1.1rem">{campeaoDeVendasProduto?.product_name || 'N/A'}</Typography>
                    {campeaoDeVendasProduto && <LaunchIcon fontSize="small" sx={{ color: '#8fa3c8' }} />}
                  </Box>                  <Typography variant="body2" color="#adb5bd" fontSize="0.9rem">
                    {campeaoDeVendasProduto ?
                      `R$ ${campeaoDeVendasProduto.total_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${campeaoDeVendasProduto.approved_sales || 0}/${campeaoDeVendasProduto.total_sales} vendas)` :
                      'R$ 0,00 (0/0 vendas)'}
                  </Typography>
                </Paper>
              </Grid>
              {/* Card Vendas de Tickets -> Top 3 Produtos */}
              <Grid item>
                <Paper
                  sx={{
                    p: '16px 20px',
                    bgcolor: '#0a0909ff',
                    border: '1px solid #2a3756',
                    color: '#fff',
                    borderRadius: 3,
                    position: 'relative',
                    cursor: 'pointer',
                    '&:hover': { borderColor: '#4a5976' }
                  }}
                  onClick={() => handleOpenProdutoTransacoesModal()}
                >
                  <Typography fontWeight={500} color="#ffffffff" mb={2} fontSize="0.875rem">Top 3 Produtos</Typography>
                  {top3Produtos.length > 0 ? top3Produtos.map((produto, index) => (
                    <Box
                      key={produto.product_id || index}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={index === top3Produtos.length - 1 ? 0 : 1.5}
                      sx={{
                        fontSize: '0.875rem',
                        py: 0.5,
                        px: 1,
                        borderRadius: 1,
                        bgcolor: index === 0 ? '#243d72ff' :         // 1º lugar – azul chique profundo
                          index === 1 ? '#6e84b679' :         // 2º lugar – azul clássico (com opacidade)
                         index === 2 ? '#6ca0dc9d' :         // 3º lugar – azul claro elegante (com opacidade)
                        'transparent'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProdutoTransacoesModal(produto.product_id);
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography
                          sx={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            color: '#fff]',
                            bgcolor: index === 0 ? '#00000071' :
                              index === 1 ? '#00000071' :
                                index === 2 ? '#00000071' : 'transparent'
                          }}
                        >
                          {index + 1}
                        </Typography>
                        <Typography color="#e0e0e0" fontSize="inherit">{produto.product_name || `Produto ${index + 1}`}</Typography>
                      </Box>                      <Box>
                        <Typography color="#adb5bd" fontSize="inherit" fontWeight={index === 0 ? 'bold' : 'normal'}>
                          R$ {produto.total_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>                        <Typography color="#adb5bd" fontSize="0.7rem">
                          {(produto.approved_sales || 0)}/{produto.total_sales} vendas
                        </Typography>
                      </Box>
                    </Box>
                  )) : (
                    <Typography color="#adb5bd" fontSize="0.875rem" textAlign="center" py={2}>
                      Nenhum produto vendido.
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Grid>        </Grid>
      )}

      {/* Modais */}      {/* Modal de vendas detalhadas (comentado mas mantido para referência) */}
      <VendasDetalhadasModal
        open={vendasModalOpen}
        onClose={handleCloseVendasModal}
        botId={selectedBotId ? Number(selectedBotId) : undefined}
        showAllBots={!selectedBotId}
        showProductsTab={showProductsTab}
      />
      {/* Modal de Ranking Completo de Bots */}      <RankingBotsModal
        open={rankingBotsModalOpen}
        onClose={handleCloseRankingBotsModal}
        bots={allBotsSorted}
        onBotClick={handleOpenBotTransacoesModal}
      />
      {/* Modal para exibir transações de um bot específico */}      <BotTransacoesModal
        open={botTransacoesModalOpen}
        onClose={handleCloseBotTransacoesModal}
        botId={currentBotId || ''}
      />

      {/* Modal para exibir histórico de vendas de produtos */}
      {produtoTransacoesModalOpen && (
        <ProdutoTransacoesModal
          open={produtoTransacoesModalOpen}
          onClose={handleCloseProdutoTransacoesModal}
          produtoId={currentProdutoId}
          showAllProducts={showAllProducts}
          key={`produto-modal-${currentProdutoId || 'all'}-${produtoTransacoesModalOpen ? '1' : '0'}`}
        />
      )}
    </Box>
  );
}

// Função para processar dados brutos para o gráfico mensal
// Definimos um tipo para as transações da API
interface ApiTransaction {
  _id: string;
  created_at: number;
  updated_at: number;
  bot: string;
  user: string;
  product: string;
  status: string;
  payment_id: number;
}

const processRawDataForMonthlyChart = (
  data: ApiTransaction[],
  productsMap: Map<string, ApiProductResponseData>,
  selectedDate: Date = new Date()
): { chartData: ChartDataPoint[], totalRevenue: number } => {
  // Usar a data selecionada em vez da data atual
  const targetDate = selectedDate;

  // Agora incluímos todas as transações sem filtrar por data
  const filteredData = filterTransactionsFromReferenceDate(data);
  console.log(`[INFO] Processando gráfico mensal: utilizando ${filteredData.length} de ${data.length} transações`);

  // Obter o número de dias no mês da data selecionada
  const daysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();

  // Inicializar todos os dias do mês selecionado com zero
  const dailyMap = new Map<number, { lucros: number, gastos: number }>();
  for (let day = 1; day <= daysInMonth; day++) {
    dailyMap.set(day, { lucros: 0, gastos: 0 });
  }

  // Variável para armazenar o faturamento total do mês
  let totalMonthlyRevenue = 0;

  console.log(`Dashboard - Processando estatísticas do mês ${targetDate.getMonth() + 1}/${targetDate.getFullYear()}:`,
    filteredData.length, "transações disponíveis");

  // Processar transações apenas do mês selecionado
  filteredData.forEach(transaction => {
    // Considerar apenas transações aprovadas
    if (transaction.status === "approved") {
      const date = new Date(transaction.created_at);      // Verificar se a transação é do mês selecionado no ano selecionado
      if (date.getMonth() === targetDate.getMonth() && date.getFullYear() === targetDate.getFullYear()) {
        const day = date.getDate();
        const currentDay = dailyMap.get(day);

        // Obter o ID do produto
        const productId = typeof transaction.product === 'string' ? transaction.product :
          (transaction.product && typeof transaction.product === 'object' &&
            transaction.product !== null && 'id' in transaction.product) ?
            String((transaction.product as { id: string | number }).id) : '';

        // Obter o preço do produto
        let price = 0;
        if (productId) {
          const productInfo = productsMap.get(productId);
          if (productInfo) {
            price = typeof productInfo.price === 'number' ?
              productInfo.price :
              parseFloat(productInfo.price as unknown as string) || 0;
          }
        }

        if (currentDay) {
          currentDay.lucros += price;
          dailyMap.set(day, currentDay);

          // Adicionar ao total do mês
          totalMonthlyRevenue += price;
        }
      }
    }
  });

  // Converter para array com formatação criativa para visualização
  // Agrupar em períodos de 5 dias para melhor visualização
  const result: ChartDataPoint[] = [];
  for (let day = 1; day <= daysInMonth; day += 5) {
    const endDay = Math.min(day + 4, daysInMonth);
    let groupLucros = 0;
    let groupGastos = 0;

    // Somar lucros do grupo de dias
    for (let d = day; d <= endDay; d++) {
      const dayData = dailyMap.get(d);
      if (dayData) {
        groupLucros += dayData.lucros;
        groupGastos += dayData.gastos;
      }
    }

    const label = day === endDay ? `${day}` : `${day}-${endDay}`;
    result.push({
      name: label,
      lucros: groupLucros,
      gastos: groupGastos
    });
  }

  return {
    chartData: result,
    totalRevenue: totalMonthlyRevenue
  };
};

// Função para processar dados brutos para o gráfico diário
const processRawDataForDailyChart = (
  data: ApiTransaction[],
  productsMap: Map<string, ProductResponseData>,
  selectedDate: Date = new Date()
): { chartData: ChartDataPoint[], totalRevenue: number } => {
  // Usar a data selecionada (garantir que seja uma nova instância para evitar problemas de referência)
  const targetDate = new Date(selectedDate);

  // Agora incluímos todas as transações sem filtrar por data
  const filteredData = filterTransactionsFromReferenceDate(data);
  console.log(`[INFO] Processando gráfico diário: utilizando ${filteredData.length} de ${data.length} transações`);
  console.log("[DEBUG] processRawDataForDailyChart - Processando dados para a data:", targetDate.toLocaleDateString('pt-BR'));

  // Define o início e fim do dia selecionado
  const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

  console.log("[DEBUG] Período do dia sendo processado:",
    startOfDay.toLocaleString('pt-BR'), "até", endOfDay.toLocaleString('pt-BR'));

  // Inicializar as 24 horas do dia com zero
  const hourlyMap = new Map<number, { lucros: number, gastos: number }>();
  for (let i = 0; i < 24; i++) {
    hourlyMap.set(i, { lucros: 0, gastos: 0 });
  }

  // Variável para armazenar o faturamento total do dia (soma de todas as horas)
  let totalDailyRevenue = 0;

  // Processar transações do dia selecionado
  filteredData.forEach(transaction => {
    // Considerar apenas transações aprovadas
    if (transaction.status === "approved") {
      const transactionDate = new Date(transaction.created_at);

      // Verificar se a transação é do dia selecionado
      if (transactionDate >= startOfDay && transactionDate <= endOfDay) {
        const hour = transactionDate.getHours();
        const currentHour = hourlyMap.get(hour);

        // Obter o ID do produto
        const productId = typeof transaction.product === 'string' ? transaction.product :
          (transaction.product && typeof transaction.product === 'object' &&
            transaction.product !== null && 'id' in transaction.product) ?
            String((transaction.product as { id: string | number }).id) : '';

        // Obter o preço do produto
        let price = 0;
        if (productId) {
          const productInfo = productsMap.get(productId);
          if (productInfo) {
            price = typeof productInfo.price === 'number' ?
              productInfo.price :
              parseFloat(productInfo.price as unknown as string) || 0;
          }
        }

        if (currentHour) {
          currentHour.lucros += price;
          hourlyMap.set(hour, currentHour);

          // Adicionar ao total do dia
          totalDailyRevenue += price;
        }
      }
    }
  });

  console.log("[DEBUG] Total de faturamento encontrado para o dia:",
    totalDailyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

  // Converter para array com formatação de horas
  const result: ChartDataPoint[] = [];
  for (let i = 0; i < 24; i++) {
    const hourData = hourlyMap.get(i);

    // Formatar nome da hora (ex: "00h", "01h", ..., "23h")
    const hourLabel = `${i.toString().padStart(2, '0')}h`;

    result.push({
      name: hourLabel,
      lucros: hourData?.lucros || 0,
      gastos: hourData?.gastos || 0
    });
  }

  // Retornar os dados do gráfico e o total do faturamento diário

  return {
    chartData: result,
    totalRevenue: totalDailyRevenue
  };
};

// Função para processar dados brutos para o gráfico anual
const processRawDataForAnnualChart = (
  data: ApiTransaction[],
  productsMap: Map<string, ProductResponseData>,
  selectedYear: number = new Date().getFullYear()
): { chartData: ChartDataPoint[], totalRevenue: number } => {
  // Agora incluímos todas as transações sem filtrar por data
  const filteredData = filterTransactionsFromReferenceDate(data);
  console.log(`[INFO] Processando gráfico anual: utilizando ${filteredData.length} de ${data.length} transações para o ano ${selectedYear}`);

  // Inicializar todos os meses do ano com zero
  const monthlyMap = new Map<number, { lucros: number, gastos: number }>();
  for (let month = 0; month < 12; month++) {
    monthlyMap.set(month, { lucros: 0, gastos: 0 });
  }

  // Variável para armazenar o faturamento total do ano
  let totalAnnualRevenue = 0;

  console.log(`Dashboard - Processando estatísticas do ano ${selectedYear}:`, filteredData.length, "transações disponíveis");

  // Processar transações apenas do ano selecionado
  filteredData.forEach(transaction => {
    // Considerar apenas transações aprovadas
    if (transaction.status === "approved") {
      const date = new Date(transaction.created_at);

      // Verificar se a transação é do ano selecionado
      if (date.getFullYear() === selectedYear) {
        const month = date.getMonth();
        const currentMonth = monthlyMap.get(month);

        // Obter o ID do produto
        const productId = typeof transaction.product === 'string' ? transaction.product :
          (transaction.product && typeof transaction.product === 'object' &&
            transaction.product !== null && 'id' in transaction.product) ?
            String((transaction.product as { id: string | number }).id) : '';

        // Obter o preço do produto
        let price = 0;
        if (productId) {
          const productInfo = productsMap.get(productId);
          if (productInfo) {
            price = typeof productInfo.price === 'number' ?
              productInfo.price :
              parseFloat(productInfo.price as unknown as string) || 0;
          }
        }

        if (currentMonth) {
          currentMonth.lucros += price;
          monthlyMap.set(month, currentMonth);

          // Adicionar ao total do ano
          totalAnnualRevenue += price;
        }
      }
    }
  });

  // Converter para array com formatação de meses
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const result: ChartDataPoint[] = [];

  for (let month = 0; month < 12; month++) {
    const monthData = monthlyMap.get(month);

    result.push({
      name: monthNames[month],
      lucros: monthData?.lucros || 0,
      gastos: monthData?.gastos || 0
    });
  }

  return {
    chartData: result,
    totalRevenue: totalAnnualRevenue
  };
};