import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonText,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonToast,
  useIonViewDidLeave
} from '@ionic/react';
import { homeOutline, cartOutline, giftOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import lojaService, { Produto } from '../services/lojaService';
import HeaderActions from '../components/HeaderActions';
import './Store.css';

const Store: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { t, lang } = useLang();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark-theme'));
  const getNome = (p: Produto) => lang === 'en' && p.nomeEn ? p.nomeEn : p.nome;
  const getDesc = (p: Produto) => lang === 'en' && p.descricaoEn ? p.descricaoEn : p.descricao;
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [saldo, setSaldo] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useIonViewDidLeave(() => {
    setLoading(false);
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!loading) return;

    // Failsafe para garantir que o spinner nunca fica preso.
    const timer = window.setTimeout(() => {
      setLoading(false);
      setToastMessage('Não foi possível carregar a loja agora. Tente novamente.');
      setShowToast(true);
    }, 15000);

    return () => window.clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark-theme'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const cardBorder = isDark ? 'rgba(90, 157, 255, 0.52)' : 'rgba(16, 148, 132, 0.28)';
  const cardShadow = isDark ? '0 24px 60px rgba(0, 0, 0, 0.58)' : '0 24px 60px rgba(15, 76, 129, 0.16)';
  const cardBackground = isDark
    ? 'linear-gradient(145deg, rgba(25, 37, 58, 0.98), rgba(10, 19, 35, 1) 74%)'
    : 'linear-gradient(150deg, rgba(241, 250, 248, 0.96), rgba(230, 246, 243, 1) 72%)';
  const cardHoverBorder = isDark ? '#5d9cff' : '#109484';
  const accentBar = isDark
    ? 'linear-gradient(90deg, #3f6ea7, #5d9cff, #3f6ea7)'
    : 'linear-gradient(90deg, #8ddac8, #109484, #8ddac8)';
  const cardTitleColor = isDark ? '#edf4ff' : '#102a43';
  const pricePillBg = isDark ? 'rgba(93, 156, 255, 0.24)' : 'rgba(16, 148, 132, 0.12)';
  const pricePillColor = isDark ? '#dbe9ff' : '#0f3f7f';
  const descColor = isDark ? '#d2dded' : '#424242';
  const enabledBtnBg = isDark
    ? 'linear-gradient(135deg, #3c86e8 0%, #2a5fa5 100%)'
    : 'linear-gradient(135deg, #109484 0%, #0f6b60 100%)';

  const withTimeout = async <T,>(promise: Promise<T>, ms: number): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error('Request timeout')), ms);
      promise
        .then((value) => {
          window.clearTimeout(timer);
          resolve(value);
        })
        .catch((error) => {
          window.clearTimeout(timer);
          reject(error);
        });
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [produtosResult, saldoResult] = await Promise.allSettled([
        withTimeout(lojaService.getAllProdutos(), 12000),
        withTimeout(lojaService.getSaldoPontos(), 12000)
      ]);

      if (produtosResult.status === 'fulfilled') {
        const produtosOrdenados = [...produtosResult.value].sort((a, b) => a.precoPontos - b.precoPontos);
        setProdutos(produtosOrdenados);
      } else {
        console.error('Erro ao carregar produtos:', produtosResult.reason);
        setProdutos([]);
      }

      if (saldoResult.status === 'fulfilled') {
        setSaldo(saldoResult.value.saldo);
      } else {
        console.error('Erro ao carregar saldo:', saldoResult.reason);
        setSaldo(0);
      }

      if (produtosResult.status === 'rejected' || saldoResult.status === 'rejected') {
        setToastMessage(t.errorLoadingStore);
        setShowToast(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleComprar = async (produtoId: string, precoPontos: number) => {
    if (saldo < precoPontos) {
      setToastMessage(t.insufficientPoints);
      setShowToast(true);
      return;
    }

    try {
      await lojaService.comprarProduto(produtoId);
      setToastMessage(t.purchaseSuccess);
      setShowToast(true);
      // Recarregar dados
      await loadData();
    } catch (error) {
      console.error('Erro ao comprar produto:', error);
      setToastMessage(t.purchaseError);
      setShowToast(true);
    }
  };

  const normalizeImageSrc = (imagem?: string) => {
    if (!imagem) return '';
    const trimmed = imagem.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('data:image/')) return trimmed;
    const clean = trimmed.replace(/\s/g, '');
    if (/^[A-Za-z0-9+/=]+$/.test(clean)) {
      return `data:image/jpeg;base64,${clean}`;
    }
    return trimmed;
  };


  if (!isAuthenticated) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton routerLink="/home">
                <IonIcon icon={homeOutline} slot="icon-only" />
              </IonButton>
            </IonButtons>
            <IonTitle>{t.storePage}</IonTitle>
            <HeaderActions />
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding ion-text-center">
          <IonText>
            <h3>{t.loginToAccessStore}</h3>
          </IonText>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton routerLink="/home">
              <IonIcon icon={homeOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonTitle>{t.storePage}</IonTitle>
          <HeaderActions />
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding store-page">
        <div className="store-header" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
          <div
            style={{
              border: `1px solid ${cardBorder}`,
              borderRadius: '12px',
              padding: '8px 14px',
              background: isDark ? 'rgba(22, 34, 54, 0.86)' : 'rgba(255, 255, 255, 0.85)',
              color: cardTitleColor,
              fontWeight: 700,
              fontSize: '14px'
            }}
          >
            Meus Pontos: {saldo} pontos
          </div>
        </div>

        {produtos.length === 0 && !loading ? (
          <div className="empty-state">
            <IonIcon icon={giftOutline} size="large" color="medium" />
            <IonText>
              <h3>{t.noProducts}</h3>
              <p>{lang === 'en' ? 'Come back later for new rewards!' : 'Volte mais tarde para ver novas recompensas!'}</p>
            </IonText>
          </div>
        ) : (
          <IonGrid className="products-grid">
            <IonRow style={{ marginBottom: '-8px' }}>
              {produtos.map((produto) => (
                <IonCol size="12" sizeSm="6" sizeMd="4" sizeLg="3" key={produto._id} style={{ paddingBottom: '10px' }} className="product-col">
                  <IonCard className="product-card" style={{
                    border: `1px solid ${cardBorder}`,
                    boxShadow: cardShadow,
                    background: cardBackground,
                    borderRadius: '30px',
                    position: 'relative',
                    minHeight: '320px',
                    height: '100%',
                    margin: '0',
                    overflow: 'hidden',
                    transition: 'transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease, background 0.28s ease',
                    cursor: 'pointer',
                    transform: 'translateY(0)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = isDark ? '0 28px 72px rgba(0, 0, 0, 0.56)' : '0 32px 84px rgba(15, 76, 129, 0.24)';
                    e.currentTarget.style.borderColor = cardHoverBorder;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = cardShadow;
                    e.currentTarget.style.borderColor = cardBorder;
                  }}
                  >
                    <div style={{
                      height: '5px',
                      background: accentBar,
                      position: 'relative'
                    }} />

                    <IonCardHeader style={{ paddingBottom: '16px', paddingTop: '30px', textAlign: 'center' }}>
                      <IonCardTitle style={{
                        color: cardTitleColor,
                        fontSize: '16px',
                        fontWeight: '800',
                        lineHeight: '1.25',
                        marginBottom: '10px',
                        marginTop: '10px'
                      }}>
                        {getNome(produto)}
                      </IonCardTitle>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        margin: '0 auto',
                        padding: '8px 14px',
                        borderRadius: '999px',
                        background: pricePillBg,
                        color: pricePillColor,
                        fontSize: '12px',
                        fontWeight: 700,
                        maxWidth: '92%'
                      }}>
                        {produto.precoPontos} {t.points}
                      </div>
                    </IonCardHeader>

                    <IonCardContent style={{ padding: '0 20px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {produto.imagem && (
                        <div style={{ marginBottom: '14px', borderRadius: '12px', overflow: 'hidden', border: isDark ? '1px solid rgba(120, 160, 220, 0.28)' : '1px solid rgba(16, 148, 132, 0.2)' }}>
                          <img
                            src={normalizeImageSrc(produto.imagem)}
                            alt={getNome(produto)}
                            style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }}
                          />
                        </div>
                      )}
                      <p style={{
                        color: descColor,
                        fontSize: '14px',
                        lineHeight: '1.5',
                        marginBottom: '16px',
                        flex: 1
                      }}>
                        {getDesc(produto)}
                      </p>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px'
                      }}>
                        <span style={{
                          fontSize: '13px',
                          color: produto.stock > 0 ? (isDark ? '#7de18b' : '#2e7d32') : (isDark ? '#ff9a9a' : '#d32f2f'),
                          fontWeight: '600'
                        }}>
                          {produto.stock > 0 ? `${t.stock} ${produto.stock}` : (lang === 'en' ? 'Sold out' : 'Esgotado')}
                        </span>
                      </div>

                      <IonButton
                        fill="solid"
                        expand="block"
                        onClick={() => handleComprar(produto._id, produto.precoPontos)}
                        disabled={produto.stock <= 0 || saldo < produto.precoPontos}
                        style={{
                          borderRadius: '12px',
                          fontWeight: '600',
                          height: '44px',
                          '--background': produto.stock <= 0 || saldo < produto.precoPontos
                            ? 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)'
                            : enabledBtnBg,
                          '--color': produto.stock <= 0 || saldo < produto.precoPontos ? '#424242' : '#ffffff',
                          '--border-radius': '12px',
                          '--box-shadow': '0 4px 12px rgba(0, 0, 0, 0.15)',
                          opacity: produto.stock <= 0 || saldo < produto.precoPontos ? '0.9' : '1',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <IonIcon icon={cartOutline} slot="start" />
                        {produto.stock <= 0 ? (lang === 'en' ? 'Sold out' : 'Esgotado') : saldo < produto.precoPontos ? t.insufficientPoints : t.buyBtn}
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        )}

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
        />
      </IonContent>
    </IonPage>
  );
};

export default Store;