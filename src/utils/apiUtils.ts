/**
 * Utilitário para gerenciar a URL da API com base no ambiente
 */

// URL base da API para produção - quando hospedado em domínio de produção
// Agora usando HTTPS como padrão, já que o certificado SSL está configurado
const PROD_API_URL = 'https://api.systemwhite.com.br';

// URL base da API para desenvolvimento - usando o proxy do Vite
const DEV_API_URL = '/api';

// Configurações do ambiente armazenadas na localStorage
const STORAGE_KEY = 'api_settings';

/**
 * Verifica se o hostname atual corresponde a qualquer um dos domínios de produção
 */
function isProductionDomain(hostname: string): boolean {
  const productionDomains = [
    'white-dash.pages.dev',
    'www.white-dash.pages.dev',
    'systemwhite.com.br',
    'www.systemwhite.com.br',
    'dash.systemwhite.com.br'
  ];

  return productionDomains.includes(hostname);
}

/**
 * Define se deve forçar o uso de HTTPS na API
 * Armazena a configuração na localStorage para persistência
 */
export function setForceHttps(force: boolean): void {
  const settings = { forceHttps: force };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

/**
 * Verifica se o HTTPS está forçado nas configurações
 * Esta função está mantida por compatibilidade, mas não é mais necessária
 * já que a API sempre usa HTTPS agora
 */
export function isHttpsForced(): boolean {
  try {
    const settings = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return !!settings.forceHttps;
  } catch {
    return false;
  }
}

/**
 * Retorna a URL base da API adequada para o ambiente atual (produção ou desenvolvimento)
 */
export function getApiBaseUrl(): string {
  // Verifica se está em ambiente de produção
  const isProduction = isProductionDomain(window.location.hostname);

  // Se não estamos em produção, usa o proxy
  if (!isProduction) {
    return DEV_API_URL;
  }

  // Em produção, sempre usa HTTPS já que o certificado SSL está instalado
  return PROD_API_URL;
}
