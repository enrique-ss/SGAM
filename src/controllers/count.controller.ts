import db from '../database/connection';

export const countAndamento = async (req: any, res: any) => {
  const entregas = await db('demandas')
  .where("status_servico", "EM ANDAMENTO")
  .count("id as total");
  return res.json(entregas);
};

export const countAtrasado = async (req: any, res: any) => {
  const entregas = await db('demandas')
  .where("status_servico", "ATRASADO")
  .count("id as total");
  return res.json(entregas);
};

export const countConcluido = async (req: any, res: any) => {
  const entregas = await db('demandas')
  .where("status_servico", "CONCLUÍDO")
  .count("id as total");
  return res.json(entregas);
};

export const countCancelado = async (req: any, res: any) => {
  const entregas = await db('demandas')
  .where("status_servico", "CANCELADO")
  .count("id as total");
  return res.json(entregas);
};


// Tipos de Serviços 

export const countSocialMedia = async (req: any, res: any) => {
  const servico = await db('demandas')
  .where("tipo_servico_id", 1)
  .count("id as total");
  return res.json(servico);
};

export const countDesignGrafico = async (req: any, res: any) => {
  const servico = await db('demandas')
  .where("tipo_servico_id", 2)
  .count("id as total");
  return res.json(servico);
};

export const countCopywriting = async (req: any, res: any) => {
  const servico = await db('demandas')
  .where("tipo_servico_id", 3)
  .count("id as total");
  return res.json(servico);
};

export const countProducaoConteudo = async (req: any, res: any) => {
  const servico = await db('demandas')
  .where("tipo_servico_id", 4)
  .count("id as total");
  return res.json(servico);
};

export const countRelatoriosEstrategia = async (req: any, res: any) => {
  const servico = await db('demandas')
  .where("tipo_servico_id", 5)
  .count("id as total");
  return res.json(servico);
};