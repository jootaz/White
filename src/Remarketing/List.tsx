import { Box, Card, CardContent, Typography, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import type { RemarketingMessage } from "./type";

interface Props {
  messages: RemarketingMessage[];
  onDelete: (id: string) => void;
}

export default function RemarketingList({ messages, onDelete }: Props) {
  if (messages.length === 0) {
    return (
      <Typography color="gray" mt={2}>
        Nenhuma mensagem cadastrada.
      </Typography>
    );
  }

  return (
    <Box display="grid" gap={2}>
      {messages.map((msg) => (
        <Card
          key={msg.id}
          sx={{ background: "#1e1e1e", borderRadius: "16px", color: "white" }}
        >
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography fontWeight={600}>
                {msg.titulo} — {msg.tipo.toUpperCase()}
              </Typography>
              <Typography variant="body2" color={msg.status === "ativo" ? "lightgreen" : "gray"}>
                {msg.status}
              </Typography>
              <IconButton onClick={() => onDelete(msg.id)}>
                <DeleteIcon sx={{ color: "#f44336" }} />
              </IconButton>
            </Box>
            <Typography mt={1}>{msg.mensagem}</Typography>
            {msg.botoes && msg.botoes.length > 0 && (
              <Box mt={1}>
                <Typography variant="body2" fontWeight={600}>
                  Botões:
                </Typography>
                {msg.botoes.map((botao, index) => (
                  <Typography key={index} variant="body2">
                    - {botao}
                  </Typography>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}