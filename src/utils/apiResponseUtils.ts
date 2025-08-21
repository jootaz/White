/**
 * Utilitários para lidar com respostas da API
 */

import type { ApiResponse } from '../types/api';

/**
 * Processa a resposta da API com tratamento robusto para erros e respostas vazias
 * @param response Resposta do fetch
 * @param defaultData Dados padrão a serem retornados se a resposta estiver vazia
 * @returns Uma resposta API padronizada
 */
export async function processApiResponse<T>(
  response: Response, 
  defaultData?: T
): Promise<ApiResponse<T>> {
  // Verificar status da resposta
  if (!response.ok) {
    console.error(`[apiUtils] Erro HTTP: ${response.status} ${response.statusText}`);
    throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
  }

  // Verificar se há conteúdo na resposta
  const contentType = response.headers.get('content-type');
  
  if (!contentType || !contentType.includes('application/json')) {
    console.warn('[apiUtils] Resposta não é JSON:', contentType);
    return { 
      message: 'Operação concluída com sucesso',
      data: defaultData as T,
      status: response.status 
    };
  }

  // Tentar ler o conteúdo da resposta
  const text = await response.text();
  
  if (!text) {
    console.warn('[apiUtils] Resposta vazia do servidor');
    return { 
      message: 'Operação concluída com sucesso',
      data: defaultData as T,
      status: response.status 
    };
  }

  // Tentar converter para JSON
  try {
    const data = JSON.parse(text);
    return data;
  } catch (jsonError) {
    console.error('[apiUtils] Erro ao analisar JSON:', jsonError, 'Texto:', text);
    throw new Error(`Resposta inválida do servidor: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
  }
}
