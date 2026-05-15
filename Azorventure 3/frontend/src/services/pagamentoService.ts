import api from './api';

export interface CheckoutResponse {
  manifest: {
    id: string;
    session: string;
    config: any;
  };
  pagamentoId: string;
}

export interface ConfirmarResponse {
  bilheteId: string;
  codigo: string;
  qrCode: string;
}

export interface PagamentoStatus {
  id: string;
  status: 'pendente' | 'pago' | 'falhou' | 'expirado';
  valor: number;
  bilhete: string | null;
  criadoEm: string;
}

class PagamentoService {
  async criarCheckout(eventoId: string): Promise<CheckoutResponse> {
    const response = await api.post('/pagamentos/checkout', { eventoId });
    return response.data;
  }

  async confirmar(pagamentoId: string): Promise<ConfirmarResponse> {
    const response = await api.post('/pagamentos/confirmar', { pagamentoId });
    return response.data;
  }

  async getStatus(pagamentoId: string): Promise<PagamentoStatus> {
    const response = await api.get(`/pagamentos/${pagamentoId}`);
    return response.data;
  }
}

export default new PagamentoService();
