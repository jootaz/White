import { Dialog, DialogContent, DialogTitle, IconButton, Grid, TextField, Button, Typography, Box, Divider, Snackbar, Alert, Checkbox, FormControlLabel, FormGroup, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { type CreateBotPayload, type CallbackResponseData, type ApiResponse } from '../../types/api';
import type { ApiContextType } from '../../contexts/ApiContextValue';

// Array com os 4 banners disponíveis
const AVAILABLE_BANNERS = [
  'https://drive.google.com/uc?id=1gP47oroqR9l2NqdR7JjcQfUvgRQ0Uiij',
  'https://drive.google.com/uc?id=1gjzQuWmk6Fg4tY6XD2UHzuVlCubrOAqC',
  'https://drive.google.com/uc?id=1HBckGlMI7po_VahH_1Ir1pfbij3t6xIT',
];

// Função para selecionar 2 banners aleatórios
const getRandomBanners = (): string[] => {
  const shuffled = [...AVAILABLE_BANNERS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2);
};

interface CadastrarBotModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Callback para quando o bot é cadastrado com sucesso
}

export function CadastrarBotModal({ open, onClose, onSuccess }: CadastrarBotModalProps) {
  const theme = useTheme();
  // const [ofertasExpanded, setOfertasExpanded] = useState(false); // Removido
  const [callbacksExpanded, setCallbacksExpanded] = useState(false);
  const [success, setSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [availableCallbacks, setAvailableCallbacks] = useState<CallbackResponseData[]>([]); // Estado para callbacks disponíveis
  const [selectedCallbacks, setSelectedCallbacks] = useState<string[]>([]); // Estado para IDs de callbacks selecionados
  const [loadingCallbacks, setLoadingCallbacks] = useState(false); // Estado para loading de callbacks

  // Usar o hook da API
  const api = useApi();
  // Usando a interface ApiContextType para tipar corretamente
  const { createBot, loading, listCallbacks } = api as ApiContextType;

  // Função para criar dados iniciais do bot com banners aleatórios
  const createInitialBotData = (): CreateBotPayload => ({
    name: 'Test',
    token: '7735533088:AAF8q0IbSjqrb9Komle4yrX439b9ksKnhss',
    start: {
      text: '[ 🚫 𝗔𝗖𝗘𝗦𝗦𝗢 𝗕𝗟𝗢𝗤𝗨𝗘𝗔𝗗𝗢 🔐 • 𝗦𝗮𝗶𝗯𝗮 𝗰𝗼𝗺𝗼 𝗗𝗘𝗦𝗕𝗟𝗢𝗤𝗨𝗘𝗔𝗥 𝘀𝗲𝘂 𝗔𝗖𝗘𝗦𝗦𝗢 𝗔𝗕𝗔𝗜𝗫𝗢 ⤵️ ]\n\n🚨 𝗦𝗼𝗺𝗲𝗻𝘁𝗲 𝗔𝗚𝗢𝗥𝗔 — Adquirindo seu 𝗮𝗰𝗲𝘀𝘀𝗼 em 𝗻𝗼𝘀𝘀𝗼 𝗩𝗜𝗣 🌟 Você vai liberar; 👇🏻\n\n💎 +𝟴 𝗚𝗿𝘂𝗽𝗼𝘀 𝗩𝗜𝗣𝗦 — 𝟬cultinh𝟰s, Inc𝟯st𝟬, Fl𝟴gr𝟴s, V𝟴z𝟴d𝟬s, N𝟬vinh𝟴s + 𝟯 Novos 𝗩𝗜𝗣𝗦;\n🗂 ❺.❸⓿⓿ 𝗠í𝗗𝗶𝗔𝗦 — Atualizadas todos os 𝗗𝗜𝗔𝗦;\n🎁 𝗗𝗲𝘀𝗰𝗼𝗻𝘁𝗼 𝗘𝘅𝗰𝗹𝘂𝘀𝗶𝘃𝗼 — Tenha 𝟴𝟯% de 𝗗𝗘𝗦𝗖𝗢𝗡𝗧𝗢 na 𝗖𝗼𝗺𝗽𝗿𝗮 do 𝗩𝗜𝗧𝗔𝗟í𝗖𝗶𝗢;\n🏃🏻‍♂️𝗚𝗮𝗿𝗮𝗻𝘁𝗶𝗮 𝗱𝗲 𝗖𝗢𝗠𝗣𝗥𝗔 — Caso não goste, reembolsamos seu 𝗗𝗜𝗡𝗛𝗘𝗜𝗥𝗢;\n\n🔴 𝗗𝗘𝗦𝗕𝗟𝗢𝗤𝗨𝗘𝗜𝗘 sua 𝗔𝗦𝗦𝗜𝗡𝗔𝗧𝗨𝗥𝗔 escolhendo 𝗮𝗹𝗴𝘂𝗺 dos 𝗣𝗹𝗮𝗻𝗼𝘀 𝗔𝗕𝗔𝗜𝗫𝗢 🔽',
      banner: getRandomBanners(),
      keyboards: [
        {
          name: 'call:6828e4d126fa0af96f41d724',
          text: '💚 𝗩𝗜𝗧𝗔𝗟Í𝗖𝗜𝗢 — R$ 𝟮𝟰.𝟵𝟬 (𝟴𝟯% 𝗢𝗙𝗙) 🔓🎉'
        },
        {
          name: 'call:683e22db3fee87ad021bb9c6',
          text: '🔸 Diário — R$ 15.90 (𝟮𝟰 𝗛𝗼𝗿𝗮𝘀) 🙁'
        }
      ]
    },
    remarkets: {
      start: '6840abd8f2b07e076913b6f0',
      product: '6840ac89f2b07e076913b6f6',
    },
    callbacks: [],
  });

  // Estados para os campos do formulário
  const [botData, setBotData] = useState<CreateBotPayload>(createInitialBotData());

  // Efeito para buscar callbacks quando o modal abrir ou o estado de callbacksExpanded mudar
  useEffect(() => {
    const fetchCallbacks = async () => {
      if (open && callbacksExpanded && typeof listCallbacks === 'function') { // Verificar se getAllCallbacks é uma função
        setLoadingCallbacks(true);
        try {
          const response: ApiResponse<CallbackResponseData[]> = await listCallbacks();
          setAvailableCallbacks(response.data || []);
        } catch (error) {
          console.error("Erro ao buscar callbacks:", error);
          setLocalError("Erro ao carregar callbacks disponíveis.");
        }
        setLoadingCallbacks(false);
      }
    };
    fetchCallbacks();
  }, [open, callbacksExpanded, listCallbacks]);

  // Efeito para regenerar dados iniciais quando o modal for aberto
  useEffect(() => {
    if (open) {
      setBotData(createInitialBotData());
    }
  }, [open]);

  // Efeito para extrair callbacks dos keyboards quando o modal for aberto
  useEffect(() => {
    if (open && botData.start?.keyboards) {
      // Extrair IDs de callback dos keyboards (formato "call:ID")
      const callbackIds = botData.start.keyboards
        .filter(keyboard => keyboard.name && keyboard.name.startsWith('call:'))
        .map(keyboard => keyboard.name.replace('call:', ''));

      if (callbackIds.length > 0) {
        setSelectedCallbacks(callbackIds);
      }
    }
  }, [open, botData.start?.keyboards]);

  // const handleOfertasToggle = () => { // Removido
  //   setOfertasExpanded(!ofertasExpanded);
  // };

  const handleCallbacksToggle = () => {
    setCallbacksExpanded(!callbacksExpanded);
  };

  const handleCallbackSelectionChange = (callbackId: string) => {
    setSelectedCallbacks(prevSelected =>
      prevSelected.includes(callbackId)
        ? prevSelected.filter(id => id !== callbackId)
        : [...prevSelected, callbackId]
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setBotData(prev => ({
      ...prev,
      [field]: value
    }));
  }; const handleStartInputChange = (field: string, value: string, bannerIndex?: number) => {
    setBotData(prev => {
      if (field === 'banner' && typeof bannerIndex === 'number') {
        // Tratamento específico para os banners quando o índice é fornecido
        const newBanner = [...(prev.start?.banner || [])];
        // Garantir que o array tenha espaço suficiente
        while (newBanner.length <= bannerIndex) {
          newBanner.push('');
        }
        newBanner[bannerIndex] = value;

        return {
          ...prev,
          start: {
            ...prev.start!,
            banner: newBanner
          }
        };
      } else {
        // Para outros campos que não são banner ou quando não é fornecido um índice
        return {
          ...prev,
          start: {
            ...prev.start!,
            [field]: value
          }
        };
      }
    });
  };

  const handleRemarketInputChange = (field: string, value: string) => {
    setBotData(prev => ({
      ...prev,
      remarkets: {
        ...prev.remarkets!,
        [field]: value
      }
    }));
  };

  // Função para remover um teclado
  const removeKeyboard = (index: number) => {
    setBotData(prev => ({
      ...prev,
      start: {
        ...prev.start!,
        keyboards: prev.start?.keyboards?.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Gerar novos banners aleatórios para este cadastro
    const payloadWithRandomBanners: CreateBotPayload = {
      ...botData,
      start: {
        ...botData.start!,
        banner: getRandomBanners()
      },
      callbacks: selectedCallbacks,
    };

    try {
      const response = await createBot(payloadWithRandomBanners);
      console.log('Bot criado com sucesso:', response);
      setSuccess(true);
      // Reset completo do formulário com novos banners aleatórios
      setBotData(createInitialBotData());

      // Reset dos callbacks selecionados
      setSelectedCallbacks([]);
      if (onSuccess) {
        onSuccess();
      }
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (err) {
      console.error('Erro ao cadastrar bot:', err);
      setLocalError(err instanceof Error ? err.message : 'Ocorreu um erro ao cadastrar o bot. Tente novamente.');
    }
  };
  const handleCloseSnackbar = () => {
    setLocalError(null);
    setSuccess(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" PaperProps={{ sx: { borderRadius: 3, bgcolor: theme.palette.mode === 'dark' ? 'rgba(24,31,42,0.98)' : '#fff', boxShadow: 24 } }}>
      <DialogTitle sx={{ p: 3, pb: 0, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={onClose} sx={{ mr: 2, color: theme.palette.primary.main }}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          Cadastro de Bot
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box component="form" autoComplete="off" onSubmit={handleSubmit}>
          <Grid container spacing={3}> {/* Aumentado o espaçamento geral */}
            {/* Coluna Esquerda: Informações Básicas e Mensagens */}
            <Grid item xs={12} md={6}> {/* Ajustado para md={6} */}
              <TextField
                label="Nome"
                placeholder="Nome do bot"
                fullWidth
                margin="normal"
                value={botData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
              <TextField
                label="Token"
                placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                fullWidth
                margin="normal"
                value={botData.token}
                onChange={(e) => handleInputChange('token', e.target.value)}
                required
              />
              <Divider sx={{ my: 2 }} />

              <Typography fontWeight={600} mb={1} mt={2}>Mensagem de Boas-vindas</Typography>
              <TextField
                label="Texto"
                placeholder="Bem-vindo ao bot!"
                fullWidth
                margin="normal"
                value={botData.start?.text}
                onChange={(e) => handleStartInputChange('text', e.target.value)}
              />              
              {/* Banners automáticos */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, mb: 1 }}>
                <Typography fontWeight={600}>Banners (Selecionados automaticamente)</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    const newBanners = getRandomBanners();
                    setBotData(prev => ({
                      ...prev,
                      start: {
                        ...prev.start!,
                        banner: newBanners
                      }
                    }));
                  }}
                  sx={{ ml: 'auto' }}
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
                helperText="2 banners são selecionados automaticamente a cada cadastro"
              />
              <TextField
                label="Banner 2 (Gerado automaticamente)"
                fullWidth
                margin="normal"
                value={botData.start?.banner?.[1] || ''}
                onChange={(e) => handleStartInputChange('banner', e.target.value, 1)}
              />

              <Divider sx={{ my: 2 }} />
              <Typography fontWeight={600} mb={1} mt={2}>IDs Remarketing</Typography>
              <TextField
                label="ID de Início"
                placeholder="Mensagem personalizada de início"
                fullWidth
                margin="normal"
                value={botData.remarkets?.start}
                onChange={(e) => handleRemarketInputChange('start', e.target.value)}
              />
              <TextField
                label="ID de Produto"
                placeholder="Mensagem personalizada de produto"
                fullWidth
                margin="normal"
                value={botData.remarkets?.product}
                onChange={(e) => handleRemarketInputChange('product', e.target.value)}
              />
            </Grid>            {/* Coluna Central: Callbacks */}
            <Grid item xs={12} md={6}> {/* Ajustado para md={6} */}
              <Typography fontWeight={600} mb={1} mt={2}>Callbacks</Typography>
              <Button
                variant="outlined"
                endIcon={callbacksExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                sx={{ width: '100%', borderRadius: 2, fontWeight: 600, mt: 1, mb: 1 }}
                onClick={handleCallbacksToggle}
              >
                Selecionar Callbacks Existentes
              </Button>
              {callbacksExpanded && (
                <Box sx={{ mt: 1, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  {loadingCallbacks ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>
                  ) : availableCallbacks.length > 0 ? (
                    <FormGroup>
                      {availableCallbacks.map((callback) => (
                        <FormControlLabel
                          key={callback._id}
                          control={
                            <Checkbox
                              checked={selectedCallbacks.includes(callback._id)}
                              onChange={() => handleCallbackSelectionChange(callback._id)}
                            />
                          }
                          label={callback.title}
                        />
                      ))}
                    </FormGroup>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', my: 2 }}>
                      Nenhum callback cadastrado ou erro ao carregar.
                    </Typography>
                  )}
                </Box>
              )}

              {/* Teclados vinculados aos callbacks */}
              <Typography fontWeight={600} mb={1} mt={3}>Teclados para Callbacks</Typography>
              {botData.start?.keyboards?.map((keyboard, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                  <TextField
                    label={`Nome Teclado ${index + 1}`}
                    value={keyboard.name}
                    disabled={keyboard.name.startsWith('call:')}
                    sx={{ flexGrow: 1 }}
                  />
                  <TextField
                    label={`Texto Teclado ${index + 1}`}
                    value={keyboard.text}
                    onChange={(e) => {
                      const newKeyboards = [...(botData.start?.keyboards || [])];
                      if (newKeyboards[index]) {
                        newKeyboards[index].text = e.target.value;
                        setBotData(prev => ({
                          ...prev,
                          start: {
                            ...prev.start!,
                            keyboards: newKeyboards
                          }
                        }));
                      }
                    }}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    onClick={() => removeKeyboard(index)}
                    size="small"
                    color="error"
                  >
                    Remover
                  </Button>
                </Box>
              ))}
            </Grid>
          </Grid>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 4, borderRadius: 2, fontWeight: 700, fontSize: 16, height: 48 }}
            disabled={loading}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar Bot Completo'}
          </Button>
        </Box>
      </DialogContent>
      {/* Feedback de erro ou sucesso */}
      <Snackbar open={!!localError || success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert
          onClose={handleCloseSnackbar}
          severity={localError ? "error" : "success"}
          sx={{ width: '100%' }}
        >
          {localError || "Bot cadastrado com sucesso!"}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}