export const PIPELINES = {
  PRESENCA_DIGITAL: {
    id: "Agência de Presença Digital",
    steps: [
      "DeepGram (Transcreve Reunião/Podcast)",
      "LLM (Resume/Cria Post Estruturado)",
      "API Social (Publica Automaticamente)"
    ]
  },
  INTELIGENCIA_MERCADO: {
    id: "Inteligência de Mercado",
    steps: [
      "Exa / FireCrawl (Monitora Notícias e Concorrentes)",
      "LLM (Gera Insights Estratégicos)",
      "Relatório Diegético no DUST"
    ]
  }
};
