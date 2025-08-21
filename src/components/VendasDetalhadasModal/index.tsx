import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useApi } from '../../hooks/useApi';
import type { Transaction, BotsStats } from '../../types/api';
import { REFERENCE_DATE, filterTransactionsFromReferenceDate } from '../../utils/dateUtils';

interface VendasDetalhadasModalProps {
  open: boolean;
  onClose: () => void;
  botId?: number; // ID opcional do bot para filtrar transações
  showAllBots?: boolean; // Flag para mostrar todos os bots ordenados por vendas
  showProductsTab?: boolean; // Nova flag para mostrar a aba de produtos
}

interface Venda {
  id: string;
  date: string;
  time: string;
  source: string; // Bot
  user: string; // Usuário
  product: string; // Produto
  value: string; // R$ 40,00
  status: string;
}

// Interface para estatísticas de produtos com status detalhados
interface DetailedProductStats {
  product_id: string;
  product_name: string;
  total_sales: number;
  approved_sales: number;
  pending_sales: number;
  cancelled_sales: number;
  total_revenue: number;
  approved_revenue: number;
}

function StatusChip({ status }: { status: string }) {
  let bgColor = 'rgba(5, 193, 104, 0.20)';
  let borderColor = 'rgba(5, 193, 104, 0.20)';
  let textColor = '#14CA74';

  if (status === 'Pendente') {
    bgColor = 'rgba(249, 181, 86, 0.20)';
    borderColor = 'rgba(249, 181, 86, 0.20)';
    textColor = '#F9B556';
  } else if (status === 'Cancelada') {
    bgColor = 'rgba(255, 90, 101, 0.20)';
    borderColor = 'rgba(255, 90, 101, 0.20)';
    textColor = '#FF5A65';
  }

  return (
    <Box sx={{
      display: 'inline-flex',
      padding: '4px 8px',
      borderRadius: '2px',
      border: `0.6px solid ${borderColor}`,
      background: bgColor,
    }}>
      <Typography
        sx={{
          color: textColor,
          fontSize: '10px',
          fontWeight: 500,
          lineHeight: '12px',
        }}
      >
        {status}
      </Typography>
    </Box>
  );
}

