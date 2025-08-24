import { v4 as uuidv4 } from 'uuid';

export interface RemarketingMessage {
  id: string;
  titulo: string;
  tipo: "Texto" | "Vídeo" | "Imagem";
  mensagem: string;
  botoes: string[];
  status: "ativo" | "inativo";
}

// Helper to create new message with ID
export const createNewRemarketingMessage = (
  data: Omit<RemarketingMessage, 'id'>
): RemarketingMessage => ({
  ...data,
  id: uuidv4(),
});