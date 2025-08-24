import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Chip,
  Box,
  IconButton,
  Typography
} from "@mui/material";
import { useState } from "react";
import type { RemarketingMessage } from "./type";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (msg: Omit<RemarketingMessage, 'id'>) => void;
}

export default function RemarketingForm({ open, onClose, onSave }: Props) {
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<RemarketingMessage["tipo"]>("Texto");
  const [mensagem, setMensagem] = useState("");
  const [status, setStatus] = useState<RemarketingMessage["status"]>("ativo");
  const [novoBotao, setNovoBotao] = useState("");
  const [botoes, setBotoes] = useState<string[]>([]);

  const handleAddBotao = () => {
    if (novoBotao.trim()) {
      setBotoes([...botoes, novoBotao.trim()]);
      setNovoBotao("");
    }
  };

  const handleRemoveBotao = (index: number) => {
    setBotoes(botoes.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!titulo || !mensagem) return;

    onSave({
      titulo,
      tipo,
      mensagem,
      botoes,
      status,
    });

    // Reset form
    setTitulo("");
    setMensagem("");
    setTipo("Texto");
    setStatus("ativo");
    setBotoes([]);
    setNovoBotao("");
  };

  const handleClose = () => {
    onClose();
    // Reset form on close
    setTitulo("");
    setMensagem("");
    setTipo("Texto");
    setStatus("ativo");
    setBotoes([]);
    setNovoBotao("");
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Nova Mensagem de Remarketing</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="normal"
          label="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />

        <TextField
          select
          fullWidth
          margin="normal"
          label="Tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as RemarketingMessage["tipo"])}
        >
          <MenuItem value="Texto">Texto</MenuItem>
          <MenuItem value="Vídeo">Vídeo</MenuItem>
          <MenuItem value="Imagem">Imagem</MenuItem>
        </TextField>

        <TextField
          fullWidth
          margin="normal"
          label="Mensagem"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          multiline
          rows={3}
          required
        />

        <Box mt={2}>
          <Typography variant="body2" gutterBottom>
            Botões (opcional):
          </Typography>
          <Box display="flex" gap={1} alignItems="center">
            <TextField
              fullWidth
              size="small"
              label="Novo botão"
              value={novoBotao}
              onChange={(e) => setNovoBotao(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddBotao()}
            />
            <IconButton onClick={handleAddBotao}>
              <AddIcon />
            </IconButton>
          </Box>
          
          <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
            {botoes.map((botao, index) => (
              <Chip
                key={index}
                label={botao}
                onDelete={() => handleRemoveBotao(index)}
                deleteIcon={<DeleteIcon />}
              />
            ))}
          </Box>
        </Box>

        <TextField
          select
          fullWidth
          margin="normal"
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as RemarketingMessage["status"])}
        >
          <MenuItem value="ativo">Ativo</MenuItem>
          <MenuItem value="inativo">Inativo</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={!titulo || !mensagem}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}