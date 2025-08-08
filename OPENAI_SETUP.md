# Configuração do Agente de IA OpenAI

## Visão Geral

O Dashboard SAP agora inclui um **Agente de IA especializado em análise de causa raiz** que utiliza a API da OpenAI para fornecer análises detalhadas e estruturadas de incidentes SAP.

## Funcionalidades

✅ **Análise de Causa Raiz Automatizada**: IA especializada em SAP analisa incidentes e identifica causas prováveis
✅ **Evidência Contextual**: Destaca trechos relevantes da descrição do incidente
✅ **Ações Corretivas**: Sugere passos específicos para resolver o problema
✅ **Ações Preventivas**: Recomenda medidas para evitar recorrência
✅ **Sugestões Adicionais**: Práticas de melhoria e automação

## Como Usar

1. **Abrir Detalhes do Incidente**: Clique em qualquer incidente na tabela
2. **Iniciar Análise de IA**: Clique no botão "🤖 Análise IA" no modal de detalhes
3. **Aguardar Processamento**: A IA analisará o incidente (2-5 segundos)
4. **Revisar Análise**: Examine as recomendações estruturadas
5. **Copiar Resultados**: Use o botão "Copiar Análise" para documentar

## Configuração da API OpenAI

### Passo 1: Obter API Key da OpenAI

1. Acesse [platform.openai.com](https://platform.openai.com)
2. Faça login em sua conta OpenAI
3. Navegue para **API Keys** no menu lateral
4. Clique em **"Create new secret key"**
5. Copie a chave gerada (formato: `sk-...`)

### Passo 2: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```bash
# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-sua_chave_aqui

# Optional: Configurações Avançadas
VITE_OPENAI_MODEL=gpt-4
VITE_OPENAI_MAX_TOKENS=2000
VITE_OPENAI_TEMPERATURE=0.3
```

### Passo 3: Reiniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

## Modo de Operação

### ✅ Com OpenAI Configurada
- **Status**: "OpenAI Configurada" (verde)
- **Funcionamento**: Utiliza GPT-4 para análise real
- **Qualidade**: Análise especializada baseada em conhecimento SAP
- **Tempo**: 3-5 segundos por análise

### ⚠️ Modo Simulação (Sem API Key)
- **Status**: "Modo Simulação" (amarelo)
- **Funcionamento**: Utiliza algoritmo interno
- **Qualidade**: Análise baseada em padrões conhecidos
- **Tempo**: 2 segundos por análise

## Custos da OpenAI

- **Modelo**: GPT-4 (recomendado para análise técnica)
- **Custo Estimado**: ~$0.03-0.06 por análise
- **Tokens por Análise**: ~1000-2000 tokens
- **Controle**: Configure `VITE_OPENAI_MAX_TOKENS` para limitar custos

## Personalização

### Modelos Suportados
```bash
VITE_OPENAI_MODEL=gpt-4          # Melhor qualidade (recomendado)
VITE_OPENAI_MODEL=gpt-4-turbo    # Mais rápido
VITE_OPENAI_MODEL=gpt-3.5-turbo  # Mais econômico
```

### Temperatura (Criatividade)
```bash
VITE_OPENAI_TEMPERATURE=0.1  # Mais conservador
VITE_OPENAI_TEMPERATURE=0.3  # Equilibrado (padrão)
VITE_OPENAI_TEMPERATURE=0.7  # Mais criativo
```

## Segurança

⚠️ **IMPORTANTE**: 
- Nunca commite arquivos `.env` no Git
- Use variáveis de ambiente em produção
- A API key é processada no browser (configuração `dangerouslyAllowBrowser: true`)
- Para produção, considere usar um backend proxy

## Troubleshooting

### Erro: "API Key da OpenAI não configurada"
- Verifique se o arquivo `.env` existe na raiz do projeto
- Confirme que a variável `VITE_OPENAI_API_KEY` está definida
- Reinicie o servidor de desenvolvimento

### Erro: "Erro de rede ao conectar com a OpenAI"
- Verifique sua conexão com a internet
- Confirme se a API key é válida
- Verifique se há créditos disponíveis na conta OpenAI

### Análise Incompleta
- Verifique se `VITE_OPENAI_MAX_TOKENS` não está muito baixo
- Aumente o valor para 2000-4000 se necessário

## Exemplo de Análise Gerada

```
🔍 CAUSA RAIZ PROVÁVEL:
Com base na string "connection timeout" e categoria "Network", 
a causa raiz provável está relacionada a problemas de conectividade...

📋 EVIDÊNCIA CONTEXTUAL:
A presença da string "connection timeout" na descrição sugere falhas...

🔧 AÇÃO CORRETIVA:
1. Verificar configurações de rede SAP
2. Validar conectividade RFC
3. Executar transação SM59 para testar conexões...

🛡️ AÇÃO PREVENTIVA:
1. Implementar monitoramento proativo de conexões
2. Estabelecer alertas de timeout...

💡 SUGESTÃO ADICIONAL:
Considerar implementação de connection pooling e revisão...
```

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console do navegador
2. Consulte a documentação da OpenAI
3. Entre em contato com o time de desenvolvimento
