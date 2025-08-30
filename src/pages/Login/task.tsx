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
  const [volume, setVolume] = useState(0.5);
  const [muted, setMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  // Inicializa áudio MP3 separado
  useEffect(() => {
    audioRef.current = new Audio("/3milhoes.mp3");
    audioRef.current.loop = true;
    audioRef.current.currentTime = 35; // inicia de 35s
    audioRef.current.volume = volume;
    audioRef.current.muted = muted;

    // autoplay silencioso
    audioRef.current.play().catch(() => {});

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Atualiza volume/mute do áudio
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    audioRef.current.muted = muted;
    if (!muted) audioRef.current.play().catch(() => {});
  }, [volume, muted]);

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (muted) {
      setMuted(false);
      if (audioRef.current.currentTime < 30) audioRef.current.currentTime = 35;
      audioRef.current.play().catch(() => {});
    } else {
      setMuted(true);
    }
  };

  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    const vol = Array.isArray(newValue) ? newValue[0] : newValue;
    setVolume(vol);
    if (vol === 0) setMuted(true);
    else if (muted) setMuted(false);
  };

  const handleLogin = () => {
    if (email === "admin@email.com" && senha === "123456") {
      onLogin();
    } else {
      const novaTentativa = tentativas + 1;
      setTentativas(novaTentativa);
      if (novaTentativa >= 2) navigate("/bloqueado");
      else alert("Credenciais inválidas. Tentativa " + novaTentativa);
    }
  };

  return (
    <>
      {/* Vídeo mudo de fundo */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          zIndex: -2,
          // Fallback de background caso o vídeo não carregue
          background: "linear-gradient(45deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => {
            console.error("Erro ao carregar vídeo de fundo");
            setVideoError(true);
            setVideoLoaded(false);
          }}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: videoLoaded ? 1 : 0,
            transition: "opacity 1s ease",
            display: videoLoaded ? "block" : "none",
          }}
        >
          <source src="/3milhoesvideo.mp4" type="video/mp4" />
          <source src="/3milhoesvideo.webm" type="video/webm" />
          Seu navegador não suporta vídeo.
        </video>
      </Box>

      {/* Overlay escura */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.6)",
          zIndex: -1,
        }}
      />

      {/* Container de login */}
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
          color: "#eee",
          userSelect: "none",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            backgroundColor: "#0d0d0dcc",
            color: "white",
            padding: 5,
            width: 380,
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            backdropFilter: "blur(12px)",
            boxShadow: "0 0 30px rgba(0,0,0,0.9)",
          }}
        >
          <Typography
            variant="h4"
            textAlign="center"
            sx={{
              fontWeight: 700,
              textShadow: "0 0 12px #3b5998, 0 0 25px #3b5998",
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
              paddingY: 1.5,
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