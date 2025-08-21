import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useTheme } from '@mui/material/styles';
import type { NotificationData } from '../types/api';
import { useApi } from '../hooks/useApi';

interface NotificacoesModalProps {
  open: boolean;
  onClose: () => void;
  notifications: NotificationData[];
  onMarkAsRead: (id: string) => void;
  onNotificationUpdate: () => void;
}

export function NotificacoesModal({
  open,
  onClose,
  notifications,
  onMarkAsRead,
  onNotificationUpdate,
}: NotificacoesModalProps) {
  const theme = useTheme();
  const { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } = useApi();

  const unreadNotifications = notifications.filter(n => !n.read);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      onMarkAsRead(id);
      onNotificationUpdate();
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      onNotificationUpdate();
    } catch (err) {
      console.error('Erro ao marcar todas notificações como lidas:', err);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification(id);
      onNotificationUpdate();
    } catch (err) {
      console.error('Erro ao deletar notificação:', err);
    }
  };

  const formatDate = (ts?: number | string) => {
    if (!ts) return 'Data não disponível';
    const dateNum = typeof ts === 'string' ? Date.parse(ts) : ts;
    const d = new Date(dateNum < 1e12 ? dateNum * 1000 : dateNum);
    if (isNaN(d.getTime())) return 'Data inválida';
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'rgba(18,18,18,0.9)',
          color: '#eee',
          borderRadius: 2,
          boxShadow: '0 0 15px rgba(0,0,0,0.6)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 'bold',
          fontSize: '1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          px: 3,
          py: 1.5,
        }}
      >
        Notificações
        <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)' }} size="large">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ maxHeight: '400px', overflowY: 'auto', px: 3, py: 2 }}>
        {unreadNotifications.length === 0 ? (
          <Typography sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', mt: 2 }}>
            Nenhuma notificação não lida no momento.
          </Typography>
        ) : (
          <List disablePadding>
            {unreadNotifications.map(n => (
              <ListItem
                key={n._id}
                onClick={() => handleMarkAsRead(n._id)}
                sx={{
                  mb: 1,
                  borderRadius: 1,
                  cursor: 'pointer',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                  px: 2,
                  py: 1.25,
                }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteNotification(n._id);
                    }}
                    sx={{ color: 'rgba(255,255,255,0.6)' }}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: 36 }}>
                  <NotificationsNoneIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    n.bot_name ? `${n.bot_name} Caiu!` : n.error_message || 'Notificação'
                  }
                  secondary={formatDate(n.timestamp || n.created_at)}
                  primaryTypographyProps={{ fontWeight: 600 }}
                  secondaryTypographyProps={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Button
          variant="outlined"
          onClick={handleMarkAllAsRead}
          disabled={unreadNotifications.length === 0}
          sx={{
            color: 'rgba(255,255,255,0.7)',
            borderColor: 'rgba(255,255,255,0.3)',
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.7)',
              backgroundColor: 'rgba(255,255,255,0.05)',
            },
          }}
        >
          Marcar todas como lidas
        </Button>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{ bgcolor: '#c72c41', '&:hover': { bgcolor: '#a52233' } }}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
