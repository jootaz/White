import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Grid,
  TextField,
  Button,
  Typography,
  Box,
  Divider,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@mui/material/styles';
import { useApi } from '../../hooks/useApi';
import type { CreateCallbackPayload, Keyboard } from '../../types/api';

interface CadastrarCallbackModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CadastrarCallbackModal({ open, onClose, onSuccess }: CadastrarCallbackModalProps) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [keyboards, setKeyboards] = useState<Array<Keyboard>>([]);
  const [keyboardName, setKeyboardName] = useState('');
  const [keyboardText, setKeyboardText] = useState('');

  const [callbackData, setCallbackData] = useState<CreateCallbackPayload>({
    title: '',
    message: {
      text: '',
      banner: [],
      keyboards: []
    },
    premessage: {
      text: '',
      banner: []
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setCallbackData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMessageInputChange = (field: string, value: string) => {
    setCallbackData(prev => ({
      ...prev,
      message: {
        ...prev.message,
        [field]: field === 'banner' ? [value] : value
      }
    }));
  };

  const handlePreMessageInputChange = (field: string, value: string) => {
    setCallbackData(prev => ({
      ...prev,
      premessage: {
        ...prev.premessage!,
        [field]: field === 'banner' ? [value] : value
      }
    }));
  };

  const addKeyboard = () => {
    if (keyboardName.trim() && keyboardText.trim()) {
      const newKeyboard: Keyboard = { name: keyboardName.trim(), text: keyboardText.trim() };
      const updatedKeyboards = [...keyboards, newKeyboard];
      setKeyboards(updatedKeyboards);
      setCallbackData(prev => ({
        ...prev,
        message: {
          ...prev.message,
          keyboards: updatedKeyboards
        }
      }));
      setKeyboardName('');
      setKeyboardText('');
    }
  };

  const removeKeyboard = (index: number) => {
    const updatedKeyboards = keyboards.filter((_, i) => i !== index);
    setKeyboards(updatedKeyboards);
    setCallbackData(prev => ({
      ...prev,
      message: {
        ...prev.message,
        keyboards: updatedKeyboards
      }
    }));
  };

  const { createCallback } = useApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createCallback(callbackData);
      setSuccess(true);

      setCallbackData({
        title: '',
        message: { text: '', banner: [], keyboards: [] },
        premessage: { text: '', banner: [] }
      });
      setKeyboards([]);
      if (onSuccess) onSuccess();

      setTimeout(() => onClose(), 1000);
    } catch (err) {
      setError('Ocorreu um erro ao cadastrar o callback. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(false);
  };

  // Paleta de cores
  const colors = {
    bgDialog: '#0d0d0d',
    bgSection: '#121212',
    textPrimary: '#dcdcdc',
    textSecondary: '#9aa8c3', // azul suave
    blueFocus: '#3b5998',
    borderLight: '#223355',
    borderDark: '#1b2a4a',
    buttonBg: '#121212',
    buttonBorder: '#2a3d66',
    buttonText: '#9aa8c3',
    buttonHoverBg: '#1f2a63',
    buttonHoverText: '#dcdcdc',
    iconDefault: '#3b5998',
    iconHover: '#9aa8c3',
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 5,
          bgcolor: colors.bgDialog,
          border: `1px solid ${colors.borderDark}`,
          color: colors.textPrimary,
          p: 0,
          minWidth: 580,
         
          boxShadow: '0 4px 20px rgba(0,0,0,0.9)'
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          p: 4,
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          backgroundColor: colors.bgSection,
          borderBottom: `1px solid ${colors.borderLight}`,
          fontWeight: 700,
          fontSize: '1.5rem',
          color: colors.textPrimary,
          userSelect: 'none',
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            color: colors.iconDefault,
            transition: 'color 0.3s',
            '&:hover': { color: colors.iconHover, backgroundColor: 'transparent' }
          }}
          aria-label="Fechar"
          size="large"
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
        Cadastrar Callback
      </DialogTitle>

      {/* Conteúdo */}
      <DialogContent sx={{ p: 5 }}>
        <Box component="form" autoComplete="off" onSubmit={handleSubmit}>

          {/* Título */}
          <Box mb={5}>
            <TextField
              label="Título do Callback"
              placeholder="Título do Callback"
              fullWidth
              margin="normal"
              value={callbackData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              variant="filled"
              InputLabelProps={{
                sx: { color: colors.textSecondary, fontWeight: 600, fontFamily: `'Georgia', serif` }
              }}
              sx={{
                bgcolor: colors.bgSection,
                borderRadius: 2,
                '& .MuiFilledInput-root': {
                  color: colors.textPrimary,
                  fontWeight: 500,
                  fontFamily: `'Georgia', serif`,
                },
                '& .MuiFilledInput-underline:before': {
                  borderBottom: `1px solid ${colors.borderLight}`,
                },
                '& .MuiFilledInput-underline:hover:before': {
                  borderBottom: `1px solid ${colors.blueFocus}`,
                },
                '& .MuiFilledInput-underline:after': {
                  borderBottom: `2px solid ${colors.blueFocus}`,
                },
              }}
            />
          </Box>

          {/* Mensagens em Grid */}
          <Grid container spacing={6}>
            {/* Mensagem Principal */}
            <Grid item xs={12} md={6}>
              <Typography
                fontWeight={700}
                mb={2}
                sx={{
                  color: colors.textSecondary,
                  fontFamily: `'Georgia', serif`,
                  fontSize: '1.1rem',
                  letterSpacing: 0.5,
                  borderBottom: `1px solid ${colors.borderLight}`,
                  paddingBottom: 4,
                  userSelect: 'none',
                }}
              >
                Mensagem Principal
              </Typography>

              <TextField
                label="Texto da mensagem"
                placeholder="Esta é a mensagem principal do callback"
                fullWidth
                margin="normal"
                multiline
                rows={4}
                value={callbackData.message.text}
                onChange={(e) => handleMessageInputChange('text', e.target.value)}
                required
                variant="filled"
                InputLabelProps={{
                  sx: { color: colors.textSecondary, fontWeight: 600, fontFamily: `'Georgia', serif` }
                }}
                sx={{
                  bgcolor: colors.bgSection,
                  borderRadius: 2,
                  '& .MuiFilledInput-root': {
                    color: colors.textPrimary,
                    fontWeight: 500,
                    fontFamily: `'Georgia', serif`,
                  },
                  '& .MuiFilledInput-underline:before': {
                    borderBottom: `1px solid ${colors.borderLight}`,
                  },
                  '& .MuiFilledInput-underline:hover:before': {
                    borderBottom: `1px solid ${colors.blueFocus}`,
                  },
                  '& .MuiFilledInput-underline:after': {
                    borderBottom: `2px solid ${colors.blueFocus}`,
                  },
                }}
              />
              <TextField
                label="URL da imagem"
                placeholder="https://exemplo.com/imagem.jpg"
                fullWidth
                margin="normal"
                value={callbackData.message.banner?.[0] || ''}
                onChange={(e) => handleMessageInputChange('banner', e.target.value)}
                variant="filled"
                InputLabelProps={{
                  sx: { color: colors.textSecondary, fontWeight: 600, fontFamily: `'Georgia', serif` }
                }}
                sx={{
                  bgcolor: colors.bgSection,
                  borderRadius: 2,
                  '& .MuiFilledInput-root': {
                    color: colors.textPrimary,
                    fontWeight: 500,
                    fontFamily: `'Georgia', serif`,
                  },
                  '& .MuiFilledInput-underline:before': {
                    borderBottom: `1px solid ${colors.borderLight}`,
                  },
                  '& .MuiFilledInput-underline:hover:before': {
                    borderBottom: `1px solid ${colors.blueFocus}`,
                  },
                  '& .MuiFilledInput-underline:after': {
                    borderBottom: `2px solid ${colors.blueFocus}`,
                  },
                }}
              />
            </Grid>

            {/* Mensagem Prévia */}
            <Grid item xs={12} md={6}>
              <Typography
                fontWeight={700}
                mb={2}
                sx={{
                  color: colors.textSecondary,
                  fontFamily: `'Georgia', serif`,
                  fontSize: '1.1rem',
                  letterSpacing: 0.5,
                  borderBottom: `1px solid ${colors.borderLight}`,
                  paddingBottom: 4,
                  userSelect: 'none',
                }}
              >
                Mensagem Prévia (Opcional)
              </Typography>

              <TextField
                label="Texto da mensagem prévia"
                placeholder="Esta mensagem será enviada antes da principal"
                fullWidth
                margin="normal"
                multiline
                rows={4}
                value={callbackData.premessage?.text || ''}
                onChange={(e) => handlePreMessageInputChange('text', e.target.value)}
                variant="filled"
                InputLabelProps={{
                  sx: { color: colors.textSecondary, fontWeight: 600, fontFamily: `'Georgia', serif` }
                }}
                sx={{
                  bgcolor: colors.bgSection,
                  borderRadius: 2,
                  '& .MuiFilledInput-root': {
                    color: colors.textPrimary,
                    fontWeight: 500,
                    fontFamily: `'Georgia', serif`,
                  },
                  '& .MuiFilledInput-underline:before': {
                    borderBottom: `1px solid ${colors.borderLight}`,
                  },
                  '& .MuiFilledInput-underline:hover:before': {
                    borderBottom: `1px solid ${colors.blueFocus}`,
                  },
                  '& .MuiFilledInput-underline:after': {
                    borderBottom: `2px solid ${colors.blueFocus}`,
                  },
                }}
              />
              <TextField
                label="URL da imagem prévia"
                placeholder="https://exemplo.com/imagem_pre.jpg"
                fullWidth
                margin="normal"
                value={callbackData.premessage?.banner?.[0] || ''}
                onChange={(e) => handlePreMessageInputChange('banner', e.target.value)}
                variant="filled"
                InputLabelProps={{
                  sx: { color: colors.textSecondary, fontWeight: 600, fontFamily: `'Georgia', serif` }
                }}
                sx={{
                  bgcolor: colors.bgSection,
                  borderRadius: 2,
                  '& .MuiFilledInput-root': {
                    color: colors.textPrimary,
                    fontWeight: 500,
                    fontFamily: `'Georgia', serif`,
                  },
                  '& .MuiFilledInput-underline:before': {
                    borderBottom: `1px solid ${colors.borderLight}`,
                  },
                  '& .MuiFilledInput-underline:hover:before': {
                    borderBottom: `1px solid ${colors.blueFocus}`,
                  },
                  '& .MuiFilledInput-underline:after': {
                    borderBottom: `2px solid ${colors.blueFocus}`,
                  },
                }}
              />
            </Grid>
          </Grid>

          {/* Teclados */}
          <Box mt={6}>
            <Typography
              fontWeight={700}
              mb={3}
              sx={{
                color: colors.textSecondary,
                fontFamily: `'Georgia', serif`,
                fontSize: '1.1rem',
                letterSpacing: 0.5,
                borderBottom: `1px solid ${colors.borderLight}`,
                paddingBottom: 6,
                userSelect: 'none',
              }}
            >
              Teclados (Botões)
            </Typography>

            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={5}>
                <TextField
                  label="Nome do botão"
                  placeholder="Confirmar"
                  fullWidth
                  value={keyboardName}
                  onChange={(e) => setKeyboardName(e.target.value)}
                  variant="filled"
                  InputLabelProps={{
                    sx: { color: colors.textSecondary, fontWeight: 600, fontFamily: `'Georgia', serif` }
                  }}
                  sx={{
                    bgcolor: colors.bgSection,
                    borderRadius: 2,
                    '& .MuiFilledInput-root': {
                      color: colors.textPrimary,
                      fontWeight: 500,
                      fontFamily: `'Georgia', serif`,
                    },
                    '& .MuiFilledInput-underline:before': {
                      borderBottom: `1px solid ${colors.borderLight}`,
                    },
                    '& .MuiFilledInput-underline:hover:before': {
                      borderBottom: `1px solid ${colors.blueFocus}`,
                    },
                    '& .MuiFilledInput-underline:after': {
                      borderBottom: `2px solid ${colors.blueFocus}`,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField
                  label="Comando do botão"
                  placeholder="callback_confirmar"
                  fullWidth
                  value={keyboardText}
                  onChange={(e) => setKeyboardText(e.target.value)}
                  variant="filled"
                  InputLabelProps={{
                    sx: { color: colors.textSecondary, fontWeight: 600, fontFamily: `'Georgia', serif` }
                  }}
                  sx={{
                    bgcolor: colors.bgSection,
                    borderRadius: 2,
                    '& .MuiFilledInput-root': {
                      color: colors.textPrimary,
                      fontWeight: 500,
                      fontFamily: `'Georgia', serif`,
                    },
                    '& .MuiFilledInput-underline:before': {
                      borderBottom: `1px solid ${colors.borderLight}`,
                    },
                    '& .MuiFilledInput-underline:hover:before': {
                      borderBottom: `1px solid ${colors.blueFocus}`,
                    },
                    '& .MuiFilledInput-underline:after': {
                      borderBottom: `2px solid ${colors.blueFocus}`,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addKeyboard}
                  disabled={!keyboardName.trim() || !keyboardText.trim()}
                  sx={{
                    height: 56,
                    width: '100%',
                    borderRadius: 3,
                    fontWeight: 700,
                    fontFamily: `'Georgia', serif`,
                    color: colors.buttonText,
                    borderColor: colors.buttonBorder,
                    textTransform: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: colors.buttonHoverBg,
                      color: colors.buttonHoverText,
                      borderColor: colors.buttonHoverBg,
                      boxShadow: `0 0 8px ${colors.buttonHoverBg}`,
                    },
                    '&:disabled': {
                      borderColor: '#444',
                      color: '#555',
                      backgroundColor: colors.bgSection,
                      boxShadow: 'none',
                      cursor: 'default',
                    },
                  }}
                >
                  Adicionar
                </Button>
              </Grid>
            </Grid>

            {/* Lista de teclados */}
            {keyboards.length > 0 && (
              <Box
                sx={{
                  mt: 5,
                  border: `1px solid ${colors.borderLight}`,
                  borderRadius: 3,
                  p: 3,
                  bgcolor: colors.bgSection,
                  maxHeight: 190,
                  overflowY: 'auto',
                  fontFamily: `'Georgia', serif`,
                }}
              >
                <List dense disablePadding>
                  {keyboards.map((keyboard, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="remover"
                          onClick={() => removeKeyboard(index)}
                          size="small"
                          sx={{
                            color: colors.iconDefault,
                            transition: 'color 0.3s',
                            '&:hover': { color: colors.iconHover },
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      }
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        bgcolor: colors.bgDialog,
                        boxShadow: '0 0 10px rgba(0,0,0,0.8)',
                        transition: 'background-color 0.3s',
                        cursor: 'default',
                        userSelect: 'none',
                        '&:hover': {
                          bgcolor: colors.bgSection,
                          boxShadow: `0 0 12px ${colors.blueFocus}`,
                        },
                      }}
                    >
                      <ListItemText
                        primary={keyboard.name}
                        secondary={`Comando: ${keyboard.text}`}
                        primaryTypographyProps={{
                          fontWeight: 700,
                          color: colors.textPrimary,   
                        }}
                        secondaryTypographyProps={{
                          color: colors.textSecondary,
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>

          {/* Botão enviar */}
          <Button
            type="submit"
            variant="outlined"
            fullWidth
            sx={{
              mt: 6,
              borderRadius: 5,
              fontWeight: 700,
              fontSize: 17,
              height: 56,
              color: colors.buttonText,
              borderColor: colors.buttonBorder,
              textTransform: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 0 10px rgba(0,0,0,0.8)',
              '&:hover': {
                backgroundColor: colors.buttonHoverBg,
                color: colors.buttonHoverText,
                borderColor: colors.buttonHoverBg,
                boxShadow: `0 0 14px ${colors.buttonHoverBg}`,
              },
              '&:disabled': {
                borderColor: '#444',
                color: '#555',
                backgroundColor: colors.bgSection,
                boxShadow: 'none',
                cursor: 'default',
              },
            }}
            disabled={loading}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar Callback'}
          </Button>
        </Box>
      </DialogContent>

      <Snackbar
        open={!!error || success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? "error" : "success"}
          sx={{
            width: '100%',
            fontWeight: 700,
            bgcolor: error ? '#b71c1c' : '#1b5e20',
            color: '#eee',
            fontFamily: `'Georgia', serif`,
            boxShadow: '0 0 8px rgba(0,0,0,0.6)'
          }}
        >
          {error || "Callback cadastrado com sucesso!"}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
