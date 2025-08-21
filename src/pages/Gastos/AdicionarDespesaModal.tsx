import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';

interface NovaDespesaData {
  nome: string;
  valor: number;
  tipo: 'Parceria' | 'Desenvolvimento' | 'Design';
  partner_id?: string;
}

interface Parceiro {
  id: string;
  nome: string;
}

interface AdicionarDespesaModalProps {
  open: boolean;
  onClose: () => void;
  onAddDespesa: (despesa: NovaDespesaData) => void;
  parceiros?: Parceiro[];
}

export function AdicionarDespesaModal({
  open,
  onClose,
  onAddDespesa,
  parceiros = [],
}: AdicionarDespesaModalProps) {
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
    iconDefault: '#3b5998',
    iconHover: '#9aa8c3',
  };

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'Parceria' | 'Desenvolvimento' | 'Design'>('Parceria');
  const [valor, setValor] = useState('');
  const [erroValor, setErroValor] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [erroPartner, setErroPartner] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'error' | 'success' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErroValor('');
    setErroPartner('');

    const valorNumerico = parseFloat(valor.replace('.', '').replace(',', '.'));
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      setErroValor('Valor inválido. Insira um número positivo.');
      return;
    }
    if (valorNumerico > 999999999) {
      setErroValor('O valor máximo permitido é R$ 999.999.999.');
      return;
    }
    if (!nome.trim()) {
      setSnackbar({ open: true, message: 'O nome da despesa não pode estar vazio.', severity: 'error' });
      return;
    }
    if (!partnerId) {
      setErroPartner('É necessário selecionar um parceiro.');
      return;
    }

    onAddDespesa({
      nome: nome.trim(),
      valor: valorNumerico,
      tipo,
      partner_id: partnerId,
    });

    // Resetar campos
    setNome('');
    setTipo('Parceria');
    setValor('');
    setPartnerId('');
    setSnackbar({ open: true, message: 'Despesa adicionada com sucesso!', severity: 'success' });
    onClose();
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/[^\d,.]/g, '');
    const num = parseFloat(sanitized.replace('.', '').replace(',', '.'));
    if (!isNaN(num) && num > 999999999) return;
    setValor(sanitized);
    if (erroValor) setErroValor('');
  };

  const inputSx = {
    mb: 4, // maior espaçamento entre inputs
    bgcolor: colors.bgSection,
    borderRadius: 2,
    '& .MuiFilledInput-root': {
      color: colors.textPrimary,
      fontWeight: 500,
      // volta fonte padrão do MUI, sem serifas
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
    '& label': {
      color: colors.textSecondary,
      fontWeight: 600,
      // sem fonte serif
    },
  };

  return (
    <>
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
            minWidth: 400,
            boxShadow: '0 4px 20px rgba(0,0,0,0.9)',
          },
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            p: 5,
            pb: 3,
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
              '&:hover': { color: colors.iconHover, backgroundColor: 'transparent' },
            }}
            aria-label="Fechar"
            size="large"
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
          Adicionar Despesa
        </DialogTitle>

        {/* Conteúdo */}
        <DialogContent sx={{ p: 6 }}>
          <Box component="form" autoComplete="off" onSubmit={handleSubmit}>
            <TextField
              label="Nome da Despesa"
              placeholder="Ex: Assinatura de Software"
              fullWidth
              required
              variant="filled"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              sx={inputSx}
            />

            <TextField
              label="Tipo de Despesa"
              select
              fullWidth
              variant="filled"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as any)}
              sx={inputSx}
            >
              <MenuItem value="Parceria">Parceria</MenuItem>
              <MenuItem value="Desenvolvimento">Desenvolvimento</MenuItem>
              <MenuItem value="Design">Design</MenuItem>
            </TextField>

            <TextField
              label="Valor"
              placeholder="R$ 0,00"
              fullWidth
              required
              variant="filled"
              value={valor}
              onChange={handleValorChange}
              error={!!erroValor}
              helperText={erroValor}
              sx={inputSx}
              inputProps={{ lang: 'pt-BR' }}
            />

            {parceiros.length > 0 ? (
              <TextField
                label="Parceiro"
                select
                fullWidth
                required
                variant="filled"
                value={partnerId}
                onChange={(e) => {
                  setPartnerId(e.target.value);
                  if (erroPartner) setErroPartner('');
                }}
                error={!!erroPartner}
                helperText={erroPartner}
                sx={inputSx}
              >
                <MenuItem value="" disabled>
                  <em>Selecione um parceiro</em>
                </MenuItem>
                {parceiros.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.nome}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <Typography color="error" variant="body2" mt={3}>
                É necessário cadastrar pelo menos um parceiro antes de adicionar uma despesa.
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="outlined"
              sx={{
                mt: 7,
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
              disabled={parceiros.length === 0}
            >
              Adicionar
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            fontWeight: 700,
            bgcolor: snackbar.severity === 'error' ? '#b71c1c' : '#1b5e20',
            color: '#eee',
            boxShadow: '0 0 8px rgba(0,0,0,0.6)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
