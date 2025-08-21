import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Grid,
  Paper,
  Button,
  LinearProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import { useApi } from '../../hooks/useApi';

// Asset imports
import RestartSvg from '../../assets/Restart.svg';
import botIconGreen from '../../assets/robot_1f916_1.png'; // Presumindo que este é o robô verde
import usuariosIcon from '../../assets/bust-in-silhouette_1f464 1.png';
import bloqueadosIcon from '../../assets/prohibited_1f6ab 1.png';
import conversaoIcon from '../../assets/counterclockwise-arrows-button_1f504 1.png';

// Interface de dados do Bot (placeholder)
export interface BotData {
  nome: string;
  status?: string;
  id?: string; // Campo ID para armazenar o identificador do bot na API
  // Os campos abaixo serão preenchidos pelas estatísticas do bot
  parceria?: {
    tipo: string; // Mantido como placeholder por enquanto
    custo: string; // Mantido como placeholder por enquanto
    feitaEm: string; // Derivado de startTime
    duracao: string; // Mantido como placeholder por enquanto
  };
  usuarios?: {
    hoje: number; // Não disponível diretamente, manter 0 ou lógica futura
    semana: number; // Não disponível diretamente, manter 0 ou lógica futura
    mes: number; // Não disponível diretamente, manter 0 ou lógica futura
    ativos: number; // de BotStats.active_users
    bloqueados: number; // Não disponível diretamente, manter 0 ou lógica futura
  };
  vendas?: {
    hoje: string; // Não disponível diretamente, manter 'R$ 0' ou lógica futura
    semana: string; // Não disponível diretamente, manter 'R$ 0' ou lógica futura
    mes: string; // Não disponível diretamente, manter 'R$ 0' ou lógica futura
    total: string; // de BotStats.sales.total_revenue
  };
  conversao?: {
    hoje: number; // Não disponível diretamente, manter 0 ou lógica futura
    semana: number; // Não disponível diretamente, manter 0 ou lógica futura
    mes: number; // Não disponível diretamente, manter 0 ou lógica futura
    // Poderia ser calculado como (vendas.total_count / usuarios.total_users) * 100 se ambos existissem para o mesmo período
  };
  dataReferencia?: string; // Derivado de BotStats.start_time
}

interface VisualizarBotModalProps {
  open: boolean;
  onClose: () => void;
  bot: BotData | null;
}

const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  width: { xs: '90%', sm: '90%', md: '600px', lg: '750px' }, // Responsivo para diferentes tamanhos de tela
  padding: { xs: '16px', sm: '20px', md: '28px' }, // Padding responsivo
  flexDirection: 'column' as const,
  alignItems: 'flex-start',
  gap: '18px',
  borderRadius: '8px',
  border: '0.6px solid #373B48', // --Elements-Color
  background: '#1B1E28', // Alterado para cor sólida opaca (era rgba(27, 30, 40, 0.36))
  color: '#fff',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxSizing: 'border-box',
};

const iconStyle = { width: 20, height: 20, marginRight: 1 };
const sectionIconStyle = { width: 32, height: 32 };

