export interface RemarketingMessage {
  id: string;
  titulo: string;
  tipo: "Texto" | "Vídeo" | "Imagem";
  mensagem: string;
  botoes: string[];
  status: "ativo" | "inativo";
  valor?: number; // ex: preço ou valor opcional
}

export interface Bot {
  id: string;
  nome: string;
  online: boolean;
  totalStarts: number;
  totalPagos: number;
  mensagens: RemarketingMessage[];
}

export interface BotMetrics {
  totalStarts: number;
  totalPagos: number;
  taxaConversao: number;
  historico: {
    data: string;
    starts: number;
    pagos: number;
  }[];
}
