import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  Divider,
  Paper,
  Grid,
  Snackbar,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import type { DespesaParceiro } from './index';

interface ConfirmarExclusaoModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nome: string;
  tipo: 'parceiro' | 'despesa';
}

function ConfirmarExclusaoModal({ open, onClose, onConfirm, nome, tipo }: ConfirmarExclusaoModalProps) {
  const theme = useTheme();

  const colors = {
    bgDialog: '#0d0d0d',
    bgSection: '#121212',
    textPrimary: '#dcdcdc',
    textSecondary: '#9aa8c3',
    blueFocus: '#3b5998',
    borderLight: '#223355',
    borderDark: '#1b2a4a',
    buttonBg: '#121212',
    buttonBorder: '#2a3d66',
    buttonText: '#9aa8c3',
    buttonHoverBg: '#1f2a63',
    buttonHoverText: '#dcdcdc',
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 5,
          bgcolor: colors.bgDialog,
          border: `1px solid ${colors.borderDark}`,
          color: colors.textPrimary,
          p: 0,
          boxShadow: '0 4px 20px rgba(0,0,0,0.9)'
        }
      }}
    >
      <DialogTitle
        sx={{
          p: 3,
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          backgroundColor: colors.bgSection,
          borderBottom: `1px solid ${colors.borderLight}`,
          fontWeight: 700,
          fontSize: '1.25rem',
          color: colors.textPrimary,
          userSelect: 'none',
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            color: colors.buttonText,
            transition: 'color 0.3s',
            '&:hover': { color: colors.blueFocus, backgroundColor: 'transparent' }
          }}
          size="large"
          aria-label="Fechar"
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
        Confirmar Exclusão
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Typography variant="body1" mb={3} sx={{ color: colors.textPrimary }}>
          Tem certeza que deseja excluir {tipo === 'parceiro' ? 'o parceiro' : 'a despesa'} <strong>"{nome}"</strong>?
        </Typography>
        <Typography variant="body2" color={colors.textSecondary} mb={4}>
          {tipo === 'parceiro'
            ? 'Esta ação não pode ser desfeita e todas as despesas associadas também serão excluídas.'
            : 'Esta ação não pode ser desfeita.'}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderColor: colors.borderLight,
              color: colors.buttonText,
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': {
                borderColor: colors.blueFocus,
                backgroundColor: 'rgba(59, 89, 152, 0.1)',
                color: colors.blueFocus,
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={onConfirm}
            sx={{
              fontWeight: 'bold',
              textTransform: 'none',
              boxShadow: '0 0 10px rgba(255, 0, 0, 0.7)',
            }}
          >
            {tipo === 'parceiro' ? 'Excluir Parceiro' : 'Excluir Despesa'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

interface ListarParceirosModalProps {
  open: boolean;
  onClose: () => void;
  despesas: DespesaParceiro[];
  onDeleteParceiro: (id: string) => Promise<void>;
  onDeleteDespesa: (id: string) => Promise<void>;
  parceiros?: { id: string; nome: string }[];
}

export function ListarParceirosModal({
  open,
  onClose,
  despesas,
  onDeleteParceiro,
  onDeleteDespesa,
  parceiros: todosOsParceiros = []
}: ListarParceirosModalProps) {
  const theme = useTheme();
  const isMobile = useTheme().breakpoints.down('sm');

  const colors = {
    bgDialog: '#0d0d0d',
    bgSection: '#121212',
    textPrimary: '#dcdcdc',
    textSecondary: '#9aa8c3',
    blueFocus: '#3b5998',
    borderLight: '#223355',
    borderDark: '#1b2a4a',
    buttonBg: '#121212',
    buttonBorder: '#2a3d66',
    buttonText: '#9aa8c3',
    buttonHoverBg: '#1f2a63',
    buttonHoverText: '#dcdcdc',
  };

  const [confirmacaoOpen, setConfirmacaoOpen] = useState(false);
  const [parceiroParaExcluir, setParceiroParaExcluir] = useState<{ id: string; nome: string } | null>(null);
  const [despesaParaExcluir, setDespesaParaExcluir] = useState<{ id: string; nome: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Agrupar despesas por parceiro
  const despesasPorParceiro = despesas.reduce((acc, despesa) => {
    if (!despesa.parceiro) return acc;

    const { id, nome } = despesa.parceiro;
    if (!acc[id]) {
      acc[id] = {
        id,
        nome,
        valor: 0,
        despesas: []
      };
    }

    acc[id].valor += despesa.valor;
    acc[id].despesas.push(despesa);

    return acc;
  }, {} as Record<string, { id: string; nome: string; valor: number; despesas: DespesaParceiro[] }>);

  // Adicionar parceiros sem despesas
  todosOsParceiros.forEach(parceiro => {
    if (!despesasPorParceiro[parceiro.id]) {
      despesasPorParceiro[parceiro.id] = {
        id: parceiro.id,
        nome: parceiro.nome,
        valor: 0,
        despesas: []
      };
    }
  });

  const parceiros = Object.values(despesasPorParceiro).sort((a, b) => b.valor - a.valor || a.nome.localeCompare(b.nome));

  const handleExcluirParceiroClick = (id: string, nome: string) => {
    setParceiroParaExcluir({ id, nome });
    setDespesaParaExcluir(null);
    setConfirmacaoOpen(true);
  };

  const handleExcluirDespesaClick = (id: string, nome: string) => {
    setDespesaParaExcluir({ id, nome });
    setParceiroParaExcluir(null);
    setConfirmacaoOpen(true);
  };

  const handleConfirmarExclusao = async () => {
    if (!parceiroParaExcluir && !despesaParaExcluir) return;
    setLoading(true);
    setAlert(null);

    try {
      if (parceiroParaExcluir) {
        await onDeleteParceiro(parceiroParaExcluir.id);
        setAlert({ type: 'success', message: 'Parceiro excluído com sucesso!' });
      } else if (despesaParaExcluir) {
        await onDeleteDespesa(despesaParaExcluir.id);
        setAlert({ type: 'success', message: 'Despesa excluída com sucesso!' });
      }
      setConfirmacaoOpen(false);
      setParceiroParaExcluir(null);
      setDespesaParaExcluir(null);
    } catch (error) {
      setAlert({ type: 'error', message: 'Erro ao excluir. Tente novamente.' });
      console.error('Erro ao excluir:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const isXs = useTheme().breakpoints.down('sm');

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: isXs ? 0 : 5,
            bgcolor: colors.bgDialog,
            border: `1px solid ${colors.borderDark}`,
            color: colors.textPrimary,
            boxShadow: '0 4px 20px rgba(0,0,0,0.9)',
            m: isXs ? 0 : 3,
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle
          sx={{
            p: isXs ? 2 : 4,
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
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
              color: colors.buttonText,
              transition: 'color 0.3s',
              '&:hover': { color: colors.blueFocus, backgroundColor: 'transparent' }
            }}
            size="large"
            aria-label="Fechar"
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
          Parceiros e Despesas
        </DialogTitle>

        <DialogContent sx={{ p: isXs ? 2 : 4, overflowY: 'auto' }}>
          {parceiros.length === 0 ? (
            <Typography
              color={colors.textSecondary}
              align="center"
              py={6}
              sx={{ userSelect: 'none', fontStyle: 'italic' }}
            >
              Nenhum parceiro encontrado.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {parceiros.map((parceiro) => (
                <Grid item xs={12} key={parceiro.id}>
                  <Paper
                    sx={{
                      borderRadius: 4,
                      border: `1px solid ${colors.borderLight}`,
                      backgroundColor: colors.bgSection,
                      overflow: 'hidden',
                      boxShadow: '0 0 10px rgba(59, 89, 152, 0.3)',
                      userSelect: 'none',
                      '&:hover': {
                        boxShadow: `0 0 14px ${colors.blueFocus}`,
                      },
                      transition: 'box-shadow 0.3s ease',
                    }}
                    elevation={0}
                  >
                    <ListItem
                      sx={{
                        display: 'flex',
                        flexDirection: isXs ? 'column' : 'row',
                        alignItems: 'center',
                        p: 2,
                        gap: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                          flexGrow: 1,
                          color: colors.textPrimary,
                          wordBreak: 'break-word',
                          width: isXs ? '100%' : 'auto',
                          mb: isXs ? 1 : 0,
                        }}
                      >
                        {parceiro.nome}
                      </Typography>

                      <Box
                        display="flex"
                        alignItems="center"
                        gap={1}
                        width={isXs ? '100%' : 'auto'}
                        justifyContent={isXs ? 'space-between' : 'flex-end'}
                      >
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          color={colors.blueFocus}
                          sx={{ minWidth: 120, textAlign: 'right' }}
                        >
                          {formatCurrency(parceiro.valor)}
                        </Typography>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleExcluirParceiroClick(parceiro.id, parceiro.nome)}
                          disabled={loading}
                          sx={{
                            borderColor: 'transparent',
                            color: colors.buttonText,
                            minWidth: 40,
                            '&:hover': {
                              backgroundColor: 'rgba(255,0,0,0.15)',
                              borderColor: 'transparent',
                              color: 'error.main',
                              boxShadow: `0 0 8px rgba(255,0,0,0.7)`,
                            },
                          }}
                          aria-label={`Excluir parceiro ${parceiro.nome}`}
                        >
                          <DeleteIcon fontSize="small" />
                        </Button>
                      </Box>
                    </ListItem>

                    <Divider sx={{ backgroundColor: colors.borderLight }} />
                    <List disablePadding>
                      {parceiro.despesas.length > 0 ? (
                        parceiro.despesas.map((despesa) => (
                          <ListItem
                            key={despesa.id}
                            sx={{
                              py: 1.5,
                              px: 3,
                              display: 'flex',
                              flexDirection: isXs ? 'column' : 'row',
                              alignItems: 'center',
                              gap: 1,
                              userSelect: 'text',
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: colors.textPrimary,
                                flexGrow: 1,
                                wordBreak: 'break-word',
                                mb: isXs ? 0.5 : 0,
                              }}
                            >
                              {despesa.nome}
                            </Typography>
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={1}
                              width={isXs ? '100%' : 'auto'}
                              justifyContent="flex-end"
                            >
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color={colors.blueFocus}
                                sx={{ minWidth: 90, textAlign: 'right' }}
                              >
                                {formatCurrency(despesa.valor)}
                              </Typography>
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => handleExcluirDespesaClick(despesa.id, despesa.nome)}
                                disabled={loading}
                                sx={{
                                  minWidth: 36,
                                  padding: 0,
                                  borderColor: 'transparent',
                                  color: colors.buttonText,
                                  '&:hover': {
                                    backgroundColor: 'rgba(255,0,0,0.15)',
                                    borderColor: 'transparent',
                                    color: 'error.main',
                                    boxShadow: `0 0 8px rgba(255,0,0,0.7)`,
                                  },
                                }}
                                aria-label={`Excluir despesa ${despesa.nome}`}
                              >
                                <DeleteIcon fontSize="small" />
                              </Button>
                            </Box>
                          </ListItem>
                        ))
                      ) : (
                        <ListItem
                          sx={{
                            py: 2,
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="body2" color={colors.textSecondary} sx={{ userSelect: 'none', fontStyle: 'italic' }}>
                            Nenhuma despesa associada a este parceiro
                          </Typography>
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal confirmação exclusão */}
      {(parceiroParaExcluir || despesaParaExcluir) && (
        <ConfirmarExclusaoModal
          open={confirmacaoOpen}
          onClose={() => setConfirmacaoOpen(false)}
          onConfirm={handleConfirmarExclusao}
          nome={parceiroParaExcluir ? parceiroParaExcluir.nome : despesaParaExcluir!.nome}
          tipo={parceiroParaExcluir ? 'parceiro' : 'despesa'}
        />
      )}

      {/* Alertas */}
      <Snackbar
        open={!!alert}
        autoHideDuration={4000}
        onClose={() => setAlert(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
      </Snackbar>
    </>
  );
}
