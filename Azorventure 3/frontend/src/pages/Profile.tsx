import React, { useState, useEffect, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonText,
  IonCard,
  IonCardContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonList,
  IonLabel,
  IonBadge,
  IonLoading,
  IonToast,
  useIonViewWillEnter,
  useIonViewDidLeave
} from '@ionic/react';
import { homeOutline, addOutline, statsChartOutline, cameraOutline } from 'ionicons/icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import eventosService, { Evento, EstatisticasEvento } from '../services/eventosService';
import HeaderActions from '../components/HeaderActions';

const Profile: React.FC = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { t, lang } = useLang();
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark-theme'));
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark-theme'));
    });
    observer.observe(document.documentElement, { attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  const tickColor = isDark ? '#ffffff' : '#555555';
  const tooltipBg = isDark ? '#1e2a3a' : '#ffffff';
  const tooltipBorder = isDark ? '#000000' : '#cccccc';
  const tooltipColor = isDark ? '#ffffff' : '#333333';
  const profileInfoBorder = isDark ? 'rgba(56, 128, 255, 0.45)' : 'rgba(16, 148, 132, 0.4)';
  const getTitle = (ev: Evento) => (lang === 'en' && ev.tituloEn ? ev.tituloEn : ev.titulo);
  const getDesc = (ev: Evento) => (lang === 'en' && ev.descricaoEn ? ev.descricaoEn : ev.descricao);
  const [meusEventos, setMeusEventos] = useState<Evento[]>([]);
  const [estatisticas, setEstatisticas] = useState<{ [key: string]: EstatisticasEvento }>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [avatarHover, setAvatarHover] = useState(false);
  const [canHover, setCanHover] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useIonViewDidLeave(() => {
    setLoading(false);
  });

  useIonViewWillEnter(() => {
    if (isAuthenticated && user && (user.role === 'admin' || user.role === 'organizador')) {
      loadMeusEventos();
    }
  });

  useEffect(() => {
    if (isAuthenticated && user && (user.role === 'admin' || user.role === 'organizador')) {
      loadMeusEventos();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!loading) return;

    const timer = window.setTimeout(() => {
      setLoading(false);
      setToastMessage('Não foi possível carregar os eventos do perfil agora.');
      setShowToast(true);
    }, 15000);

    return () => window.clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    if (user?.profileImage) {
      setSelectedImage(user.profileImage);
    }
  }, [user]);

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)');
    const apply = () => {
      setCanHover(media.matches);
      if (!media.matches) {
        setAvatarHover(false);
      }
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const apply = () => setIsMobile(media.matches);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, []);

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

  const loadMeusEventos = async () => {
    try {
      setLoading(true);
      const eventos = await withTimeout(eventosService.getMeusEventos(), 12000);
      setMeusEventos(eventos);

      const stats: { [key: string]: EstatisticasEvento } = {};
      const statsResults = await Promise.allSettled(
        eventos
          .filter((evento) => !!evento.id)
          .map(async (evento) => {
            const stat = await withTimeout(eventosService.getEstatisticasEvento(evento.id!), 8000);
            return { id: evento.id!, stat };
          })
      );

      statsResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          stats[result.value.id] = result.value.stat;
        } else {
          console.error('Erro ao carregar estatisticas de evento:', result.reason);
        }
      });

      setEstatisticas(stats);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      setToastMessage(t.errorLoadingProfileEvents);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const maxSize = 640;
          let { width, height } = img;
          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height >= width && height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Não foi possível processar a imagem.'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.75);
          resolve(compressed);
        };
        img.onerror = () => reject(new Error('Imagem inválida.'));
        img.src = String(fileReader.result || '');
      };
      fileReader.onerror = () => reject(new Error('Erro ao ler ficheiro.'));
      fileReader.readAsDataURL(file);
    });
  };

  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const base64Image = await compressImage(file);
      setSelectedImage(base64Image);
      await updateProfile({ profileImage: base64Image });
      setToastMessage('Imagem de perfil atualizada com sucesso');
    } catch (error: any) {
      console.error('Erro ao atualizar imagem de perfil:', error);
      setToastMessage(error?.response?.data?.message || 'Não foi possível atualizar a imagem de perfil');
    } finally {
      setShowToast(true);
      setUploading(false);
      event.target.value = '';
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton routerLink="/home">
                <IonIcon icon={homeOutline} slot="icon-only" />
              </IonButton>
            </IonButtons>
            <IonTitle>{t.profilePage}</IonTitle>
            <HeaderActions />
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding ion-text-center">
          <IonText>
            <h3>{t.loginToSeeProfile}</h3>
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
          <IonTitle>{t.profilePage}</IonTitle>
          <HeaderActions />
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardContent>
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap',
                marginBottom: '16px'
              }}
            >
              <div
                role="button"
                tabIndex={0}
                onMouseEnter={() => canHover && setAvatarHover(true)}
                onMouseLeave={() => setAvatarHover(false)}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: '#e0e0e0',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                  cursor: 'pointer'
                }}
              >
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="Foto de perfil"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ color: '#666', textAlign: 'center', padding: '0 8px' }}>
                    Sem foto
                  </span>
                )}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'rgba(0, 0, 0, 0.45)',
                    opacity: canHover && avatarHover ? 1 : 0,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <IonIcon icon={cameraOutline} style={{ color: '#ffffff', fontSize: '28px' }} />
                </div>
              </div>
              <div style={{ flex: isMobile ? undefined : 1, minWidth: isMobile ? undefined : '200px', width: isMobile ? '100%' : undefined }}>
                <input
                  ref={fileInputRef}
                  id="profileImageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
            <div
              style={{
                border: `1px solid ${profileInfoBorder}`,
                borderRadius: '12px',
                padding: '12px 14px',
                width: '100%'
              }}
            >
              <p><strong>Nome:</strong> {user.name}</p>
              <p><strong>{t.email}</strong> {user.email}</p>
              {user.telefone && <p><strong>{t.phone}</strong> {user.telefone}</p>}
              <p><strong>{t.pointsLabel}</strong> {user.pontos}</p>
              <p><strong>{t.role}</strong> {user.role}</p>
            </div>
          </IonCardContent>
        </IonCard>

        <IonLoading isOpen={uploading} message="Atualizando imagem..." />

        {(user.role === 'admin' || user.role === 'organizador') && (
          <>
            <IonButton
              expand="block"
              routerLink="/create-event"
              style={{ margin: '20px 0' }}
            >
              <IonIcon icon={addOutline} slot="start" />
              {t.createNewEvent}
            </IonButton>

            <h3 style={{ marginTop: '30px' }}>{t.myEvents}</h3>

            {meusEventos.length === 0 && !loading ? (
              <IonText>
                <p>{t.noProfileEvents}</p>
              </IonText>
            ) : (
              <IonList>
                {meusEventos.map((evento) => {
                  const stats = estatisticas[evento.id!];
                  return (
                    <IonCard key={evento.id}>
                      <IonCardContent>
                        <h4>{getTitle(evento)}</h4>
                        <p>{getDesc(evento)}</p>
                        <p><strong>{t.profileDate}</strong> {formatDate(evento.inicio)}</p>
                        <p><strong>{t.profileLocation}</strong> {evento.local}</p>
                        <p><strong>{t.profileStatus}</strong>
                          <IonBadge color={evento.status === 'ativo' ? 'success' : 'danger'} style={{ marginLeft: '8px' }}>
                            {evento.status === 'ativo' ? t.statusAtivo : evento.status === 'cancelado' ? t.statusCancelado : t.statusEncerrado}
                          </IonBadge>
                        </p>

                        {stats && (
                          <div style={{ marginTop: '15px' }}>
                            <h5 style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                              <IonIcon icon={statsChartOutline} style={{ marginRight: '8px' }} />
                              {t.statistics}
                            </h5>
                            <ResponsiveContainer width="100%" height={160}>
                              <BarChart
                                data={[
                                  { name: t.ticketsSold.replace(':', ''), value: stats.estatisticas.bilhetesVendidos, fill: '#3880ff' },
                                  { name: t.ticketsUsed.replace(':', ''), value: stats.estatisticas.bilhetesUsados, fill: '#2dd36f' },
                                  { name: t.ticketsAvailable.replace(':', ''), value: stats.estatisticas.bilhetesDisponiveis, fill: '#92949c' },
                                  { name: t.occupancyRate.replace(':', ''), value: parseFloat(stats.estatisticas.taxaOcupacao), fill: '#ffc409' },
                                  { name: `${t.totalRevenue.replace(':', '')} (€)`, value: stats.estatisticas.receitaTotal, fill: '#eb445a' }
                                ]}
                                margin={{ top: 4, right: 8, left: -20, bottom: 55 }}
                              >
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: tickColor }} angle={-30} textAnchor="end" interval={0} />
                                <YAxis tick={{ fontSize: 10, fill: tickColor }} />
                                <Tooltip
                                  cursor={{ fill: 'transparent' }}
                                  contentStyle={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '6px', color: tooltipColor }}
                                  labelStyle={{ color: tooltipColor, fontWeight: 'bold' }}
                                  itemStyle={{ color: tooltipColor }}
                                  formatter={(value, name) => {
                                    const safeValue = value ?? 0;
                                    const safeName = String(name ?? '');
                                    return safeName.includes('€') ? [`€${safeValue}`, safeName] : [safeValue, safeName];
                                  }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                  {[
                                    { fill: '#3880ff' },
                                    { fill: '#2dd36f' },
                                    { fill: '#92949c' },
                                    { fill: '#ffc409' },
                                    { fill: '#eb445a' }
                                  ].map((entry, index) => (
                                    <Cell key={index} fill={entry.fill} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </IonCardContent>
                    </IonCard>
                  );
                })}
              </IonList>
            )}
          </>
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

export default Profile;
