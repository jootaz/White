import { Dialog, DialogContent, DialogTitle, IconButton, TextField, Button, Typography, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useApi } from '../../hooks/useApi';

interface AdicionarParceiroModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Callback para quando o parceiro for adicionado com sucesso
}

export function AdicionarParceiroModal({ open, onClose, onSuccess }: AdicionarParceiroModalProps) {
  const theme = useTheme();
  const api = useApi();
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!nome.trim()) {
      setError('O nome do parceiro não pode estar vazio.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await api.createPartner({
        name: nome.trim()
      });
      if (response && response.data) {
        setNome('');
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError('Erro ao adicionar parceiro');
      }
    } catch (err) {
      console.error('Erro ao criar parceiro:', err);
      setError('Erro ao processar a solicitação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: 400,
          borderRadius: 5,
          border: `1px solid ${colors.borderDark}`,
          backgroundColor: colors.bgDialog,
          boxShadow: '0 4px 20px rgba(0,0,0,0.9)',
          color: colors.textPrimary,
          p: 0,
        }
      }}
      BackdropProps={{
        sx: { backgroundColor: 'rgba(0,0,0,0.7)' }
      }}
    >
      <DialogTitle
        sx={{
          p: 5,
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
        Adicionar Parceiro
      </DialogTitle>

      <DialogContent sx={{ p: 5 }}>
        <Box component="form" autoComplete="off" onSubmit={handleSubmit}>
          <TextField
            label="Nome do Parceiro"
            placeholder="Ex: Empresa XYZ"
            fullWidth
            required
            margin="normal"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            error={!!error}
            helperText={error}
            disabled={loading}
            variant="filled"
            InputLabelProps={{
              sx: { color: colors.textSecondary, fontWeight: 600 }
            }}
            sx={{
              bgcolor: colors.bgSection,
              borderRadius: 2,
              mb: 4,
              '& .MuiFilledInput-root': {
                color: colors.textPrimary,
                fontWeight: 500,
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
          <Button
            type="submit"
            variant="outlined"
            fullWidth
            disabled={loading}
            sx={{
              mt: 5,
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
          >
            {loading ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
