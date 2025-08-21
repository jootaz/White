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
import type { ProductResponseData, CreateProductPayload, Keyboard } from '../../types/api';

interface EditarProdutoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  product: ProductResponseData | null;
}

export function EditarProdutoModal({ open, onClose, onSuccess, product }: EditarProdutoModalProps) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const api = useApi();

  const [productData, setProductData] = useState<CreateProductPayload>({
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

  const [keyboards, setKeyboards] = useState<Keyboard[]>([]);
  const [newKeyboardName, setNewKeyboardName] = useState('');
  const [newKeyboardText, setNewKeyboardText] = useState('');

  useEffect(() => {
    if (product) {
      setProductData({
        name: product.name,
        price: product.price,
        message: {
          text: product.message.text || '',
          banner: product.message.banner || [],
          keyboards: product.message.keyboards || []
        },
        qrcode: {
          resize: product.qrcode.resize,
          cord_x: product.qrcode.cord_x,
          cord_y: product.qrcode.cord_y,
          message: {
            text: product.qrcode.message?.text || ''
          }
        },
        approve: {
          message: {
            text: product.approve.message?.text || '',
            banner: product.approve.message?.banner || []
          },
          action: product.approve.action || '',
          data: product.approve.data || ''
        }
      });
      setKeyboards(product.message.keyboards || []);
    }
  }, [product]);

  const handleInputChange = (field: string, value: string | number) => {
    setProductData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMessageInputChange = (field: string, value: string) => {
    setProductData(prev => ({
      ...prev,
      message: {
        ...prev.message,
        [field]: field === 'banner' ? [value] : value
      }
    }));
  };

  const handleQrcodeInputChange = (field: string, value: number) => {
    setProductData(prev => ({
      ...prev,
      qrcode: {
        ...prev.qrcode,
        [field]: value
      }
    }));
  };

  const handleQrcodeMessageInputChange = (value: string) => {
    setProductData(prev => ({
      ...prev,
      qrcode: {
        ...prev.qrcode,
        message: {
          text: value
        }
      }
    }));
  };

  const handleApproveMessageInputChange = (field: string, value: string) => {
    setProductData(prev => ({
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

  const handleApproveInputChange = (field: string, value: string) => {
    setProductData(prev => ({
      ...prev,
      approve: {
        ...prev.approve,
        [field]: value
      }
    }));
  };

  const handleAddKeyboard = () => {
    if (newKeyboardName && newKeyboardText) {
      const updatedKeyboards = [...keyboards, { name: newKeyboardName, text: newKeyboardText }];
      setKeyboards(updatedKeyboards);
      setProductData(prev => ({
        ...prev,
        message: {
          ...prev.message,
          keyboards: updatedKeyboards
        }
      }));
      setNewKeyboardName('');
      setNewKeyboardText('');
    }
  };

  const handleRemoveKeyboard = (index: number) => {
    const updatedKeyboards = [...keyboards];
    updatedKeyboards.splice(index, 1);
    setKeyboards(updatedKeyboards);
    setProductData(prev => ({
      ...prev,
      message: {
        ...prev.message,
        keyboards: updatedKeyboards
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?._id) {
      setError('ID do produto não disponível');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.updateProduct(product._id, productData);
      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
      setError('Ocorreu um erro ao atualizar o produto. Tente novamente.');
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
          bgcolor: '#000000',  // fundo preto puro
          boxShadow: '0 4px 20px rgba(59,89,152,0.6)',  // sombra azul suave
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
          Editar Produto
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3, color: '#E0E0E0' }}>
        <Box component="form" autoComplete="off" onSubmit={handleSubmit}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Informações Básicas
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Nome do Produto"
                fullWidth
                margin="normal"
                value={productData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                variant="filled"
                InputLabelProps={{ style: { color: '#9aa8c3' } }}
                InputProps={{ style: { color: '#E0E0E0', backgroundColor: '#121212' } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Preço (R$)"
                fullWidth
                margin="normal"
                type="number"
                value={productData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                inputProps={{ min: 0, step: '0.01' }}
                required
                variant="filled"
                InputLabelProps={{ style: { color: '#9aa8c3' } }}
                InputProps={{ style: { color: '#E0E0E0', backgroundColor: '#121212' } }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3, borderColor: '#2c3e70' }} />

          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Mensagem do Produto
          </Typography>

          <TextField
            label="Texto da Mensagem"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={productData.message.text}
            onChange={(e) => handleMessageInputChange('text', e.target.value)}
            required
            variant="filled"
            InputLabelProps={{ style: { color: '#9aa8c3' } }}
            InputProps={{ style: { color: '#E0E0E0', backgroundColor: '#121212' } }}
          />

          <TextField
            label="URL do Banner (opcional)"
            fullWidth
            margin="normal"
            value={
              productData.message.banner && productData.message.banner.length > 0
                ? typeof productData.message.banner[0] === 'string' ? productData.message.banner[0] : ''
                : ''
            }
            onChange={(e) => handleMessageInputChange('banner', e.target.value)}
            placeholder="https://exemplo.com/imagem.jpg"
            variant="filled"
            InputLabelProps={{ style: { color: '#9aa8c3' } }}
            InputProps={{ style: { color: '#E0E0E0', backgroundColor: '#121212' } }}
          />

          <Typography variant="subtitle2" fontWeight={600} mt={2} mb={1}>
            Botões de Teclado
          </Typography>

          {keyboards.length > 0 && (
            <List sx={{ mb: 2, bgcolor: '#121212', borderRadius: 1, color: '#E0E0E0' }}>
              {keyboards.map((keyboard, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <Button size="small" color="error" onClick={() => handleRemoveKeyboard(index)} sx={{ color: '#B23A48' }}>
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
                variant="filled"
                InputLabelProps={{ style: { color: '#9aa8c3' } }}
                InputProps={{ style: { color: '#E0E0E0', backgroundColor: '#121212' } }}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                label="Texto/Ação do Botão"
                fullWidth
                size="small"
                value={newKeyboardText}
                onChange={(e) => setNewKeyboardText(e.target.value)}
                variant="filled"
                InputLabelProps={{ style: { color: '#9aa8c3' } }}
                InputProps={{ style: { color: '#E0E0E0', backgroundColor: '#121212' } }}
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
                  color: '#9aa8c3',
                  borderColor: '#9aa8c3',
                  '&:hover': {
                    backgroundColor: '#9aa8c3',
                    color: '#fff'
                  }
                }}
              >
                Adicionar
              </Button>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3, borderColor: '#9aa8c3' }} />

          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            QR Code
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Tamanho (redimensionamento)"
                fullWidth
                margin="normal"
                type="number"
                value={productData.qrcode.resize}
                onChange={(e) => handleQrcodeInputChange('resize', parseFloat(e.target.value))}
                inputProps={{ min: 0.1, step: 0.1 }}
                variant="filled"
                InputLabelProps={{ style: { color: '#9aa8c3' } }}
                InputProps={{ style: { color: '#E0E0E0', backgroundColor: '#121212' } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Coordenada X"
                fullWidth
                margin="normal"
                type="number"
                value={productData.qrcode.cord_x}
                onChange={(e) => handleQrcodeInputChange('cord_x', parseInt(e.target.value))}
                variant="filled"
                InputLabelProps={{ style: { color: '#9aa8c3' } }}
                InputProps={{ style: { color: '#E0E0E0', backgroundColor: '#121212' } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Coordenada Y"
                fullWidth
                margin="normal"
                type="number"
                value={productData.qrcode.cord_y}
                onChange={(e) => handleQrcodeInputChange('cord_y', parseInt(e.target.value))}
                variant="filled"
                InputLabelProps={{ style: { color: '#9aa8c3' } }}
                InputProps={{ style: { color: '#E0E0E0', backgroundColor: '#121212' } }}
              />
            </Grid>
          </Grid>

          <TextField
            label="Mensagem do QR Code"
            fullWidth
            margin="normal"
            value={productData.qrcode.message.text}
            onChange={(e) => handleQrcodeMessageInputChange(e.target.value)}
            variant="filled"
            InputLabelProps={{ style: { color: '#9aa8c3' } }}
            InputProps={{ style: { color: '#E0E0E0', backgroundColor: '#121212' } }}
          />

          <Divider sx={{ my: 3, borderColor: '#2c3e70' }} />

          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Aprovação
          </Typography>

          <TextField
            label="Mensagem de Aprovação"
            fullWidth
            margin="normal"
            multiline
            rows={2}
            value={productData.approve.message.text}
            onChange={(e) => handleApproveMessageInputChange('text', e.target.value)}
            variant="filled"
            InputLabelProps={{ style: { color: '#9aa8c3' } }}
            InputProps={{ style: { color: '#E0E0E0', backgroundColor: '#121212' } }}
          />

          <TextField
            label="URL do Banner de Aprovação (opcional)"
            fullWidth
            margin="normal"
            value={
              productData.approve.message.banner && productData.approve.message.banner.length > 0
                ? typeof productData.approve.message.banner[0] === 'string' ? productData.approve.message.banner[0] : ''
                : ''
            }
            onChange={(e) => handleApproveMessageInputChange('banner', e.target.value)}
            placeholder="https://exemplo.com/imagem.jpg"
            variant="filled"
            InputLabelProps={{ style: { color: '#9aa8c3' } }}
            InputProps={{ style: { color: '#E0E0E0', backgroundColor: '#121212' } }}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Ação"
                fullWidth
                margin="normal"
                value={productData.approve.action}
                onChange={(e) => handleApproveInputChange('action', e.target.value)}
                variant="filled"
                InputLabelProps={{ style: { color: '#9aa8c3' } }}
                InputProps={{ style: { color: '#E0E0E0', backgroundColor: '#121212' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Dados"
                fullWidth
                margin="normal"
                value={productData.approve.data}
                onChange={(e) => handleApproveInputChange('data', e.target.value)}
                variant="filled"
                InputLabelProps={{ style: { color: '#9aa8c3' } }}
                InputProps={{ style: { color: '#E0E0E0', backgroundColor: '#121212' } }}
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
              backgroundColor: '#3b5998',
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
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%', bgcolor: error ? '#b23a48' : '#3b5998', color: '#E0E0E0' }}
        >
          {error || 'Produto atualizado com sucesso!'}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
