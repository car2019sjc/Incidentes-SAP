import OpenAI from 'openai';
import { OPENAI_CONFIG, isOpenAIConfigured, OPENAI_ERRORS } from '../config/openai';
import { Incident } from '../types/incident';

// Interface para a resposta da análise
export interface AIAnalysisResponse {
  causaRaiz: string;
  evidenciaContextual: string;
  acaoCorretiva: string;
  acaoPreventiva: string;
  sugestaoAdicional?: string;
}

class OpenAIService {
  private client: OpenAI | null = null;

  constructor() {
    if (isOpenAIConfigured()) {
      this.client = new OpenAI({
        apiKey: OPENAI_CONFIG.apiKey,
        dangerouslyAllowBrowser: true // Necessário para uso no browser
      });
    }
  }

  // Verificar se o serviço está configurado
  isConfigured(): boolean {
    return this.client !== null && isOpenAIConfigured();
  }

  // Criar prompt estruturado para análise
  private createAnalysisPrompt(incident: Incident, selectedString: string, category: string): string {
    return `Você é um especialista SAP em análise de causa raiz de incidentes.

Abaixo está a descrição de um incidente reportado na plataforma ServiceNow:

Incidente ID: ${incident.number}
Prioridade: ${incident.priority}
Descrição e anotações: ${incident.description || 'N/A'}
String-chave detectada: ${selectedString}
Categoria técnica: ${category}
Estado: ${incident.state}
Assignment Group: ${incident.assignment_group}
Opened: ${incident.opened}
Resolved: ${incident.resolved || 'N/A'}

Por favor, faça uma análise detalhada e estruturada da causa raiz, considerando as melhores práticas de suporte e sustentação SAP:

1. **Causa raiz provável** — explique o que provavelmente causou o problema com base na string e na descrição.
2. **Evidência contextual** — destaque trechos da descrição que apoiam sua análise.
3. **Ação corretiva** — o que deve ser feito para resolver o problema neste caso específico.
4. **Ação preventiva** — o que pode ser feito para evitar recorrência.
5. **Sugestão adicional (se aplicável)** — práticas de melhoria, automação ou revisão de processos relacionadas.

Responda de forma objetiva e técnica, como se estivesse alimentando um sistema de diagnóstico automatizado.

IMPORTANTE: Responda APENAS com um JSON válido no seguinte formato, sem texto adicional:
{
  "causaRaiz": "sua análise da causa raiz",
  "evidenciaContextual": "evidências que apoiam a análise",
  "acaoCorretiva": "ações para resolver o problema",
  "acaoPreventiva": "ações para prevenir recorrência",
  "sugestaoAdicional": "sugestões adicionais (opcional)"
}`;
  }

  // Gerar análise usando OpenAI
  async generateAnalysis(
    incident: Incident, 
    selectedString: string, 
    category: string
  ): Promise<AIAnalysisResponse> {
    if (!this.isConfigured()) {
      throw new Error(OPENAI_ERRORS.NO_API_KEY);
    }

    try {
      const prompt = this.createAnalysisPrompt(incident, selectedString, category);

      const completion = await this.client!.chat.completions.create({
        model: OPENAI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista SAP em análise de causa raiz de incidentes. Responda sempre em português brasileiro e em formato JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: OPENAI_CONFIG.maxTokens,
        temperature: OPENAI_CONFIG.temperature,
        response_format: { type: 'json_object' }
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error(OPENAI_ERRORS.INVALID_RESPONSE);
      }

      // Parse da resposta JSON
      const analysis = JSON.parse(response) as AIAnalysisResponse;
      
      // Validar campos obrigatórios
      if (!analysis.causaRaiz || !analysis.evidenciaContextual || !analysis.acaoCorretiva || !analysis.acaoPreventiva) {
        throw new Error('Resposta da IA incompleta');
      }

      return analysis;

    } catch (error) {
      console.error('Erro ao gerar análise com OpenAI:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          throw new Error(OPENAI_ERRORS.NO_API_KEY);
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error(OPENAI_ERRORS.NETWORK_ERROR);
        } else if (error.message.includes('JSON')) {
          throw new Error(OPENAI_ERRORS.INVALID_RESPONSE);
        }
      }
      
      throw new Error(OPENAI_ERRORS.API_ERROR);
    }
  }

  // Gerar análise simulada (fallback quando OpenAI não está configurada)
  async generateMockAnalysis(
    incident: Incident, 
    selectedString: string, 
    category: string
  ): Promise<AIAnalysisResponse> {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      causaRaiz: `Com base na string "${selectedString}" e categoria "${category}", a causa raiz provável está relacionada a problemas de configuração ou conectividade no sistema SAP. A prioridade ${incident.priority} indica o impacto significativo no negócio. Este tipo de erro geralmente ocorre quando há falhas na comunicação entre módulos ou problemas de autorização.`,
      
      evidenciaContextual: `A presença da string "${selectedString}" na descrição sugere falhas específicas no módulo/componente relacionado. O assignment group "${incident.assignment_group}" e o tempo decorrido desde a abertura indicam a complexidade técnica envolvida. O estado atual "${incident.state}" mostra o progresso da resolução.`,
      
      acaoCorretiva: `1. Verificar configurações do sistema SAP relacionadas à "${selectedString}"\n2. Validar conectividade e permissões de usuário\n3. Executar transações de diagnóstico específicas (SM21, ST22, SLG1)\n4. Analisar logs de sistema para identificar erros relacionados\n5. Aplicar correções ou patches necessários conforme documentação SAP`,
      
      acaoPreventiva: `1. Implementar monitoramento proativo para "${selectedString}"\n2. Criar alertas preventivos no Solution Manager\n3. Estabelecer procedimentos de manutenção regular\n4. Treinar equipe em troubleshooting específico para categoria "${category}"\n5. Documentar procedimentos de resolução para casos similares`,
      
      sugestaoAdicional: `Considerar implementação de automação para verificações de saúde do sistema relacionadas à categoria "${category}". Avaliar a criação de dashboards de monitoramento em tempo real e estabelecer métricas de SLA específicas para este tipo de incidente. Revisar processos de change management que podem impactar esta área.`
    };
  }
}

// Instância singleton do serviço
export const openAIService = new OpenAIService();
