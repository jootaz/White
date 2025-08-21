import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { useApi } from '../../hooks/useApi';
import { REFERENCE_DATE, filterTransactionsFromReferenceDate } from '../../utils/dateUtils';

interface BotTransacoesModalProps {
  open: boolean;
  onClose: () => void;
  botId: string;
}

interface ProdutoTransacoes {
  produto: string;
  quantidade: number;
  valorTotal: number;
  transacoes: {
    id: string;
    data: string;
    status: string;
    valor: number;
  }[];
}

interface ApiTransactionDetailed {
  bot: string | { id?: string; _id?: string };
  _id: string;
  product: string | { id?: string; _id?: string; name?: string; price?: number | string };
  status: string;
  created_at: number;
}

interface BotDataCache {
  botNome: string;
  produtosTransacoes: ProdutoTransacoes[];
  totalVendas: number;
  faturamentoTotal: number;
  timestamp: number;
}

const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutos em ms

const BotTransacoesModal: React.FC<BotTransacoesModalProps> = ({ open, onClose, botId }) => {
  const [loading, setLoading] = useState(true);
  const [botNome, setBotNome] = useState('');
  const [produtosTransacoes, setProdutosTransacoes] = useState<ProdutoTransacoes[]>([]);
  const [totalVendas, setTotalVendas] = useState(0);
  const [faturamentoTotal, setFaturamentoTotal] = useState(0);

  const dadosCache = useRef<Record<string, BotDataCache>>({});
  const loadingRef = useRef(false);
  const api = useApi();

  const carregarDados = useCallback(async () => {
    if (!botId || loadingRef.current) return;

    // Usa cache se válido
    const cacheData = dadosCache.current[botId];
    const agora = Date.now();
    if (cacheData && (agora - cacheData.timestamp) < CACHE_TIMEOUT) {
      setBotNome(cacheData.botNome);
      setProdutosTransacoes(cacheData.produtosTransacoes);
      setTotalVendas(cacheData.totalVendas);
      setFaturamentoTotal(cacheData.faturamentoTotal);
      setLoading(false);
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);

      // Buscar dados do bot
      const botsResponse = await api.listBots();
      const botInfo = botsResponse.data?.find((b: any) => b.id === botId || b._id === botId);
      const nomeDoBotEncontrado = botInfo?.name || `Bot #${botId}`;
      setBotNome(nomeDoBotEncontrado);

      // Buscar estatísticas detalhadas
      const now = Date.now();
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
      const detailedStatsResponse = await api.getBotStatsDetailed({
        dateRange: { start: thirtyDaysAgo, end: now },
      });

      // Produtos para consulta
      const productsResponse = await api.listProducts();
      const productsMap = new Map<string, any>();
      if (productsResponse.data && Array.isArray(productsResponse.data)) {
        productsResponse.data.forEach((p: any) => {
          productsMap.set(p.id || p._id, p);
        });
      }

      if (detailedStatsResponse.data && Array.isArray(detailedStatsResponse.data)) {
        // Filtrar por data de referência
        const transactionsFromReferenceDate = filterTransactionsFromReferenceDate(detailedStatsResponse.data);
        // Filtrar transações do bot atual
        const botTransacoes = transactionsFromReferenceDate.filter((t: ApiTransactionDetailed) => {
          const transactionBotId = typeof t.bot === 'string' ? t.bot : String(t.bot?.id || t.bot?._id || '');
          return transactionBotId === botId;
        });

        const produtosMap = new Map<string, ProdutoTransacoes>();
        let totalTransacoes = 0;
        let totalFaturamento = 0;

        botTransacoes.forEach((transacao: ApiTransactionDetailed) => {
          const productId = typeof transacao.product === 'string' ? transacao.product : String(transacao.product?.id || transacao.product?._id || '');
          const productInfo = productsMap.get(productId);
          const produtoNome = productInfo?.name ?? `Produto #${productId}`;
          const precoUnitario = productInfo ? (typeof productInfo.price === 'number' ? productInfo.price : parseFloat(String(productInfo.price)) || 0) : 0;
          const isApproved = transacao.status === 'approved';

          totalTransacoes++;
          if (isApproved) totalFaturamento += precoUnitario;

          if (!produtosMap.has(productId)) {
            produtosMap.set(productId, {
              produto: produtoNome,
              quantidade: 0,
              valorTotal: 0,
              transacoes: [],
            });
          }

          const produto = produtosMap.get(productId)!;

          if (isApproved) {
            produto.quantidade++;
            produto.valorTotal += precoUnitario;
          }

          produto.transacoes.push({
            id: transacao._id,
            data: new Date(transacao.created_at).toLocaleString('pt-BR'),
            status: transacao.status,
            valor: precoUnitario,
          });
        });

        const produtosArray = Array.from(produtosMap.values()).sort((a, b) => b.valorTotal - a.valorTotal);

        setProdutosTransacoes(produtosArray);
        setTotalVendas(totalTransacoes);
        setFaturamentoTotal(totalFaturamento);

        dadosCache.current[botId] = {
          botNome: nomeDoBotEncontrado,
          produtosTransacoes: produtosArray,
          totalVendas: totalTransacoes,
          faturamentoTotal: totalFaturamento,
          timestamp: agora,
        };
      }
    } catch (error) {
      console.error('Erro ao carregar dados do bot:', error);
      setProdutosTransacoes([]);
      setTotalVendas(0);
      setFaturamentoTotal(0);
      setBotNome('');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [botId, api]);

  useEffect(() => {
    if (open && botId) {
      carregarDados();
    }
  }, [open, botId, carregarDados]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { bgcolor: '#181f2a', color: '#e0e0e0', borderRadius: 2 } }}
    >
      <DialogTitle sx={{ bgcolor: '#1a2332', p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            Transações do Bot: {botNome || '-'}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: '#8fa3c8' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={40} sx={{ color: '#00326eff' }} />
          </Box>
        ) : (
          <Box>
            <Box sx={{ mb: 3, p: 2, bgcolor: '#222b3c', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight={500}>
                Resumo de Vendas
              </Typography>
              <Box display="flex" gap={4}>
                <Box>
                  <Typography variant="body2" color="#8fa3c8" fontSize="0.85rem">
                    Total de Transações
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    {totalVendas}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="#8fa3c8" fontSize="0.85rem">
                    Faturamento Total
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    R$ {faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {produtosTransacoes.length > 0 ? (
              produtosTransacoes.map((produto, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Box sx={{ p: 2, bgcolor: '#222b3c', borderRadius: 1, mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight={500}>
                      {produto.produto}
                    </Typography>
                    <Box display="flex" gap={4} mt={1}>
                      <Typography variant="body2">
                        <span style={{ color: '#8fa3c8' }}>Quantidade:</span> {produto.quantidade}
                      </Typography>
                      <Typography variant="body2">
                        <span style={{ color: '#8fa3c8' }}>Valor Total:</span>{' '}
                        R$ {produto.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  </Box>

                  <TableContainer component={Paper} sx={{ bgcolor: '#1a2332', mb: 3 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#253046' }}>
                        <TableRow>
                          <TableCell sx={{ color: '#8fa3c8', fontWeight: 500, fontSize: '0.8rem' }}>
                            ID da Transação
                          </TableCell>
                          <TableCell sx={{ color: '#8fa3c8', fontWeight: 500, fontSize: '0.8rem' }}>Data</TableCell>
                          <TableCell sx={{ color: '#8fa3c8', fontWeight: 500, fontSize: '0.8rem' }}>Status</TableCell>
                          <TableCell sx={{ color: '#8fa3c8', fontWeight: 500, fontSize: '0.8rem' }}>Valor</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {produto.transacoes.map((transacao) => (
                          <TableRow
                            key={transacao.id}
                            sx={{
                              '&:hover': { bgcolor: '#253046' },
                              bgcolor:
                                transacao.status === 'approved'
                                  ? 'rgba(20, 202, 116, 0.1)'
                                  : transacao.status === 'pending'
                                  ? 'rgba(249, 181, 86, 0.1)'
                                  : 'rgba(255, 90, 101, 0.1)',
                            }}
                          >
                            <TableCell
                              sx={{
                                color: '#e0e0e0',
                                fontSize: '0.8rem',
                                maxWidth: '200px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {transacao.id}
                            </TableCell>
                            <TableCell sx={{ color: '#e0e0e0', fontSize: '0.8rem' }}>{transacao.data}</TableCell>
                            <TableCell sx={{ fontSize: '0.8rem' }}>
                              <Box
                                component="span"
                                sx={{
                                  py: 0.5,
                                  px: 1,
                                  borderRadius: 1,
                                  bgcolor:
                                    transacao.status === 'approved'
                                      ? 'rgba(20, 202, 116, 0.2)'
                                      : transacao.status === 'pending'
                                      ? 'rgba(249, 181, 86, 0.2)'
                                      : 'rgba(255, 90, 101, 0.2)',
                                  color:
                                    transacao.status === 'approved'
                                      ? '#14CA74'
                                      : transacao.status === 'pending'
                                      ? '#F9B556'
                                      : '#FF5A65',
                                }}
                              >
                                {transacao.status === 'approved'
                                  ? 'Aprovado'
                                  : transacao.status === 'pending'
                                  ? 'Pendente'
                                  : 'Cancelado'}
                              </Box>
                            </TableCell>
                            <TableCell
                              sx={{
                                color: '#e0e0e0',
                                fontSize: '0.8rem',
                                fontWeight: transacao.status === 'approved' ? 600 : 400,
                                opacity: transacao.status === 'approved' ? 1 : 0.7,
                              }}
                            >
                              R$ {transacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {index < produtosTransacoes.length - 1 && <Divider sx={{ bgcolor: '#2a3756', my: 2 }} />}
                </Box>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="#8fa3c8">
                  Nenhuma transação encontrada para este bot.
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BotTransacoesModal;
