import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from '@react-google-maps/api';
import {
    IonContent,
    IonHeader,
    IonPage,
    IonModal,
    IonTitle,
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBadge,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonText,
    IonRefresher,
    IonRefresherContent,
    RefresherEventDetail,
    IonButtons,
    IonIcon,
    IonAlert,
    IonToast,
    useIonViewWillEnter,
    useIonViewDidLeave
} from '@ionic/react';
import { calendarOutline, closeOutline, heart, heartOutline, homeOutline, ticketOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import HeaderActions from '../components/HeaderActions';
import api from '../services/api';
import { Evento } from '../services/eventosService';
import eventosService from '../services/eventosService';
import bilhetesService from '../services/bilhetesService';

const terceiraCenter = { lat: 38.7223, lng: -27.2211 };
const containerStyle = { width: '100%', height: '400px' };

interface EventInfoWindowProps {
    event: Evento;
    isDarkMode: boolean;
    onClose: () => void;
}

const EventInfoWindow: React.FC<EventInfoWindowProps> = ({ event, isDarkMode, onClose }) => {
    const { t, lang } = useLang();
    const titulo = lang === 'en' && event.tituloEn ? event.tituloEn : event.titulo;
    const descricao = lang === 'en' && event.descricaoEn ? event.descricaoEn : event.descricao;
    const accentColor = event.interesseUsuario ? '#ffc107' : (isDarkMode ? '#1f7a8c' : '#007bff');
    const popupBg = isDarkMode ? '#0f1b28' : '#ffffff';
    const translateStatus = (s: string) =>
        s === 'ativo' ? t.statusAtivo : s === 'cancelado' ? t.statusCancelado : s === 'encerrado' ? t.statusEncerrado : s;
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div style={{
            background: `linear-gradient(90deg, ${accentColor} 0 6px, ${popupBg} 6px 100%)`,
            color: isDarkMode ? '#f5f5f5' : '#1e1e1e',
            padding: '10px 16px 14px 16px',
            maxWidth: '380px',
            minWidth: '300px',
            maxHeight: '68vh',
            borderRadius: '0 14px 14px 0',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.18)',
            fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
            overflowY: 'auto',
            overflowX: 'hidden',
            lineHeight: 1.45,
            position: 'relative'
        }}>
            <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{
                    position: 'absolute',
                    top: '6px',
                    right: '8px',
                    width: '26px',
                    height: '26px',
                    border: 'none',
                    borderRadius: '50%',
                    background: 'transparent',
                    color: isDarkMode ? '#b9c4d0' : '#4b5563',
                    fontSize: '26px',
                    lineHeight: '22px',
                    cursor: 'pointer',
                    padding: 0
                }}
            >
                ×
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ flex: 1, paddingRight: '34px' }}>
                        <h3 style={{
                            margin: 0,
                            fontSize: '16px',
                            fontWeight: 700,
                            color: event.interesseUsuario ? '#ff9800' : '#0056d6',
                            wordBreak: 'break-word'
                        }}>
                            {titulo}
                        </h3>
                        {event.organizador?.name && (
                            <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: isDarkMode ? '#cfcfcf' : '#6b7280' }}>
                                {t.organizer} {event.organizador.name}
                            </p>
                        )}
                    </div>
                    {event.interesseUsuario && (
                        <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            padding: '8px 14px',
                            borderRadius: '20px',
                            background: isDarkMode ? 'rgba(255, 193, 7, 0.12)' : 'rgba(255, 193, 7, 0.16)',
                            color: '#ffc107',
                            fontSize: '13px',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            marginRight: '34px',
                            boxShadow: '0 4px 12px rgba(255, 193, 7, 0.35)',
                            border: '2px solid #ffc107',
                            letterSpacing: '0.3px'
                        }}>
                            {t.interest}
                        </span>
                    )}
                </div>
                <div style={{ height: '1px', backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />
            </div>

            <div style={{ display: 'grid', gap: '10px', fontSize: '13px' }}>
                <div><strong>{t.date}</strong> {formatDate(event.inicio)}</div>
                <div><strong>{lang === 'en' ? 'End:' : 'Fim:'}</strong> {formatDate(event.fim)}</div>
                <div><strong>{t.price}</strong> {event.preco ? `${event.preco}€` : t.free}</div>
                <div><strong>{t.capacity}</strong> {event.capacidadeMaxima != null ? `${event.capacidadeMaxima} ${t.people}` : '-'}</div>
                <div>
                    <strong>{t.status}</strong>{' '}
                    <span style={{
                        display: 'inline-block',
                        minWidth: '65px',
                        textAlign: 'center',
                        padding: '3px 7px',
                        borderRadius: '999px',
                        backgroundColor: event.status === 'ativo' ? '#28a745' : event.status === 'cancelado' ? '#dc3545' : '#ffc107',
                        color: event.status === 'ativo' || event.status === 'cancelado' ? '#fff' : '#0f172a',
                        fontSize: '11px'
                    }}>
                        {translateStatus(event.status)}
                    </span>
                </div>
                {event.telefone && (
                    <div style={{
                        padding: '10px',
                        borderRadius: '10px',
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)',
                        color: isDarkMode ? '#e5e7eb' : '#374151'
                    }}>
                        <strong>{lang === 'en' ? 'Phone:' : 'Telefone:'}</strong> {event.telefone}
                    </div>
                )}
                {event.local && (
                    <div style={{
                        padding: '10px',
                        borderRadius: '10px',
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)',
                        color: isDarkMode ? '#e5e7eb' : '#374151'
                    }}>
                        <strong>{lang === 'en' ? 'Location:' : 'Local:'}</strong> {event.local}
                    </div>
                )}
                {descricao && (
                    <div style={{
                        padding: '10px',
                        borderRadius: '10px',
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)',
                        color: isDarkMode ? '#e5e7eb' : '#374151',
                        fontSize: '12px',
                        maxHeight: '80px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {descricao}
                    </div>
                )}
            </div>
        </div>
    );
};

