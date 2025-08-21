// Utilitário para limitar requisições à API

// Armazena a última vez que cada endpoint foi chamado
const lastRequestTime: Record<string, number> = {};

// Armazena as promessas pendentes para cada endpoint
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pendingRequests: { [key: string]: Promise<any> } = {};

// Intervalo mínimo entre requisições para o mesmo endpoint (em ms)
const MIN_REQUEST_INTERVAL = 2000; // 2 segundos

/**
 * Limita as requisições para o mesmo endpoint, reutilizando promessas pendentes
 * ou respeitando um intervalo mínimo entre chamadas
 * 
 * @param endpoint Identificador único do endpoint
 * @param requestFn Função que realiza a requisição
 * @returns Resultado da requisição
 */
export async function limitRequest<T>(
  endpoint: string,
  requestFn: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  // Se já existe uma requisição pendente para este endpoint, retorna a mesma promessa
  if (endpoint in pendingRequests) {
    console.log(`[RequestLimiter] Reutilizando requisição pendente para ${endpoint}`);
    return pendingRequests[endpoint] as Promise<T>;
  }

  // Verifica se já passado tempo suficiente desde a última requisição
  const lastTime = lastRequestTime[endpoint] || 0;
  if (now - lastTime < MIN_REQUEST_INTERVAL) {
    console.log(`[RequestLimiter] Intervalo muito curto para ${endpoint}, retornando última resposta ou aguardando`);
    // Aqui poderíamos implementar uma fila de requisições se necessário

    // Por enquanto, esperamos o tempo necessário
    await new Promise(resolve =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - (now - lastTime))
    );
  }

  // Realiza a requisição
  try {
    console.log(`[RequestLimiter] Iniciando requisição para ${endpoint}`);

    // Armazena a promessa para reutilização
    const promise = requestFn();
    pendingRequests[endpoint] = promise;

    // Atualiza o timestamp da última requisição
    lastRequestTime[endpoint] = Date.now();

    // Aguarda a requisição terminar
    const result = await promise;

    // Remove a promessa pendente após um breve intervalo
    // (permitir que múltiplos consumidores simultâneos aproveitam a mesma requisição)
    setTimeout(() => {
      delete pendingRequests[endpoint];
    }, 300);

    return result;
  } catch (error) {
    // Remove a promessa pendente em caso de erro
    delete pendingRequests[endpoint];
    throw error;
  }
}

/**
 * Registra uma resposta bem-sucedida para um endpoint sem fazer uma nova requisição
 * Útil para atualizar o cache após operações de criação/edição que já sabem o resultado
 * 
 * @param endpoint Identificador único do endpoint
 */
export function registerSuccessfulRequest(endpoint: string): void {
  lastRequestTime[endpoint] = Date.now();
}
