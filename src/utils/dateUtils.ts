// Arquivo de utilidades para manipulação e filtragem de datas

// Antes tínhamos uma data de referência (25/06/2025), agora consideramos todos os dados
export const REFERENCE_DATE = new Date(2000, 0, 1, 0, 0, 0, 0); // Data antiga para incluir todos os dados

/**
 * Função modificada para incluir todas as datas
 * Originalmente verificava se uma data era posterior à data de referência
 * Agora retorna sempre true para incluir todas as transações
 * @returns true (sempre)
 */
export const isAfterOrEqualReferenceDate = (): boolean => {
  return true;
};

/**
 * Anteriormente esta função filtrava transações por data de referência
 * Agora retorna todas as transações sem filtragem
 * @param transactions Array de transações
 * @returns O mesmo array de transações sem filtragem
 */
export const filterTransactionsFromReferenceDate = <T extends { created_at: number }>(
  transactions: T[]
): T[] => {
  if (!Array.isArray(transactions)) return [];

  // Retorna todas as transações sem filtrar por data
  return transactions;
};
