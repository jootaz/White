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
  DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useApi } from '../../hooks/useApi';
import { type CallbackResponseData } from '../../types/api';
import { CadastrarCallbackModal } from './CadastrarCallbackModal';
import { EditarCallbackModal } from './EditarCallbackModal';

export function CallbacksManager() {
  const [callbacks, setCallbacks] = useState<CallbackResponseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedCallback, setSelectedCallback] = useState<CallbackResponseData | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingCallback, setDeletingCallback] = useState<string | null>(null);

  const { listCallbacks, deleteCallback } = useApi();

  const fetchCallbacks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listCallbacks();
      if (response && response.data) {
        setCallbacks(response.data);
      }
    } catch (err) {
      console.error("Erro ao buscar callbacks:", err);
      setError("Falha ao carregar callbacks. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [listCallbacks]);

  const initialFetchRef = useRef(false);

  useEffect(() => {
    if (!initialFetchRef.current) {
      fetchCallbacks();
      initialFetchRef.current = true;
    }
  }, [fetchCallbacks]);

  const handleDelete = async (id: string) => {
    setOpenDeleteDialog(false);
    setLoading(true);
    try {
      await deleteCallback(id);
      setSuccess("Callback excluído com sucesso!");
      fetchCallbacks();
    } catch (err) {
      console.error("Erro ao excluir callback:", err);
      setError("Falha ao excluir callback. Tente novamente.");
    } finally {
      setLoading(false);
      setDeletingCallback(null);
    }
  };

  const openDeleteConfirmation = (id: string, title: string) => {
    setDeletingCallback(id);
    setSelectedCallback({
      _id: id,
      title,
      message: { text: '', banner: [], keyboards: [] }
    });
    setOpenDeleteDialog(true);
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  const handleOpenEditModal = (callback: CallbackResponseData) => {
    setSelectedCallback({
      ...callback,
      message: {
        ...callback.message,
        text: callback.message.text ?? '',
        banner: Array.isArray(callback.message.banner)
          ? callback.message.banner.map(item => typeof item === 'string' ? item : '')
          : [],
        keyboards: callback.message.keyboards ?? []
      },
      premessage: callback.premessage ? {
        ...callback.premessage,
        text: callback.premessage.text ?? '',
        banner: Array.isArray(callback.premessage.banner)
          ? callback.premessage.banner.map(item => typeof item === 'string' ? item : '')
          : []
      } : undefined
    });
    setOpenEditModal(true);
  };

  return (
    <Box sx={{ bgcolor: 'rgba(24,31,42,0.98)', p: 3, borderRadius: 3 }}>
      <Box display="flex" alignItems="center" mb={3} gap={2} flexWrap="wrap">
        <Typography variant="h4" fontWeight={600} sx={{ flex: 1, minWidth: 120, color: '#E1E8F0' }}>
          Callbacks
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2, fontWeight: 700, minWidth: 160, bgcolor: '#4EA5D9' }}
          onClick={() => setOpenModal(true)}
        >
          Novo Callback
        </Button>
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress color="primary" />
        </Box>
      )}

      {!loading && callbacks.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#1E2735' }}>
          <Typography color="#B0BEC5">
            Nenhum callback encontrado. Crie um novo callback para começar.
          </Typography>
        </Paper>
      )}

      {!loading && callbacks.length > 0 && (
        <Grid container spacing={2}>
          {callbacks.map((callback) => (
            <Grid item xs={12} md={6} lg={4} key={callback._id}>
              <Paper sx={{ p: 2, borderRadius: 3, minHeight: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', bgcolor: '#1E2735' }}>
                <Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom noWrap sx={{ color: '#E1E8F0' }}>
                    {callback.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#B0BEC5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 2 }}>
                    {callback.message.text}
                  </Typography>

                  <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                    {callback.message.keyboards?.map((keyboard, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          bgcolor: '#4EA5D9',
                          color: 'white',
                          py: 0.5,
                          px: 1,
                          borderRadius: 1,
                          fontSize: '0.75rem'
                        }}
                      >
                        {keyboard.name}
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
                  <IconButton color="primary" size="small" onClick={() => handleOpenEditModal(callback)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" size="small" onClick={() => openDeleteConfirmation(callback._id, callback.title)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <CadastrarCallbackModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={() => {
          setSuccess("Callback cadastrado com sucesso!");
          fetchCallbacks();
        }}
      />

      <EditarCallbackModal
        callback={selectedCallback}
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        onSuccess={() => {
          setSuccess("Callback atualizado com sucesso!");
          fetchCallbacks();
        }}
      />

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o callback "{selectedCallback?.title}"? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button
            onClick={() => deletingCallback && handleDelete(deletingCallback)}
            color="error"
            variant="contained"
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

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