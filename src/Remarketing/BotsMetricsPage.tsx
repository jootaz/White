import { Box, Typography, Button } from "@mui/material";
import { useParams } from "react-router-dom";
import RemarketingForm from "./Form";
import { useState } from "react";

export default function BotMetricsPage() {
  const { id } = useParams();
  const [openForm, setOpenForm] = useState(false);

  return (
    <Box p={3}>
      <Typography variant="h5">Métricas do Bot {id}</Typography>
      {/* Aqui entraria cards/gráficos de métricas */}
      
      <Button 
        variant="contained" 
        sx={{ mt: 3 }}
        onClick={() => setOpenForm(true)}
      >
        Enviar Nova Mensagem
      </Button>

      <RemarketingForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={(msg) => console.log("Nova mensagem criada:", msg)}
      />
    </Box>
  );
}
