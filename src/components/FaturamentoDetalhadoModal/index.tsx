import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Select,
  MenuItem,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Importação dos ícones
import MoneyBagIcon from '../../assets/money-bag_1f4b0_1.png';

// Importação do hook de API
import { useApi } from '../../hooks/useApi';
import type { Transaction } from '../../types/api';
import type { SelectChangeEvent } from '@mui/material/Select';

interface Entry {
  id: string;
  date: string;
  time: string;
  source: string;
  type: string;
  value: string;
  status: string;
}

interface FaturamentoDetalhadoModalProps {
  open: boolean;
  onClose: () => void;
}

const FaturamentoDetalhadoModal: React.FC<FaturamentoDetalhadoModalProps> = ({ open, onClose }) => {
  const [period, setPeriod] = useState('mensal');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const { listAllTransactions } = useApi();

  const handlePeriodChange = (event: SelectChangeEvent<string>) => {
    setPeriod(event.target.value);
    setPage(0);
    fetchTransactions();
  };

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDateTime = (timestamp: number): { date: string; time: string } => {
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleDateString('pt-BR');
    const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return { date: formattedDate, time: formattedTime };
  };

  const convertTransactionsToEntries = (transactions: Transaction[]): Entry[] => {
    let totalRev = 0;

    const approvedTransactions = transactions.filter((t) => t.status === 'approved');

    approvedTransactions.forEach((transaction) => {
      const price =
        typeof transaction.product?.price === 'number'
          ? transaction.product.price
          : parseFloat(transaction.product?.price as unknown as string) || 0;
      totalRev += price;
    });

    let filteredTransactions = [...approvedTransactions];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    if (period === 'diario') {
      filteredTransactions = approvedTransactions.filter((transaction) => {
        const d = new Date(transaction.created_at);
        return (
          d.getDate() === today.getDate() &&
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear()
        );
      });
    } else if (period === 'semanal') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      filteredTransactions = approvedTransactions.filter((transaction) => {
        const t = new Date(transaction.created_at).getTime();
        return t >= startOfWeek.getTime() && t <= endOfWeek.getTime();
      });
    } else if (period === 'mensal') {
      filteredTransactions = approvedTransactions.filter((transaction) => {
        const d = new Date(transaction.created_at);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    } else if (period === 'anual') {
      filteredTransactions = approvedTransactions.filter((transaction) => {
        const d = new Date(transaction.created_at);
        return d.getFullYear() === currentYear;
      });
    }

    setTotalRevenue(totalRev);

    return filteredTransactions.map((transaction) => {
      const { date, time } = formatDateTime(transaction.created_at);
      const price =
        typeof transaction.product?.price === 'number'
          ? transaction.product.price
          : parseFloat(transaction.product?.price as unknown as string) || 0;
      return {
        id: transaction._id,
        date,
        time,
        source: transaction.bot?.name || 'Bot desconhecido',
        type: transaction.product?.name || 'Produto desconhecido',
        value: `R$ ${price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        status: 'Aprovado',
      };
    });
  };

  const fetchTransactions = async () => {
    if (!open) return;
    setLoading(true);
    try {
      const response = await listAllTransactions();
      if (response.data && response.data.transactions) {
        const converted = convertTransactionsToEntries(response.data.transactions);
        setEntries(converted);
      } else {
        setEntries([]);
        setTotalRevenue(0);
      }
    } catch (error) {
      console.error(error);
      setEntries([]);
      setTotalRevenue(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchTransactions();
  }, [open]);

  const paginatedEntries = entries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // PALLETA ELEGANTE E MINIMALISTA
  const bgMain = '#121214';             // preto muito escuro e matte
  const bgHeader = '#1c1e26';           // preto azulado escuro
  const borderColor = '#2e3142';        // cinza azulado escuro
  const textPrimary = '#e3e6eb';        // branco quebrado, suave
  const textSecondary = '#8b8f9a';      // cinza médio
  const accentBlue = '#6a738d';         // azul acinzentado super sutil (só pra destaque)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: '720px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          borderRadius: 2,
          border: `1px solid ${borderColor}`,
          backgroundColor: bgMain,
          color: textPrimary,
          maxHeight: 'calc(100vh - 64px)',
          overflowY: 'auto',
          userSelect: 'text',
          fontFamily: "'Roboto', sans-serif",
          fontWeight: 400,
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 3,
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: textPrimary,
          fontWeight: 700,
          fontSize: '1.5rem',
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          userSelect: 'none',
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <img src={MoneyBagIcon} alt="Faturamento Total" style={{ width: 36, height: 36 }} />
          Faturamento Total (Todas as Vendas Aprovadas)
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            display="flex"
            alignItems="center"
            sx={{
              bgcolor: bgHeader,
              p: '4px 12px',
              borderRadius: 2,
            }}
          >
            <CalendarTodayIcon sx={{ color: accentBlue, mr: 1, fontSize: 20 }} />
            <Select
              size="small"
              value={period}
              onChange={handlePeriodChange}
              variant="standard"
              disableUnderline
              sx={{
                color: textPrimary,
                fontSize: '0.875rem',
                '& .MuiSelect-icon': { color: accentBlue },
                '& .MuiSelect-select': { p: '6px 20px 6px 6px' },
              }}
            >
              <MenuItem value="diario">Diário</MenuItem>
              <MenuItem value="semanal">Semanal</MenuItem>
              <MenuItem value="mensal">Mensal</MenuItem>
              <MenuItem value="anual">Anual</MenuItem>
            </Select>
          </Box>
          <IconButton onClick={onClose} sx={{ color: accentBlue }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box p={3}>
          <Typography variant="h4" fontWeight={700} color={textPrimary} mb={1}>
            R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
          <Typography variant="body2" color={textSecondary} mb={2}>
            Soma total de todas as vendas aprovadas. Abaixo são mostradas apenas as vendas do período{' '}
            {period === 'diario'
              ? 'diário (hoje)'
              : period === 'semanal'
              ? 'semanal (semana atual)'
              : period === 'mensal'
              ? 'mensal (mês atual)'
              : 'anual (ano atual)'}
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <CircularProgress size={40} sx={{ color: accentBlue }} />
            </Box>
          ) : paginatedEntries.length > 0 ? (
            <TableContainer
              component={Paper}
              sx={{ bgcolor: 'transparent', boxShadow: 'none', maxHeight: 400 }}
            >
              <Table stickyHeader aria-label="tabela de faturamento">
                <TableHead>
                  <TableRow>
                    {['Data', 'Hora', 'Bot', 'Produto', 'Valor', 'Status (Aprovado)'].map((header) => (
                      <TableCell
                        key={header}
                        sx={{
                          bgcolor: bgHeader,
                          color: textPrimary,
                          borderBottom: `1px solid ${borderColor}`,
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          userSelect: 'none',
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedEntries.map((entry) => (
                    <TableRow
                      key={entry.id}
                      sx={{
                        '&:nth-of-type(even)': { backgroundColor: '#18191f' },
                        cursor: 'default',
                        transition: 'background-color 0.15s ease',
                        '&:hover': { backgroundColor: '#262835' },
                      }}
                      tabIndex={0}
                    >
                      <TableCell sx={{ color: textPrimary, borderBottom: `1px solid ${borderColor}` }}>
                        {entry.date}
                      </TableCell>
                      <TableCell sx={{ color: textPrimary, borderBottom: `1px solid ${borderColor}` }}>
                        {entry.time}
                      </TableCell>
                      <TableCell sx={{ color: textPrimary, borderBottom: `1px solid ${borderColor}` }}>
                        {entry.source}
                      </TableCell>
                      <TableCell sx={{ color: textPrimary, borderBottom: `1px solid ${borderColor}` }}>
                        {entry.type}
                      </TableCell>
                      <TableCell sx={{ color: textPrimary, borderBottom: `1px solid ${borderColor}` }}>
                        {entry.value}
                      </TableCell>
                      <TableCell sx={{ color: textPrimary, borderBottom: `1px solid ${borderColor}` }}>
                        <Box
                          component="span"
                          sx={{
                            py: 0.5,
                            px: 1,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            bgcolor: entry.status === 'Aprovado' ? 'rgba(40, 167, 69, 0.2)' : 'rgba(255, 193, 7, 0.2)',
                            color: entry.status === 'Aprovado' ? '#28a745' : '#ffc107',
                            userSelect: 'none',
                            userDrag: 'none',
                          }}
                        >
                          {entry.status}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box py={4} textAlign="center" color={textSecondary}>
              Nenhuma transação aprovada encontrada no sistema.
            </Box>
          )}

          <TablePagination
            component="div"
            count={entries.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Itens por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count !== -1 ? count : `mais que ${to}`}`
            }
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              color: textPrimary,
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                color: textPrimary,
              },
              '.MuiTablePagination-select': {
                color: textPrimary,
              },
              '.MuiTablePagination-selectIcon': {
                color: accentBlue,
              },
              '.MuiTablePagination-actions': {
                color: accentBlue,
              },
              fontWeight: 600,
              fontFamily: "'Roboto', sans-serif",
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default FaturamentoDetalhadoModal;
