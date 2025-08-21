import {
  Dialog, DialogContent, DialogTitle, IconButton, Typography,
  Box, List, ListItem, Divider, Paper, Checkbox,
  useMediaQuery, Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';

interface Despesa {
  id: string;
  nome: string;
  valor: number;
  tipo: 'Parceria' | 'Desenvolvimento' | 'Design';
  data: Date;
  checked: boolean;
  paid: boolean;
  partner_id?: string;
  partner_name?: string;
  parceiro?: {
    id: string;
    nome: string;
  };
}

interface ListarDespesasModalProps {
  open: boolean;
  onClose: () => void;
  despesas: Despesa[];
  onUpdatePaidStatus: (id: string, paid: boolean) => Promise<void>;
}

export function ListarDespesasModal({
  open,
  onClose,
  despesas,
  onUpdatePaidStatus
}: ListarDespesasModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [atualizando, setAtualizando] = useState<string | null>(null);

  const handleTogglePaid = async (id: string, currentPaidStatus: boolean) => {
    try {
      setAtualizando(id);
      await onUpdatePaidStatus(id, !currentPaidStatus);
    } catch (error) {
      console.error('Erro ao atualizar status de pagamento:', error);
    } finally {
      setAtualizando(null);
    }
  };

  const despesasPorTipo = despesas.reduce((acc, despesa) => {
    if (!acc[despesa.tipo]) {
      acc[despesa.tipo] = [];
    }
    acc[despesa.tipo].push(despesa);
    return acc;
  }, {} as Record<string, Despesa[]>);

  const tiposDespesa = Object.keys(despesasPorTipo).sort((a, b) => {
    const ordem = { 'Parceria': 1, 'Desenvolvimento': 2, 'Design': 3 };
    return ordem[a as keyof typeof ordem] - ordem[b as keyof typeof ordem];
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? '0' : '8px',
          border: '1px solid #373B48',
          background: 'rgba(27, 30, 40, 0.95)',
          height: isMobile ? '100%' : 'auto',
          m: isMobile ? 0 : 2
        }
      }}
    >
      <DialogTitle
        sx={{
          p: isMobile ? 2 : 3,
          pb: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box display="flex" alignItems="center">
          <IconButton onClick={onClose} sx={{ mr: 2, color: theme.palette.primary.main }}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={700}>
            Marcar Despesas como Pagas
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: isMobile ? 2 : 3 }}>
        {despesas.length === 0 ? (
          <Typography color="text.secondary" align="center" py={4}>
            Nenhuma despesa encontrada no período selecionado.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {tiposDespesa.map((tipo) => (
              <Grid item xs={12} key={tipo}>
                <Paper
                  sx={{
                    borderRadius: '8px',
                    border: '1px solid #373B48',
                    background: 'rgba(27, 30, 40, 0.36)',
                    overflow: 'hidden',
                    mb: 2
                  }}
                >
                  <ListItem
                    sx={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      alignItems: isMobile ? 'flex-start' : 'center',
                      p: isMobile ? 2 : 3,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      gap: 2
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      sx={{
                        mb: isMobile ? 1 : 0,
                        width: '100%',
                        color:
                          tipo === 'Parceria'
                            ? '#4f8cff'
                            : tipo === 'Desenvolvimento'
                            ? '#7c3aed'
                            : '#4fc3f7'
                      }}
                    >
                      Despesas de {tipo}
                    </Typography>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent={isMobile ? 'space-between' : 'flex-end'}
                      width="100%"
                    >
                      <Typography variant="h6" fontWeight={700} color="primary">
                        {formatCurrency(
                          despesasPorTipo[tipo].reduce((acc: number, d: Despesa) => acc + d.valor, 0)
                        )}
                      </Typography>
                    </Box>
                  </ListItem>

                  <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

                  <List disablePadding>
                    {despesasPorTipo[tipo].map((despesa: Despesa) => {
                      const isMarcada = despesa.paid;

                      return (
                        <ListItem
                          key={despesa.id}
                          sx={{
                            py: 2,
                            px: isMobile ? 2 : 3,
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            alignItems: isMobile ? 'flex-start' : 'center',
                            gap: 2,
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            '&:last-child': {
                              borderBottom: 'none'
                            }
                          }}
                        >
                          <Box display="flex" alignItems="flex-start" gap={2} width="100%">
                            <Checkbox
                              checked={isMarcada}
                              onChange={() => handleTogglePaid(despesa.id, isMarcada)}
                              disabled={atualizando !== null}
                              sx={{
                                color: 'rgba(255, 255, 255, 0.5)',
                                '&.Mui-checked': {
                                  color: theme.palette.primary.main
                                }
                              }}
                            />
                            <Box>
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: 500,
                                  textDecoration: isMarcada ? 'line-through' : 'none',
                                  color: isMarcada ? 'text.secondary' : 'text.primary',
                                  mb: 0.5
                                }}
                              >
                                {despesa.nome}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(despesa.data)}
                                {despesa.partner_id && ` • Parceiro: ${despesa.parceiro?.nome}`}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography
                            variant="body1"
                            fontWeight={600}
                            sx={{
                              ml: isMobile ? 0 : 'auto',
                              pl: isMobile ? 0 : 2,
                              mt: isMobile ? 1 : 0,
                              width: isMobile ? '100%' : 'auto',
                              textAlign: isMobile ? 'left' : 'right',
                              textDecoration: isMarcada ? 'line-through' : 'none',
                              color: isMarcada ? 'text.secondary' : 'text.primary'
                            }}
                          >
                            {formatCurrency(despesa.valor)}
                          </Typography>
                        </ListItem>
                      );
                    })}
                  </List>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
}