const Events: React.FC = () => {
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showBuyAlert, setShowBuyAlert] = useState(false);
    const [eventToBuy, setEventToBuy] = useState<Evento | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
    const [showOrganizerModal, setShowOrganizerModal] = useState(false);
    const [organizerProfile, setOrganizerProfile] = useState<{ _id?: string; name?: string; email?: string; telefone?: string; profileImage?: string } | null>(null);
    const [organizerEvents, setOrganizerEvents] = useState<Evento[]>([]);
    const [organizerProfileLoading, setOrganizerProfileLoading] = useState(false);
    const [isOrganizerFavorited, setIsOrganizerFavorited] = useState(false);
    const [organizerFavoriteLoading, setOrganizerFavoriteLoading] = useState(false);
    const { user, isAuthenticated, refreshProfile } = useAuth();
    const { t, lang } = useLang();
    const history = useHistory();

    const getTitle = (ev: Evento) => lang === 'en' && ev.tituloEn ? ev.tituloEn : ev.titulo;
    const getDesc = (ev: Evento) => lang === 'en' && ev.descricaoEn ? ev.descricaoEn : ev.descricao;
    const organizerModalTitle = lang === 'en' ? 'Organizer profile' : 'Perfil do organizador';
    const activeEventsLabel = lang === 'en' ? 'Active events' : 'Eventos ativos';
    const noActiveEventsLabel = lang === 'en' ? 'No active events.' : 'Nenhum evento ativo.';
    const favoriteOrganizerLabel = lang === 'en' ? 'Favorite organizer' : 'Favoritar organizador';
    const unfavoriteOrganizerLabel = lang === 'en' ? 'Unfavorite organizer' : 'Remover dos favoritos';
    const currentUserId = user?.id || (user as any)?._id || '';
    const isOwnOrganizerProfile = !!organizerProfile?._id && !!currentUserId && organizerProfile._id === currentUserId;

    const translateStatus = (s: string) =>
        s === 'ativo' ? t.statusAtivo : s === 'cancelado' ? t.statusCancelado : s === 'encerrado' ? t.statusEncerrado : s;

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

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

    const loadEventos = async () => {
        try {
            setIsLoading(true);
            const data = await withTimeout(eventosService.getAll(), 12000);
            const agora = new Date();
            const eventosDisponiveis = data.filter((evento) => {
                const statusEfetivo = evento.status === 'ativo' && new Date(evento.fim) < agora
                    ? 'encerrado'
                    : evento.status;

                return statusEfetivo !== 'encerrado';
            });

            setEventos(eventosDisponiveis);
                    setError('');
                    if (selectedEvent) {
                        const updatedEvent = eventosDisponiveis.find(e => e.id === selectedEvent.id);
                        if (updatedEvent) {
                            setSelectedEvent(updatedEvent);
                        }
                    }
        } catch (err: any) {
            setError(t.errorLoadingEvents);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBuyTicket = async () => {
        if (!eventToBuy || !eventToBuy.id) {
            console.error('EventToBuy or event ID is undefined');
            return;
        }
        
        const eventId = eventToBuy.id;
        const eventPrice = eventToBuy.preco || 0;
        setShowBuyAlert(false);
        setEventToBuy(null);

        if (eventPrice > 0) {
            // Redirect to EasyPay checkout for paid events
            history.push(`/checkout/${eventId}`);
        } else {
            // Free events - buy directly
            try {
                const result = await bilhetesService.comprar(eventId);
                setToastMessage(t.ticketSuccess);
                setShowToast(true);
                await refreshProfile();
                await loadEventos();
            } catch (err: any) {
                setToastMessage(t.ticketError(err.response?.data?.message || err.message));
                setShowToast(true);
            }
        }
    };

    const confirmBuyTicket = (evento: Evento) => {
        setEventToBuy(evento);
        setShowBuyAlert(true);
    };

    const toggleCardDetails = (cardId: string) => {
        setExpandedCards((prev) => ({
            ...prev,
            [cardId]: !prev[cardId]
        }));
    };

    const openOrganizerModal = async (evento: Evento) => {
        const organizerId = evento.organizador?._id;
        const ativos = organizerId
            ? eventos.filter((ev) => ev.organizador?._id === organizerId && ev.status === 'ativo')
            : [];

        setOrganizerEvents(ativos);
        setShowOrganizerModal(true);

        if (!organizerId) {
            setOrganizerProfile(null);
            return;
        }

        setOrganizerProfile({
            _id: evento.organizador._id,
            name: evento.organizador.name,
            email: evento.organizador.email
        });

        if (currentUserId && organizerId === currentUserId) {
            setIsOrganizerFavorited(false);
        } else {
            try {
                const statusResponse = await withTimeout(api.get(`/favoritos/organizadores/${organizerId}/status`), 6000);
                setIsOrganizerFavorited(!!statusResponse.data?.favorito);
            } catch (err) {
                setIsOrganizerFavorited(false);
            }
        }

        try {
            setOrganizerProfileLoading(true);
            const response = await withTimeout(api.get(`/user/public/${organizerId}`), 8000);
            const profile = response.data || {};
            setOrganizerProfile({
                _id: profile._id || organizerId,
                name: profile.name || evento.organizador.name,
                email: profile.email || evento.organizador.email,
                telefone: profile.telefone,
                profileImage: profile.profileImage
            });
        } catch (err) {
            // Mantem fallback local caso o endpoint falhe.
        } finally {
            setOrganizerProfileLoading(false);
        }
    };

    const toggleOrganizerFavorite = async () => {
        if (!organizerProfile?._id || organizerFavoriteLoading || isOwnOrganizerProfile) {
            return;
        }

        try {
            setOrganizerFavoriteLoading(true);
            const response = await withTimeout(api.post(`/favoritos/organizadores/${organizerProfile._id}`), 8000);
            const favorito = !!response.data?.favorito;
            setIsOrganizerFavorited(favorito);
            setToastMessage(
                favorito
                    ? (lang === 'en' ? 'Organizer added to favorites.' : 'Organizador adicionado aos favoritos.')
                    : (lang === 'en' ? 'Organizer removed from favorites.' : 'Organizador removido dos favoritos.')
            );
            setShowToast(true);
        } catch (err: any) {
            if (err?.response?.status === 400) {
                setToastMessage(lang === 'en' ? 'You cannot favorite your own organizer profile.' : 'Nao pode favoritar o seu proprio perfil de organizador.');
            } else {
                setToastMessage(lang === 'en' ? 'Could not update favorite organizer.' : 'Nao foi possivel atualizar favorito do organizador.');
            }
            setShowToast(true);
        } finally {
            setOrganizerFavoriteLoading(false);
        }
    };

    useEffect(() => {
        loadEventos();
    }, []);

    useEffect(() => {
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark-theme'));
        };
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                loadEventos();
                refreshProfile();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    useIonViewWillEnter(() => {
        loadEventos();
        refreshProfile();
    });

    useIonViewDidLeave(() => {
        setIsLoading(false);
    });

    const interestIconUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="45" height="45" viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
            <circle cx="22.5" cy="22.5" r="20" fill="#ffc107" stroke="white" stroke-width="3"/>
            <circle cx="22.5" cy="22.5" r="12" fill="white"/>
            <text x="22.5" y="27" text-anchor="middle" fill="#ffc107" font-size="14" font-weight="bold">★</text>
        </svg>
    `)}`;

    const normalIconUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 2C10.03 2 6 6.03 6 11c0 5.25 6.55 13.55 8.22 15.7.37.48 1.19.48 1.56 0C17.45 24.55 24 16.25 24 11c0-4.97-4.03-9-9-9z" fill="#007bff" stroke="white" stroke-width="1"/>
            <circle cx="15" cy="11" r="3" fill="white"/>
        </svg>
    `)}`;

    const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
        await loadEventos();
        event.detail.complete();
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
                        <IonTitle>{t.eventsPage}</IonTitle>
                        <HeaderActions />
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding ion-text-center">
                    <IonText>
                        <h3>{t.loginToSeeEvents}</h3>
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
                    <IonTitle>{t.eventsPage}</IonTitle>
                    <HeaderActions />
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <style>
                    {`
                        ion-alert.buy-alert-dark {
                            --background: #0f1b28;
                            --color: #ffffff;
                            --title-color: #ffffff;
                            --message-color: #ffffff;
                            --button-color: #ffffff;
                            --backdrop-opacity: 0.4;
                            color: #ffffff !important;
                        }

                        ion-alert.buy-alert-dark::part(content),
                        ion-alert.buy-alert-dark::part(message) {
                            color: #ffffff !important;
                            opacity: 1 !important;
                            -webkit-text-fill-color: #ffffff !important;
                        }

                        ion-alert.buy-alert-dark::part(header),
                        ion-alert.buy-alert-dark::part(title) {
                            color: #ffffff !important;
                            opacity: 1 !important;
                            -webkit-text-fill-color: #ffffff !important;
                        }

                        ion-alert.buy-alert-dark::part(subheader),
                        ion-alert.buy-alert-dark::part(button) {
                            color: #ffffff !important;
                            opacity: 1 !important;
                            -webkit-text-fill-color: #ffffff !important;
                        }

                        ion-alert.buy-alert-dark .alert-message,
                        ion-alert.buy-alert-dark .alert-title,
                        ion-alert.buy-alert-dark .alert-button-inner {
                            color: #ffffff !important;
                            opacity: 1 !important;
                            -webkit-text-fill-color: #ffffff !important;
                        }

                        ion-modal.organizer-fullscreen-modal {
                            --width: 100vw;
                            --height: 100vh;
                            --max-width: 100vw;
                            --max-height: 100vh;
                            --border-radius: 0;
                            --backdrop-opacity: 0.45;
                        }

                        ion-modal.organizer-fullscreen-modal::part(content) {
                            width: 100vw;
                            height: 100vh;
                            border-radius: 0;
                        }
                    `}
                </style>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent></IonRefresherContent>
                </IonRefresher>

                <div className="ion-padding">
                    <style>
                        {`
                            .events-map .gm-style .gm-style-iw-c {
                                border-radius: 0 14px 14px 0 !important;
                                padding: 0 !important;
                            }

                            .events-map .gm-style .gm-style-iw-d {
                                overflow: auto !important;
                                max-height: 70vh !important;
                                scrollbar-width: thin;
                                scrollbar-color: #7aa2cf rgba(0, 0, 0, 0.08);
                            }

                            .events-map .gm-style .gm-style-iw-d::-webkit-scrollbar {
                                width: 10px;
                            }

                            .events-map .gm-style .gm-style-iw-d::-webkit-scrollbar-track {
                                background: rgba(0, 0, 0, 0.08);
                                border-radius: 999px;
                            }

                            .events-map .gm-style .gm-style-iw-d::-webkit-scrollbar-thumb {
                                background: #7aa2cf;
                                border-radius: 999px;
                                border: 2px solid rgba(0, 0, 0, 0.08);
                            }

                            .events-map.dark-map .gm-style .gm-style-iw-d {
                                scrollbar-color: #3f6f9e #0f1b28;
                            }

                            .events-map.dark-map .gm-style .gm-style-iw-d::-webkit-scrollbar-track {
                                background: #0f1b28;
                            }

                            .events-map.dark-map .gm-style .gm-style-iw-d::-webkit-scrollbar-thumb {
                                background: #3f6f9e;
                                border: 2px solid #0f1b28;
                            }

                            .events-map .gm-style .gm-ui-hover-effect {
                                display: none !important;
                            }

                            .events-map.dark-map .gm-style .gm-style-iw-c {
                                background: #0f1b28 !important;
                                box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35) !important;
                            }

                            .events-map.dark-map .gm-style .gm-style-iw-d {
                                background: #0f1b28 !important;
                            }

                            .events-map.dark-map .gm-style .gm-style-iw-tc::after {
                                background: #0f1b28 !important;
                            }

                        `}
                    </style>

                    {/* MAPA GOOGLE */}
                    {isLoaded && (
                        <div className={`events-map ${isDarkMode ? 'dark-map' : ''}`} style={{ marginBottom: 24, touchAction: 'none' }}>
                            <GoogleMap
                                mapContainerStyle={containerStyle}
                                center={terceiraCenter}
                                zoom={11}
                                onClick={() => setSelectedEvent(null)}
                                options={{ gestureHandling: 'greedy' }}
                            >
                                {eventos
                                    .filter(ev => typeof ev.lat === 'number' && typeof ev.lng === 'number')
                                    .map((ev, index) => (
                                        <Marker
                                            key={`marker-${ev.id || ev._id || index}`}
                                            position={{ lat: ev.lat as number, lng: ev.lng as number }}
                                            title={ev.interesseUsuario ? `❤️ ${getTitle(ev)} (${t.yourInterest})` : getTitle(ev)}
                                            onClick={() => setSelectedEvent(ev)}
                                            icon={ev.interesseUsuario ? {
                                                url: interestIconUrl,
                                                scaledSize: new google.maps.Size(45, 45),
                                                anchor: new google.maps.Point(22.5, 45)
                                            } : {
                                                url: normalIconUrl,
                                                scaledSize: new google.maps.Size(30, 30),
                                                anchor: new google.maps.Point(15, 30)
                                            }}
                                        />
                                    ))}
                                {/* InfoWindow para mostrar detalhes do evento */}
                                {selectedEvent && (
                                    <InfoWindow
                                        key={`info-${selectedEvent.id || selectedEvent._id || 'selected'}-${isDarkMode}`}
                                        position={{ lat: selectedEvent.lat || 38.7223, lng: selectedEvent.lng || -27.2211 }}
                                        onCloseClick={() => setSelectedEvent(null)}
                                    >
                                        <EventInfoWindow 
                                            event={selectedEvent} 
                                            isDarkMode={isDarkMode} 
                                            onClose={() => setSelectedEvent(null)} 
                                        />
                                    </InfoWindow>
                                )}
                            </GoogleMap>
                        </div>
                    )}

                    {error && (
                        <IonText color="danger">
                            <p>{error}</p>
                        </IonText>
                    )}

                    <h2>{t.availableEvents}</h2>

                    <IonGrid style={{ paddingLeft: '8px', paddingRight: '8px' }}>
                        <IonRow style={{ marginBottom: '-8px' }}>
                            {eventos.map((evento, index) => (
                                <IonCol size="12" sizeSm="6" sizeMd="4" sizeLg="3" key={`evento-${evento.id || evento._id || index}`} style={{ paddingBottom: '10px' }}>
                                    <IonCard style={{
                                        border: evento.interesseUsuario ? '2.5px solid #ffc107' : '2px solid #5d9cff',
                                        boxShadow: isDarkMode ? '0 26px 68px rgba(0,0,0,0.6)' : '0 26px 68px rgba(15, 76, 129, 0.2)',
                                        background: isDarkMode ? '#0f1b28' : 'linear-gradient(150deg, rgba(242, 248, 255, 0.96), rgba(227, 242, 255, 1) 70%)',
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
                                        e.currentTarget.style.boxShadow = '0 32px 84px rgba(15, 76, 129, 0.24)';
                                        e.currentTarget.style.borderColor = evento.interesseUsuario ? '#ffb300' : '#5b9cff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 26px 68px rgba(15, 76, 129, 0.2)';
                                        e.currentTarget.style.borderColor = evento.interesseUsuario ? '#ffc107' : '#5d9cff';
                                    }}
                                    >
                                        <div style={{
                                            height: '5px',
                                            background: evento.interesseUsuario ? 'linear-gradient(90deg, #ffe082, #ffc107, #ffe082)' : 'linear-gradient(90deg, #a6c8ff, #5d9cff, #a6c8ff)',
                                            position: 'relative'
                                        }} />

                                        <IonCardHeader style={{ paddingBottom: '12px', paddingTop: '20px', textAlign: 'center' }}>
                                            {evento.interesseUsuario && (
                                                <div style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    alignSelf: 'center',
                                                    gap: '4px',
                                                    background: isDarkMode ? 'rgba(255, 193, 7, 0.12)' : 'rgba(255, 193, 7, 0.16)',
                                                    color: '#ffc107',
                                                    padding: '7px 14px',
                                                    borderRadius: '20px',
                                                    fontSize: '13px',
                                                    fontWeight: '700',
                                                    boxShadow: '0 4px 12px rgba(255, 193, 7, 0.35)',
                                                    border: '2px solid #ffc107',
                                                    marginBottom: '10px'
                                                }}>
                                                    {t.interest}
                                                </div>
                                            )}

                                            <IonCardTitle style={{
                                                color: isDarkMode ? '#e8f0fe' : '#102a43',
                                                fontSize: '16px',
                                                fontWeight: '800',
                                                lineHeight: '1.25',
                                                marginBottom: '8px',
                                                textAlign: 'center'
                                            }}>
                                                {getTitle(evento)}
                                            </IonCardTitle>
                                            {evento.local && (
                                                <div style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    margin: '0 auto',
                                                    padding: '8px 14px',
                                                    borderRadius: '999px',
                                                    background: isDarkMode ? 'rgba(91, 156, 255, 0.15)' : 'rgba(66, 133, 244, 0.12)',
                                                    color: isDarkMode ? '#a6c8ff' : '#0f3f7f',
                                                    fontSize: '12px',
                                                    fontWeight: 700,
                                                    maxWidth: '92%'
                                                }}>
                                                    {evento.local}
                                                </div>
                                            )}
                                            <span style={{
                                                marginTop: '14px',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '6px 16px',
                                                borderRadius: '999px',
                                                background: isDarkMode ? 'rgba(91, 156, 255, 0.2)' : 'rgba(66, 133, 244, 0.18)',
                                                color: isDarkMode ? '#a6c8ff' : '#1e3a8a',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.45px',
                                                boxShadow: '0 10px 22px rgba(15, 76, 129, 0.08)'
                                            }}>
                                                {lang === 'en' ? 'Event' : 'Evento'}
                                            </span>
                                        </IonCardHeader>

                                        {getDesc(evento) && (
                                            <div style={{
                                                padding: '0 18px 12px 18px',
                                                fontSize: '12px',
                                                lineHeight: 1.45,
                                                color: isDarkMode ? '#c7d4e6' : '#52616f',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {getDesc(evento)}
                                            </div>
                                        )}

                                        <div style={{
                                            height: '1px',
                                            background: isDarkMode ? 'linear-gradient(90deg, transparent, #5b9cff, transparent)' : 'linear-gradient(90deg, transparent, #5b9cff, transparent)',
                                            margin: '10px 18px'
                                        }} />

                                        <IonCardContent style={{ paddingTop: '14px', paddingBottom: '18px', fontSize: '13px', color: isDarkMode ? '#e0e8f0' : '#22303f' }}>
                                            {(evento.topico || evento.subtopico) && (
                                                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                                    {evento.topico && (
                                                        <span style={{
                                                            backgroundColor: isDarkMode ? 'rgba(91, 156, 255, 0.15)' : '#e8f3ff',
                                                            color: isDarkMode ? '#a6c8ff' : '#0d47a1',
                                                            padding: '5px 11px',
                                                            borderRadius: '14px',
                                                            fontSize: '11px',
                                                            fontWeight: '700',
                                                            textTransform: 'capitalize'
                                                        }}>{evento.topico}</span>
                                                    )}
                                                    {evento.subtopico && (
                                                        <span style={{
                                                            backgroundColor: isDarkMode ? 'rgba(66, 133, 244, 0.12)' : '#e3f2fd',
                                                            color: isDarkMode ? '#90b8f8' : '#1565c0',
                                                            padding: '5px 11px',
                                                            borderRadius: '14px',
                                                            fontSize: '11px',
                                                            fontWeight: '700',
                                                            textTransform: 'capitalize'
                                                        }}>{evento.subtopico}</span>
                                                    )}
                                                </div>
                                            )}

                                            {expandedCards[String(evento.id || evento._id || index)] && (
                                                <>
                                                    {/* Organizador no topo do Ver mais */}
                                                    {evento.organizador?.name && (
                                                        <div style={{ marginBottom: '10px', fontSize: '13px', color: isDarkMode ? '#cfcfcf' : '#6b7280' }}>
                                                            <span>{t.organizer} </span>
                                                            <span
                                                                style={{
                                                                    color: '#1976d2',
                                                                    textDecoration: 'underline',
                                                                    cursor: 'pointer',
                                                                    fontWeight: 700
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openOrganizerModal(evento);
                                                                }}
                                                            >
                                                                {evento.organizador.name}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {evento.telefone && (
                                                        <div style={{
                                                            marginBottom: '12px',
                                                            padding: '8px 12px',
                                                            backgroundColor: isDarkMode ? 'rgba(166, 200, 255, 0.08)' : 'rgba(166, 200, 255, 0.2)',
                                                            borderRadius: '12px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            gap: '10px'
                                                        }}>
                                                            <span style={{ fontSize: '12px', fontWeight: 700, color: isDarkMode ? '#a6c8ff' : '#2a4f7d' }}>
                                                                {lang === 'en' ? 'Phone:' : 'Telefone:'}
                                                            </span>
                                                            <span style={{ fontWeight: 700, color: isDarkMode ? '#d9e8fa' : '#1f3f68' }}>{evento.telefone}</span>
                                                        </div>
                                                    )}

                                                    <div style={{
                                                        marginBottom: '12px',
                                                        padding: '10px 12px',
                                                        backgroundColor: isDarkMode ? 'rgba(91, 156, 255, 0.1)' : 'rgba(227, 242, 253, 0.75)',
                                                        borderRadius: '12px'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', color: isDarkMode ? '#a6c8ff' : '#334e68' }}>
                                                            <span style={{ fontSize: '12px', fontWeight: 700 }}>
                                                                {lang === 'en' ? 'Start:' : 'Início:'}
                                                            </span>
                                                            <span style={{ fontWeight: 700 }}>{formatDate(evento.inicio)}</span>
                                                        </div>
                                                        <div style={{
                                                            height: '1px',
                                                            margin: '7px 0',
                                                            background: isDarkMode ? 'rgba(166, 200, 255, 0.2)' : 'rgba(66, 133, 244, 0.2)'
                                                        }} />
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', color: isDarkMode ? '#b8c7d9' : '#4f6275' }}>
                                                            <span style={{ fontSize: '12px', fontWeight: 700 }}>
                                                                {lang === 'en' ? 'End:' : 'Fim:'}
                                                            </span>
                                                            <span style={{ fontWeight: 700 }}>{formatDate(evento.fim)}</span>
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                marginBottom: '12px',
                                                padding: '8px 12px',
                                                backgroundColor: isDarkMode ? 'rgba(31, 122, 140, 0.18)' : 'rgba(31, 122, 140, 0.12)',
                                                borderRadius: '12px'
                                            }}>
                                                <span style={{ fontSize: '12px', fontWeight: 700, color: isDarkMode ? '#9ed6de' : '#1f5963' }}>
                                                    {t.capacity.replace(':', '')}
                                                </span>
                                                <span style={{ fontSize: '13px', fontWeight: 800, color: isDarkMode ? '#d8f1f5' : '#114850' }}>
                                                    {evento.capacidadeMaxima != null ? `${evento.capacidadeMaxima} ${t.people}` : '-'}
                                                </span>
                                            </div>

                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                marginBottom: '8px',
                                                padding: '10px 12px',
                                                backgroundColor: isDarkMode ? 'rgba(91, 156, 255, 0.1)' : 'rgba(227, 242, 253, 0.85)',
                                                borderRadius: '14px'
                                            }}>
                                                <span style={{ fontSize: '12px', fontWeight: '700', color: isDarkMode ? '#8ab4d8' : '#44596e' }}>
                                                    {evento.gratuito ? t.free : t.price}
                                                </span>
                                                <span style={{ fontSize: '14px', fontWeight: '800', color: isDarkMode ? '#e8f0fe' : '#102a43' }}>
                                                    {evento.preco ? `${evento.preco}€` : t.free}
                                                </span>
                                            </div>

                                            <IonButton
                                                fill="outline"
                                                size="small"
                                                onClick={() => toggleCardDetails(String(evento.id || evento._id || index))}
                                                style={{
                                                    marginBottom: '12px',
                                                    width: '100%',
                                                    height: '32px',
                                                    fontSize: '12px',
                                                    fontWeight: 700,
                                                    '--background': 'var(--ion-color-primary)',
                                                    '--border-color': 'var(--ion-color-primary)',
                                                    '--color': '#ffffff'
                                                }}
                                            >
                                                {expandedCards[String(evento.id || evento._id || index)] ? (lang === 'en' ? 'See less' : 'Ver menos') : (lang === 'en' ? 'See more' : 'Ver mais')}
                                            </IonButton>

                                            <div style={{
                                                padding: '8px 12px',
                                                background: evento.status === 'ativo'
                                                    ? (isDarkMode ? 'linear-gradient(90deg, rgba(22, 163, 74, 0.35), rgba(34, 197, 94, 0.28))' : 'linear-gradient(90deg, #d9fbe7, #c5f6da)')
                                                    : evento.status === 'cancelado'
                                                        ? (isDarkMode ? 'rgba(235, 68, 90, 0.15)' : '#ffebee')
                                                        : (isDarkMode ? 'rgba(255, 196, 9, 0.15)' : '#fff8e1'),
                                                borderRadius: '14px',
                                                color: evento.status === 'ativo' ? (isDarkMode ? '#2dd36f' : '#1b5e20') : evento.status === 'cancelado' ? (isDarkMode ? '#eb445a' : '#c62828') : (isDarkMode ? '#ffc409' : '#e65100'),
                                                border: evento.status === 'ativo' ? (isDarkMode ? '1px solid rgba(45, 211, 111, 0.5)' : '1px solid #7dd3a2') : '1px solid transparent',
                                                boxShadow: evento.status === 'ativo' ? (isDarkMode ? '0 0 12px rgba(45, 211, 111, 0.28)' : '0 4px 10px rgba(34, 197, 94, 0.18)') : 'none',
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                textAlign: 'center',
                                                marginBottom: '14px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {translateStatus(evento.status)}
                                            </div>

                                            {evento.preco && evento.preco > 0 && (
                                                <IonButton
                                                    fill="solid"
                                                    color={evento.interesseUsuario ? 'warning' : 'primary'}
                                                    size="small"
                                                    onClick={() => {
                                                        const eventId = evento.id || evento._id;
                                                        if (eventId) {
                                                            confirmBuyTicket(evento);
                                                        } else {
                                                            console.error('Event ID is undefined for event:', evento);
                                                        }
                                                    }}
                                                    style={{
                                                        marginTop: '8px',
                                                        height: '34px',
                                                        fontSize: '12px',
                                                        width: '100%',
                                                        fontWeight: '700',
                                                        borderRadius: '12px'
                                                    }}
                                                >
                                                    <IonIcon icon={ticketOutline} slot="start" />
                                                    {t.buyTicket(evento.preco || 0)}
                                                </IonButton>
                                            )}
                                        </IonCardContent>
                                    </IonCard>
                                </IonCol>
                            ))}
                        </IonRow>
                    </IonGrid>

                    {eventos.length === 0 && !isLoading && (
                        <div className="ion-text-center">
                            <IonText>
                                <p>{t.noEvents}</p>
                            </IonText>
                        </div>
                    )}
                </div>

                <IonAlert
                    isOpen={showBuyAlert}
                    onDidDismiss={() => setShowBuyAlert(false)}
                    cssClass={isDarkMode ? 'buy-alert-dark' : undefined}
                    header={t.confirmPurchase}
                    message={t.confirmPurchaseMsg(eventToBuy?.titulo || '', eventToBuy?.preco || 0)}
                    buttons={[
                        {
                            text: t.cancel,
                            role: 'cancel',
                            handler: () => setShowBuyAlert(false)
                        },
                        {
                            text: t.buy,
                            handler: () => {
                                handleBuyTicket();
                                return true;
                            }
                        }
                    ]}
                />

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={3000}
                />
            </IonContent>
            <IonModal
                isOpen={showOrganizerModal}
                onDidDismiss={() => setShowOrganizerModal(false)}
                cssClass="organizer-fullscreen-modal"
            >
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>{organizerModalTitle}</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={() => setShowOrganizerModal(false)}>
                                <IonIcon icon={closeOutline} slot="icon-only" />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding">
                    {organizerProfileLoading && (
                        <IonText color="medium">
                            <p>{lang === 'en' ? 'Loading profile...' : 'A carregar perfil...'}</p>
                        </IonText>
                    )}
                    {organizerProfile ? (
                        <>
                            <IonCard>
                                <IonCardContent>
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            gap: '10px',
                                            marginBottom: '8px'
                                        }}
                                    >
                                        {organizerProfile.profileImage ? (
                                            <img
                                                src={organizerProfile.profileImage}
                                                alt={organizerProfile.name || 'Organizer'}
                                                style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div
                                                style={{
                                                    width: 96,
                                                    height: 96,
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: isDarkMode ? 'rgba(56, 128, 255, 0.2)' : 'rgba(56, 128, 255, 0.12)',
                                                    color: isDarkMode ? '#a6c8ff' : '#0d47a1',
                                                    fontWeight: 800,
                                                    fontSize: '30px'
                                                }}
                                            >
                                                {(organizerProfile.name || '?').trim().charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <h2 style={{ margin: 0 }}>{organizerProfile.name || '-'}</h2>
                                    </div>

                                    <div
                                        style={{
                                            border: `1px solid ${isDarkMode ? 'rgba(56, 128, 255, 0.45)' : 'rgba(16, 148, 132, 0.4)'}`,
                                            borderRadius: '12px',
                                            padding: '12px 14px',
                                            width: '100%'
                                        }}
                                    >
                                        <p><strong>{t.email}</strong> {organizerProfile.email || '-'}</p>
                                        {organizerProfile.telefone && <p><strong>{t.phone}</strong> {organizerProfile.telefone}</p>}
                                        <p><strong>{t.role}</strong> {lang === 'en' ? 'Organizer' : 'Organizador'}</p>
                                    </div>

                                    {!isOwnOrganizerProfile && (
                                        <IonButton
                                            expand="block"
                                            fill={isOrganizerFavorited ? 'solid' : 'outline'}
                                            color={isOrganizerFavorited ? 'danger' : 'primary'}
                                            onClick={toggleOrganizerFavorite}
                                            disabled={organizerFavoriteLoading}
                                            style={{ marginTop: '14px' }}
                                        >
                                            <IonIcon icon={isOrganizerFavorited ? heart : heartOutline} slot="start" />
                                            {isOrganizerFavorited ? unfavoriteOrganizerLabel : favoriteOrganizerLabel}
                                        </IonButton>
                                    )}
                                </IonCardContent>
                            </IonCard>

                            <h3 style={{ marginTop: '24px' }}>{activeEventsLabel}</h3>

                            {organizerEvents.length === 0 ? (
                                <IonText>
                                    <p>{noActiveEventsLabel}</p>
                                </IonText>
                            ) : (
                                organizerEvents.map((ev, idx) => (
                                    <IonCard key={ev.id || ev._id || `org-ev-${idx}`}>
                                        <IonCardHeader>
                                            <IonCardTitle>{getTitle(ev)}</IonCardTitle>
                                        </IonCardHeader>
                                        <IonCardContent>
                                            {getDesc(ev) && <p style={{ marginTop: 0 }}>{getDesc(ev)}</p>}
                                            <p><strong>{t.profileDate}</strong> {formatDate(ev.inicio)}</p>
                                            <p><strong>{t.profileLocation}</strong> {ev.local || '-'}</p>
                                            <p>
                                                <strong>{t.profileStatus}</strong>{' '}
                                                <IonBadge color={ev.status === 'ativo' ? 'success' : ev.status === 'cancelado' ? 'danger' : 'warning'}>
                                                    {translateStatus(ev.status)}
                                                </IonBadge>
                                            </p>
                                        </IonCardContent>
                                    </IonCard>
                                ))
                            )}
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', paddingTop: 40 }}>
                            <IonText color="medium">
                                <p>{lang === 'en' ? 'Unable to load organizer profile.' : 'Nao foi possivel carregar o perfil do organizador.'}</p>
                            </IonText>
                        </div>
                    )}
                </IonContent>
            </IonModal>
        </IonPage>
    );
};

export default Events;