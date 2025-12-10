import { GoogleGenAI } from "@google/genai";
import type { Campaign } from '../types';
import { SUPABASE_URL_META, SUPABASE_ANON_KEY_META, SUPABASE_URL_GOOGLE, SUPABASE_ANON_KEY_GOOGLE } from './supabaseClient';


export const fetchCampaignDetails = async (): Promise<Campaign[]> => {
  if (!SUPABASE_URL_META || !SUPABASE_ANON_KEY_META) {
    throw new Error("As credenciais do Supabase não foram configuradas.");
  }

  const requestUrl = `${SUPABASE_URL_META}/rest/v1/métricas_campanhas_meta?select=*`;

  try {
    const response = await fetch(requestUrl, {
      headers: {
        'apikey': SUPABASE_ANON_KEY_META,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY_META}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error fetching campaign details from Supabase:", errorData);
       if (errorData.code === '42P01') {
          throw new Error("Erro: A tabela `métricas_campanhas_meta` não foi encontrada. Verifique o nome da tabela e as permissões de leitura (RLS).");
      }
      throw new Error(`Erro no Supabase: ${errorData.message || 'Não foi possível buscar os dados.'}`);
    }

    const data: any[] = await response.json();

    if (!data || data.length === 0) {
      return [];
    }
    
    return data.map((item, index) => ({
      id: item.id || `supabase-${index}`,
      name: item.campaign_name || 'Campanha Sem Nome',
      spent: Number(item.spend_today ?? 0),
      impressions: Number(item.impressions_today ?? 0),
      clicks: Number(item.clicks_today ?? 0),
      conversions: Number(item.conversions_today ?? 0),
      leads: Number(item.leads_today ?? 0),
      cpa: Number(item.cpa_today ?? 0),
      spentDiff: item.spend_diff != null ? Number(item.spend_diff) : undefined,
      impressionsDiff: item.impressions_diff != null ? Number(item.impressions_diff) : undefined,
      clicksDiff: item.clicks_diff != null ? Number(item.clicks_diff) : undefined,
      conversionsDiff: item.conversions_diff != null ? Number(item.conversions_diff) : undefined,
      leadsDiff: item.leads_diff != null ? Number(item.leads_diff) : undefined,
      cpaDiff: item.cpa_diff != null ? Number(item.cpa_diff) : undefined,
      spentPercent: item.spend_percent != null ? Number(item.spend_percent) : undefined,
      impressionsPercent: item.impressions_percent != null ? Number(item.impressions_percent) : undefined,
      clicksPercent: item.clicks_percent != null ? Number(item.clicks_percent) : undefined,
      conversionsPercent: item.conversions_percent != null ? Number(item.conversions_percent) : undefined,
      leadsPercent: item.leads_percent != null ? Number(item.leads_percent) : undefined,
      cpaPercent: item.cpa_percent != null ? Number(item.cpa_percent) : undefined,
      // Preserve platform if it exists in raw data, or map it
      platform: item.platform || 'Facebook Ads' 
    }));

  } catch (error) {
    console.error("Error in fetchCampaignDetails:", error);
    // Re-lança o erro para ser capturado pelo componente
    throw error;
  }
};

export const fetchAllInsights = async (platform: string = 'meta'): Promise<string[]> => {
  if (platform === 'google') {
    // Buscar insights do Google Ads (Gallant)
    console.log('[fetchAllInsights] Platform Google Ads');
    console.log('[fetchAllInsights] SUPABASE_URL_GOOGLE:', SUPABASE_URL_GOOGLE ? '✓' : '✗');
    console.log('[fetchAllInsights] SUPABASE_ANON_KEY_GOOGLE:', SUPABASE_ANON_KEY_GOOGLE ? '✓' : '✗');
    
    if (!SUPABASE_URL_GOOGLE || !SUPABASE_ANON_KEY_GOOGLE) {
      throw new Error("As credenciais do Supabase Google não foram configuradas para buscar o insight.");
    }

    const requestUrl = `${SUPABASE_URL_GOOGLE}/rest/v1/Gallant_insights?select=insight&order=created_at.desc`;
    console.log('[fetchAllInsights] Requesting:', requestUrl);

    try {
      const response = await fetch(requestUrl, {
        headers: {
          'apikey': SUPABASE_ANON_KEY_GOOGLE,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY_GOOGLE}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching Google Ads insights from Supabase:", errorData);
        throw new Error(`Erro no Supabase ao buscar insights Google: ${errorData.message || 'Não foi possível buscar os dados.'}`);
      }

      const data: any[] = await response.json();

      if (!data || data.length === 0) {
        return [];
      }
      
      return data.map(item => item.insight).filter((insight): insight is string => !!insight);

    } catch (error) {
      console.error("Error in fetchAllInsights (Google):", error);
      throw error;
    }
  } else {
    // Buscar insights do Meta Ads (padrão)
    if (!SUPABASE_URL_META || !SUPABASE_ANON_KEY_META) {
      throw new Error("As credenciais do Supabase não foram configuradas para buscar o insight.");
    }

    // Busca todos os insights da tabela 'output', ordenados pelo mais recente
    const requestUrl = `${SUPABASE_URL_META}/rest/v1/output?select=output&order=created_at.desc`;

    try {
      const response = await fetch(requestUrl, {
        headers: {
          'apikey': SUPABASE_ANON_KEY_META,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY_META}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching insights from Supabase:", errorData);
        throw new Error(`Erro no Supabase ao buscar insights: ${errorData.message || 'Não foi possível buscar os dados.'}`);
      }

      const data: any[] = await response.json();

      if (!data || data.length === 0) {
        return []; // Retorna array vazio se não houver insights
      }
      
      // Retorna um array com o conteúdo de cada 'output'
      return data.map(item => item.output).filter((output): output is string => !!output);

    } catch (error) {
      console.error("Error in fetchAllInsights:", error);
      throw error;
    }
  }
};


interface PeriodSummary {
  totalSpent: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  cpc: number;
  ctr: number;
  cpa: number;
}

export const generateComparisonInsights = async (
  currentPeriodData: PeriodSummary,
  previousPeriodData: PeriodSummary,
  period1Label: string,
  period2Label: string
): Promise<string> => {
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        return "Erro: A chave da API do Google não foi configurada.";
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const formatPercent = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? ' (aumento significativo)' : ' (sem alteração)';
        const change = ((current - previous) / previous) * 100;
        return ` (${change >= 0 ? '+' : ''}${change.toFixed(1)}%)`;
    };

    const prompt = `
        Você é um analista de marketing digital sênior, especialista em análise de dados de performance. Sua tarefa é comparar dois períodos de tempo para um conjunto de campanhas de mídia paga e fornecer um relatório detalhado e acionável em português.

        **Período Atual (${period1Label}):**
        - **Investimento:** R$ ${currentPeriodData.totalSpent.toFixed(2)}
        - **Impressões:** ${currentPeriodData.totalImpressions.toLocaleString('pt-BR')}
        - **Cliques:** ${currentPeriodData.totalClicks.toLocaleString('pt-BR')}
        - **Conversões:** ${currentPeriodData.totalConversions.toLocaleString('pt-BR')}
        - **CPC Médio:** R$ ${currentPeriodData.cpc.toFixed(2)}
        - **CTR Média:** ${currentPeriodData.ctr.toFixed(2)}%
        - **CPA Médio:** R$ ${currentPeriodData.cpa.toFixed(2)}

        **Período Anterior (${period2Label}):**
        - **Investimento:** R$ ${previousPeriodData.totalSpent.toFixed(2)}
        - **Impressões:** ${previousPeriodData.totalImpressions.toLocaleString('pt-BR')}
        - **Cliques:** ${previousPeriodData.totalClicks.toLocaleString('pt-BR')}
        - **Conversões:** ${previousPeriodData.totalConversions.toLocaleString('pt-BR')}
        - **CPC Médio:** R$ ${previousPeriodData.cpc.toFixed(2)}
        - **CTR Média:** ${previousPeriodData.ctr.toFixed(2)}%
        - **CPA Médio:** R$ ${previousPeriodData.cpa.toFixed(2)}

        **Sua Análise Deve Conter (use Markdown):**

        1.  **Diagnóstico Rápido:** Um parágrafo inicial resumindo a performance geral do período atual em comparação com o anterior. A performance melhorou, piorou ou se manteve estável?

        2.  **Análise de Métricas Principais:** Detalhe a variação de cada métrica chave (Investimento, Conversões, CPA, etc.), incluindo o cálculo da variação percentual. Use uma lista para isso. Exemplo:
            *   **Conversões:** ${currentPeriodData.totalConversions.toLocaleString('pt-BR')} vs ${previousPeriodData.totalConversions.toLocaleString('pt-BR')}${formatPercent(currentPeriodData.totalConversions, previousPeriodData.totalConversions)}

        3.  **Highlights (Pontos Positivos):** Identifique as melhorias mais significativas e o que pode ter causado isso.

        4.  **Pontos de Atenção (Pontos Fracos):** Identifique as piores quedas de performance e as possíveis causas.

        5.  **Hipóteses e Recomendações:** Com base na análise, formule hipóteses sobre o que causou as mudanças (ex: sazonalidade, mudanças na concorrência, fadiga de criativos, alterações de orçamento) e fornece recomendações claras e práticas para otimizar os resultados no próximo período.

        Seja conciso, direto e foque em insights que ajudem na tomada de decisão estratégica.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for comparison:", error);
        return "Ocorreu um erro ao gerar a análise comparativa. Por favor, tente novamente.";
    }
};

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export const sendChatMessage = async (message: string, history: ChatMessage[], contextData?: any): Promise<string> => {
    if (!process.env.API_KEY) {
        return "Erro: Chave de API não configurada.";
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let dataContextString = "";
    if (contextData) {
        dataContextString = `
        
        **CONTEXTO DE DADOS ATUAL:**
        Abaixo estão os dados REAIS das campanhas que o usuário está visualizando na plataforma neste momento. 
        Você DEVE usar estes dados para responder a perguntas específicas sobre performance, campanhas, custos, etc.
        Se os dados forem uma lista vazia, informe ao usuário que não há campanhas disponíveis na visualização atual.

        \`\`\`json
        ${JSON.stringify(contextData, null, 2)}
        \`\`\`
        `;
    }

    try {
        const chat = ai.chats.create({
            model: 'gemini-3-pro-preview',
            history: history,
            config: {
                systemInstruction: `Você é um Consultor Sênior de Tráfego Pago e Growth Marketing altamente experiente.
                
                Seu papel é ajudar analistas e gestores de tráfego a entenderem seus dados, otimizarem campanhas e traçarem estratégias de crescimento.
                
                **Suas Habilidades:**
                1.  **Análise Técnica:** Entende profundamente métricas como CPA, ROAS, CTR, CPC, Taxa de Conversão em plataformas como Meta Ads (Facebook/Instagram), Google Ads, TikTok Ads e LinkedIn Ads.
                2.  **Estratégia:** Sugere estruturas de campanha, funis de vendas, testes A/B e alocação de verba.
                3.  **Resolução de Problemas:** Identifica por que uma campanha parou de performar (fadiga de criativo, audiência saturada, problemas de tracking, etc.) e sugere soluções.
                
                **Tom de Voz:** Profissional, direto, analítico, mas acessível e colaborativo. Use formatação Markdown (negrito, listas) para facilitar a leitura.
                
                **Instruções Importantes:**
                - Responda sempre em Português do Brasil.
                - Se o contexto de dados for fornecido abaixo, USE-O como base para suas respostas.
                - Se o usuário perguntar "qual a melhor campanha?", analise os dados (CPA, ROAS, Conversões) para responder.
                - Se o usuário perguntar "quanto gastei?", some os valores do contexto.
                ${dataContextString}`,
            }
        });

        const result = await chat.sendMessage({ message });
        return result.text;

    } catch (error) {
        console.error("Error in chat:", error);
        return "Desculpe, estou com dificuldades para processar sua solicitação no momento. Tente novamente em instantes.";
    }
}