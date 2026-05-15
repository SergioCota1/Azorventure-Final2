import api from './api';

export interface Evento {
  id?: string;
  _id?: string;
  titulo: string;
  tituloEn?: string;
  descricao: string;
  descricaoEn?: string;
  data?: string;
  local?: string;
  preco?: number;
  imagem?: string;
  categoria?: string;
  capacidade?: number;
  inscritos?: number;
  status: 'ativo' | 'cancelado' | 'encerrado';
  createdAt?: string;
  updatedAt?: string;
  lat?: number;
  lng?: number;
  // Propriedades do modelo MongoDB
  inicio: string;
  fim: string;
  gratuito: boolean;
  capacidadeMaxima: number;
  bilhetesVendidos?: number;
  capacidadeDisponivel?: number;
  telefone?: string;
  imagens: string[];
  topico: string;
  subtopico: string;
  organizador: {
    _id: string;
    name: string;
    email: string;
  };
  favorito?: boolean;
  interesseUsuario?: boolean;
}

export interface CreateEventoData {
  titulo: string;
  tituloEn?: string;
  descricao: string;
  descricaoEn?: string;
  inicio: string;
  fim: string;
  local: string;
  lat?: number;
  lng?: number;
  preco?: number;
  capacidadeMaxima: number;
  telefone?: string;
  imagens?: string[];
  topico: string;
  subtopico: string;
}

export interface EstatisticasEvento {
  evento: {
    id: string;
    titulo: string;
    capacidadeMaxima: number;
  };
  estatisticas: {
    bilhetesVendidos: number;
    bilhetesUsados: number;
    bilhetesDisponiveis: number;
    receitaTotal: number;
    taxaOcupacao: string;
  };
}

class EventosService {
  async getAll(): Promise<Evento[]> {
    const response = await api.get('/eventos');
    return response.data;
  }

  async getById(id: string): Promise<Evento> {
    const response = await api.get(`/eventos/${id}`);
    return response.data;
  }

  async getByCategoria(categoria: string): Promise<Evento[]> {
    const response = await api.get(`/eventos/categoria/${categoria}`);
    return response.data;
  }

  async create(data: CreateEventoData): Promise<Evento> {
    const response = await api.post('/eventos', data);
    return response.data;
  }

  async update(id: string, data: Partial<CreateEventoData>): Promise<Evento> {
    const response = await api.put(`/eventos/${id}`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/eventos/${id}`);
  }

  async inscrever(id: string): Promise<void> {
    await api.post(`/bilhetes/eventos/${id}`);
  }

  async cancelarInscricao(id: string): Promise<void> {
    await api.delete(`/eventos/${id}/inscrever`);
  }

  async getMeusEventos(): Promise<Evento[]> {
    const response = await api.get('/eventos/meus-eventos');
    return response.data;
  }

  async getEstatisticasEvento(id: string): Promise<EstatisticasEvento> {
    const response = await api.get(`/eventos/${id}/estatisticas`);
    return response.data;
  }
}

export default new EventosService();