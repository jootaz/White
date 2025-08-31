import { useState, useEffect, useRef } from 'react';
import { Box, Grid, Paper, Typography, Button, TextField, InputAdornment, Select, MenuItem, IconButton, CircularProgress, Snackbar, Alert, Tabs, Tab, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BlockIcon from '@mui/icons-material/Block';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import { CadastrarBotModal } from './CadastrarBotModal';
import { VisualizarBotModal } from './VisualizarBotModal';
import { EditarBotModal } from './EditarBotModal';
import { CallbacksManager } from './CallbacksManager';
import { ProductsManager } from './ProductsManager';
import type { BotData } from './VisualizarBotModal';
import type { BotResponseData } from '../../types/api';
import { useApi } from '../../hooks/useApi';
import RestartSvg from '../../assets/Restart.svg';  
import GroupsIcon from "@mui/icons-material/Groups";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PaidIcon from "@mui/icons-material/Paid";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";


// Componentes com carregamento sob demanda para evitar requisições duplicadas
const LazyCallbacksManager = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Marca como carregado na primeira renderização
    if (!loaded) {
      setLoaded(true);
    }
  }, [loaded]);

  // Só retorna o componente se estiver visível
  return <CallbacksManager key="callbacks" />;
};

const LazyProductsManager = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Marca como carregado na primeira renderização
    if (!loaded) {
      setLoaded(true);
    }
  }, [loaded]);

  // Só retorna o componente se estiver visível
  return <ProductsManager key="products" />;
};

// Interface para abas
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{ width: '100%' }}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Função para mapear dados da API para o formato esperado pelo componente
// Modificada para usar apiBot.running do novo formato da resposta da API
const mapApiBotToComponentBot = (apiBot: BotResponseData): BotData => {

  // O status 'ativo' é definido se o bot tem a propriedade running como true.
  // Caso contrário, é 'inativo'.
  const status = apiBot.running ? 'ativo' : 'inativo';

  return {
    nome: apiBot.name,
    status: status,
    id: apiBot._id,
    parceria: {
      tipo: "Parceria",
      custo: "R$ 10,7K",
      feitaEm: new Date().toLocaleDateString('pt-BR'),
      duracao: "30 dias",
    },
    usuarios: {
      hoje: 43,
      semana: 68,
      mes: 234,
      ativos: 56,
      bloqueados: 3,
    },
    vendas: {
      hoje: "R$ 1k",
      semana: "R$ 4k",
      mes: "R$ 14k",
      total: "R$ 26k",
    },
    conversao: {
      hoje: 10,
      semana: 70,
      mes: 90,
    },
    dataReferencia: apiBot.startTime
      ? new Date(apiBot.startTime).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
      : new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  };
};

// A função mapRunningBotToComponentBot foi removida pois o endpoint /bots/running não está mais disponível no backend
// e não é mais necessária no código

function getStatusIcon(status: string | undefined) {
  if (status === 'ativo') return <AutorenewIcon color="success" fontSize="small" />;
  if (status === 'inativo') return <BlockIcon color="error" fontSize="small" />;
  return <AutorenewIcon color="disabled" fontSize="small" />;
}

