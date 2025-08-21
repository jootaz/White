import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  Link,
  Slider,
  Tooltip,
} from "@mui/material";
import { Visibility, VisibilityOff, VolumeUp, VolumeOff } from "@mui/icons-material";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export function Login({ onLogin }: { onLogin: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tentativas, setTentativas] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    audioRef.current = new Audio("/3milhoes.mp3");
    audioRef.current.loop = true;
    audioRef.current.currentTime = 35;
    audioRef.current.volume = volume;
    audioRef.current.muted = muted;

    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    audioRef.current.muted = muted;
  }, [volume, muted]);

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (muted) {
      setMuted(false);
      if (audioRef.current.currentTime < 30) {
        audioRef.current.currentTime = 30;
      }
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      setMuted(true);
    }
  };

  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    const vol = Array.isArray(newValue) ? newValue[0] : newValue;
    setVolume(vol);
    if (vol === 0) {
      setMuted(true);
    } else if (muted) {
      setMuted(false);
    }
  };

  const handleLogin = () => {
    if (audioRef.current && audioRef.current.paused) {
      if (audioRef.current.currentTime < 30) {
        audioRef.current.currentTime = 30;
      }
      audioRef.current.muted = false;
      audioRef.current.volume = volume;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      setMuted(false);
    }

    if (email === "admin@email.com" && senha === "123456") {
      onLogin();
    } else {
      const novaTentativa = tentativas + 1;
      setTentativas(novaTentativa);

      if (novaTentativa >= 2) {
        navigate("/bloqueado");
      } else {
        alert("Credenciais inválidas. Tentativa " + novaTentativa);
      }
    }
  };

  return (
    <>
      {/* Vídeo de fundo */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          zIndex: -2,
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        >
          <source src="/3milhoes" type="video/mp3" />
          Seu navegador não suporta vídeo.
        </video>
      </Box>

      {/* Sobreposição escura para contraste */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.5)",
          zIndex: -1,
        }}
      />

      {/* Login Paper */}
      <Box
        sx={{
          height: "100vh",
          width: "100vw",
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
            width: 380,
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
            sx={{
              fontWeight: 700,
              textShadow: "0 0 10px #3b5998, 0 0 20px #3b5998",
            }}
          >
            Bem-Vindo(a)
          </Typography>

          <Typography variant="subtitle1" textAlign="center" color="#bbb">
            Efetue seu login abaixo:
          </Typography>

          <TextField
            label="E-mail/Usuário"
            placeholder="Digite seu E-mail/Usuário..."
            variant="filled"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              disableUnderline: true,
              sx: { backgroundColor: "#222", borderRadius: 2, color: "white", "& input": { color: "white" } },
            }}
            InputLabelProps={{ sx: { color: "#888" } }}
          />

          <TextField
            label="Senha"
            placeholder="Digite sua senha..."
            type={showPassword ? "text" : "password"}
            variant="filled"
            fullWidth
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            InputProps={{
              disableUnderline: true,
              sx: { backgroundColor: "#222", borderRadius: 2, color: "white", "& input": { color: "white" } },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: "#aaa" }}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            InputLabelProps={{ sx: { color: "#888" } }}
          />

          <Box textAlign="right">
            <Link href="#" underline="hover" color="#888" fontSize={14}>
              Esqueceu a senha?
            </Link>
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={handleLogin}
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
            Login
          </Button>
        </Paper>

        {/* Controle de áudio */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 2,
            width: 200,
            color: muted ? "#666" : "#3b5998",
            filter: muted ? "none" : "drop-shadow(0 0 8px rgba(59, 89, 152, 0.7))",
          }}
        >
          <Tooltip title={muted ? "Ativar som" : "Silenciar"}>
            <IconButton
              onClick={toggleMute}
              sx={{ color: muted ? "#666" : "#3b5998", transition: "color 0.3s ease", "&:hover": { color: "#1d3a7a" } }}
              aria-label={muted ? "Ativar som" : "Silenciar"}
            >
              {muted ? <VolumeOff /> : <VolumeUp />}
            </IconButton>
          </Tooltip>

          <Slider
            value={volume}
            onChange={handleVolumeChange}
            min={0}
            max={1}
            step={0.01}
            sx={{ color: "#3b5998", "& .MuiSlider-thumb": { borderRadius: "50%" } }}
          />
        </Box>
      </Box>
    </>
  );
}
