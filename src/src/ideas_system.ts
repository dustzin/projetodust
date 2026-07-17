import { PIPELINES } from './pipeline_chaining';

export interface API_Record {
  nome: string;
  uso_nicho: string;
  status_validacao: 'AGUARDANDO_TESTE' | 'TESTANDO' | 'VALIDADA' | 'FALHOU';
  pipeline_operacional: string;
}

export const API_LAB: Record<string, API_Record> = {
  exa: {
    nome: 'Exa (Busca Semântica Avançada)',
    uso_nicho: 'Inteligência de Mercado e Pesquisa',
    status_validacao: 'AGUARDANDO_TESTE',
    pipeline_operacional: PIPELINES.INTELIGENCIA_MERCADO.id
  },
  firecrawl: {
    nome: 'FireCrawl (Scraping Profundo)',
    uso_nicho: 'Mapeamento de E-commerces e Concorrentes',
    status_validacao: 'AGUARDANDO_TESTE',
    pipeline_operacional: PIPELINES.INTELIGENCIA_MERCADO.id
  },
  deepgram: {
    nome: 'DeepGram (Transcrição Rápida)',
    uso_nicho: 'Agência de Podcasts / Reuniões',
    status_validacao: 'AGUARDANDO_TESTE',
    pipeline_operacional: PIPELINES.PRESENCA_DIGITAL.id
  },
  social: {
    nome: 'Social-Publishing-APIs',
    uso_nicho: 'Automação de Posts para Clientes',
    status_validacao: 'AGUARDANDO_TESTE',
    pipeline_operacional: PIPELINES.PRESENCA_DIGITAL.id
  }
};

export const heuristicEngine = (nicho: string): string => {
  if (!nicho || nicho.trim() === '') return "Aguardando nicho...";
  const lowered = nicho.toLowerCase();
  const map: Record<string, string> = {
    "criadores": PIPELINES.PRESENCA_DIGITAL.id,
    "criador": PIPELINES.PRESENCA_DIGITAL.id,
    "influencers": PIPELINES.PRESENCA_DIGITAL.id,
    "e-commerce": PIPELINES.INTELIGENCIA_MERCADO.id,
    "ecommerce": PIPELINES.INTELIGENCIA_MERCADO.id,
    "lojas": PIPELINES.INTELIGENCIA_MERCADO.id,
    "clínicas": PIPELINES.PRESENCA_DIGITAL.id,
    "clinicas": PIPELINES.PRESENCA_DIGITAL.id,
    "negócios": PIPELINES.INTELIGENCIA_MERCADO.id,
    "negocios": PIPELINES.INTELIGENCIA_MERCADO.id,
    "b2b": PIPELINES.INTELIGENCIA_MERCADO.id,
    "saas": PIPELINES.INTELIGENCIA_MERCADO.id,
  };
  
  for (const key in map) {
    if (lowered.includes(key)) return map[key];
  }
  
  return "Pipeline Genérico (Requer Validação Manual)";
};
