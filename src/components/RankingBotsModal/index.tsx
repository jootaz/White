import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface BotStats {
  bot_id: string;
  bot_name: string;
  sales_count: number;
  revenue: number;
}

interface RankingBotsModalProps {
  open: boolean;
  onClose: () => void;
  bots: BotStats[];
  onBotClick?: (botId: string) => void;
}

export default function RankingBotsModal({
  open,
  onClose,
  bots,
  onBotClick,
}: RankingBotsModalProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const sortedBots = [...bots].sort((a, b) => b.revenue - a.revenue);
  const slicedBots = sortedBots.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const divineBlue = "#6b7a8f";
  const backgroundBlack = "#0f0f0f";
  const textWhite = "#f0f0f0";
  const textGray = "#888c94";
  const borderGray = "#2e3340";

  return (
    <Dialog
      open={open}
      onClose={() => {
        document.body.style.overflow = "auto";
        onClose();
      }}
      fullWidth
      maxWidth="md"
      TransitionProps={{ unmountOnExit: true }}
      PaperProps={{
        sx: {
          bgcolor: backgroundBlack,
          color: textWhite,
          borderRadius: 14,
          border: `1px solid ${borderGray}`,
          userSelect: "none",
          overflow: "hidden",
          boxShadow: "0 6px 24px rgba(0,0,0,0.8)",
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(15,15,15,0.9)",
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 3,
          fontWeight: 700,
          fontSize: "1.9rem",
          borderBottom: `2px solid ${divineBlue}`,
          color: textWhite,
          userSelect: "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          textTransform: "uppercase",
          letterSpacing: 3,
          fontFamily: "'Montserrat', 'Roboto', sans-serif",
          lineHeight: 1,
          mb: 1,
        }}
      >
        Ranking Completo de Bots
        <IconButton
          onClick={() => {
            document.body.style.overflow = "auto";
            onClose();
          }}
          aria-label="fechar"
          sx={{
            color: divineBlue,
            borderRadius: "50%",
            border: `1.7px solid ${divineBlue}`,
            transition: "background-color 0.2s ease, color 0.2s ease",
            "&:hover": {
              backgroundColor: divineBlue,
              color: backgroundBlack,
              boxShadow: "none",
            },
          }}
          size="medium"
        >
          <CloseIcon fontSize="medium" />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: 3,
          maxHeight: "65vh",
          overflowY: "auto",
          bgcolor: "transparent",
          userSelect: "text",
          fontFamily: "'Roboto', sans-serif",
          fontSize: "1rem",
        }}
      >
        <TableContainer
          component={Paper}
          sx={{
            bgcolor: "#16161a",
            boxShadow: "none",
            borderRadius: 10,
            border: `1px solid ${borderGray}`,
            overflowX: "auto",
          }}
        >
          <Table stickyHeader sx={{ tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                {[
                  "Posição",
                  "Nome do Bot",
                  "Vendas Realizadas",
                  "Faturamento (R$)",
                ].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      color: divineBlue,
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      borderBottom: `1px solid ${borderGray}`,
                      userSelect: "none",
                      paddingY: 1.5,
                      textTransform: "uppercase",
                      letterSpacing: 2,
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                    align={header === "Faturamento (R$)" ? "right" : "left"}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {slicedBots.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    sx={{
                      textAlign: "center",
                      py: 6,
                      color: textGray,
                      fontStyle: "italic",
                    }}
                  >
                    Nenhum bot encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                slicedBots.map((bot, idx) => {
                  const position = page * rowsPerPage + idx + 1;
                  const isTop3 = position <= 3;

                  return (
                    <TableRow
                      key={bot.bot_id}
                      onClick={() => onBotClick && onBotClick(bot.bot_id)}
                      sx={{
                        cursor: onBotClick ? "pointer" : "default",
                        bgcolor: idx % 2 === 0 ? "#1c1c22" : "transparent",
                        transition: "background-color 0.2s ease",
                        "&:hover": {
                          bgcolor: "#2f2f38",
                        },
                      }}
                      tabIndex={0}
                    >
                      <TableCell
                        sx={{
                          color: isTop3 ? divineBlue : textWhite,
                          fontWeight: isTop3 ? 700 : 400,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          userSelect: "none",
                          minWidth: 48,
                          paddingY: 1.5,
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            border: isTop3
                              ? `2.7px solid ${divineBlue}`
                              : `2.7px solid transparent`,
                            color: isTop3 ? divineBlue : textWhite,
                            fontWeight: "700",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: "1rem",
                            userSelect: "none",
                          }}
                        >
                          {position}
                        </Box>
                      </TableCell>

                      <TableCell
                        sx={{
                          color: textWhite,
                          fontWeight: isTop3 ? 600 : 400,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 240,
                          paddingY: 1.5,
                          fontSize: "1rem",
                          fontFamily: "'Roboto', sans-serif",
                        }}
                        title={bot.bot_name}
                      >
                        {bot.bot_name || `Bot ${position}`}
                      </TableCell>

                      <TableCell
                        sx={{
                          color: textGray,
                          fontWeight: 400,
                          paddingY: 1.5,
                          fontSize: "0.9rem",
                          fontFamily: "'Roboto', sans-serif",
                        }}
                      >
                        {bot.sales_count}
                      </TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          color: textGray,
                          fontWeight: 400,
                          paddingY: 1.5,
                          fontSize: "0.9rem",
                          fontFamily: "'Roboto', sans-serif",
                        }}
                      >
                        {bot.revenue.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={sortedBots.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          sx={{
            mt: 3,
            color: divineBlue,
            "& .MuiTablePagination-selectIcon": {
              color: divineBlue,
            },
            "& .MuiTablePagination-select": {
              color: divineBlue,
            },
            "& .MuiTablePagination-selectLabel": {
              color: divineBlue,
            },
            "& .MuiTablePagination-actions button": {
              color: divineBlue,
            },
            fontFamily: "'Roboto', sans-serif",
            fontWeight: 600,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
