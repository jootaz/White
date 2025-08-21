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
  ListItemText,
  InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@mui/material/styles';
import { useApi } from '../../hooks/useApi';
import type { CreateProductPayload, Keyboard } from '../../types/api';

interface CadastrarProdutoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CadastrarProdutoModal({ open, onClose, onSuccess }: CadastrarProdutoModalProps) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [keyboards, setKeyboards] = useState<Array<Keyboard>>([]);
  const [keyboardName, setKeyboardName] = useState('');
  const [keyboardText, setKeyboardText] = useState('');
  const { createProduct } = useApi();

  // Estado do formulário
  const [produtoData, setProdutoData] = useState<CreateProductPayload>({
    name: '',
    price: 0,
    message: {
      text: '',
      banner: [],
      keyboards: []
    },
    qrcode: {
      resize: 1,
      cord_x: 10,
      cord_y: 20,
      message: {
        text: ''
      }
    },
    approve: {
      message: {
        text: '',
        banner: []
      },
      action: '',
      data: ''
    }
  });

  // Atualiza campo simples no produtoData
  const handleInputChange = (field: string, value: string | number) => {
    setProdutoData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Atualiza campo dentro message do produtoData
  const handleMessageInputChange = (field: string, value: string) => {
    setProdutoData(prev => ({
      ...prev,
      message: {
        ...prev.message,
        [field]: field === 'banner' ? [value] : value
      }
    }));
  };

  // Atualiza campos do qrcode
  const handleQrcodeInputChange = (field: string, value: string | number) => {
    setProdutoData(prev => ({
      ...prev,
      qrcode: {
        ...prev.qrcode,
        [field]: value,
      }
    }));
  };

  // Atualiza mensagem dentro do qrcode
  const handleQrcodeMessageInputChange = (field: string, value: string) => {
    setProdutoData(prev => ({
      ...prev,
      qrcode: {
        ...prev.qrcode,
        message: {
          ...prev.qrcode.message,
          [field]: value
        }
      }
    }));
  };

  // Atualiza campo simples dentro de approve
  const handleApproveInputChange = (field: string, value: string) => {
    setProdutoData(prev => ({
      ...prev,
      approve: {
        ...prev.approve,
        [field]: value
      }
    }));
  };

  // Atualiza mensagem dentro de approve
  const handleApproveMessageInputChange = (field: string, value: string) => {
    setProdutoData(prev => ({
      ...prev,
      approve: {
        ...prev.approve,
        message: {
          ...prev.approve.message,
          [field]: field === 'banner' ? [value] : value
        }
      }
    }));
  };

  // Adiciona um teclado (botão) à lista
  const addKeyboard = () => {
    if (keyboardName && keyboardText) {
      const newKeyboard: Keyboard = { name: keyboardName, text: keyboardText };
      setKeyboards([...keyboards, newKeyboard]);
      setProdutoData(prev => ({
        ...prev,
        message: {
          ...prev.message,
          keyboards: [...(prev.message.keyboards || []), newKeyboard]
        }
      }));
      setKeyboardName('');
      setKeyboardText('');
    }
  };

  // Remove teclado da lista por índice
  const removeKeyboard = (index: number) => {
    const updatedKeyboards = [...keyboards];
    updatedKeyboards.splice(index, 1);
    setKeyboards(updatedKeyboards);
    setProdutoData(prev => ({
      ...prev,
      message: {
        ...prev.message,
        keyboards: updatedKeyboards
      }
    }));
  };

  // Submete o formulário, chama API e controla loading/error/success
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createProduct(produtoData);
      console.log('Produto criado com sucesso!');
      setSuccess(true);

      // Resetar formulário
      setProdutoData({
        name: '',
        price: 0,
        message: {
          text: '',
          banner: [],
          keyboards: []
        },
        qrcode: {
          resize: 1,
          cord_x: 10,
          cord_y: 20,
          message: {
            text: ''
          }
        },
        approve: {
          message: {
            text: '',
            banner: []
          },
          action: '',
          data: ''
        }
      });
      setKeyboards([]);

      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (err) {
      console.error('Erro ao cadastrar produto:', err);
      setError('Ocorreu um erro ao cadastrar o produto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Fecha Snackbar de feedback
  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: 'rgba(16,22,29,0.96)', // fundo escuro sofisticado
          boxShadow: '0 0 24px rgba(0,0,0,0.4)', // sombra suave
          backdropFilter: 'blur(6px)', // leve blur no fundo
          border: '1px solid rgba(90,105,120,0.15)' // contorno elegante sutil
        }
      }}
    >
      <DialogTitle sx={{ p: 3, pb: 0, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={onClose} sx={{ mr: 2, color: '#0089fabd' /* azul suave */ }}>
          <CloseIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700} sx={{ color: '#ffffffbd' /* azul suave */ }}>
          Cadastrar Produto
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box component="form" autoComplete="off" onSubmit={handleSubmit}>
          <Grid container spacing={3}>

            {/* Informações básicas */}
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#cfc6c6bd' }}>
                Informações Básicas
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <TextField
                    label="Nome do Produto"
                    placeholder="Produto Incrível"
                    fullWidth
                    margin="normal"
                    value={produtoData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    required
                    InputLabelProps={{ style: { color: '#cfc6c6bd' } }}
                    sx={{
                      input: { color: '#eee' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'rgba(108,160,220,0.6)' },
                        '&:hover fieldset': { borderColor: '#cfc6c6bd' },
                        '&.Mui-focused fieldset': { borderColor: '#cfc6c6bd' }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Preço"
                    placeholder="0.00"
                    fullWidth
                    margin="normal"
                    type="number"
                    InputProps={{
                      startAdornment: <InputAdornment position="start" sx={{ color: '#6CA0DC' }}>R$</InputAdornment>,
                      style: { color: '#eee' }
                    }}
                    value={produtoData.price}
                    onChange={e => handleInputChange('price', parseFloat(e.target.value))}
                    required
                    InputLabelProps={{ style: { color: '#cfc6c6bd' } }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'rgba(108,160,220,0.6)' },
                        '&:hover fieldset': { borderColor: '#cfc6c6bd' },
                        '&.Mui-focused fieldset': { borderColor: '#cfc6c6bd' }
                      }
                    }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2, borderColor: 'rgba(108,160,220,0.3)' }} />
            </Grid>

            {/* Mensagem do Produto */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#cfc6c6bd' }}>
                Mensagem do Produto
              </Typography>

              <TextField
                label="Texto da mensagem"
                placeholder="Compre agora o Produto Incrível e receba um brinde!"
                fullWidth
                margin="normal"
                multiline
                rows={3}
                value={produtoData.message.text}
                onChange={e => handleMessageInputChange('text', e.target.value)}
                required
                InputLabelProps={{ style: { color: '#cfc6c6bd' } }}
                sx={{
                  input: { color: '#eee' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(108,160,220,0.6)' },
                    '&:hover fieldset': { borderColor: '#cfc6c6bd' },
                    '&.Mui-focused fieldset': { borderColor: '#cfc6c6bd' }
                  }
                }}
              />

              <TextField
                label="URL da imagem"
                placeholder="https://exemplo.com/imagem.jpg"
                fullWidth
                margin="normal"
                value={produtoData.message.banner?.[0] || ''}
                onChange={e => handleMessageInputChange('banner', e.target.value)}
                InputLabelProps={{ style: { color: '#cfc6c6bd' } }}
                sx={{
                  input: { color: '#eee' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(108,160,220,0.6)' },
                    '&:hover fieldset': { borderColor: '#cfc6c6bd' },
                    '&.Mui-focused fieldset': { borderColor: '#cfc6c6bd' }
                  }
                }}
              />

              <Typography variant="subtitle2" mt={2} mb={1} sx={{ color: '#cfc6c6bd' }}>
                Botões (Teclados)
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={5}>
                  <TextField
                    label="Nome do botão"
                    placeholder="Comprar Agora"
                    fullWidth
                    size="small"
                    value={keyboardName}
                    onChange={e => setKeyboardName(e.target.value)}
                    InputLabelProps={{ style: { color: '#cfc6c6bd' } }}
                    sx={{
                      input: { color: '#eee' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'rgba(108,160,220,0.6)' },
                        '&:hover fieldset': { borderColor: '#1361c7ff' },
                        '&.Mui-focused fieldset': { borderColor: '#1361c7ff' }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    label="Comando"
                    placeholder="comprar_produto"
                    fullWidth
                    size="small"
                    value={keyboardText}
                    onChange={e => setKeyboardText(e.target.value)}
                    InputLabelProps={{ style: { color: '#cfc6c6bd' } }}
                    sx={{
                      input: { color: '#eee' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'rgba(108,160,220,0.6)' },
                        '&:hover fieldset': { borderColor: '#1361c7ff' },
                        '&.Mui-focused fieldset': { borderColor: '#1361c7ff' }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    variant="outlined"
                    onClick={addKeyboard}
                    sx={{
                      height: '40px',
                      width: '100%',
                      color: '#1551a0ff',
                      borderColor: '#2b5183ff',
                      '&:hover': {
                        backgroundColor: 'rgba(108,160,220,0.1)',
                        borderColor: '#1361c7ff'
                      }
                    }}
                  >
                    <AddIcon />
                  </Button>
                </Grid>
              </Grid>

              {keyboards.length > 0 && (
                <Box sx={{ mt: 2, border: '1px solid', borderColor: 'rgba(108,160,220,0.3)', borderRadius: 1, p: 2 }}>
                  <List dense disablePadding>
                    {keyboards.map((keyboard, index) => (
                      <ListItem
                        key={index}
                        dense
                        secondaryAction={
                          <IconButton edge="end" aria-label="remover" onClick={() => removeKeyboard(index)} sx={{ color: '#cfc6c6bd' }}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        }
                      >
                        <ListItemText
                          primary={keyboard.name}
                          secondary={`Comando: ${keyboard.text}`}
                          primaryTypographyProps={{ color: '#eee' }}
                          secondaryTypographyProps={{ color: 'rgba(255,255,255,0.7)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Grid>

            {/* Configurações do QR Code */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#cfc6c6bd' }}>
                Configurações do QR Code
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    label="Resize"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={produtoData.qrcode.resize}
                    onChange={e => handleQrcodeInputChange('resize', parseInt(e.target.value))}
                    required
                    InputLabelProps={{ style: { color: '#cfc6c6bd' } }}
                    sx={{
                      input: { color: '#eee' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'rgba(108,160,220,0.6)' },
                        '&:hover fieldset': { borderColor: '#cfc6c6bd' },
                        '&.Mui-focused fieldset': { borderColor: '#cfc6c6bd' }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Posição X"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={produtoData.qrcode.cord_x}
                    onChange={e => handleQrcodeInputChange('cord_x', parseInt(e.target.value))}
                    required
                    InputLabelProps={{ style: { color: '#cfc6c6bd' } }}
                    sx={{
                      input: { color: '#eee' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'rgba(108,160,220,0.6)' },
                        '&:hover fieldset': { borderColor: '#cfc6c6bd' },
                        '&.Mui-focused fieldset': { borderColor: '#cfc6c6bd' }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Posição Y"
                    type="number"
                    fullWidth
                    margin="normal"
                    value={produtoData.qrcode.cord_y}
                    onChange={e => handleQrcodeInputChange('cord_y', parseInt(e.target.value))}
                    required
                    InputLabelProps={{ style: { color: '#cfc6c6bd' } }}
                    sx={{
                      input: { color: '#eee' },
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'rgba(108,160,220,0.6)' },
                        '&:hover fieldset': { borderColor: '#cfc6c6bd' },
                        '&.Mui-focused fieldset': { borderColor: '#cfc6c6bd' }
                      }
                    }}
                  />
                </Grid>
              </Grid>

              <TextField
                label="Mensagem do QR Code"
                placeholder="Escaneie o QR Code para pagar com Pix."
                fullWidth
                margin="normal"
                multiline
                rows={2}
                value={produtoData.qrcode.message.text}
                onChange={e => handleQrcodeMessageInputChange('text', e.target.value)}
                required
                InputLabelProps={{ style: { color: '#cfc6c6bd' } }}
                sx={{
                  input: { color: '#eee' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(108,160,220,0.6)' },
                    '&:hover fieldset': { borderColor: '#cfc6c6bd' },
                    '&.Mui-focused fieldset': { borderColor: '#cfc6c6bd' }
                  }
                }}
              />

              <Divider sx={{ my: 2, borderColor: 'rgba(108,160,220,0.3)' }} />

              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#cfc6c6bd' }}>
                Aprovação
              </Typography>

              <TextField
                label="Mensagem de aprovação"
                placeholder="Seu pagamento foi aprovado!"
                fullWidth
                margin="normal"
                multiline
                rows={2}
                value={produtoData.approve.message.text}
                onChange={e => handleApproveMessageInputChange('text', e.target.value)}
                required
                InputLabelProps={{ style: { color: '#cfc6c6bd' } }}
                sx={{
                  input: { color: '#eee' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(108,160,220,0.6)' },
                    '&:hover fieldset': { borderColor: '#cfc6c6bd' },
                    '&.Mui-focused fieldset': { borderColor: '#cfc6c6bd' }
                  }
                }}
              />

              <TextField
                label="URL da imagem de aprovação"
                placeholder="https://exemplo.com/imagem_aprovado.gif"
                fullWidth
                margin="normal"
                value={produtoData.approve.message.banner?.[0] || ''}
                onChange={e => handleApproveMessageInputChange('banner', e.target.value)}
                InputLabelProps={{ style: { color: '#cfc6c6bd' } }}
                sx={{
                  input: { color: '#eee' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(108,160,220,0.6)' },
                    '&:hover fieldset': { borderColor: '#cfc6c6bd' },
                    '&.Mui-focused fieldset': { borderColor: '#cfc6c6bd' }
                  }
                }}
              />

              <TextField
                label="Ação"
                placeholder="liberar_acesso"
                fullWidth
                margin="normal"
                value={produtoData.approve.action}
                onChange={e => handleApproveInputChange('action', e.target.value)}
                required
                InputLabelProps={{ style: { color: '#cfc6c6bd' } }}
                sx={{
                  input: { color: '#eee' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(108,160,220,0.6)' },
                    '&:hover fieldset': { borderColor: '#cfc6c6bd' },
                    '&.Mui-focused fieldset': { borderColor: '#cfc6c6bd' }
                  }
                }}
              />

              <TextField
                label="Dados adicionais"
                placeholder="dados_adicionais"
                fullWidth
                margin="normal"
                value={produtoData.approve.data}
                onChange={e => handleApproveInputChange('data', e.target.value)}
                required
                InputLabelProps={{ style: { color: '#cfc6c6bd' } }}
                sx={{
                  input: { color: '#eee' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'rgba(108,160,220,0.6)' },
                    '&:hover fieldset': { borderColor: '#cfc6c6bd' },
                    '&.Mui-focused fieldset': { borderColor: '#cfc6c6bd' }
                  }
                }}
              />
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
              backgroundColor: '#19336bff',
              '&:hover': {
                backgroundColor: '#2c4477ff',
              }
            }}
            disabled={loading}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar Produto'}
          </Button>
        </Box>
      </DialogContent>

      {/* Feedback de erro ou sucesso */}
      <Snackbar open={!!error || success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? "error" : "success"}
          sx={{ width: '100%' }}
        >
          {error || "Produto cadastrado com sucesso!"}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
