import { useState, useEffect } from 'react';
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
import type { CallbackResponseData, Keyboard } from '../../types/api';

interface EditarCallbackModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  callback: CallbackResponseData | null;
}

export function EditarCallbackModal({ open, onClose, onSuccess, callback }: EditarCallbackModalProps) {
  const theme = useTheme();
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Dados do callback
  const [title, setTitle] = useState('');
  const [messageText, setMessageText] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [keyboards, setKeyboards] = useState<Keyboard[]>([]);
  const [premessageText, setPremessageText] = useState('');
  const [premessageBannerUrl, setPremessageBannerUrl] = useState('');

  // Novo teclado
  const [newKeyboardName, setNewKeyboardName] = useState('');
  const [newKeyboardText, setNewKeyboardText] = useState('');

  useEffect(() => {
    if (callback) {
      setTitle(callback.title);
      setMessageText(callback.message.text || '');
      setBannerUrl(
        callback.message.banner && callback.message.banner.length > 0
          ? (typeof callback.message.banner[0] === 'string' ? callback.message.banner[0] : '')
          : ''
      );
      setKeyboards(callback.message.keyboards || []);
      if (callback.premessage) {
        setPremessageText(callback.premessage.text || '');
        setPremessageBannerUrl(
          callback.premessage.banner && callback.premessage.banner.length > 0
            ? (typeof callback.premessage.banner[0] === 'string' ? callback.premessage.banner[0] : '')
            : ''
        );
      }
    }
  }, [callback]);

  const handleAddKeyboard = () => {
    if (newKeyboardName && newKeyboardText) {
      setKeyboards([...keyboards, { name: newKeyboardName, text: newKeyboardText }]);
      setNewKeyboardName('');
      setNewKeyboardText('');
    }
  };

  const handleRemoveKeyboard = (index: number) => {
    const updated = [...keyboards];
    updated.splice(index, 1);
    setKeyboards(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callback?._id) {
      setError('ID do callback não disponível');
      return;
    }
    if (!title || !messageText) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const callbackData: any = {
        title,
        message: {
          text: messageText,
          banner: bannerUrl ? [bannerUrl] : [],
          keyboards
        }
      };
      if (premessageText || premessageBannerUrl) {
        callbackData.premessage = {
          text: premessageText,
          banner: premessageBannerUrl ? [premessageBannerUrl] : []
        };
      }
      const result = await api.updateCallback(callback._id, callbackData);
      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => onClose(), 1000);
    } catch (err: unknown) {
      if (err instanceof Error) setError(`Erro ao atualizar o callback: ${err.message}`);
      else setError('Ocorreu um erro ao atualizar o callback. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: '#000000', // fundo preto puro
          boxShadow: '0 4px 20px rgba(59,89,152,0.6)', // sombra azul suave
          minWidth: { sm: '600px' },
          color: '#E0E0E0', // texto cinza claro
          border: '1px solid #2c3e70', // borda azul escuro acinzentado
        }
      }}
    >
      <DialogTitle sx={{ p: 3, pb: 0, display: 'flex', alignItems: 'center', color: '#E0E0E0' }}>
        <IconButton onClick={onClose} sx={{ mr: 2, color: '#3b5998' }}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          Editar Callback
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3, color: '#E0E0E0' }}>
        <Box component="form" autoComplete="off" onSubmit={handleSubmit}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Informações Básicas
          </Typography>

          <TextField
            label="Título"
            fullWidth
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            InputLabelProps={{ style: { color: '#9aa8c3' } }}
            InputProps={{
              style: { color: '#E0E0E0', backgroundColor: '#121212' },
            }}
            variant="filled"
          />

          <Divider sx={{ my: 3, borderColor: '#2c3e70' }} />

          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Mensagem Principal
          </Typography>

          <TextField
            label="Texto da Mensagem"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            required
            InputLabelProps={{ style: { color: '#9aa8c3' } }}
            InputProps={{
              style: { color: '#E0E0E0', backgroundColor: '#121212' },
            }}
            variant="filled"
          />

          <TextField
            label="URL do Banner (opcional)"
            fullWidth
            margin="normal"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="https://exemplo.com/imagem.jpg"
            InputLabelProps={{ style: { color: '#9aa8c3' } }}
            InputProps={{
              style: { color: '#E0E0E0', backgroundColor: '#121212' },
            }}
            variant="filled"
          />

          <Divider sx={{ my: 3, borderColor: '#2c3e70' }} />

          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Botões de Teclado
          </Typography>

          {keyboards.length > 0 && (
            <List sx={{ mb: 2, bgcolor: '#121212', borderRadius: 1, color: '#E0E0E0' }}>
              {keyboards.map((keyboard, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleRemoveKeyboard(index)}
                      sx={{ color: '#B23A48' }}
                    >
                      Remover
                    </Button>
                  }
                >
                  <ListItemText
                    primary={keyboard.name}
                    secondary={keyboard.text}
                    primaryTypographyProps={{ color: '#E0E0E0' }}
                    secondaryTypographyProps={{ color: '#a0a0a0' }}
                  />
                </ListItem>
              ))}
            </List>
          )}

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5}>
              <TextField
                label="Nome do Botão"
                fullWidth
                size="small"
                value={newKeyboardName}
                onChange={(e) => setNewKeyboardName(e.target.value)}
                InputLabelProps={{ style: { color: '#9aa8c3' } }}
                InputProps={{
                  style: { color: '#E0E0E0', backgroundColor: '#121212' },
                }}
                variant="filled"
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                label="Texto/Ação do Botão"
                fullWidth
                size="small"
                value={newKeyboardText}
                onChange={(e) => setNewKeyboardText(e.target.value)}
                InputLabelProps={{ style: { color: '#9aa8c3' } }}
                InputProps={{
                  style: { color: '#E0E0E0', backgroundColor: '#121212' },
                }}
                variant="filled"
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                variant="outlined"
                onClick={handleAddKeyboard}
                disabled={!newKeyboardName || !newKeyboardText}
                startIcon={<AddIcon />}
                fullWidth
                sx={{
                  color: '#3b5998',
                  borderColor: '#3b5998',
                  '&:hover': {
                    backgroundColor: '#3b5998',
                    color: '#fff'
                  }
                }}
              >
                Adicionar
              </Button>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3, borderColor: '#2c3e70' }} />

          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Mensagem Prévia (Opcional)
          </Typography>

          <TextField
            label="Texto da Mensagem Prévia"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={premessageText}
            onChange={(e) => setPremessageText(e.target.value)}
            InputLabelProps={{ style: { color: '#9aa8c3' } }}
            InputProps={{
              style: { color: '#E0E0E0', backgroundColor: '#121212' },
            }}
            variant="filled"
          />

          <TextField
            label="URL do Banner da Mensagem Prévia"
            fullWidth
            margin="normal"
            value={premessageBannerUrl}
            onChange={(e) => setPremessageBannerUrl(e.target.value)}
            placeholder="https://exemplo.com/imagem.jpg"
            InputLabelProps={{ style: { color: '#9aa8c3' } }}
            InputProps={{
              style: { color: '#E0E0E0', backgroundColor: '#121212' },
            }}
            variant="filled"
          />

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
              backgroundColor: '#9aa8c3',
              '&:hover': { backgroundColor: '#2e4770' }
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
          sx={{ width: '100%' }}
        >
          {error || "Callback atualizado com sucesso!"}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
