import { Dialog, DialogContent, DialogTitle, IconButton, Grid, TextField, Button, Typography, Box, Divider, Snackbar, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { type UpdateBotPayload, type BotResponseData, UpdateBotPayloadSchema } from '../../types/api';

const AVAILABLE_BANNERS = [
  'https://drive.google.com/uc?id=1gP47oroqR9l2NqdR7JjcQfUvgRQ0Uiij',
  'https://drive.google.com/uc?id=1gjzQuWmk6Fg4tY6XD2UHzuVlCubrOAqC',
  'https://drive.google.com/uc?id=1HBckGlMI7po_VahH_1Ir1pfbij3t6xIT',
];

const getRandomBanners = (): string[] => {
  const shuffled = [...AVAILABLE_BANNERS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2);
};

interface EditarBotModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  bot: BotResponseData | null;
}

export function EditarBotModal({ open, onClose, onSuccess, bot }: EditarBotModalProps) {
  const theme = useTheme();
  const [ofertasExpanded, setOfertasExpanded] = useState(false);
  const [callbacksExpanded, setCallbacksExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { updateBot } = useApi();

  const [botData, setBotData] = useState<Omit<UpdateBotPayload, 'id'>>({
    name: '',
    token: '',
    start: {
      text: 'Bem-vindo ao bot!',
      banner: [],
      keyboards: []
    },
    remarkets: {
      start: '',
      product: '',
      payment: ''
    }
  });

  useEffect(() => {
    if (bot) {
      let banner = bot.start?.banner ? (Array.isArray(bot.start.banner) ? [...bot.start.banner] : []) : [];

      if (banner.length === 0 || banner.every(b => !b || (typeof b === 'string' && b.trim() === ''))) {
        banner = getRandomBanners();
      }

      setBotData({
        name: bot.name,
        token: bot.token,
        start: {
          text: bot.start?.text || 'Bem-vindo ao bot!',
          banner,
          keyboards: bot.start?.keyboards || []
        },
        remarkets: bot.remarkets || {
          start: '',
          product: '',
          payment: ''
        }
      });
    }
  }, [bot]);

  const handleOfertasToggle = () => setOfertasExpanded(!ofertasExpanded);
  const handleCallbacksToggle = () => setCallbacksExpanded(!callbacksExpanded);

  const handleInputChange = (field: string, value: string) => {
    setBotData(prev => ({ ...prev, [field]: value }));
  };

  const handleStartInputChange = (field: string, value: string, bannerIndex?: number) => {
    setBotData(prev => {
      if (field === 'banner' && typeof bannerIndex === 'number') {
        const currentBanner = Array.isArray(prev.start?.banner) ? [...prev.start.banner] : [];
        while (currentBanner.length <= bannerIndex) currentBanner.push('');
        currentBanner[bannerIndex] = value;
        return { ...prev, start: { ...prev.start!, banner: currentBanner } };
      }
      return { ...prev, start: { ...prev.start!, [field]: value } };
    });
  };

  const handleRemarketInputChange = (field: string, value: string) => {
    setBotData(prev => ({ ...prev, remarkets: { ...prev.remarkets!, [field]: value } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bot?._id) {
      setError("ID do bot não disponível");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedBotData = {
        ...botData,
        start: botData.start ? {
          ...botData.start,
          banner: Array.isArray(botData.start.banner) ? botData.start.banner.filter(Boolean) : []
        } : undefined
      };

      const updatePayload: UpdateBotPayload = {
        ...updatedBotData,
        id: bot._id
      };

      try {
        UpdateBotPayloadSchema.parse(updatePayload);
      } catch (validationError) {
        if (validationError instanceof Error) {
          setError(validationError.message || 'Erro de validação nos dados');
        } else {
          setError('Erro de validação nos dados');
        }
        setLoading(false);
        return;
      }

      const response = await updateBot(updatePayload);
      console.log('Bot atualizado com sucesso:', response);
      setSuccess(true);
      if (onSuccess) onSuccess();

      setTimeout(() => onClose(), 1000);
    } catch (err) {
      console.error('Erro ao atualizar bot:', err);
      setError('Ocorreu um erro ao atualizar o bot. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(false);
  };

  // --- Estilo Old Money Azul sofisticado + preto ---

  const colors = {
  background: '#000000',       // preto puro
  paper: '#121212',            // preto quase carvão
  primary: '#3b5998',          // azul acinzentado suave e elegante
  primaryLight: '#9aa8c3',  // azul claro suave para hover
  textPrimary: '#E0E0E0',      // cinza claro confortável para texto
  border: '#2E3A4A',           // azul muito escuro apagado para bordas
  error: '#B23A48',
  success: '#3A6A42'
};


  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: colors.paper,
          boxShadow: `0 0 15px ${colors.primary}80`,
          color: colors.textPrimary,
          fontFamily: "'Georgia', serif",
          minWidth: 600,
        }
      }}
    >
      <DialogTitle
        sx={{
          p: 3,
          pb: 0,
          display: 'flex',
          alignItems: 'center',
          color: colors.primary,
          fontWeight: 700,
          fontSize: 24,
          fontFamily: "'Georgia', serif",
          borderBottom: `1px solid ${colors.border}`
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            mr: 2,
            color: colors.primary,
            '&:hover': { color: colors.primaryLight }
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700} sx={{ fontFamily: "'Georgia', serif" }}>
          Editar Bot
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box component="form" autoComplete="off" onSubmit={handleSubmit} sx={{ color: colors.textPrimary }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nome"
                placeholder="Nome do bot"
                fullWidth
                margin="normal"
                value={botData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                InputLabelProps={{ sx: { color: colors.primary } }}
                sx={{
                  input: { color: colors.textPrimary, fontFamily: "'Georgia', serif" },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: colors.border },
                    '&:hover fieldset': { borderColor: colors.primaryLight },
                    '&.Mui-focused fieldset': { borderColor: colors.primary }
                  }
                }}
              />
              <TextField
                label="Token"
                placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                fullWidth
                margin="normal"
                value={botData.token}
                onChange={(e) => handleInputChange('token', e.target.value)}
                required
                InputLabelProps={{ sx: { color: colors.primary } }}
                sx={{
                  input: { color: colors.textPrimary, fontFamily: "'Georgia', serif" },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: colors.border },
                    '&:hover fieldset': { borderColor: colors.primaryLight },
                    '&.Mui-focused fieldset': { borderColor: colors.primary }
                  }
                }}
              />

              <TextField
                label="Pixel ID"
                placeholder="000000000000000"
                fullWidth
                margin="normal"
                InputLabelProps={{ sx: { color: colors.primary } }}
                sx={{
                  input: { color: colors.textPrimary, fontFamily: "'Georgia', serif" },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: colors.border },
                    '&:hover fieldset': { borderColor: colors.primaryLight },
                    '&.Mui-focused fieldset': { borderColor: colors.primary }
                  }
                }}
              />

              <Divider sx={{ my: 2, borderColor: colors.border }} />
              <Typography fontWeight={600} mb={1} mt={2} sx={{ color: colors.primary }}>
                Callbacks
              </Typography>
              <Button
                variant="outlined"
                endIcon={callbacksExpanded ? <ExpandLessIcon sx={{ color: colors.primary }} /> : <ExpandMoreIcon sx={{ color: colors.primary }} />}
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  fontWeight: 600,
                  mt: 1,
                  color: colors.primary,
                  borderColor: colors.border,
                  fontFamily: "'Georgia', serif",
                  '&:hover': {
                    borderColor: colors.primaryLight,
                    backgroundColor: colors.primaryLight + '11',
                    color: colors.primaryLight
                  }
                }}
                onClick={handleCallbacksToggle}
              >
                Callbacks
              </Button>
              {callbacksExpanded && (
                <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: colors.border, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} mb={1} sx={{ color: colors.primary }}>
                    Configurar Callbacks
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textPrimary }} mb={2}>
                    Os callbacks permitem criar interações personalizadas com o usuário
                  </Typography>
                  <Button variant="outlined" size="small" fullWidth sx={{
                    mt: 1,
                    color: colors.primary,
                    borderColor: colors.border,
                    fontFamily: "'Georgia', serif",
                    '&:hover': {
                      borderColor: colors.primaryLight,
                      backgroundColor: colors.primaryLight + '11',
                      color: colors.primaryLight
                    }
                  }}>
                    Adicionar Callback
                  </Button>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Divider sx={{ my: 2, borderColor: colors.border }} />

              <Typography fontWeight={600} mb={1} mt={2} sx={{ color: colors.primary }}>
                Mensagem de Boas-vindas
              </Typography>
              <TextField
                label="Texto"
                placeholder="Bem-vindo ao bot!"
                fullWidth
                margin="normal"
                value={botData.start?.text}
                onChange={(e) => handleStartInputChange('text', e.target.value)}
                InputLabelProps={{ sx: { color: colors.primary } }}
                sx={{
                  input: { color: colors.textPrimary, fontFamily: "'Georgia', serif" },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: colors.border },
                    '&:hover fieldset': { borderColor: colors.primaryLight },
                    '&.Mui-focused fieldset': { borderColor: colors.primary }
                  }
                }}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, mb: 1 }}>
                <Typography fontWeight={600} sx={{ color: colors.primary }}>Banners</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    const newBanners = getRandomBanners();
                    setBotData(prev => ({ ...prev, start: { ...prev.start!, banner: newBanners } }));
                  }}
                  sx={{
                    ml: 'auto',
                    color: colors.primary,
                    borderColor: colors.border,
                    fontFamily: "'Georgia', serif",
                    '&:hover': {
                      borderColor: colors.primaryLight,
                      backgroundColor: colors.primaryLight + '11',
                      color: colors.primaryLight
                    }
                  }}
                >
                  Regenerar
                </Button>
              </Box>

              <TextField
                label="Banner 1 (Gerado automaticamente)"
                fullWidth
                margin="normal"
                value={botData.start?.banner?.[0] || ''}
                onChange={(e) => handleStartInputChange('banner', e.target.value, 0)}
                helperText="2 banners são selecionados automaticamente"
                InputLabelProps={{ sx: { color: colors.primary } }}
                sx={{
                  input: { color: colors.textPrimary, fontFamily: "'Georgia', serif" },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: colors.border },
                    '&:hover fieldset': { borderColor: colors.primaryLight },
                    '&.Mui-focused fieldset': { borderColor: colors.primary }
                  }
                }}
              />
              <TextField
                label="Banner 2 (Gerado automaticamente)"
                fullWidth
                margin="normal"
                value={botData.start?.banner?.[1] || ''}
                onChange={(e) => handleStartInputChange('banner', e.target.value, 1)}
                InputLabelProps={{ sx: { color: colors.primary } }}
                sx={{
                  input: { color: colors.textPrimary, fontFamily: "'Georgia', serif" },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: colors.border },
                    '&:hover fieldset': { borderColor: colors.primaryLight },
                    '&.Mui-focused fieldset': { borderColor: colors.primary }
                  }
                }}
              />

              <Divider sx={{ my: 2, borderColor: colors.border }} />
              <Typography fontWeight={600} mb={1} mt={2} sx={{ color: colors.primary }}>
                Mensagens Personalizadas
              </Typography>
              <TextField
                label="Mensagem de Início"
                placeholder="Mensagem personalizada de início"
                fullWidth
                margin="normal"
                value={botData.remarkets?.start}
                onChange={(e) => handleRemarketInputChange('start', e.target.value)}
                InputLabelProps={{ sx: { color: colors.primary } }}
                sx={{
                  input: { color: colors.textPrimary, fontFamily: "'Georgia', serif" },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: colors.border },
                    '&:hover fieldset': { borderColor: colors.primaryLight },
                    '&.Mui-focused fieldset': { borderColor: colors.primary }
                  }
                }}
              />
              <TextField
                label="Mensagem de Produto"
                placeholder="Mensagem personalizada de produto"
                fullWidth
                margin="normal"
                value={botData.remarkets?.product}
                onChange={(e) => handleRemarketInputChange('product', e.target.value)}
                InputLabelProps={{ sx: { color: colors.primary } }}
                sx={{
                  input: { color: colors.textPrimary, fontFamily: "'Georgia', serif" },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: colors.border },
                    '&:hover fieldset': { borderColor: colors.primaryLight },
                    '&.Mui-focused fieldset': { borderColor: colors.primary }
                  }
                }}
              />
              <TextField
                label="Mensagem de Pagamento"
                placeholder="Mensagem personalizada de pagamento"
                fullWidth
                margin="normal"
                value={botData.remarkets?.payment}
                onChange={(e) => handleRemarketInputChange('payment', e.target.value)}
                InputLabelProps={{ sx: { color: colors.primary } }}
                sx={{
                  input: { color: colors.textPrimary, fontFamily: "'Georgia', serif" },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: colors.border },
                    '&:hover fieldset': { borderColor: colors.primaryLight },
                    '&.Mui-focused fieldset': { borderColor: colors.primary }
                  }
                }}
              />

              <Divider sx={{ my: 2, borderColor: colors.border }} />
              <Typography fontWeight={600} mb={1} mt={2} sx={{ color: colors.primary }}>
                Ofertas
              </Typography>
              <Button
                variant="outlined"
                endIcon={ofertasExpanded ? <ExpandLessIcon sx={{ color: colors.primary }} /> : <ExpandMoreIcon sx={{ color: colors.primary }} />}
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  fontWeight: 600,
                  mt: 1,
                  color: colors.primary,
                  borderColor: colors.border,
                  fontFamily: "'Georgia', serif",
                  '&:hover': {
                    borderColor: colors.primaryLight,
                    backgroundColor: colors.primaryLight + '11',
                    color: colors.primaryLight
                  }
                }}
                onClick={handleOfertasToggle}
              >
                Ofertas
              </Button>
              {ofertasExpanded && (
                <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: colors.border, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} mb={1} sx={{ color: colors.primary }}>
                    Configurar Produtos/Ofertas
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textPrimary }} mb={2}>
                    Produtos e ofertas poderão ser usados pelo bot para vendas
                  </Typography>
                  <TextField label="Nome da Oferta" placeholder="Nome da oferta" fullWidth margin="normal" 
                    InputLabelProps={{ sx: { color: colors.primary } }}
                    sx={{
                      input: { color: colors.textPrimary, fontFamily: "'Georgia', serif" },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: colors.border },
                        '&:hover fieldset': { borderColor: colors.primaryLight },
                        '&.Mui-focused fieldset': { borderColor: colors.primary }
                      }
                    }}
                  />
                  <TextField label="Valor da Oferta" placeholder="R$ 0,00" fullWidth margin="normal" 
                    InputLabelProps={{ sx: { color: colors.primary } }}
                    sx={{
                      input: { color: colors.textPrimary, fontFamily: "'Georgia', serif" },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: colors.border },
                        '&:hover fieldset': { borderColor: colors.primaryLight },
                        '&.Mui-focused fieldset': { borderColor: colors.primary }
                      }
                    }}
                  />
                  <TextField label="Descrição" placeholder="Descrição da oferta" fullWidth margin="normal" multiline rows={2} 
                    InputLabelProps={{ sx: { color: colors.primary } }}
                    sx={{
                      input: { color: colors.textPrimary, fontFamily: "'Georgia', serif" },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: colors.border },
                        '&:hover fieldset': { borderColor: colors.primaryLight },
                        '&.Mui-focused fieldset': { borderColor: colors.primary }
                      }
                    }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      mt: 1,
                      color: colors.primary,
                      borderColor: colors.border,
                      fontFamily: "'Georgia', serif",
                      '&:hover': {
                        borderColor: colors.primaryLight,
                        backgroundColor: colors.primaryLight + '11',
                        color: colors.primaryLight
                      }
                    }}
                  >
                    Adicionar Oferta
                  </Button>
                </Box>
              )}
            </Grid>
          </Grid>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 4,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: 16,
              height: 48,
              bgcolor: colors.primary,
              color: colors.textPrimary,
              fontFamily: "'Georgia', serif",
              '&:hover': {
                bgcolor: colors.primaryLight,
              }
            }}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </Box>
      </DialogContent>

      <Snackbar open={!!error || success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? "error" : "success"}
          sx={{
            width: '100%',
            fontFamily: "'Georgia', serif",
            bgcolor: error ? colors.error + 'dd' : colors.success + 'dd',
            color: colors.textPrimary,
            fontWeight: 700,
          }}
        >
          {error || "Bot atualizado com sucesso!"}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