export function Bots() {
  const [openModal, setOpenModal] = useState(false);
  const [openVisualizarModal, setOpenVisualizarModal] = useState(false);
  const [openEditarModal, setOpenEditarModal] = useState(false);
  const [selectedBot, setSelectedBot] = useState<BotData | null>(null);
  const [selectedBotApi, setSelectedBotApi] = useState<BotResponseData | null>(null);
  const [bots, setBots] = useState<BotData[]>([]);
  const [errorMessage, setError] = useState<string | null>(null); // Para mensagens de erro específicas da UI
  const [success, setSuccess] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [tabValue, setTabValue] = useState(0); // Estado para controlar a aba ativa
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [botToDelete, setBotToDelete] = useState<{ id: string, nome: string } | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // Loading apenas para carregamento inicial
  const [isRefreshing, setIsRefreshing] = useState(false); // Loading para refresh manual
  
  const {
    listBots,
    restartBot,
    deleteBot,
    loading,
    error: apiError
  } = useApi();  // Carregar bots da API apenas quando necessário
  // Flag para controlar a primeira montagem e evitar carregar múltiplas vezes
  const isMountedRef = useRef(false);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    // Função para carregar os bots
    const loadBots = async () => {
      if (isLoadingRef.current) return;

      isLoadingRef.current = true;
      await fetchBots(false); // false = não é refresh manual
      isLoadingRef.current = false;
    };

    // Carrega na montagem inicial
    if (!isMountedRef.current) {
      loadBots();
      isMountedRef.current = true;
    }

    // Para mudanças nos filtros, usamos um debounce
    // A flag isMountedRef.current garante que isso não rode na montagem inicial
    if (isMountedRef.current) {
      const handler = setTimeout(() => {
        // Para filtros, não mostramos loading para evitar limpeza da tela
        loadBots();
      }, 500);

      return () => {
        clearTimeout(handler);
      };
    }
  }, [filterStatus, searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  // Monitorar mudanças no erro da API
  useEffect(() => {
    if (apiError) {
      setError(`Erro na API: ${apiError.message}`);
    }
  }, [apiError]);

  const fetchBots = async (isManualRefresh = false) => {
    try {
      // Só mostra loading se for carregamento inicial ou refresh manual
      if (isManualRefresh) {
        setIsRefreshing(true);
      }

      let componentBots: BotData[] = [];

      // Como o endpoint /bots/running foi removido, carregamos todos os bots através do listBots
      // e fazemos a filtragem localmente
      const allBotsResponse = await listBots();

      if (allBotsResponse && allBotsResponse.data) {
        // Mapeamos diretamente os bots usando a propriedade 'running' presente na resposta da API
        componentBots = allBotsResponse.data.map(apiBot => mapApiBotToComponentBot(apiBot));

        // Aplicar filtro de status
        if (filterStatus !== "todos") {
          componentBots = componentBots.filter(bot => bot.status === filterStatus);
        }
      }

      // Aplicar filtro de pesquisa (searchTerm) se houver
      if (searchTerm) {
        componentBots = componentBots.filter(bot =>
          bot.nome.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Exibir todos os bots sem paginação
      setBots(componentBots);

      // Marcar carregamento inicial como concluído
      if (isInitialLoading) {
        setIsInitialLoading(false);
      }

    } catch (err: unknown) {
      setError((err as Error).message || 'Erro ao buscar bots');
      setBots([]);

      // Marcar carregamento inicial como concluído mesmo em caso de erro
      if (isInitialLoading) {
        setIsInitialLoading(false);
      }
    } finally {
      // Limpar loading de refresh manual
      if (isManualRefresh) {
        setIsRefreshing(false);
      }
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleOpenVisualizarModal = (bot: BotData) => {
    setSelectedBot(bot);
    setOpenVisualizarModal(true);
  };

  const handleCloseVisualizarModal = () => {
    setOpenVisualizarModal(false);
    setSelectedBot(null);
  };

  const handleOpenEditarModal = async (bot: BotData) => {
    if (!bot.id) {
      setError("ID do bot não encontrado");
      return;
    }

    try {
      // Primeiro, buscar na lista de bots local
      const botsList = await listBots();
      if (botsList && botsList.data) {
        // Encontrar o bot específico pelo ID
        const fullBot = botsList.data.find(apiBot => apiBot._id === bot.id);

        if (fullBot) {
          // Usar diretamente o objeto completo do bot
          setSelectedBotApi(fullBot);
          setOpenEditarModal(true);
        } else {
          throw new Error('Bot não encontrado na lista atual');
        }
      } else {
        throw new Error('Não foi possível obter a lista de bots');
      }
    } catch (err) {
      console.error('Erro ao obter dados completos do bot:', err);
      setError('Erro ao carregar dados do bot para edição');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleCloseEditarModal = () => {
    setOpenEditarModal(false);
    setSelectedBotApi(null);
  };

  const handleRestartBot = async (id: string, botName: string) => {
    try {
      await restartBot(id);
      setSuccess(`Bot ${botName} reiniciado com sucesso!`);
      fetchBots(false); // Recarrega a lista sem mostrar loading
      setTimeout(() => setSuccess(null), 3000); // Limpa a mensagem de sucesso
    } catch (err) {
      console.error('Erro ao reiniciar bot:', err);
      setError('Falha ao reiniciar o bot.');
      setTimeout(() => setError(null), 5000); // Limpa a mensagem de erro
    }
  };

  const handleOpenDeleteConfirm = (bot: BotData) => {
    if (bot.id && bot.nome) {
      setBotToDelete({ id: bot.id, nome: bot.nome });
      setDeleteDialogOpen(true);
    } else {
      setError("ID ou nome do bot não encontrado");
    }
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    setBotToDelete(null);
  };

  const handleDeleteBot = async () => {
    if (!botToDelete?.id) return;

    try {
      await deleteBot(botToDelete.id);
      setSuccess(`Bot ${botToDelete.nome} deletado com sucesso!`);
      fetchBots(false); // Recarregar lista sem mostrar loading
      setDeleteDialogOpen(false);
      setBotToDelete(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Erro ao deletar bot:', err);
      setError('Falha ao deletar o bot. Por favor, tente novamente.');
      setTimeout(() => setError(null), 5000);
    }
  }; 

 // Estado para estatísticas
const [stats, setStats] = useState({
  totalUsers: 0,
  startUsers: 0,
  paidUsers: 0,
  unpaidUsers: 0,
});

// Atualiza stats quando bots mudar
useEffect(() => {
  const totalUsers = bots.reduce((sum, bot) => sum + (bot.usuarios?.ativos || 0), 0);
  const startUsers = bots.reduce((sum, bot) => sum + (bot.usuarios?.hoje || 0), 0);
  const paidUsers = bots.reduce((sum, bot) => {
    const vendasHoje = bot.vendas?.hoje || "0";
    // Remove "R$" e "k" e transforma em número
    const num = parseFloat(vendasHoje.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
    return sum + num;
  }, 0);
  const unpaidUsers = bots.reduce((sum, bot) => sum + (bot.usuarios?.bloqueados || 0), 0);

  setStats({ totalUsers, startUsers, paidUsers, unpaidUsers });
}, [bots]);

  return (
    <Box sx={{ p: 2 }}>
      <CadastrarBotModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={() => {
          setSuccess('Bot cadastrado com sucesso!');
          fetchBots(false); // Recarregar lista sem mostrar loading
          setTimeout(() => setSuccess(null), 3000);
        }}
      />

      {selectedBot && ( // Adicionada verificação para selectedBot antes de renderizar VisualizarBotModal
        <VisualizarBotModal
          open={openVisualizarModal}
          onClose={handleCloseVisualizarModal}
          bot={selectedBot}
        />
      )}

      {selectedBotApi && ( // Adicionada verificação para selectedBotApi antes de renderizar EditarBotModal
        <EditarBotModal
          open={openEditarModal}
          onClose={handleCloseEditarModal}
          onSuccess={() => {
            setSuccess('Bot atualizado com sucesso!');
            fetchBots(false); // Recarregar lista sem mostrar loading
            setTimeout(() => setSuccess(null), 3000);
          }}
          bot={selectedBotApi}
        />
      )}

      {/* Cabeçalho da página com título */}
      <Typography variant="h5" gutterBottom fontWeight={600} color="#fff" marginTop={6}>
        Gerenciamento de Bots
      </Typography>     
      {/* Estatísticas de usuários */}
<Grid container spacing={2} sx={{ mb: 3 }}>
  {[
    { label: "Usuários Totais", value: stats.totalUsers, icon: GroupsIcon },
    { label: "Usuários /start", value: stats.startUsers, icon: PlayCircleOutlineIcon },
    { label: "Usuários Pagantes", value: stats.paidUsers, icon: PaidIcon },
    { label: "Gerou e não Pagou", value: stats.unpaidUsers, icon: ReportProblemIcon },
  ].map((stat, index) => (
    <Grid item xs={12} sm={6} md={3} key={index}>
      <Paper
        sx={{
          p: 2,
          borderRadius: "12px",
          bgcolor: "#0a0b0cff",
          color: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          alignItems: "flex-start",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
          },
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <stat.icon sx={{ fontSize: 30, color: "#1361c7ff" }} />
          <Typography
            variant="body2"
            sx={{ color: "#CBD5E1", fontWeight: 500 }}
          >
            {stat.label}
          </Typography>
        </Box>
        <Typography variant="h5" fontWeight={700}>
          {stat.value}
        </Typography>
      </Paper>
    </Grid>
  ))}
</Grid>
      
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => setOpenModal(true)}
            sx={{ bgcolor: '#01364dff', '&:hover': { bgcolor: '#014764ff' }, borderRadius: '8px', fontWeight: 600, minWidth: '180px' }}
          >
            Cadastrar Novo Bot
          </Button>
          <Button
            variant="outlined"
            onClick={() => fetchBots(true)} // true = refresh manual
            disabled={isRefreshing}
            startIcon={<RefreshIcon />}
            sx={{ borderRadius: '8px', borderColor: '#4A5C71', color: '#fff', '&:hover': { borderColor: '#E2E8F0', bgcolor: 'rgba(255, 255, 255, 0.05)' } }}
          >
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar bot..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#fff' }} /></InputAdornment>,
              sx: { borderRadius: '8px', bgcolor: '#1e2733ff', color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4A5C71' } }
            }}
            sx={{ minWidth: '240px' }}
          />          <Select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as string);
            }}
            size="small"
            sx={{ borderRadius: '8px', bgcolor: '#1e2733ff', color: '#fff', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4A5C71' }, '& .MuiSvgIcon-root': { color: '#fff' } }}
          >
            <MenuItem value="todos">Todos os Status</MenuItem>
            <MenuItem value="ativo">Ativo</MenuItem>
            <MenuItem value="inativo">Inativo</MenuItem>
          </Select>
        </Box>
      </Box>      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} aria-label="abas de gerenciamento">
        <Tab label="Bots" sx={{ color: '#fff', fontWeight: tabValue === 0 ? 'bold' : 'normal' }} />
        <Tab label="Callbacks" sx={{ color: '#fff', fontWeight: tabValue === 1 ? 'bold' : 'normal' }} />
        <Tab label="Produtos" sx={{ color: '#fff', fontWeight: tabValue === 2 ? 'bold' : 'normal' }} />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        {isInitialLoading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>}
        {errorMessage && <Alert severity="error" sx={{ my: 2 }}>{errorMessage}</Alert>}
        {success && <Alert severity="success" sx={{ my: 2 }}>{success}</Alert>}
        {!isInitialLoading && bots.length === 0 && !errorMessage && (
          <Typography sx={{ textAlign: 'center', color: '#aaa', mt: 3 }}>
            Nenhum bot encontrado com os filtros atuais.
          </Typography>
        )}
        {!isInitialLoading && bots.length > 0 && (
          <Grid
            container
            spacing={3}
            sx={{
              mt: 1,
              maxHeight: '75vh',
              overflow: 'auto',
              px: 1
            }}
          >
            {bots.map((bot) => (
              <Grid item xs={12} sm={6} md={4} key={bot.id}>
                <Paper sx={{
                  p: 2.5,
                  borderRadius: '12px',
                  bgcolor: '#0a0b0cff',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  height: '180px', // Altura fixa para todos os cards
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                  }
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '70%', // Limitar largura para evitar quebrar layout
                        fontSize: '1rem',
                        letterSpacing: '0.01em'
                      }}
                    >
                      {bot.nome}
                    </Typography>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1,
                      py: 0.5,
                      borderRadius: '6px',
                      bgcolor: bot.status === 'ativo' ? 'rgba(22, 163, 74, 0.9)' : bot.status === 'pendente' ? 'rgba(245, 158, 11, 0.9)' : 'rgba(220, 38, 38, 0.9)'
                    }}>
                      {getStatusIcon(bot.status)}
                      <Typography variant="caption" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                        {bot.status}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#CBD5E1',
                      mt: 1.5,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: '0.85rem'
                    }}
                  >
                    ID: {bot.id}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#CBD5E1',
                      mb: 2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: '0.85rem'
                    }}
                  >
                    Referência: {bot.dataReferencia}
                  </Typography>

                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 1,
                    mt: 'auto', // Empurra os botões para o final do card
                    alignItems: 'center'
                  }}>
                    <Button
                      variant="outlined"
                      onClick={() => handleOpenVisualizarModal(bot)}
                      sx={{
                        borderRadius: '8px',
                        borderColor: '#007eb4ff',
                        color: '#007eb4ff',
                        '&:hover': {
                          borderColor: '#0389c2ff',
                          backgroundColor: 'rgba(0, 164, 232, 0.1)'
                        },
                        fontWeight: 500,
                        flexGrow: 1,
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        py: 0.75
                      }}
                    >
                      Visualizar
                    </Button>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenEditarModal(bot)}
                      sx={{
                        color: '#94A3B8',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          color: '#E2E8F0'
                        }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => bot.id && bot.nome && handleRestartBot(bot.id, bot.nome)}
                      sx={{
                        color: '#94A3B8',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          color: '#E2E8F0'
                        }
                      }}
                      disabled={loading || isRefreshing} // Desabilitar durante operações de API ou refresh
                    >
                      <img src={RestartSvg} alt="Restart Bot" style={{ width: 18, height: 18 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDeleteConfirm(bot)}
                      sx={{
                        color: '#94A3B8',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        '&:hover': {
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#EF4444'
                        }
                      }}
                      disabled={loading || isRefreshing} // Desabilitar durante operações de API ou refresh
                    >
                      <BlockIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>      <TabPanel value={tabValue} index={1}>
        {tabValue === 1 && <LazyCallbacksManager />}
      </TabPanel>      <TabPanel value={tabValue} index={2}>
        {tabValue === 2 && <LazyProductsManager />}
      </TabPanel>

      {/* Diálogo de confirmação para exclusão de bot */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteConfirm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: {
            backgroundColor: '#1E293B',
            color: '#fff',
            borderRadius: '12px',
            minWidth: '400px',
          }
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ color: '#f97171', fontWeight: 600 }}>
          Confirmar exclusão
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ color: '#E2E8F0' }}>
            Tem certeza que deseja excluir o bot <strong>{botToDelete?.nome || ''}</strong>? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={handleCloseDeleteConfirm}
            sx={{
              color: '#94A3B8',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteBot}
            variant="contained"
            autoFocus
            sx={{
              backgroundColor: '#EF4444',
              '&:hover': { backgroundColor: '#DC2626' },
              fontWeight: 600
            }}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!errorMessage} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}