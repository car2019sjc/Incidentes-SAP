// Configuração da API OpenAI
export const OPENAI_CONFIG = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4',
  maxTokens: parseInt(import.meta.env.VITE_OPENAI_MAX_TOKENS || '2000'),
  temperature: parseFloat(import.meta.env.VITE_OPENAI_TEMPERATURE || '0.3'),
  baseURL: 'https://api.openai.com/v1'
};

// Verificar se a API key está configurada
export const isOpenAIConfigured = (): boolean => {
  return !!OPENAI_CONFIG.apiKey && OPENAI_CONFIG.apiKey.startsWith('sk-');
};

// Mensagens de erro
export const OPENAI_ERRORS = {
  NO_API_KEY: 'API Key da OpenAI não configurada. Configure a variável VITE_OPENAI_API_KEY.',
  API_ERROR: 'Erro ao conectar com a API da OpenAI. Verifique sua configuração e tente novamente.',
  INVALID_RESPONSE: 'Resposta inválida da API da OpenAI.',
  NETWORK_ERROR: 'Erro de rede ao conectar com a OpenAI.'
};
