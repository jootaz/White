import { Box, Paper, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export function Bloqueado() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @keyframes subtleFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 60%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes glow {
          0%, 100% {
            text-shadow:
              0 0 5px #ff0000,
              0 0 10px #ff0000,
              0 0 20px #ff0000,
              0 0 40px #ff0000;
            color: #ffaaaa;
          }
          50% {
            text-shadow:
              0 0 15px #ff3333,
              0 0 30px #ff3333,
              0 0 50px #ff3333,
              0 0 80px #ff3333;
            color: #ffdddd;
          }
        }

        .glow-text {
          animation: glow 3s ease-in-out infinite;
          font-weight: 700;
        }
      `}</style>

      <Box
        sx={{
          height: "100vh",
          width: "100vw",
          background:
            "radial-gradient(circle at 30% 30%, rgba(40,40,40,0.8), #000000 80%), " +
            "radial-gradient(circle at 70% 70%, rgba(30,30,30,0.6), #000000 70%)",
          backgroundSize: "200% 200%",
          animation: "subtleFlow 30s ease-in-out infinite",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 2,
          padding: 2,
          overflow: "hidden",
          color: "#eee",
          userSelect: "none",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            backgroundColor: "#121212cc",
            color: "white",
            padding: 4,
            width: 500,
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            backdropFilter: "blur(10px)",
            boxShadow: "0 0 25px rgba(0,0,0,0.8)",
          }}
        >
          <Typography
            variant="h4"
            textAlign="center"
            className="glow-text"
            sx={{ fontWeight: 700 }}
          >
            Acesso Bloqueado 🚫
          </Typography>

          <Typography
            variant="body1"
            sx={{
              whiteSpace: "pre-line",
              color: "#bbb",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            {`Eae safado, tá pagando de doido rapaz

Vou ir ai te buscar em [CIDADE] seu vacilão`}
          </Typography>

          {/* Aqui entra a FOTO */}
          <Box
            component="img"
            src="/kid.jpg" // coloque a imagem na pasta public e troque o nome se precisar
            alt="Foto do Kid"
            sx={{
              width: "100%",
              maxHeight: 250,
              objectFit: "cover",
              borderRadius: 2,
              my: 2,
            }}
          />

          <Typography
            variant="body1"
            sx={{
              whiteSpace: "pre-line",
              color: "#bbb",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            {`Já sai daqui se não o kid vai te pegar`}
          </Typography>

          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate("/")}
            sx={{
              backgroundColor: "#3b5998",
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: "bold",
              paddingY: 1.2,
              transition: "background-color 0.3s ease",
              "&:hover": { backgroundColor: "#36579eff" },
            }}
          >
            Voltar ao Login
          </Button>
        </Paper>
      </Box>
    </>
  );
}
