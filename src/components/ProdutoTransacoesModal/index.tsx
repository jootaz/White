import React, { useState, useEffect, useRef } from 'react';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useApi } from '../../hooks/useApi';
import { REFERENCE_DATE, filterTransactionsFromReferenceDate } from '../../utils/dateUtils';

interface ProdutoTransacoesModalProps {
  open: boolean;
  onClose: () => void;
  produtoId?: string;
  showAllProducts?: boolean;
}

interface ProdutoVendas {
  produto_id: string;
  produto_nome: string;
  quantidade: number;
  valorTotal: number;
  transacoes: {
    id: string;
    data: string;
    bot_nome: string;
    status: string;
    valor: number;
  }[];
}

// Interface para tipagem da transação
interface ApiTransactionDetailed {
  bot: string | { id?: string, _id?: string, name?: string },
  _id: string,
  product: string | { id?: string, _id?: string, name?: string, price?: number | string },
  status: string,
  created_at: number
}

// Interface para tipagem do produto
interface ProductDetailedInfo {
  id?: string;
  _id?: string;
  name: string;
  price: number | string;
}

// Cache dos dados por produtoId
const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutos em ms

const ProdutoTransacoesModal: React.FC<ProdutoTransacoesModalProps> = ({ 
  open, 
  onClose, 
  produtoId,
  showAllProducts = false
}) => {
  // Restringir logs para não poluir o console
  // console.log("[DEBUG] ProdutoTransacoesModal renderizando. open:", open, "produtoId:", produtoId, "showAll:", showAllProducts, "render time:", new Date().toISOString());
  const [loading, setLoading] = useState(true);
  const [produtoNome, setProdutoNome] = useState('');
  const [produtosVendas, setProdutosVendas] = useState<ProdutoVendas[]>([]);
  const [totalVendas, setTotalVendas] = useState(0);
  const [faturamentoTotal, setFaturamentoTotal] = useState(0);
  // Ref para armazenar cache dos dados por produtoId
  const dadosCache = useRef<Record<string, { 
    produtoNome: string, 
    produtosVendas: ProdutoVendas[],
    totalVendas: number,
    faturamentoTotal: number,
    timestamp: number 
  }>>({});
  
  // Controlador para evitar múltiplas requisições simultâneas
  const loadingRef = useRef<boolean>(false);
  
  // Ref para armazenar todos os produtos para poder restaurá-los
  const todosProdutosRef = useRef<ProdutoVendas[]>([]);
  
  const api = useApi();
  
  // Função para lidar com o clique em um produto na tabela de visão geral
  // Reescrever completamente a função de click para eliminar qualquer comportamento que possa fechar o modal
  const handleProdutoClick = (produtoId: string, event?: React.MouseEvent) => {
    console.log("[DEBUG] Iniciando handleProdutoClick para produtoId:", produtoId);
    
    // Interromper a propagação de eventos se houver
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    // Não fazer nada se estiver carregando
    if (loading) {
      console.log("[DEBUG] Ignorando clique no produto porque está carregando");
      return;
    }
    
    // IMPORTANTE: Primeiro salvamos a lista completa de produtos para referência futura
    if (produtosVendas.length > 1) {
      todosProdutosRef.current = [...produtosVendas];
    }
    
    // Encontrar o produto selecionado
    const produtoSelecionado = produtosVendas.find(p => p.produto_id === produtoId);
    
    if (!produtoSelecionado) {
      console.log("[DEBUG] Produto não encontrado");
      return;
    }
    
    console.log("[DEBUG] Produto selecionado:", produtoSelecionado.produto_nome);
    
    // Abordagem alternativa: Usar clonagem profunda para evitar problemas com referências
    const produtoClone = JSON.parse(JSON.stringify(produtoSelecionado));
    
    // Atualizar o estado uma única vez
    setProdutoNome(produtoClone.produto_nome);
    setProdutosVendas([produtoClone]);
  };

  // Função para voltar à visão geral de todos os produtos
  // Reescrever a função de voltar para simplificar e evitar qualquer comportamento que possa fechar o modal
  const handleVoltarParaVisaoGeral = (event?: React.MouseEvent) => {
    console.log("[DEBUG] Iniciando handleVoltarParaVisaoGeral");
    
    // Interromper propagação de eventos se houver
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    // Não fazer nada se estiver carregando
    if (loading) {
      console.log("[DEBUG] Ignorando clique em voltar porque está carregando");
      return;
    }
    
    // Nada a fazer se não houver produtos salvos
    if (todosProdutosRef.current.length === 0) {
      console.log("[DEBUG] Não há produtos salvos para restaurar");
      return;
    }
    
    console.log("[DEBUG] Restaurando lista de produtos:", todosProdutosRef.current.length);
    
    // Abordagem alternativa: Usar clonagem profunda para evitar problemas com referências
    const produtosClone = JSON.parse(JSON.stringify(todosProdutosRef.current));
    
    // Definir diretamente sem setTimeout
    setProdutosVendas(produtosClone);
  };

  // Contador para rastrear o número de requisições feitas
  const requestCountRef = useRef(0);
    
  // Função para carregar dados única
  const carregarDadosUmaVez = async () => {
    // Incrementa e loga o contador de requisições
    requestCountRef.current += 1;
    const requestId = requestCountRef.current;
    
    console.log(`[DEBUG] #${requestId} Iniciando carregarDadosUmaVez com timestamp:`, new Date().toISOString());
    
    // Se já está carregando, não faz nada
    if (loadingRef.current) {
      console.log(`[DEBUG] #${requestId} Já está carregando dados... ignorando chamada`);
      return;
    }
    
    // Se não está configurado para mostrar todos os produtos e o produtoId for vazio, não faz nada
    if (!showAllProducts && !produtoId) {
      console.log("[DEBUG] Ignorando carregamento por configuração inválida");
      setLoading(false);
      return;
    }
    
    // Define que está carregando
    loadingRef.current = true;
    setLoading(true);
    
    try {
      // Limpar o ref de todos produtos quando o modal é aberto
      todosProdutosRef.current = [];
      
      // Verifica se já temos dados em cache para este produtoId
      const cacheKey = produtoId || 'todos';
      const cacheData = dadosCache.current[cacheKey];
      const agora = Date.now();
      
      if (cacheData && (agora - cacheData.timestamp) < CACHE_TIMEOUT) {
        console.log(`[DEBUG] #${requestId} Usando dados em cache para o produto:`, cacheKey);
        
        // Usa dados do cache
        setProdutoNome(cacheData.produtoNome);
        setProdutosVendas(cacheData.produtosVendas);
        setTotalVendas(cacheData.totalVendas);
        setFaturamentoTotal(cacheData.faturamentoTotal);
        return;
      }
      
      console.log(`[DEBUG] #${requestId} Carregando dados novos para o produto:`, cacheKey);
      
      // Buscar estatísticas detalhadas
      const now = Date.now();
      const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
      
      const detailedStatsResponse = await api.getBotStatsDetailed({
        dateRange: {
          start: thirtyDaysAgo,
          end: now
        }
      });

      // Buscar produtos para obter informações completas
      const productsResponse = await api.listProducts();
      const productsMap = new Map<string, ProductDetailedInfo>();
      
      if (productsResponse.data && Array.isArray(productsResponse.data)) {
        productsResponse.data.forEach((product: ProductDetailedInfo) => {
          productsMap.set(product.id || product._id || '', product);
        });
      }
      
      // Buscar informações dos bots
      const botsResponse = await api.listBots();
      const botsMap = new Map<string, { id?: string, _id?: string, name: string }>();
      
      if (botsResponse.data && Array.isArray(botsResponse.data)) {
        botsResponse.data.forEach((bot: { id?: string, _id?: string, name: string }) => {
          botsMap.set(bot.id || bot._id || '', bot);
        });
      }

      // Filtrar transações para este produto e agrupar por produto
      if (detailedStatsResponse.data && Array.isArray(detailedStatsResponse.data)) {
        // Primeiro aplica o filtro de data para incluir apenas transações a partir de 25/06/2025
        let transactions = filterTransactionsFromReferenceDate(detailedStatsResponse.data);
        console.log(`[INFO] ProdutoTransacoesModal - Filtrando transações a partir de ${REFERENCE_DATE.toLocaleDateString('pt-BR')}: ${transactions.length} de ${detailedStatsResponse.data.length} transações`);
        
        let nomeDoProdutoAtual = '';
        
        // Se fornecido um produtoId específico, filtrar apenas por ele
        if (produtoId) {
          transactions = transactions.filter((transaction: ApiTransactionDetailed) => {
            const transactionProductId = typeof transaction.product === 'string' 
              ? transaction.product 
              : (transaction.product ? String(transaction.product.id || transaction.product._id) : '');
            
            return transactionProductId === produtoId;
          });
          
          // Definir o nome do produto
          const productInfo = productsMap.get(produtoId);
          if (productInfo) {
            nomeDoProdutoAtual = productInfo.name;
          } else {
            nomeDoProdutoAtual = `Produto #${produtoId}`;
          }
        } else {
          // Se mostrarmos todos os produtos
          nomeDoProdutoAtual = 'Todos os Produtos';
        }
        setProdutoNome(nomeDoProdutoAtual);

        const produtosMap = new Map<string, ProdutoVendas>();
        let totalTransacoes = 0;
        let totalFaturamento = 0;

        transactions.forEach((transacao: ApiTransactionDetailed) => {
          const productId = typeof transacao.product === 'string' 
            ? transacao.product 
            : (transacao.product ? String(transacao.product.id || transacao.product._id) : '');
          
          const botId = typeof transacao.bot === 'string'
            ? transacao.bot
            : (transacao.bot ? String(transacao.bot.id || transacao.bot._id) : '');
          
          const productInfo = productsMap.get(productId);
          const produtoNomeLocal = productInfo ? productInfo.name : `Produto #${productId}`;
          const precoUnitario = productInfo ? (typeof productInfo.price === 'number' ? productInfo.price : parseFloat(String(productInfo.price)) || 0) : 0;
          const isApproved = transacao.status === 'approved';
          
          // Buscar informações do bot
          const botInfo = botsMap.get(botId);
          const botNome = botInfo ? botInfo.name : `Bot #${botId}`;
          
          totalTransacoes++;
          if (isApproved) {
            totalFaturamento += precoUnitario;
          }

          if (!produtosMap.has(productId)) {
            produtosMap.set(productId, {
              produto_id: productId,
              produto_nome: produtoNomeLocal,
              quantidade: 0,
              valorTotal: 0,
              transacoes: []
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
            bot_nome: botNome,
            status: transacao.status,
            valor: precoUnitario
          });
        });

        // Converter map para array e ordenar por valor total (maior para menor)
        const produtosArray = Array.from(produtosMap.values())
          .sort((a, b) => b.valorTotal - a.valorTotal);
        
        setProdutosVendas(produtosArray);
        setTotalVendas(totalTransacoes);
        setFaturamentoTotal(totalFaturamento);
        
        // Salva os dados no cache
        dadosCache.current[cacheKey] = {
          produtoNome: nomeDoProdutoAtual,
          produtosVendas: produtosArray,
          totalVendas: totalTransacoes,
          faturamentoTotal: totalFaturamento,
          timestamp: Date.now()
        };
      }
    } catch (error) {
      console.error(`[DEBUG] #${requestId} Erro ao carregar histórico de produtos:`, error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
      
      // Marcamos que os dados foram carregados com sucesso
      configRef.current.dataCarregada = true;
      
      console.log(`[DEBUG] #${requestId} Requisição finalizada, estados resetados, dados marcados como carregados.`);
    }
  };

  // ID único para cada abertura do modal
  // Criamos um objeto ref para armazenar configurações e controlar o carregamento
  const configRef = useRef({
    open: false,
    produtoId: '' as string | undefined,
    showAllProducts: false,
    lastRequestTimestamp: 0,
    dataCarregada: false
  });
  
  // Efeito único que lida com abertura/fechamento do modal e mudanças de props
  useEffect(() => {
    // Se o modal não está aberto, limpamos o estado e saímos
    if (!open) {
      loadingRef.current = false;
      // Ao fechar o modal, resetamos o estado de dados carregados,
      // mas mantemos os outros valores para cache
      configRef.current.dataCarregada = false;
      configRef.current.open = false;
      return;
    }
    
    // Pegamos os valores atuais da configuração
    const config = configRef.current;
    const agora = Date.now();
    
    // Verificamos se houve mudança real nas props importantes
    const propsChanged = 
      config.open !== open || 
      config.produtoId !== produtoId || 
      config.showAllProducts !== showAllProducts;
    
    // Se as props não mudaram E já carregamos dados OU estamos carregando, não fazemos nada
    if (!propsChanged && (config.dataCarregada || loadingRef.current)) {
      console.log("[DEBUG] Evitando recarga desnecessária. Props não mudaram e dados já carregados ou carregando.");
      return;
    }
    
    // Se a última requisição foi há menos de 1 segundo, evitamos sobrecarga
    if (agora - config.lastRequestTimestamp < 1000) {
      console.log("[DEBUG] Evitando requisições muito próximas:", 
        agora - config.lastRequestTimestamp, "ms desde a última");
      return;
    }
    
    // Atualizamos a ref com os valores atuais
    configRef.current = {
      ...config,
      open,
      produtoId,
      showAllProducts,
      lastRequestTimestamp: agora
    };
    
    console.log("[DEBUG] Carregando dados do modal. Mudança detectada:", 
      propsChanged ? "sim" : "não", 
      "open:", open, 
      "produtoId:", produtoId, 
      "showAll:", showAllProducts
    );
    
    // Carregamos os dados sem timer e apenas se não estiver já carregando
    if (!loadingRef.current) {
      carregarDadosUmaVez();
    }
    
  // Dependências necessárias para o efeito ser executado quando algo importante mudar
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, produtoId, showAllProducts]);
  

  // Imediatamente cancel qualquer tentativa de fechar o modal via clicks ou teclas
  // Só permitir o fechamento pelo botão explícito X
  const handleModalClose = (event: React.MouseEvent<HTMLElement>, reason: string) => {
    console.log("[DEBUG] Dialog onClose interceptado, reason:", reason);
    
    // Bloquear SEMPRE o fechamento automático, independente do motivo
    // O modal só deve fechar explicitamente pelo botão X
    event.stopPropagation();
    
    // Não propagar o evento de fechamento, mantendo o modal aberto
    return false;
  };

  return (
    <Dialog 
      open={open} 
      // Desabilitar COMPLETAMENTE o fechamento automático
      onClose={handleModalClose}
      // Não permitir fechamento com tecla Escape
      disableEscapeKeyDown={true}
      // O modal deve ocupar toda a largura disponível
      fullWidth
      maxWidth="md"
      // Desativar completamente o comportamento de clique no backdrop
      sx={{ 
        "& .MuiBackdrop-root": {
          pointerEvents: "none" // Desativa interatividade do backdrop
        }
      }}
      // Configurações adicionais para o Paper (corpo do modal)
      PaperProps={{
        sx: {
          bgcolor: '#181f2a',
          color: '#e0e0e0',
          borderRadius: 2,
          // Garantir que o papel recebe eventos, mesmo com backdrop desativado
          pointerEvents: "auto"
        },
        // Interromper qualquer propagação de eventos no papel
        onClick: (e: React.MouseEvent<HTMLDivElement>) => {
          e.stopPropagation();
        }
      }}
    >
      <DialogTitle sx={{ bgcolor: '#1a2332', p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            {showAllProducts ? 'Histórico de Vendas - Produtos' : `Histórico de Vendas - ${produtoNome}`}
          </Typography>
          {/* Este é o ÚNICO botão que pode fechar o modal */}
          <Box 
            component="div"
            sx={{
              display: 'inline-flex',
              p: 0.5,
              borderRadius: 1,
              border: '1px solid #8fa3c8',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'rgba(143, 163, 200, 0.1)'
              }
            }}
            onClick={() => {
              console.log("[DEBUG] Botão fechar clicado explicitamente - FECHANDO MODAL");
              // Chamada direta de onClose() sem setTimeout
              // Este é o ÚNICO local no componente que fecha o modal
              onClose();
            }}
          >
            <CloseIcon sx={{ color: '#8fa3c8', fontSize: '1.25rem' }} />
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent 
        sx={{ p: 3 }}
        onClick={(e) => {
          // Interceptar cliques na área de conteúdo para evitar que fechem o modal
          e.stopPropagation();
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={40} sx={{ color: '#60a5fa' }} />
          </Box>
        ) : (
          <Box onClick={(e) => {
            // Interceptar cliques na Box principal para evitar que fechem o modal
            e.stopPropagation();
          }}>
            <Box sx={{ mb: 3, p: 2, bgcolor: '#222b3c', borderRadius: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" fontWeight={500}>
                  Resumo de Vendas
                </Typography>
                
                {/* Botão de voltar para visão geral quando estiver vendo um produto específico */}
                {produtosVendas.length === 1 && todosProdutosRef.current.length > 1 && (
                  <Box
                    component="button"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      border: 'none',
                      background: 'transparent',
                      color: '#8fa3c8',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: 1,
                      '&:hover': {
                        bgcolor: 'rgba(143, 163, 200, 0.1)'
                      }
                    }}
                    onClick={handleVoltarParaVisaoGeral}
                  >
                    <ArrowBackIcon fontSize="small" /> 
                    <Typography variant="caption" sx={{ ml: 0.5 }}>Voltar para todos</Typography>
                  </Box>
                )}
              </Box>
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
            
            {/* A parte de navegação entre abas foi removida para simplificar a interface */}
            
            {produtosVendas.length > 1 ? (
              <TableContainer component={Paper} sx={{ bgcolor: '#1a2332', mb: 3 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#253046' }}>
                      <TableRow>
                        <TableCell sx={{ color: '#8fa3c8', fontWeight: 500, fontSize: '0.8rem' }}>Produto</TableCell>
                        <TableCell sx={{ color: '#8fa3c8', fontWeight: 500, fontSize: '0.8rem' }}>Quantidade Vendida</TableCell>
                        <TableCell sx={{ color: '#8fa3c8', fontWeight: 500, fontSize: '0.8rem' }} align="right">Valor Total</TableCell>
                      </TableRow>
                    </TableHead>
                  <TableBody>
                    {produtosVendas.map((produto) => (
                      <TableRow 
                        key={produto.produto_id} 
                        sx={{ 
                          '&:hover': { bgcolor: '#253046' },
                          cursor: 'pointer'
                        }}
                        // Previnir qualquer bubbling de evento antes mesmo do click
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                        onClick={(e) => {
                          console.log("[DEBUG] TableRow clicked para produto:", produto.produto_nome);
                          
                          // Nova abordagem: criamos um evento de clique totalmente novo
                          // em vez de confiar no evento original que pode estar causando problemas
                          e.stopPropagation();
                          e.preventDefault();
                          
                          // Chamamos diretamente sem setTimeout
                          handleProdutoClick(produto.produto_id);
                        }}
                      >
                        <TableCell sx={{ color: '#e0e0e0', fontSize: '0.8rem' }}>
                          {produto.produto_nome}
                        </TableCell>
                        <TableCell sx={{ color: '#e0e0e0', fontSize: '0.8rem' }}>{produto.quantidade}</TableCell>
                        <TableCell sx={{ color: '#e0e0e0', fontSize: '0.8rem', fontWeight: 600 }} align="right">
                          R$ {produto.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              produtosVendas.map((produto, index) => (
                <Box key={produto.produto_id || index} sx={{ mb: 3 }}>
                  <Box sx={{ p: 2, bgcolor: '#222b3c', borderRadius: 1, mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={500}>
                        {produto.produto_nome}
                      </Typography>
                      {todosProdutosRef.current.length > 1 && (
                        <IconButton 
                          size="small" 
                          onClick={(e) => {
                            console.log("[DEBUG] Botão voltar clicado");
                            e.stopPropagation();
                            e.preventDefault();
                            e.nativeEvent.stopImmediatePropagation();
                            
                            // Usamos setTimeout para garantir que o evento de click já terminou
                            setTimeout(() => {
                              handleVoltarParaVisaoGeral(e);
                            }, 0);
                            
                            return false;
                          }}
                          sx={{ color: '#8fa3c8' }}
                          title="Voltar para visão geral"
                          onMouseDown={(e) => {
                            // Garantimos que nem o mousedown propaga
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                        >
                          <ArrowBackIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    <Box display="flex" gap={4} mt={1}>
                      <Typography variant="body2">
                        <span style={{ color: '#8fa3c8' }}>Quantidade:</span> {produto.quantidade}
                      </Typography>
                      <Typography variant="body2">
                        <span style={{ color: '#8fa3c8' }}>Valor Total:</span> R$ {produto.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <TableContainer component={Paper} sx={{ bgcolor: '#1a2332', mb: 3 }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#253046' }}>
                        <TableRow>
                          <TableCell sx={{ color: '#8fa3c8', fontWeight: 500, fontSize: '0.8rem' }}>ID da Transação</TableCell>
                          <TableCell sx={{ color: '#8fa3c8', fontWeight: 500, fontSize: '0.8rem' }}>Data</TableCell>
                          <TableCell sx={{ color: '#8fa3c8', fontWeight: 500, fontSize: '0.8rem' }}>Bot</TableCell>
                          <TableCell sx={{ color: '#8fa3c8', fontWeight: 500, fontSize: '0.8rem' }}>Status</TableCell>
                          <TableCell sx={{ color: '#8fa3c8', fontWeight: 500, fontSize: '0.8rem' }} align="right">
                            Valor 
                            {todosProdutosRef.current.length > 1 && produtosVendas.length === 1 && (
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  console.log("[DEBUG] Botão voltar na tabela clicado");
                                  e.stopPropagation();
                                  e.preventDefault();
                                  e.nativeEvent.stopImmediatePropagation();
                                  
                                  // Usamos setTimeout para garantir que o evento de click já terminou
                                  setTimeout(() => {
                                    handleVoltarParaVisaoGeral(e);
                                  }, 0);
                                  
                                  return false;
                                }}
                                sx={{ color: '#8fa3c8', ml: 1 }}
                                title="Voltar para todos produtos"
                                onMouseDown={(e) => {
                                  // Garantimos que nem o mousedown propaga
                                  e.stopPropagation();
                                  e.preventDefault();
                                }}
                              >
                                <ArrowBackIcon fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {produto.transacoes.map((transacao) => (
                          <TableRow 
                            key={transacao.id} 
                            sx={{ 
                              '&:hover': { bgcolor: '#253046' },
                              bgcolor: transacao.status === 'approved' ? 'rgba(20, 202, 116, 0.1)' :
                                      transacao.status === 'pending' ? 'rgba(249, 181, 86, 0.1)' : 
                                      'rgba(255, 90, 101, 0.1)'
                            }}
                            // Prevenir qualquer propagação de eventos
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                            }}>
                            <TableCell sx={{ color: '#e0e0e0', fontSize: '0.8rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {transacao.id}
                            </TableCell>
                            <TableCell sx={{ color: '#e0e0e0', fontSize: '0.8rem' }}>{transacao.data}</TableCell>
                            <TableCell sx={{ color: '#e0e0e0', fontSize: '0.8rem' }}>{transacao.bot_nome}</TableCell>
                            <TableCell sx={{ fontSize: '0.8rem' }}>
                              <Box component="span" sx={{ 
                                py: 0.5, 
                                px: 1, 
                                borderRadius: 1, 
                                bgcolor: transacao.status === 'approved' ? 'rgba(20, 202, 116, 0.2)' :
                                        transacao.status === 'pending' ? 'rgba(249, 181, 86, 0.2)' : 
                                        'rgba(255, 90, 101, 0.2)',
                                color: transacao.status === 'approved' ? '#14CA74' :
                                       transacao.status === 'pending' ? '#F9B556' : 
                                       '#FF5A65'
                              }}>
                                {transacao.status === 'approved' ? 'Aprovado' :
                                 transacao.status === 'pending' ? 'Pendente' : 
                                 'Cancelado'}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ 
                              color: '#e0e0e0', 
                              fontSize: '0.8rem',
                              fontWeight: transacao.status === 'approved' ? 600 : 400,
                              opacity: transacao.status === 'approved' ? 1 : 0.7
                            }} align="right">
                              R$ {transacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {index < (produtosVendas.length - 1) && (
                    <Divider sx={{ bgcolor: '#2a3756', my: 2 }} />
                  )}
                </Box>
              ))
            )}
            
            {produtosVendas.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="#8fa3c8">
                  Nenhuma transação encontrada para {produtoId ? 'este produto' : 'os produtos'}.
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProdutoTransacoesModal;
