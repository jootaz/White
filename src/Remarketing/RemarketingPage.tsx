import { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemarketingList from "./List";
import RemarketingForm from "./Form";
import type { RemarketingMessage } from "./type";
import { createNewRemarketingMessage } from "./type";

export default function RemarketingPage() {
  const [messages, setMessages] = useState<RemarketingMessage[]>([]);
  const [openForm, setOpenForm] = useState(false);

  const handleAddMessage = (msg: Omit<RemarketingMessage, 'id'>) => {
    setMessages([...messages, createNewRemarketingMessage(msg)]);
    setOpenForm(false);
  };

  const handleDeleteMessage = (id: string) => {
    setMessages(messages.filter(msg => msg.id !== id));
  };

  return (
    <Box p={6}>
      <Typography variant="h5" mb={3} fontWeight={600} color="white">
        Remarketing
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ mb: 2, borderRadius: "12px", textTransform: "none" }}
        onClick={() => setOpenForm(true)}
      >
        Adicionar Mensagem
      </Button>

      <RemarketingList messages={messages} onDelete={handleDeleteMessage} />

      <RemarketingForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={handleAddMessage}
      />
    </Box>
  );
}