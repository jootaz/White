import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useApi } from '../../hooks/useApi';
import { type ProductResponseData } from '../../types/api';
import { CadastrarProdutoModal } from './CadastrarProdutoModal';
import { EditarProdutoModal } from './EditarProdutoModal';

// Usamos o tipo ProductResponseData da API

export function ProductsManager() {
  const [products, setProducts] = useState<ProductResponseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductResponseData | null>(null);
  const [openCadastrarModal, setOpenCadastrarModal] = useState(false);
  const [openEditarModal, setOpenEditarModal] = useState(false);

  // Usar o hook da API
  const { listProducts, deleteProduct } = useApi();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listProducts();
      if (response && response.data) {
        setProducts(response.data);
      }
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      setError("Falha ao carregar produtos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [listProducts, setProducts, setLoading, setError]);

  // Referência para rastrear se já foi feita a primeira chamada à API
  const initialFetchRef = useRef(false);

  useEffect(() => {
    // Faz apenas uma chamada inicial
    if (!initialFetchRef.current) {
      fetchProducts();
      initialFetchRef.current = true;
    }
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    setOpenDeleteDialog(false);
    setLoading(true);
    try {
      await deleteProduct(id);
      setSuccess("Produto excluído com sucesso!");
      fetchProducts(); // Atualiza a lista
    } catch (err) {
      console.error("Erro ao excluir produto:", err);
      setError("Falha ao excluir produto. Tente novamente.");
    } finally {
      setLoading(false);
      setDeletingProduct(null);
    }
  };

  const openDeleteConfirmation = (id: string, name: string) => {
    setDeletingProduct(id);
    setSelectedProduct({
      _id: id,
      name,
      price: 0,
      message: { text: '', banner: [], keyboards: [] },
      qrcode: { resize: 1, cord_x: 0, cord_y: 0, message: { text: '' } },
      approve: { message: { text: '', banner: [] }, action: '', data: '' }
    });
    setOpenDeleteDialog(true);
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  const handleOpenEditarModal = (product: ProductResponseData) => {
    // Adaptar o objeto ProductResponseData para o formato esperado pelo EditarProdutoModal
    setSelectedProduct({
      ...product,
      message: {
        ...product.message,
        text: product.message.text ?? '',
        banner: Array.isArray(product.message.banner) ?
          product.message.banner.map(item => typeof item === 'string' ? item : '') :
          [],
        keyboards: product.message.keyboards ?? []
      },
      qrcode: {
        ...product.qrcode,
        message: {
          ...product.qrcode.message,
          text: product.qrcode.message.text ?? ''
        }
      },
      approve: {
        ...product.approve,
        message: {
          ...product.approve.message,
          text: product.approve.message.text ?? '',
          banner: Array.isArray(product.approve.message.banner) ?
            product.approve.message.banner.map(item => typeof item === 'string' ? item : '') :
            []
        }
      }
    });
    setOpenEditarModal(true);
  };


  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3} gap={2} flexWrap="wrap">
        <Typography variant="h4" fontWeight={600} sx={{ flex: 1, minWidth: 120 }}>
          Produtos
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2, fontWeight: 700, minWidth: 160 }}
          onClick={() => setOpenCadastrarModal(true)}
        >
          Novo Produto
        </Button>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      )}

      {!loading && products.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Nenhum produto encontrado. Crie um novo produto para começar.
          </Typography>
        </Paper>
      )}

      {!loading && products.length > 0 && (
        <Grid container spacing={2}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <Card sx={{ borderRadius: 2, height: '100%' }}>
                {product.message.banner && product.message.banner.length > 0 && (
                  <Box
                    sx={{
                      height: 140,
                      backgroundImage: `url(${product.message.banner[0]})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                )}
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" fontWeight={600} component="div" noWrap>
                      {product.name}
                    </Typography>
                    <Chip
                      label={formatCurrency(product.price)}
                      color="primary"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 2
                  }}>
                    {product.message.text}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="caption" color="text.secondary">
                    Ação: {product.approve.action}
                  </Typography>

                  {product.message.keyboards && product.message.keyboards.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="caption" display="block" gutterBottom>
                        Botões:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {product.message.keyboards.map((keyboard, idx) => (
                          <Chip
                            key={idx}
                            label={keyboard.name}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <IconButton
                    size="small"
                    color="primary"
                    title="Editar"
                    onClick={() => handleOpenEditarModal(product)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    title="Excluir"
                    onClick={() => openDeleteConfirmation(product._id, product.name)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Diálogo de confirmação de exclusão */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o produto "{selectedProduct?.name}"? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button
            onClick={() => deletingProduct && handleDelete(deletingProduct)}
            color="error"
            variant="contained"
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de cadastro de produto */}
      <CadastrarProdutoModal
        open={openCadastrarModal}
        onClose={() => setOpenCadastrarModal(false)}
        onSuccess={() => {
          setSuccess("Produto cadastrado com sucesso!");
          fetchProducts();
        }}
      />

      <EditarProdutoModal
        open={openEditarModal}
        onClose={() => setOpenEditarModal(false)}
        onSuccess={() => {
          setSuccess("Produto atualizado com sucesso!");
          fetchProducts();
        }}
        product={selectedProduct}
      />

      {/* Feedback de erro ou sucesso */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}
