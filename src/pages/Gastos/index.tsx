import { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Button, Divider, useMediaQuery, useTheme, Select, MenuItem, FormControl } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AdicionarDespesaModal } from './AdicionarDespesaModal';
import { AdicionarParceiroModal } from './AdicionarParceiroModal';
import { ListarParceirosModal } from './ListarParceirosModal';
import { ListarDespesasModal } from './ListarDespesasModal';
import { useApi } from '../../hooks/useApi';

import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import LaptopChromebookIcon from '@mui/icons-material/LaptopChromebook';

interface CustomPieLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  value: number;
  suffix: string;
}

const RADIAN = Math.PI / 180;

const renderCustomPieLabel = (props: CustomPieLabelProps) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, value, suffix } = props;
  const radiusFactor = 0.5;
  const radius = innerRadius + (outerRadius - innerRadius) * radiusFactor;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Não renderizar o rótulo se o valor for 0 ou muito pequeno
  if (value === 0 || (percent < 0.05 && value < 0.5)) {
    return null;
  }

  let fontSize = 11;
  if (percent < 0.15) {
    fontSize = 9;
  }

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={`${fontSize}px`}
      fontWeight="600"
    >
      {`R$${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}${suffix}`}
    </text>
  );
};

interface Despesa {
  id: string; // ID da despesa (_id da API)
  nome: string; // name da API
  valor: number; // value da API
  tipo: 'Parceria' | 'Desenvolvimento' | 'Design'; // type da API
  data: Date; // created_at da API convertido para Date
  checked: boolean; // Controle de UI
  paid: boolean; // Status se foi pago ou não (paid da API)
  partner_id?: string; // ID do parceiro (partner_id da API)
  partner_name?: string; // Nome do parceiro (partner_name da API)
}

interface Parceiro {
  id: string;
  nome: string;
}

// Interface usada para a comunicação com o ListarParceirosModal
export interface DespesaParceiro {
  id: string;
  nome: string;
  valor: number;
  parceiro: {
    id: string;
    nome: string;
  } | null;
}