export const VisualizarBotModal: React.FC<VisualizarBotModalProps> = ({ open, onClose, bot }) => {
  const [actionLoading, setActionLoading] = useState(false); // Para ações como reiniciar/deletar
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { restartBot, deleteBot } = useApi();

  if (!bot) return null;

  const handleGenericAction = async (actionPromise: Promise<unknown>, successMessage: string, errorMessage: string, isDeleteAction = false) => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await actionPromise;
      setSuccess(successMessage);
      if (isDeleteAction) setTimeout(() => onClose(), 1000);
    } catch (err) {
      console.error(errorMessage, err);
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestartBot = () => {
    if (!bot.id) {
      setError("ID do bot não disponível");
      return;
    }
    handleGenericAction(restartBot(bot.id), "Bot reiniciado com sucesso!", "Falha ao reiniciar o bot. Tente novamente.");
  };

  const handleDeleteBot = () => {
    if (!bot.id) {
      setError("ID do bot não disponível");
      return;
    }
    if (!window.confirm(`Deseja realmente excluir o bot "${bot.nome}"?`)) {
      return;
    }
    handleGenericAction(deleteBot(bot.id), "Bot excluído com sucesso!", "Falha ao excluir o bot. Tente novamente.", true);
  };

  const handleStopBot = async () => {
    if (!bot.id) {
      setError("ID do bot não disponível");
      return;
    }
    setActionLoading(true);
    try {
      // Simula uma chamada de API para stop/start, já que não existe no useApi para BotStats
      // Idealmente, isso chamaria uma função como toggleBotStatus(bot.id)
      // Por agora, apenas atualiza o estado local para demonstração e mostra mensagem.
      setError("Funcionalidade de pausar/iniciar o bot temporariamente desabilitada.");
    } catch (err) {
      console.error("Erro ao tentar pausar/iniciar bot:", err);
      setError("Falha ao tentar pausar/iniciar o bot.");
    } finally {
      setActionLoading(false);
    }
  };

  // Dados formatados para exibição - usando valores estáticos temporariamente
  const dataReferenciaView = bot?.dataReferencia || '-';
  const usuariosAtivos = 0; // Valor estático temporário
  const conversaoGeral = 0; // Valor estático temporário

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', position: 'relative', minHeight: '40px' }}>
          <IconButton
            onClick={onClose}
            sx={{
              color: '#fff',
              position: 'absolute',
              top: '-10px',
              left: '-10px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '50%',
              padding: '4px',
              zIndex: 1
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            flexGrow: 1,
            justifyContent: 'center',
            textAlign: 'center',
            flexWrap: 'wrap',
            gap: { xs: 0.5, sm: 1 }
          }}>
            <IconButton
              sx={{ color: '#fff' }}
              onClick={handleRestartBot}
              disabled={actionLoading}
              size="small"
            >
              <img src={RestartSvg} alt="Restart" style={{ width: 20, height: 20 }} />
            </IconButton>
            <Typography
              variant="h6"
              fontWeight={600}
              noWrap
              sx={{
                fontSize: { xs: '1rem', sm: '1.25rem' },
                maxWidth: { xs: '180px', sm: '250px', md: '300px' },
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {bot.nome || 'Nome do Bot'}
            </Typography>
          </Box>
          <img src={botIconGreen} alt="Bot Icon" style={{ width: 32, height: 32, position: 'absolute', top: '-5px', right: '0px' }} />
        </Box>

        {/* Date Selector */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Paper sx={{
            display: 'flex',
            alignItems: 'center',
            padding: { xs: '6px 12px', sm: '8px 16px' },
            borderRadius: '8px',
            background: 'rgba(0,0,0,0.2)',
            width: 'fit-content',
            maxWidth: '100%',
            overflow: 'hidden'
          }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: { xs: 16, sm: 20 }, marginRight: { xs: '4px', sm: '8px' } }} />
            <Typography
              variant="body1"
              sx={{
                mr: 1,
                fontSize: { xs: '0.85rem', sm: '1rem' },
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {dataReferenciaView}
            </Typography>
          </Paper>
        </Box>

        <Grid container spacing={2} sx={{ width: '100%' }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, borderRadius: '8px', background: 'rgba(0,0,0,0.2)', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={500}>Usuários</Typography>
                <img src={usuariosIcon} alt="Usuários" style={sectionIconStyle} />
              </Box>
              {/* Dados estáticos de usuários */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2">Total Geral</Typography>
                <Typography variant="body2" fontWeight="bold">0</Typography>
              </Box>
              <hr style={{ border: '0.5px solid #373B48', margin: '8px 0', width: '100%' }} />
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <PublicOutlinedIcon sx={{ fontSize: 20, marginRight: 1 }} />
                <Typography variant="body2" sx={{ flexGrow: 1 }}>Ativos (no momento)</Typography>
                <Typography variant="body2" fontWeight="bold">{usuariosAtivos}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <img src={bloqueadosIcon} alt="Bloqueados" style={iconStyle} />
                <Typography variant="body2" sx={{ flexGrow: 1 }}>Bloqueados</Typography>
                <Typography variant="body2" fontWeight="bold">N/A</Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, borderRadius: '8px', background: 'rgba(0,0,0,0.2)', height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={500}>Conversão Geral</Typography>
                <img src={conversaoIcon} alt="Conversão" style={sectionIconStyle} />
              </Box>
              {/* Dados estáticos de conversão */}
              <Box sx={{ mb: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="body2">Geral (Vendas/Usuários)</Typography>
                  <Typography variant="body2" fontWeight="bold">{conversaoGeral}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={0}
                  sx={{ height: 8, borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.1)', '& .MuiLinearProgress-bar': { backgroundColor: '#007bff' } }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Seção de ações do bot */}
        <Box sx={{
          width: '100%',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 2, sm: 0 },
          mt: 2
        }}>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1
          }}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleDeleteBot}
              disabled={actionLoading}
              sx={{ borderRadius: '8px' }}
              fullWidth={false}
            >
              Excluir Bot
            </Button>

            <Button
              variant="outlined"
              onClick={handleRestartBot}
              disabled={actionLoading}
              startIcon={<img src={RestartSvg} alt="Reiniciar" style={{ width: 15, height: 14 }} />}
              sx={{ borderRadius: '8px' }}
              fullWidth={false}
            >
              Reiniciar
            </Button>
          </Box>

          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1
          }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleStopBot}
              disabled={actionLoading}
              sx={{ borderRadius: '8px' }}
              fullWidth={false}
            >
              Pausar
            </Button>

            <Button
              variant="contained"
              onClick={onClose}
              sx={{ borderRadius: '8px' }}
              fullWidth={false}
            >
              Fechar
            </Button>
          </Box>
        </Box>

        {/* Mensagens de feedback */}
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
            {success}
          </Alert>
        </Snackbar>
      </Box>
    </Modal>
  );
};
