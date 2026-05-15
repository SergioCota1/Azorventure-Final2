import api from './api';

export interface Bilhete {
  id: string;
  user: string;
  evento: string;
  qrCode: string;
  usado: boolean;
  criadoEm: string;
  eventoData?: {
    titulo: string;
    tituloEn?: string;
    inicio: string;
    local?: string;
  };
}

export interface CompraBilheteResponse {
  bilheteId: string;
  codigo: string;
  qrCode: string;
}

class BilhetesService {
  async getMyBilhetes(): Promise<Bilhete[]> {
    const response = await api.get('/bilhetes');
    return response.data;
  }

  async comprar(eventoId: string): Promise<CompraBilheteResponse> {
    const response = await api.post(`/bilhetes/eventos/${eventoId}`);
    return response.data;
  }

  async validar(codigo: string): Promise<{ message: string }> {
    const response = await api.post('/bilhetes/validar', { codigo });
    return response.data;
  }
}

export default new BilhetesService();