export function Gastos() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [openDespesaModal, setOpenDespesaModal] = useState(false);
  const [openParceiroModal, setOpenParceiroModal] = useState(false);
  const [openListarParceirosModal, setOpenListarParceirosModal] = useState(false);
  const [openListarDespesasModal, setOpenListarDespesasModal] = useState(false);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth()); // Mês atual (0-11)
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear()); // Ano atual

  const api = useApi();

  // Lista de meses para o seletor
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Função para carregar dados
  const carregarDados = async () => {
    setLoading(true);
    setError(null);

    try {
      // Carregar despesas
      const despesasResponse = await api.getAllExpenses();
      if (despesasResponse && despesasResponse.data) {
        const despesasData = despesasResponse.data.map((item) => {
          // Usar created_at que vem como timestamp da API
          const dataField = item.created_at;
          const dataConvertida = new Date(dataField);

          return {
            id: item._id,
            nome: item.name,
            valor: item.value,
            tipo: item.type,
            data: dataConvertida,
            checked: false,
            paid: item.paid || false,
            partner_id: item.partner_id,
            partner_name: item.partner_name
          };
        });
        setDespesas(despesasData);
      } else {
        setError("Erro ao carregar despesas");
        console.error("Erro na API de despesas");
      }

      // Carregar parceiros
      const parceirosResponse = await api.getAllPartners();
      if (parceirosResponse && parceirosResponse.data) {
        const parceirosData = parceirosResponse.data.map((item) => ({
          id: item._id,
          nome: item.name
        }));
        setParceiros(parceirosData);
      } else {
        console.error("Erro na API de parceiros");
      }
    } catch (err) {
      setError("Erro ao carregar dados");
      console.error("Erro geral:", err);
    } finally {
      setLoading(false);
    }
  };

  // Efeito para carregar dados na inicialização
  useEffect(() => {
    // Função para inicializar os dados
    const inicializar = async () => {
      await carregarDados();
    };
    inicializar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (value: number) => {
    // Limitar o valor máximo para evitar números muito grandes
    const maxValue = 999999999999; // 999 bilhões
    const limitedValue = Math.min(value, maxValue);

    if (limitedValue >= 1000000) {
      // Formato para milhões (M)
      return `R$ ${(limitedValue / 1000000).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}M`;
    } else if (limitedValue >= 1000) {
      // Formato para milhares (K)
      return `R$ ${(limitedValue / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}K`;
    }
    // Formato para valores abaixo de mil
    return `R$ ${limitedValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // Filtrar despesas por mês selecionado
  const despesasFiltradas = despesas.filter(despesa => {
    const dataExpense = new Date(despesa.data);
    const mesAtual = dataExpense.getMonth();
    const anoAtual = dataExpense.getFullYear();

    return mesAtual === mesSelecionado && anoAtual === anoSelecionado;
  });

  // Cálculos para os cards e gráfico baseados nas despesas filtradas
  const totalParcerias = despesasFiltradas
    .filter(d => d.tipo === 'Parceria')
    .reduce((acc, d) => acc + d.valor, 0);

  const totalDesenvolvimento = despesasFiltradas
    .filter(d => d.tipo === 'Desenvolvimento')
    .reduce((acc, d) => acc + d.valor, 0);

  const totalDesign = despesasFiltradas
    .filter(d => d.tipo === 'Design')
    .reduce((acc, d) => acc + d.valor, 0);

  const totalEquipes = totalDesenvolvimento + totalDesign; // Só design e desenvolvimento são equipes

  // Função para converter valores para o formato do gráfico (em K ou M)
  const convertValueForChart = (value: number) => {
    if (value >= 1000000) {
      return value / 1000000; // Converter para M
    }
    return value / 1000; // Converter para K
  };

  // Função para obter o sufixo do valor (K ou M)
  const getValueSuffix = (value: number) => {
    return value >= 1000000 ? 'M' : 'K';
  };

  const dynamicPieData = [
    {
      name: 'Parcerias',
      value: convertValueForChart(totalParcerias),
      suffix: getValueSuffix(totalParcerias),
      color: '#1361c7ff'
    },
    {
      name: 'Desenvolvimento',
      value: convertValueForChart(totalDesenvolvimento),
      suffix: getValueSuffix(totalDesenvolvimento),
      color: '#1361c7ff'
    },
    {
      name: 'Design',
      value: convertValueForChart(totalDesign),
      suffix: getValueSuffix(totalDesign),
      color: '#1361c7ff'
    },
  ].filter(item => item.value > 0); // Filtrar itens com valor 0 para não aparecer no gráfico


  // Função a ser chamada pelo modal para adicionar despesa
  const handleAddDespesa = async (novaDespesaData: { nome: string; valor: number; tipo: 'Parceria' | 'Desenvolvimento' | 'Design'; partner_id?: string }) => {
    try {
      // Encontrar o nome do parceiro se um parceiro foi selecionado
      let partner_name;
      if (novaDespesaData.partner_id) {
        const parceiro = parceiros.find(p => p.id === novaDespesaData.partner_id);
        partner_name = parceiro ? parceiro.nome : undefined;
      }

      const response = await api.createExpense({
        name: novaDespesaData.nome,
        type: novaDespesaData.tipo,
        value: novaDespesaData.valor,
        partner_id: novaDespesaData.partner_id,
        partner_name: partner_name // Adiciona o nome do parceiro junto com o ID
      });

      if (response && response.data) {
        // Obter a data de criação da nova despesa usando o campo created_at da API
        const dataField = response.data.created_at; // Timestamp da API
        const dataCriacao = new Date(dataField);

        // Atualizar o mês e ano selecionados para corresponder à data da nova despesa
        // Isso fará com que a interface mostre a nova despesa imediatamente
        setMesSelecionado(dataCriacao.getMonth());
        setAnoSelecionado(dataCriacao.getFullYear());

        // Recarregar todos os dados para garantir que temos as informações mais atualizadas
        // Isso resolve o problema de não ver a despesa adicionada imediatamente
        await carregarDados();

        // Despesa adicionada com sucesso
      } else {
        console.error('Erro ao adicionar despesa');
      }
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
    }
  };

  // Função chamada quando um parceiro é adicionado com sucesso
  const handleParceiroAdicionado = () => {
    // Recarregar a lista de parceiros
    carregarDados();
  };

  // Função para excluir um parceiro
  const handleExcluirParceiro = async (id: string) => {
    try {
      await api.deletePartner(id);
      await carregarDados();
    } catch (error) {
      console.error('Erro ao excluir parceiro:', error);
      setError('Falha ao excluir parceiro. Tente novamente.');
    }
  };

  // Função para excluir uma despesa
  const handleExcluirDespesa = async (id: string) => {
    try {
      await api.deleteExpense(id);
      await carregarDados();
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
      setError('Falha ao excluir despesa. Tente novamente.');
    }
  };

  // Função para atualizar o status paid de uma despesa
  const handleUpdatePaidStatus = async (id: string, paid: boolean) => {
    try {
      await api.updateExpensePaidStatus(id, paid);
      // Recarregar dados para refletir a mudança
      await carregarDados();
      // Status de pagamento atualizado
    } catch (error) {
      console.error('Erro ao atualizar status de pagamento:', error);
      throw error; // Propagar o erro para que o componente modal possa tratá-lo
    }
  };


  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      {/* Modais */}
      <AdicionarDespesaModal
        open={openDespesaModal}
        onClose={() => setOpenDespesaModal(false)}
        onAddDespesa={handleAddDespesa}
        parceiros={parceiros}
      />

      <AdicionarParceiroModal
        open={openParceiroModal}
        onClose={() => setOpenParceiroModal(false)}
        onSuccess={handleParceiroAdicionado}
      />

      {/* Modal para listar parceiros */}
      <ListarParceirosModal
        open={openListarParceirosModal}
        onClose={() => setOpenListarParceirosModal(false)}
        despesas={despesasFiltradas.map(d => ({
          id: d.id,
          nome: d.nome,
          valor: d.valor,
          parceiro: d.partner_id ? {
            id: d.partner_id,
            // Usar o partner_name se existir, caso contrário buscar na lista de parceiros
            nome: d.partner_name || parceiros.find(p => p.id === d.partner_id)?.nome || 'Parceiro Desconhecido'
          } : null
        }))}
        parceiros={parceiros} // Passando todos os parceiros
        onDeleteParceiro={handleExcluirParceiro}
        onDeleteDespesa={handleExcluirDespesa}
      />

      {/* Modal para gerenciar despesas */}
      <ListarDespesasModal
        open={openListarDespesasModal}
        onClose={() => setOpenListarDespesasModal(false)}
        despesas={despesasFiltradas.map(d => ({
          ...d,
          parceiro: d.partner_id ? {
            id: d.partner_id,
            // Usar o partner_name se existir, caso contrário buscar na lista de parceiros
            nome: d.partner_name || parceiros.find(p => p.id === d.partner_id)?.nome || 'Parceiro Desconhecido'
          } : undefined
        }))}
        onUpdatePaidStatus={handleUpdatePaidStatus}
      />

      {/* Cabeçalho */}
      <Typography variant="h4" fontWeight={600} mb={2} px={1} marginTop={6}>
        Gastos
      </Typography>

      {/* Mensagem de erro */}
      {error && (
        <Paper sx={{
          mb: 2,
          p: 2,
          bgcolor: 'rgba(255, 0, 0, 0.1)',
          border: '1px solid #ff5252',
          color: '#ff5252',
          borderRadius: '8px'
        }}>
          <Typography>{error}</Typography>
          <Button variant="text" color="error" onClick={carregarDados} sx={{ mt: 1 }}>
            Tentar novamente
          </Button>
        </Paper>
      )}

      {/* Indicador de carregamento */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <Typography color="text.secondary">Carregando dados...</Typography>
        </Box>
      ) : (
        <Grid container spacing={isMobile ? 2 : 3} alignItems="flex-start">
          {/* Coluna Esquerda */}
          <Grid item xs={12} sm={6} md={3}>
            <Box display="flex" flexDirection="column" gap={2}>
              {/* Botões para adicionar despesa e parceiro */}
              <Box
                display="flex"
                flexDirection={{ xs: 'column', sm: 'column' }}
                gap={2}
                mb={1}
                sx={{ width: '100%' }}
              >
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  sx={{
                    flexGrow: { xs: 1, sm: 0 },
                    display: 'flex',
                    height: '42px',
                    padding: '0px 14px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '4px',
                    border: '1px solid #1361c7ff',
                    color: '#1361c7ff',
                    textAlign: 'center',
                    fontFamily: 'Lato',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '14px',
                    textTransform: 'none',
                    width: '100%',
                    '&:hover': {
                      border: '1px solid #0e69dfff',
                      backgroundColor: 'rgba(124, 58, 237, 0.04)'
                    }
                  }}
                  onClick={() => setOpenParceiroModal(true)}
                >
                  Adicionar Parceiro
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  sx={{
                    display: 'flex',
                    height: '42px',
                    padding: '0px 14px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '4px',
                    border: '1px solid #1361c7ff',
                    color: '#1361c7ff',
                    textAlign: 'center',
                    fontFamily: 'Lato',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '14px',
                    textTransform: 'none',
                    width: '100%',
                    '&:hover': {
                      border: '1px solid #0e69dfff',
                      backgroundColor: 'rgba(61, 145, 255, 0.04)'
                    }
                  }}
                  onClick={() => setOpenDespesaModal(true)}
                >
                  Adicionar Despesa
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<CheckBoxOutlinedIcon />}
                  sx={{
                    display: 'flex',
                    height: '42px',
                    padding: '0px 14px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: '4px',
                    border: '1px solid #1361c7ff',
                    color: '#1361c7ff',
                    textAlign: 'center',
                    fontFamily: 'Lato',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    lineHeight: '14px',
                    textTransform: 'none',
                    width: '100%',
                    '&:hover': {
                      border: '1px solid #0e69dfff',
                      backgroundColor: 'rgba(79, 195, 247, 0.04)'
                    }
                  }}
                  onClick={() => setOpenListarDespesasModal(true)}
                >
                  Marcar como Pago
                </Button>
              </Box>
              {/* Card Top Parceiros */}
              <Paper sx={{
                display: 'flex',
                flexDirection: 'column',
                padding: { xs: '14px', sm: '18px' },
                alignItems: 'flex-start',
                gap: { xs: '18px', sm: '24px' },
                borderRadius: '8px',
                border: '1px solid #373B48',
                background: 'rgba(17, 17, 17, 0.36)',
                mb: 1
              }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" width="100%" flexWrap="wrap">
                  <Box display="flex" alignItems="center" gap={1}>
                    
                 <EmojiEventsOutlinedIcon fontSize="inherit"
                 sx={{
                fontSize: isMobile ? 25 : 45,
                color: '#1a45a3ff' // dourado, remete a coroa/premiação
                    }}
                  />
                  <Typography fontWeight={500}>Top Parceiros</Typography>
                  </Box>
                  <Button
                    startIcon={<VisibilityOutlinedIcon />}
                    variant="text"
                    size="small"
                    onClick={() => setOpenListarParceirosModal(true)}
                    sx={{
                      color: '#4678b9ff',
                      '&:hover': {
                        backgroundColor: 'rgba(61, 145, 255, 0.04)'
                      },
                      mt: isMobile ? 1 : 0,
                      ml: isMobile ? 'auto' : 0
                    }}
                  >
                    Ver todos
                  </Button>
                </Box>
                <Divider sx={{ mb: 1, width: '100%' }} />
                <Box display="flex" flexDirection="column" gap={1} width="100%">
                  {parceiros.length === 0 && (
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      Nenhum parceiro cadastrado.
                    </Typography>
                  )}
                  {parceiros.length > 0 ? (
                    // Agrupar as despesas por parceiro e mostrar os top 3
                    parceiros
                      .map(parceiro => {
                        // Encontrar todas as despesas associadas a este parceiro no mês selecionado
                        const despesasDoParceiro = despesasFiltradas.filter(d => d.partner_id === parceiro.id);

                        return {
                          ...parceiro,
                          despesas: despesasDoParceiro
                        };
                      })
                      // Filtrar apenas parceiros que têm despesas
                      .filter(p => p.despesas.length > 0)
                      // Ordenar por valor total de despesas, de forma decrescente
                      .sort((a, b) => {
                        const totalA = a.despesas.reduce((sum, d) => sum + d.valor, 0);
                        const totalB = b.despesas.reduce((sum, d) => sum + d.valor, 0);
                        return totalB - totalA;
                      })
                      .slice(0, 3)
                      .map((parceiro, index) => (
                        <Box
                          key={parceiro.id}
                          display="flex"
                          flexDirection="column"
                          width="100%"
                          py={0.8}
                          sx={{
                            borderLeft: index === 0 ? '3px solid #FFD700' : index === 1 ? '3px solid #C0C0C0' : index === 2 ? '3px solid #CD7F32' : 'none',
                            pl: 1,
                            borderRadius: '4px',
                            bgcolor: 'rgba(255, 255, 255, 0.03)'
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                            <Box>
                              <Typography noWrap sx={{
                                maxWidth: { xs: '100%', sm: '120px', md: '150px' },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontWeight: 600
                              }}>
                                {parceiro.nome}
                              </Typography>
                              {index === 0 && <Typography variant="caption" color="#FFD700">Top parceiro</Typography>}
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {parceiro.despesas.length} {parceiro.despesas.length === 1 ? 'despesa' : 'despesas'}
                            </Typography>
                          </Box>

                          {/* Lista das despesas do parceiro */}
                          <Box sx={{ ml: 1 }}>
                            {parceiro.despesas
                              .slice(0, 2) // Mostrar apenas as 2 primeiras despesas para não sobrecarregar a interface
                              .map((despesa) => (
                                <Box
                                  key={despesa.id}
                                  display="flex"
                                  justifyContent="space-between"
                                  alignItems="center"
                                  py={0.3}
                                >
                                  <Typography variant="body2" noWrap sx={{
                                    maxWidth: { xs: '120px', sm: '80px', md: '110px' },
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontSize: '0.75rem'
                                  }}>
                                    {despesa.nome}
                                  </Typography>
                                  <Typography variant="body2" fontSize="0.75rem" fontWeight={600} color="text.secondary">
                                    {formatCurrency(despesa.valor)}
                                  </Typography>
                                </Box>
                              ))
                            }
                            {parceiro.despesas.length > 2 && (
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5, display: 'block', mt: 0.3 }}>
                                +{parceiro.despesas.length - 2} {parceiro.despesas.length - 2 === 1 ? 'outra' : 'outras'}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                      Adicione parceiros para visualizá-los aqui.
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Box>
          </Grid>
          {/* Coluna Central */}
          <Grid item xs={12} sm={6} md={5}>
            <Box display="flex" flexDirection="column" gap={2}>
              {/* Card Despesas Parcerias */}
              <Paper sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                minHeight: { xs: '130px', sm: '92px' },
                borderRadius: '8px',
                border: '1px solid #373B48',
                background: 'rgba(17, 17, 17, 0.36)',
                p: { xs: 1.5, sm: 2 },
                mb: 2
              }}>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  width="100%"
                  justifyContent={{ xs: 'center', sm: 'flex-start' }}
                  mb={{ xs: 1, sm: 0 }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                   <HandshakeOutlinedIcon
                     fontSize="inherit"
                     sx={{
                    fontSize: isMobile ? 25 : 45,
                    color: '#1a45a3ff' 
                    }}
                   />
                  </Box>

                  <Typography fontWeight={500}>Despesas Parcerias</Typography>
                </Box>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  ml={{ xs: 0, sm: 3 }}
                  textAlign={{ xs: 'center', sm: 'left' }}
                >
                  {formatCurrency(totalParcerias)}
                </Typography>
              </Paper>

              {/* Card Despesas Equipes */}
              <Paper sx={{
                display: 'flex',
                flexDirection: 'column',
                padding: { xs: '14px', sm: '18px' },
                borderRadius: '8px',
                border: '1px solid #373B48',
                background: 'rgba(17, 17, 17, 0.36)',
                mb: 2
              }}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <LaptopChromebookIcon
                      fontSize="inherit"
                      sx={{
                      fontSize: isMobile ? 25 : 45,
                      color: '#1a45a3ff' // ou outra cor que combine com seu design
                     }}
                  />
                  <Box>
                    <Typography fontWeight={500}>Despesas Equipes</Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {formatCurrency(totalEquipes)}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {/* Detalhamento das despesas de equipes */}
                <Box display="flex" flexDirection="column" gap={1.5}>
                  {/* Desenvolvimento */}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    flexDirection={isMobile ? "column" : "row"}
                    alignItems={isMobile ? "flex-start" : "center"}
                    gap={isMobile ? 0.5 : 0}
                  >
                    <Typography variant="body1">Desenvolvimento</Typography>
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      color="#ffffffff"
                      alignSelf={isMobile ? "flex-end" : "auto"}
                    >
                      {formatCurrency(totalDesenvolvimento)}
                    </Typography>
                  </Box>

                  {/* Design */}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    flexDirection={isMobile ? "column" : "row"}
                    alignItems={isMobile ? "flex-start" : "center"}
                    gap={isMobile ? 0.5 : 0}
                  >
                    <Typography variant="body1">Design</Typography>
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      color="#ffffffff"
                      alignSelf={isMobile ? "flex-end" : "auto"}
                    >
                      {formatCurrency(totalDesign)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

            </Box>
          </Grid>
          {/* Coluna Direita - Gráfico de Pizza */}
          <Grid item xs={12} sm={12} md={4}>
            <Paper sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: 'auto',
              minHeight: { xs: '280px', sm: '300px' },
              padding: { xs: '20px', sm: '28px' },
              borderRadius: '8px',
              border: '0.6px solid #373B48',
              background: 'rgba(17, 17, 17, 0.36)',
              boxSizing: 'border-box',
              alignItems: 'center',
              justifyContent: 'flex-start'
            }}>
              <Box display="flex" alignItems="center" gap={1} mb={2} width="100%" flexWrap="wrap">
                <Typography fontWeight={700} color="#fff">Visão Geral</Typography>
                <Typography variant="body2" color="text.secondary">Despesas Totais</Typography>
                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                  {/* Seletor de Mês */}
                  <FormControl size="small">
                    <Select
                      value={mesSelecionado}
                      onChange={(e) => setMesSelecionado(Number(e.target.value))}
                      sx={{
                        backgroundColor: '#2a3756',
                        color: '#e0e0e0',
                        fontSize: '0.8rem',
                        minWidth: '100px',
                        height: '28px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none'
                        },
                        '& .MuiSelect-icon': {
                          color: '#e0e0e0'
                        },
                        '&:hover': {
                          backgroundColor: '#3b4a6e'
                        }
                      }}
                    >
                      {meses.map((mes, index) => (
                        <MenuItem key={index} value={index} sx={{ fontSize: '0.8rem' }}>
                          {mes}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Seletor de Ano */}
                  <FormControl size="small">
                    <Select
                      value={anoSelecionado}
                      onChange={(e) => setAnoSelecionado(Number(e.target.value))}
                      sx={{
                        backgroundColor: '#2a3756',
                        color: '#e0e0e0',
                        fontSize: '0.8rem',
                        minWidth: '70px',
                        height: '28px',
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none'
                        },
                        '& .MuiSelect-icon': {
                          color: '#e0e0e0'
                        },
                        '&:hover': {
                          backgroundColor: '#3b4a6e'
                        }
                      }}
                    >
                      {[2024, 2025, 2026].map((ano) => (
                        <MenuItem key={ano} value={ano} sx={{ fontSize: '0.8rem' }}>
                          {ano}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              <Box height={isMobile ? 180 : 220} width="100%" mb={2}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dynamicPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomPieLabel}
                      innerRadius="60%"
                      outerRadius="85%"
                      fill="#8884d8"
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {dynamicPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box width="100%">
                {dynamicPieData.length === 0 && (
                  <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
                    Nenhuma despesa para exibir no gráfico.
                  </Typography>
                )}
                {dynamicPieData.map((entry) => (
                  <Box key={entry.name} display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                    <Box display="flex" alignItems="center">
                      <Box sx={{ width: 10, height: 10, bgcolor: entry.color, borderRadius: '50%', mr: 1 }} />
                      <Typography fontSize="0.875rem" color="text.secondary">{entry.name}</Typography>
                    </Box>
                    <Typography fontSize="0.875rem" fontWeight={600} color="#fff">
                      {`R$ ${entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}${entry.suffix}`}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}