const VendasDetalhadasModal: React.FC<VendasDetalhadasModalProps> = ({ open, onClose, botId, showAllBots, showProductsTab }) => {
  // const [period, setPeriod] = useState('mensal');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalSales, setTotalSales] = useState(0);
  const [totalApproved, setTotalApproved] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [botName, setBotName] = useState<string | null>(null);
  // Inicializa a aba com base nas props
  const [tabValue, setTabValue] = useState(
    showProductsTab ? 3 : showAllBots ? 1 : 0
  );
  const [botsStats, setBotsStats] = useState<BotsStats | null>(null);

  // Estado para as estatísticas de produtos
  const [productStats, setProductStats] = useState<{
    product_id: string;
    product_name: string;
    sales_count: number;
    revenue: number;
  }[]>([]);

  // Estado para as estatísticas detalhadas de produtos
  const [detailedProductStats, setDetailedProductStats] = useState<DetailedProductStats[]>([]);

  const { listTransactions, getBot, getBotsStats } = useApi();

  // const handlePeriodChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //   setPeriod(event.target.value);
  //   setPage(0);
  //   fetchTransactions(botId);
  // };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0);

    // Buscar estatísticas dos bots quando a aba "Todos os Bots" for selecionada
    if (newValue === 1) {
      fetchBotsStats();
    }

    // Buscar transações para processar estatísticas de produtos quando a aba "Ranking de Produtos" ou "Todos os Produtos" for selecionada
    if (newValue === 2 || newValue === 3) {
      fetchTransactions(botId);
    }
  };

  // Função para formatar data e hora a partir do timestamp
  const formatDateTime = (timestamp: number): { date: string; time: string } => {
    const date = new Date(timestamp);

    // Formato de data: DD/MM/YYYY
    const formattedDate = date.toLocaleDateString('pt-BR');

    // Formato de hora: HH:MM
    const formattedTime = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return { date: formattedDate, time: formattedTime };
  };

  // Converter transações para formato de vendas
  const convertTransactionsToVendas = (transactions: Transaction[]): Venda[] => {
    let approved = 0;
    let pending = 0;

    const vendasList = transactions.map(transaction => {
      const { date, time } = formatDateTime(transaction.created_at);

      // Contagem de status
      if (transaction.status === 'approved') {
        approved++;
      } else if (transaction.status === 'pending') {
        pending++;
      }

      const status = transaction.status === 'approved' ? 'Aprovada' :
        transaction.status === 'pending' ? 'Pendente' : 'Cancelada';

      // Garantir que o preço seja um número válido
      const price = typeof transaction.product.price === 'number' ?
        transaction.product.price :
        parseFloat(transaction.product.price as unknown as string) || 0;

      console.log(`VendasDetalhadasModal - Processando transação: ID: ${transaction._id}, Produto: ${transaction.product.name}, Preço: ${price}`);

      return {
        id: transaction._id,
        date,
        time,
        source: transaction.bot.name,
        user: transaction.user.name || `${transaction.user.telegram_id}`,
        product: transaction.product.name,
        value: `R$ ${price.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`,
        status
      };
    });

    setTotalSales(transactions.length);
    setTotalApproved(approved);
    setTotalPending(pending);

    return vendasList;
  };

  // Função para processar transações e calcular estatísticas de produtos
  const processProductStats = (transactions: Transaction[]) => {
    const productMap = new Map<string, {
      product_id: string;
      product_name: string;
      sales_count: number;
      revenue: number;
    }>();

    console.log("VendasDetalhadasModal - Processando estatísticas de produtos:",
      transactions.length, "transações disponíveis");

    transactions.forEach(transaction => {
      // Considerar apenas transações aprovadas
      if (transaction.status === "approved") {
        const productId = transaction.product.id;
        const existingProduct = productMap.get(productId);

        // Garantir que o preço seja um número válido
        const price = typeof transaction.product.price === 'number' ?
          transaction.product.price :
          parseFloat(transaction.product.price as unknown as string) || 0;

        if (existingProduct) {
          existingProduct.sales_count += 1;
          existingProduct.revenue += price;
        } else {
          productMap.set(productId, {
            product_id: productId,
            product_name: transaction.product.name,
            sales_count: 1,
            revenue: price
          });
        }
      }
    });

    // Converter Map para array e ordenar por receita (do maior para o menor)
    const productStats = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue);

    return productStats;
  };

  // Função para processar transações e calcular estatísticas detalhadas de produtos (com todos os status)
  const processDetailedProductStats = (transactions: Transaction[]) => {
    const productMap = new Map<string, DetailedProductStats>();

    console.log("VendasDetalhadasModal - Processando estatísticas detalhadas de produtos:",
      transactions.length, "transações disponíveis");

    transactions.forEach(transaction => {
      const productId = transaction.product.id;
      const existingProduct = productMap.get(productId);

      // Garantir que o preço seja um número válido
      const price = typeof transaction.product.price === 'number' ?
        transaction.product.price :
        parseFloat(transaction.product.price as unknown as string) || 0;

      const isApproved = transaction.status === "approved";
      const isPending = transaction.status === "pending";
      const isCancelled = !isApproved && !isPending;

      if (existingProduct) {
        existingProduct.total_sales += 1;

        if (isApproved) {
          existingProduct.approved_sales += 1;
          existingProduct.approved_revenue += price;
          existingProduct.total_revenue += price;
        } else if (isPending) {
          existingProduct.pending_sales += 1;
        } else {
          existingProduct.cancelled_sales += 1;
        }
      } else {
        productMap.set(productId, {
          product_id: productId,
          product_name: transaction.product.name,
          total_sales: 1,
          approved_sales: isApproved ? 1 : 0,
          pending_sales: isPending ? 1 : 0,
          cancelled_sales: isCancelled ? 1 : 0,
          total_revenue: isApproved ? price : 0,
          approved_revenue: isApproved ? price : 0
        });
      }
    });

    // Converter Map para array e ordenar por vendas totais (do maior para o menor)
    return Array.from(productMap.values())
      .sort((a, b) => b.total_sales - a.total_sales);
  };

  // Buscar transações
  const fetchTransactions = async (botId?: number) => {
    if (!open) return;

    setLoading(true);
    try {
      // Usar a API para buscar transações
      // Se o botId for fornecido e não for undefined, busca transações específicas desse bot
      const response = await listTransactions(botId !== undefined ? botId : 0);

      if (response.data && response.data.transactions) {
        // Filtrar para incluir apenas transações a partir de 25/06/2025
        const filteredTransactions = filterTransactionsFromReferenceDate(response.data.transactions);
        console.log(`[INFO] VendasDetalhadasModal - Filtrando transações a partir de ${REFERENCE_DATE.toLocaleDateString('pt-BR')}: ${filteredTransactions.length} de ${response.data.transactions.length} transações`);
        
        const convertedVendas = convertTransactionsToVendas(filteredTransactions);
        setVendas(convertedVendas);

        // Usar produtos consolidados da API se disponíveis
        
        if (response.data.consolidatedProducts && response.data.consolidatedProducts.length > 0) {
          console.log("VendasDetalhadasModal - Usando produtos consolidados da API");
          // Converter o formato para compatibilidade
          // Obs: Se a API já fornece consolidados, precisaríamos filtrar pelo campo created_at se disponível
          const formattedProductStats = response.data.consolidatedProducts.map(p => ({
            product_id: p.id,
            product_name: p.name,
            sales_count: p.count,
            revenue: p.totalRevenue
          })).sort((a, b) => b.revenue - a.revenue);

          setProductStats(formattedProductStats);
        } else {
          // Processar estatísticas de produtos manualmente (fallback)
          console.log("VendasDetalhadasModal - Processando produtos manualmente");
          const productStatsData = processProductStats(filteredTransactions);
          setProductStats(productStatsData);
        }

        // Processar estatísticas detalhadas de produtos
        const detailedProductStatsData = processDetailedProductStats(filteredTransactions);
        console.log("VendasDetalhadasModal - Estatísticas detalhadas de produtos:",
          detailedProductStatsData.map(p => `${p.product_name}: Aprovadas=${p.approved_sales}, Pendentes=${p.pending_sales}, Canceladas=${p.cancelled_sales}`));
        setDetailedProductStats(detailedProductStatsData);
      } else {
        setVendas([]);
        setProductStats([]);
        setTotalSales(0);
        setTotalApproved(0);
        setTotalPending(0);
      }
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      setVendas([]);
      setProductStats([]);
      setTotalSales(0);
      setTotalApproved(0);
      setTotalPending(0);
    } finally {
      setLoading(false);
    }
  };

  // Buscar estatísticas dos bots
  const fetchBotsStats = async () => {
    setLoading(true);
    try {
      const response = await getBotsStats();

      if (response.data) {
        setBotsStats(response.data);
      } else {
        setBotsStats(null);
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas dos bots:', error);
      setBotsStats(null);
    } finally {
      setLoading(false);
    }
  };

  // Carregar transações quando o modal abrir
  useEffect(() => {
    if (open) {
      // Se precisamos mostrar a aba de produtos, só carregamos as transações se necessário
      if (showProductsTab) {
        // Aba "Todos os Produtos"
        setTabValue(3); // Certifique-se que a aba "Todos os Produtos" está selecionada

        // Se tivermos dados de produtos já disponíveis no dash, poderíamos usá-los aqui
        // Mas como não temos acesso direto, vamos fazer uma única requisição
        if (!detailedProductStats.length) {
          fetchTransactions(undefined); // Buscar todas as transações apenas se necessário (sem botId)
        }
      }
      else if (showAllBots) {
        // Se a flag showAllBots for verdadeira, buscar estatísticas dos bots
        fetchBotsStats();
        setTabValue(1); // Certifique-se que a aba Todos os Bots está selecionada
      } else {
        // Para a visualização normal, buscar transações do bot específico ou todas
        fetchTransactions(botId);
        setTabValue(0); // Voltar para a aba de transações

        // Se um botId for fornecido e não for 0, buscar informações do bot para exibir o nome
        if (botId && botId !== 0) {
          const fetchBotInfo = async () => {
            try {
              const response = await getBot(String(botId));
              if (response.data) {
                setBotName(response.data.name);
              }
            } catch (error) {
              console.error('Erro ao buscar informações do bot:', error);
              setBotName(null);
            }
          };

          fetchBotInfo();
        } else {
          setBotName(null);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, botId, showAllBots]);

  // Filtragem para paginação
  const paginatedVendas = vendas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: '720px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          borderRadius: '8px',
          border: '1px solid #373B48',
          backgroundColor: '#1B1E28',
          color: '#fff',
          maxHeight: 'calc(100vh - 64px)',
          overflowY: 'auto',
        }
      }}
    >
      <DialogTitle sx={{
        p: '24px',
        borderBottom: '1px solid #373B48',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
       <Box display="flex" alignItems="center" gap={1.5}>
              <ShoppingCartIcon
              sx={{
                fontSize: 40,
              color: '#3b5998',
              }}
              /> 
              <Box>
            <Typography variant="h6" fontWeight={700}>
              {showAllBots ? "Ranking de Bots por Vendas" : botName ? `Vendas do Bot: ${botName}` : "Vendas Detalhadas"}
            </Typography>
            {tabValue === 0 && botName && (
              <Typography variant="subtitle2" color="#506a9bff">
                Bot: {botName}
              </Typography>
            )}
          </Box>
        </Box>
        <Box display="flex" alignItems="center">
          <Box display="flex" alignItems="center" sx={{ bgcolor: '#10161f', p: '4px 8px', borderRadius: 2, mr: 1 }}>
            <CalendarTodayIcon sx={{ color: '#506a9bff', mr: 1, fontSize: '1.1rem' }} />
            <Select
              size="small"
              // value={period}
              // onChange={handlePeriodChange}
              variant="standard"
              disableUnderline
              sx={{
                color: '#e0e0e0',
                fontSize: '0.875rem',
                '& .MuiSelect-icon': { color: '#506a9bff' },
                '& .MuiSelect-select': { p: '6px 20px 6px 6px' },
              }}
            >
              <MenuItem value="diario">Diário</MenuItem>
              <MenuItem value="semanal">Semanal</MenuItem>
              <MenuItem value="mensal">Mensal</MenuItem>
              <MenuItem value="anual">Anual</MenuItem>
            </Select>
          </Box>
          <IconButton onClick={onClose} sx={{ color: '#506a9bff' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box p={3}>
          <Box display="flex" justifyContent="space-between" mb={3}>
            <Box>
              <Typography variant="h5" fontWeight={700} color="#fff">
                {totalSales} vendas
              </Typography>
              <Typography variant="body2" color="#adb5bd">
                {totalApproved} aprovadas · {totalPending} pendentes
              </Typography>
            </Box>
            {botName && (
              <Box>
                <Typography variant="body2" color="#adb5bd" textAlign="right">
                  Bot: <strong>{botName}</strong>
                </Typography>
              </Box>
            )}
          </Box>

          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              bgcolor: '#10161f',
              borderRadius: '8px',
              mb: 2,
              '& .MuiTabs-indicator': {
                bgcolor: '#14CA74',
              },
              '& .MuiTab-root': {
                color: '#6f84acff',
                fontWeight: 500,
                borderRadius: '8px',
              },
              '& .Mui-selected': {
                color: '#fff',
                bgcolor: 'rgba(20, 202, 116, 0.1)',
              },
            }}
          >
            <Tab label="Transações" />
            <Tab label="Todos os Bots" />
            <Tab label="Ranking de Produtos" />
            <Tab label="Todos os Produtos" />
          </Tabs>

          {/* Renderização condicional baseada no valor da aba selecionada */}
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <CircularProgress size={40} />
            </Box>
          ) : (
            <>
              {/* Aba de Transações */}
              {tabValue === 0 && (
                <>
                  {paginatedVendas.length > 0 ? (
                    <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                      <Table aria-label="tabela de vendas">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ bgcolor: '#2a3756', color: '#fff', borderBottom: '1px solid #373B48' }}>Data</TableCell>
                            <TableCell sx={{ bgcolor: '#2a3756', color: '#fff', borderBottom: '1px solid #373B48' }}>Bot</TableCell>
                            <TableCell sx={{ bgcolor: '#2a3756', color: '#fff', borderBottom: '1px solid #373B48' }}>Usuário</TableCell>
                            <TableCell sx={{ bgcolor: '#2a3756', color: '#fff', borderBottom: '1px solid #373B48' }}>Produto</TableCell>
                            <TableCell sx={{ bgcolor: '#2a3756', color: '#fff', borderBottom: '1px solid #373B48' }}>Valor</TableCell>
                            <TableCell sx={{ bgcolor: '#2a3756', color: '#fff', borderBottom: '1px solid #373B48' }}>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedVendas.map((venda) => (
                            <TableRow key={venda.id}>
                              <TableCell sx={{ color: '#e0e0e0', borderBottom: '1px solid #373B48' }}>{`${venda.date} ${venda.time}`}</TableCell>
                              <TableCell sx={{ color: '#e0e0e0', borderBottom: '1px solid #373B48' }}>{venda.source}</TableCell>
                              <TableCell sx={{ color: '#e0e0e0', borderBottom: '1px solid #373B48' }}>{venda.user}</TableCell>
                              <TableCell sx={{ color: '#e0e0e0', borderBottom: '1px solid #373B48' }}>{venda.product}</TableCell>
                              <TableCell sx={{ color: '#e0e0e0', borderBottom: '1px solid #373B48' }}>{venda.value}</TableCell>
                              <TableCell sx={{ color: '#e0e0e0', borderBottom: '1px solid #373B48' }}>
                                <StatusChip status={venda.status} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box py={4} textAlign="center">
                      <Typography color="#adb5bd">
                        Nenhuma venda encontrada.
                      </Typography>
                    </Box>
                  )}

                  <TablePagination
                    component="div"
                    count={vendas.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Itens por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    sx={{
                      color: '#e0e0e0',
                      '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                        color: '#e0e0e0',
                      },
                      '.MuiTablePagination-select': {
                        color: '#e0e0e0',
                      },
                      '.MuiTablePagination-selectIcon': {
                        color: '#506a9bff',
                      },
                      '.MuiTablePagination-actions': {
                        color: '#506a9bff',
                      },
                    }}
                  />
                </>
              )}

              {/* Aba de Ranking de Bots */}
              {tabValue === 1 && (
                <>
                  {botsStats && botsStats.bots_stats && botsStats.bots_stats.length > 0 ? (
                    <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                      <Table aria-label="tabela de bots">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ bgcolor: '#2a3756', color: '#fff', borderBottom: '1px solid #373B48' }}>Posição</TableCell>
                            <TableCell sx={{ bgcolor: '#2a3756', color: '#fff', borderBottom: '1px solid #373B48' }}>Bot</TableCell>
                            <TableCell sx={{ bgcolor: '#2a3756', color: '#fff', borderBottom: '1px solid #373B48' }}>Vendas</TableCell>
                            <TableCell sx={{ bgcolor: '#2a3756', color: '#fff', borderBottom: '1px solid #373B48' }}>Faturamento</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {/* Ordenar os bots por receita antes de exibir */}
                          {[...botsStats.bots_stats]
                            .sort((a, b) => b.revenue - a.revenue)
                            .map((bot, index) => (
                              <TableRow key={bot.bot_id}>
                                <TableCell
                                  sx={{
                                    color: '#e0e0e0',
                                    borderBottom: '1px solid #373B48',
                                    padding: '10px'
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: '50%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.75rem',
                                      fontWeight: 'bold',
                                      color: '#fff',
                                      bgcolor: index === 0 ? '#FFD700' :
                                        index === 1 ? '#C0C0C0' :
                                          index === 2 ? '#CD7F32' : '#2a3756'
                                    }}
                                  >
                                    {index + 1}
                                  </Box>
                                </TableCell>
                                <TableCell
                                  sx={{
                                    color: index < 3 ? '#fff' : '#e0e0e0',
                                    fontWeight: index < 3 ? 'bold' : 'normal',
                                    borderBottom: '1px solid #373B48'
                                  }}
                                >
                                  {bot.bot_name}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    color: index < 3 ? '#fff' : '#e0e0e0',
                                    fontWeight: index < 3 ? 'bold' : 'normal',
                                    borderBottom: '1px solid #373B48'
                                  }}
                                >
                                  {bot.sales_count}
                                </TableCell>
                                <TableCell
                                  sx={{
                                    color: index < 3 ? '#fff' : '#e0e0e0',
                                    fontWeight: index < 3 ? 'bold' : 'normal',
                                    borderBottom: '1px solid #373B48'
                                  }}
                                >
                                  R$ {bot.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box py={4} textAlign="center">
                      <Typography color="#adb5bd">
                        Nenhum bot com vendas encontrado.
                      </Typography>
                    </Box>
                  )}
                </>
              )}

              {/* Nova aba de Ranking de Produtos */}
              {tabValue === 2 && (
                <>
                  {productStats && productStats.length > 0 ? (
                    <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                      <Table aria-label="tabela de produtos">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ bgcolor: '#2a3756', color: '#fff', borderBottom: '1px solid #373B48' }}>Posição</TableCell>
                            <TableCell sx={{ bgcolor: '#2a3756', color: '#fff', borderBottom: '1px solid #373B48' }}>Produto</TableCell>
                            <TableCell sx={{ bgcolor: '#2a3756', color: '#fff', borderBottom: '1px solid #373B48' }}>Vendas</TableCell>
                            <TableCell sx={{ bgcolor: '#2a3756', color: '#fff', borderBottom: '1px solid #373B48' }}>Faturamento</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {/* Produtos já estão ordenados pela função processProductStats */}
                          {productStats.map((product, index) => (
                            <TableRow key={product.product_id}>
                              <TableCell
                                sx={{
                                  color: '#e0e0e0',
                                  borderBottom: '1px solid #373B48',
                                  padding: '10px'
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    color: '#fff',
                                    bgcolor: index === 0 ? '#FFD700' :
                                      index === 1 ? '#C0C0C0' :
                                        index === 2 ? '#CD7F32' : '#2a3756'
                                  }}
                                >
                                  {index + 1}
                                </Box>
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: index < 3 ? '#fff' : '#e0e0e0',
                                  fontWeight: index < 3 ? 'bold' : 'normal',
                                  borderBottom: '1px solid #373B48'
                                }}
                              >
                                {product.product_name}
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: index < 3 ? '#fff' : '#e0e0e0',
                                  fontWeight: index < 3 ? 'bold' : 'normal',
                                  borderBottom: '1px solid #373B48'
                                }}
                              >
                                {product.sales_count}
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: index < 3 ? '#fff' : '#e0e0e0',
                                  fontWeight: index < 3 ? 'bold' : 'normal',
                                  borderBottom: '1px solid #373B48'
                                }}
                              >
                                R$ {product.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box py={4} textAlign="center">
                      <Typography color="#adb5bd">
                        Nenhum produto com vendas encontrado.
                      </Typography>
                    </Box>
                  )}
                </>
              )}

              {/* Aba de Todos os Produtos */}
              {/* Aba de Todos os Produtos */}
              {tabValue === 3 && (
                <>
                  {/* Resumo das estatísticas */}
                  {detailedProductStats && detailedProductStats.length > 0 && (
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h6" fontWeight={600} color="#fff">
                          {detailedProductStats.length} produtos
                        </Typography>
                        <Typography variant="body2" color="#adb5bd">
                          {detailedProductStats.reduce((sum, p) => sum + p.approved_sales, 0)} aprovadas · {' '}
                          {detailedProductStats.reduce((sum, p) => sum + p.pending_sales, 0)} pendentes · {' '}
                          {detailedProductStats.reduce((sum, p) => sum + p.cancelled_sales, 0)} canceladas
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="#14CA74" textAlign="right" fontWeight={700}>
                          R$ {detailedProductStats.reduce((sum, p) => sum + p.approved_revenue, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                        <Typography variant="caption" color="#adb5bd">
                          Faturamento Total
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {detailedProductStats && detailedProductStats.length > 0 ? (
                    <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                      <Table aria-label="tabela de todos os produtos">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ bgcolor: '#2a3756', color: '#fff', borderBottom: '1px solid #373B48' }}>Produto</TableCell>
                            <TableCell sx={{ bgcolor: '#2a3756', color: '#fff', borderBottom: '1px solid #373B48', textAlign: 'center' }}>Aprovadas</TableCell>
                            <TableCell sx={{ bgcolor: '#2a3756', color: '#fff', borderBottom: '1px solid #373B48', textAlign: 'center' }}>Pendentes</TableCell>
                            <TableCell sx={{ bgcolor: '#2a3756', color: '#fff', borderBottom: '1px solid #373B48', textAlign: 'center' }}>Canceladas</TableCell>
                            <TableCell sx={{ bgcolor: '#2a3756', color: '#fff', borderBottom: '1px solid #373B48', textAlign: 'center' }}>Total</TableCell>
                            <TableCell sx={{ bgcolor: '#2a3756', color: '#fff', borderBottom: '1px solid #373B48', textAlign: 'right' }}>Receita</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {detailedProductStats.map((product) => (
                            <TableRow
                              key={product.product_id}
                              hover
                              sx={{ '&:hover': { bgcolor: 'rgba(20, 202, 116, 0.05)' } }}
                            >
                              <TableCell sx={{ color: '#e0e0e0', borderBottom: '1px solid #373B48' }}>
                                {product.product_name}
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: product.approved_sales > 0 ? '#14CA74' : '#e0e0e0',
                                  fontWeight: product.approved_sales > 0 ? 'bold' : 'normal',
                                  borderBottom: '1px solid #373B48',
                                  textAlign: 'center'
                                }}
                              >
                                {product.approved_sales}
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: product.pending_sales > 0 ? '#F9B556' : '#e0e0e0',
                                  fontWeight: product.pending_sales > 0 ? 'bold' : 'normal',
                                  borderBottom: '1px solid #373B48',
                                  textAlign: 'center'
                                }}
                              >
                                {product.pending_sales}
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: product.cancelled_sales > 0 ? '#FF5A65' : '#e0e0e0',
                                  fontWeight: product.cancelled_sales > 0 ? 'bold' : 'normal',
                                  borderBottom: '1px solid #373B48',
                                  textAlign: 'center'
                                }}
                              >
                                {product.cancelled_sales}
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: '#e0e0e0',
                                  borderBottom: '1px solid #373B48',
                                  textAlign: 'center'
                                }}
                              >
                                {product.total_sales}
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: product.approved_revenue > 0 ? '#14CA74' : '#e0e0e0',
                                  fontWeight: product.approved_revenue > 0 ? 'bold' : 'normal',
                                  borderBottom: '1px solid #373B48',
                                  textAlign: 'right'
                                }}
                              >
                                R$ {product.approved_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box py={4} textAlign="center">
                      <Typography color="#adb5bd">
                        Nenhum produto encontrado.
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default VendasDetalhadasModal;