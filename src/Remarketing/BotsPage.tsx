import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Paper,
  Grid,
  TextField,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";

// ---- Tipos ----
interface BotMetric {
  id: number;
  name: string;
  online: boolean;
  starts: number;
  paidUsers: number;
}

interface RemarketingMessage {
  type: "text" | "image" | "video";
  content: string | File | null;
  value?: number;
  buttonLabel?: string;
}

// ---- Componente Principal ----
export default function RemarketingPage() {
  // Estado dos bots
  const [bots] = useState<BotMetric[]>([
    { id: 1, name: "Bot Alpha", online: true, starts: 320, paidUsers: 58 },
    { id: 2, name: "Bot Beta", online: false, starts: 210, paidUsers: 33 },
    { id: 3, name: "Bot Gamma", online: true, starts: 520, paidUsers: 120 },
  ]);
  const [selectedBot, setSelectedBot] = useState<BotMetric | null>(null);

  // Estado da mensagem
  const [message, setMessage] = useState<RemarketingMessage>({
    type: "text",
    content: "",
    value: undefined,
    buttonLabel: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMessage({ ...message, content: e.target.files[0] });
    }
  };

  return (
    <Box sx={{ background: "#0e0e0e", minHeight: "100vh", p: 5, pt: 8 }}>
      {/* Título */}
      <Typography
        variant="h4"
        sx={{
          color: "#e0e0e0",
          fontWeight: "600",
          mb: 4,
          textAlign: "center",
          letterSpacing: "1px",
        }}
      >
        Painel de Remarketing
      </Typography>

      {/* Métricas Resumidas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: "#0e0d0dff",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              transition: "0.3s",
              "&:hover": { transform: "translateY(-4px)" },
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ color: "#e0e0e0" }}>
                Bots Online
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: "#1361c7ff", fontWeight: "700" }}
              >
                {bots.filter((b) => b.online).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: "#0e0d0dff",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              transition: "0.3s",
              "&:hover": { transform: "translateY(-4px)" },
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ color: "#e0e0e0" }}>
                Total Starts
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: "#1361c7ff", fontWeight: "700" }}
              >
                {bots.reduce((acc, b) => acc + b.starts, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: "#0e0d0dff",
              borderRadius: "16px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              transition: "0.3s",
              "&:hover": { transform: "translateY(-4px)" },
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ color: "#e0e0e0" }}>
                Usuários Pagos
              </Typography>
              <Typography
                variant="h4"
                sx={{ color: "#1361c7ff", fontWeight: "700" }}
              >
                {bots.reduce((acc, b) => acc + b.paidUsers, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lista de Bots */}
      <Paper
        sx={{
          p: 3,
          background: "#0e0d0dff",
          borderRadius: "16px",
          mb: 4,
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "#e0e0e0", mb: 2, fontWeight: "600" }}
        >
          Bots Cadastrados
        </Typography>
        {bots.map((bot) => (
          <Box
            key={bot.id}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              mb: 1,
              borderRadius: "12px",
              background: selectedBot?.id === bot.id ? "#2a2a2a" : "#141414",
              cursor: "pointer",
              transition: "0.2s",
              "&:hover": { background: "#0c0c0cff" },
            }}
            onClick={() => setSelectedBot(bot)}
          >
            <Typography sx={{ color: "#e0e0e0" }}>{bot.name}</Typography>
            <Typography
              sx={{
                color: bot.online ? "#3fbf4c" : "#c73636",
                fontWeight: "600",
              }}
            >
              {bot.online ? "Online" : "Offline"}
            </Typography>
          </Box>
        ))}
      </Paper>

      {/* Métricas detalhadas do Bot selecionado */}
      {selectedBot && (
        <Paper
          sx={{
            p: 3,
            mb: 4,
            background: "#0e0d0dff",
            borderRadius: "16px",
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: "#e0e0e0", mb: 2, fontWeight: "600" }}
          >
            Métricas de {selectedBot.name}
          </Typography>
          <Typography sx={{ color: "#e0e0e0" }}>
            Starts:{" "}
            <span style={{ color: "#1361c7ff" }}>{selectedBot.starts}</span>
          </Typography>
          <Typography sx={{ color: "#e0e0e0" }}>
            Usuários Pagos:{" "}
            <span style={{ color: "#1361c7ff" }}>{selectedBot.paidUsers}</span>
          </Typography>
        </Paper>
      )}

      {/* Formulário de Mensagens */}
      <Paper
        sx={{
          p: 3,
          background: "#0e0d0dff",
          borderRadius: "16px",
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "#e0e0e0", mb: 2, fontWeight: "600" }}
        >
          Nova Mensagem de Remarketing
        </Typography>

        {/* Tipo da mensagem */}
        <Select
          fullWidth
          value={message.type}
          onChange={(e) =>
            setMessage({ ...message, type: e.target.value as any, content: "" })
          }
          sx={{ mb: 2, color: "#e0e0e0" }}
        >
          <MenuItem value="text">Texto</MenuItem>
          <MenuItem value="image">Imagem</MenuItem>
          <MenuItem value="video">Vídeo</MenuItem>
        </Select>

        {/* Campo dinâmico */}
        {message.type === "text" && (
          <TextField
            fullWidth
            label="Mensagem de Texto"
            value={message.content as string}
            onChange={(e) =>
              setMessage({ ...message, content: e.target.value })
            }
            multiline
            rows={3}
            sx={{
              mb: 2,
              input: { color: "#e0e0e0" },
              label: { color: "#888" },
            }}
          />
        )}

        {(message.type === "image" || message.type === "video") && (
          <Box sx={{ mb: 2 }}>
            <Button variant="outlined" component="label" fullWidth>
              {message.type === "image" ? "Anexar Imagem" : "Anexar Vídeo"}
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            {message.content && (
              <Typography variant="body2" sx={{ mt: 1, color: "#e0e0e0" }}>
                Arquivo selecionado: {(message.content as File).name}
              </Typography>
            )}
          </Box>
        )}

        {/* Valor */}
        <TextField
          fullWidth
          label="Valor (R$)"
          type="number"
          value={message.value ?? ""}
          onChange={(e) =>
            setMessage({ ...message, value: Number(e.target.value) })
          }
          sx={{
            mb: 2,
            input: { color: "#e0e0e0" },
            label: { color: "#888" },
          }}
        />

        {/* Botão CTA */}
        <TextField
          fullWidth
          label="Texto do Botão"
          value={message.buttonLabel}
          onChange={(e) =>
            setMessage({ ...message, buttonLabel: e.target.value })
          }
          sx={{
            mb: 2,
            input: { color: "#e0e0e0" },
            label: { color: "#888" },
          }}
        />

        <Divider sx={{ mb: 2, borderColor: "#333" }} />

        <Button
          variant="contained"
          fullWidth
          sx={{
            background: "#1361c7ff",
            borderRadius: "12px",
            py: 1.5,
            textTransform: "none",
            fontWeight: "600",
            fontSize: "16px",
            "&:hover": { background: "#0e4fa3" },
          }}
        >
          Salvar Mensagem
        </Button>
      </Paper>
    </Box>
  );
}
