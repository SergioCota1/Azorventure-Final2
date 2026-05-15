import api from './api';

export interface Produto {
  _id: string;
  nome: string;
  nomeEn?: string;
  descricao: string;
  descricaoEn?: string;
  precoPontos: number;
  imagem?: string;
  stock: number;
  ativo: boolean;
  criadoEm: string;
}

export interface CreateProdutoData {
  nome: string;
  nomeEn?: string;
  descricao: string;
  descricaoEn?: string;
  precoPontos: number;
  imagem?: string;
  stock: number;
}

export interface Transacao {
  id: string;
  userId: string;
  produtoId: string;
  quantidade: number;
  pontosUsados: number;
  valorTotal: number;
  status: 'pendente' | 'concluida' | 'cancelada';
  dataTransacao: string;
  produto?: Produto;
}

class LojaService {
  async getAllProdutos(): Promise<Produto[]> {
    const response = await api.get('/loja/produtos');
    return response.data;
  }

  async getProdutoById(id: string): Promise<Produto> {
    const response = await api.get(`/loja/produtos`);
    const produto = (response.data as Produto[]).find((p) => p._id === id);
    if (!produto) {
      throw new Error('Produto não encontrado');
    }
    return produto;
  }

  async getByCategoria(categoria: string): Promise<Produto[]> {
    const response = await api.get(`/loja/categoria/${categoria}`);
    return response.data;
  }

  async createProduto(data: CreateProdutoData): Promise<Produto> {
    const response = await api.post('/loja/produtos', data);
    return response.data;
  }

  async updateProduto(id: string, data: Partial<CreateProdutoData>): Promise<Produto> {
    const endpoints = [
      `/loja/produtos/${id}`,
      `/api/loja/produtos/${id}`,
      `/loja/${id}`,
      `/api/loja/${id}`
    ];

    let lastError: any;

    for (const endpoint of endpoints) {
      try {
        const response = await api.put(endpoint, data);
        return response.data;
      } catch (error: any) {
        lastError = error;
        if (error?.response?.status !== 404) {
          throw error;
        }
      }

      try {
        const response = await api.patch(endpoint, data);
        return response.data;
      } catch (error: any) {
        lastError = error;
        if (error?.response?.status !== 404) {
          throw error;
        }
      }
    }

    throw lastError;
  }

  async deleteProduto(id: string): Promise<void> {
    await api.delete(`/loja/produtos/${id}`);
  }

  async comprarProduto(produtoId: string, quantidade: number = 1): Promise<Transacao> {
    const response = await api.post(`/loja/produtos/${produtoId}/comprar`, { quantidade });
    return response.data;
  }

  async getMyTransacoes(): Promise<Transacao[]> {
    const response = await api.get('/loja/transacoes');
    return response.data;
  }

  async getSaldoPontos(): Promise<{ saldo: number }> {
    const response = await api.get('/loja/saldo');
    return response.data;
  }
}

export default new LojaService();