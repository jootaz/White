import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useApi } from "../hooks/useApi"; // ajuste o caminho

// ---- Tipos ----
interface BotMetric {
  id: string;
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
  trigger?: "start" | "product" | "payment"; // Novo campo
  schedule?: string; // Novo campo (ex: "2025-09-01 18:00")
}

// ---- Componente Principal ----
export default function RemarketingPage() {
  const { listBots } = useApi();

  // Estado dos bots
  const [bots, setBots] = useState<BotMetric[]>([]);
  const [selectedBot, setSelectedBot] = useState<BotMetric | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Estado da mensagem
  const [message, setMessage] = useState<RemarketingMessage>({
    type: "text",
    content: "",
    value: undefined,
    buttonLabel: "",
    trigger: "start",
    schedule: "",
  });

  // Fetch dos bots
  useEffect(() => {
    const fetchBots = async () => {
      try {
        setLoading(true);
        const res = await listBots();
        if (res?.data) {
          const mapped = res.data.map((apiBot: any) => ({
            id: apiBot._id,
            name: apiBot.name,
            online: apiBot.running ?? false,
            starts: apiBot.starts ?? 0,
            paidUsers: apiBot.paidUsers ?? 0,
          }));
          setBots(mapped);
        }
      } catch (err) {
        console.error("Erro ao buscar bots:", err);
        setBots([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBots();
  }, [listBots]);

  // Upload de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMessage({ ...message, content: e.target.files[0] });
    }
  };

  // Filtra bots pelo nome
  const filteredBots = bots.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ background: "#0b0b0b", minHeight: "100vh", p: 5, pt: 8 }}>
      {/* Título */}
      <Typography
        variant="h4"
        sx={{
          color: "#f0f0f0",
          fontWeight: 700,
          mb: 5,
          textAlign: "center",
          letterSpacing: 1,
        }}
      >
        Painel de Remarketing
      </Typography>

      <Grid container spacing={4}>
        {/* Coluna Esquerda */}
        <Grid item xs={12} md={4}>
          {loading ? (
            <CircularProgress sx={{ color: "#1361c7ff" }} />
          ) : (
            <>
              {/* Métricas resumidas */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  {
                    title: "Bots Online",
                    value: bots.filter((b) => b.online).length,
                    color: "#3fbf4c",
                  },
                  {
                    title: "Total Starts",
                    value: bots.reduce((acc, b) => acc + b.starts, 0),
                    color: "#1361c7ff",
                  },
                  {
                    title: "Usuários Pagos",
                    value: bots.reduce((acc, b) => acc + b.paidUsers, 0),
                    color: "#1361c7ff",
                  },
                ].map((metric, idx) => (
                  <Grid item xs={12} key={idx}>
                    <Card
                      sx={{
                        background: "#1a1a1a",
                        borderRadius: 2,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                      }}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ color: "#aaa" }}>
                          {metric.title}
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{ color: metric.color, fontWeight: 700 }}
                        >
                          {metric.value}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Filtro + Lista de Bots */}
              <Card
                sx={{
                  background: "#1a1a1a",
                  borderRadius: 2,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ color: "#f0f0f0", mb: 2, fontWeight: 600 }}
                  >
                    Bots Cadastrados
                  </Typography>

                  {/* Campo de busca */}
                  <TextField
                    placeholder="Buscar bot..."
                    fullWidth
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconButton>
                            <SearchIcon sx={{ color: "#888" }} />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2,
                      input: { color: "#f0f0f0" },
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#333" },
                      },
                    }}
                  />

                  <List
                    sx={{
                      maxHeight: 400,
                      overflowY: "auto",
                      bgcolor: "#141414",
                      borderRadius: 2,
                    }}
                  >
                    {filteredBots.map((bot) => (
                      <ListItem
                        key={bot.id}
                        button
                        selected={selectedBot?.id === bot.id}
                        onClick={() => setSelectedBot(bot)}
                        sx={{
                          "&.Mui-selected": {
                            backgroundColor: "#2a2a2a",
                          },
                          "&:hover": { backgroundColor: "#222" },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography sx={{ color: "#f0f0f0" }}>
                              {bot.name}
                            </Typography>
                          }
                          secondary={
                            <Typography sx={{ color: "#888", fontSize: 13 }}>
                              {bot.starts} starts • {bot.paidUsers} pagos
                            </Typography>
                          }
                        />
                        <Typography
                          sx={{
                            color: bot.online ? "#3fbf4c" : "#ff5a5a",
                            fontWeight: 600,
                          }}
                        >
                          {bot.online ? "Online" : "Offline"}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </>
          )}
        </Grid>

        {/* Coluna Direita */}
        <Grid item xs={12} md={8}>
          {/* Métricas detalhadas */}
          {selectedBot && (
            <Card
              sx={{
                mb: 3,
                background: "#1a1a1a",
                borderRadius: 2,
                boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ color: "#f0f0f0", mb: 2, fontWeight: 600 }}
                >
                  Métricas de {selectedBot.name}
                </Typography>
                <Typography sx={{ color: "#f0f0f0", mb: 1 }}>
                  Starts:{" "}
                  <span style={{ color: "#1361c7ff" }}>{selectedBot.starts}</span>
                </Typography>
                <Typography sx={{ color: "#f0f0f0" }}>
                  Usuários Pagos:{" "}
                  <span style={{ color: "#1361c7ff" }}>
                    {selectedBot.paidUsers}
                  </span>
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Formulário de Mensagem */}
          <Card
            sx={{
              background: "#1a1a1a",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{ color: "#f0f0f0", mb: 2, fontWeight: 600 }}
              >
                Nova Mensagem de Remarketing
              </Typography>

              {/* Disparo */}
              <Select
                fullWidth
                value={message.trigger}
                onChange={(e) =>
                  setMessage({ ...message, trigger: e.target.value as any })
                }
                sx={{ mb: 2, color: "#f0f0f0" }}
              >
                <MenuItem value="start">Ao iniciar</MenuItem>
                <MenuItem value="product">Produto</MenuItem>
                <MenuItem value="payment">Pagamento</MenuItem>
              </Select>

              {/* Tipo da mensagem */}
              <Select
                fullWidth
                value={message.type}
                onChange={(e) =>
                  setMessage({
                    ...message,
                    type: e.target.value as any,
                    content: "",
                  })
                }
                sx={{ mb: 2, color: "#f0f0f0" }}
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
                    input: { color: "#f0f0f0" },
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
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, color: "#f0f0f0" }}
                    >
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
                  input: { color: "#f0f0f0" },
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
                  input: { color: "#f0f0f0" },
                  label: { color: "#888" },
                }}
              />

              {/* Agendamento */}
              <TextField
                fullWidth
                label="Agendar (YYYY-MM-DD HH:mm)"
                value={message.schedule}
                onChange={(e) =>
                  setMessage({ ...message, schedule: e.target.value })
                }
                sx={{
                  mb: 2,
                  input: { color: "#f0f0f0" },
                  label: { color: "#888" },
                }}
              />

              <Divider sx={{ mb: 2, borderColor: "#333" }} />

              <Button
                variant="contained"
                fullWidth
                sx={{
                  background: "#1361c7ff",
                  borderRadius: 2,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 16,
                  "&:hover": { background: "#0e4fa3" },
                }}
              >
                Salvar Mensagem
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
