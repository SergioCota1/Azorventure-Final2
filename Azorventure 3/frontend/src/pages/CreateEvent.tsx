import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonLoading,
  IonCard,
  IonCardContent,
  IonText
} from '@ionic/react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { arrowBackOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import eventosService from '../services/eventosService';
import HeaderActions from '../components/HeaderActions';

const terceiraCenter = { lat: 38.7223, lng: -27.2211 };
const containerStyle = { width: '100%', height: '300px' };

const CreateEvent: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLang();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const [formData, setFormData] = useState({
    titulo: '',
    tituloEn: '',
    descricao: '',
    descricaoEn: '',
    inicio: '',
    fim: '',
    local: '',
    lat: terceiraCenter.lat,
    lng: terceiraCenter.lng,
    preco: '',
    capacidadeMaxima: '',
    telefone: '',
    topico: '',
    subtopico: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setFormData(prev => ({
        ...prev,
        lat,
        lng
      }));
    }
  };

  const handleLocalChange = async (value: string) => {
    setFormData(prev => ({
      ...prev,
      local: value
    }));

    // Geocode the location if Google Maps is loaded
    if (value && isLoaded && window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: value + ', Açores, Portugal' }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          setFormData(prev => ({
            ...prev,
            lat: location.lat(),
            lng: location.lng()
          }));
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo || !formData.descricao || !formData.inicio || !formData.fim ||
        !formData.local || !formData.capacidadeMaxima || !formData.topico || !formData.subtopico || formData.preco === '') {
      setToastMessage(t.fillRequired);
      setShowToast(true);
      return;
    }

    if (formData.telefone && formData.telefone.replace(/[\s()-]/g, '').length < 9) {
      setToastMessage(t.phoneTooShort);
      setShowToast(true);
      return;
    }

    try {
      setLoading(true);
      const data = {
        ...formData,
        preco: formData.preco ? parseFloat(formData.preco) : 0,
        capacidadeMaxima: parseInt(formData.capacidadeMaxima),
        lat: formData.lat,
        lng: formData.lng
      };

      await eventosService.create(data);
      setToastMessage(t.eventCreated);
      setShowToast(true);
      setTimeout(() => {
        history.push('/profile');
      }, 2000);
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      setToastMessage(t.eventCreateError);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'organizador')) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton routerLink="/profile">
                <IonIcon icon={arrowBackOutline} slot="icon-only" />
              </IonButton>
            </IonButtons>
            <IonTitle>{t.createEventPage}</IonTitle>
            <HeaderActions />
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding ion-text-center">
          <h3>{t.accessDenied}</h3>
          <p>{t.noPermission}</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton routerLink="/profile">
              <IonIcon icon={arrowBackOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
          <IonTitle>{t.createEventPage}</IonTitle>
          <HeaderActions />
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonLoading isOpen={loading} message={t.creatingEvent} />

        <form onSubmit={handleSubmit}>
          <IonCard>
            <IonCardContent>
              <IonItem>
                <IonLabel position="stacked">{t.titleField}</IonLabel>
                <IonInput
                  value={formData.titulo}
                  onIonChange={e => handleInputChange('titulo', e.detail.value!)}
                  placeholder={t.titlePlaceholder}
                  required
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">{t.titleEnField}</IonLabel>
                <IonInput
                  value={formData.tituloEn}
                  onIonChange={e => handleInputChange('tituloEn', e.detail.value!)}
                  placeholder={t.titleEnPlaceholder}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">{t.descriptionField}</IonLabel>
                <IonTextarea
                  value={formData.descricao}
                  onIonChange={e => handleInputChange('descricao', e.detail.value!)}
                  placeholder={t.descriptionPlaceholder}
                  rows={3}
                  required
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">{t.descriptionEnField}</IonLabel>
                <IonTextarea
                  value={formData.descricaoEn}
                  onIonChange={e => handleInputChange('descricaoEn', e.detail.value!)}
                  placeholder={t.descriptionEnPlaceholder}
                  rows={3}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">{t.startDateTime}</IonLabel>
                <IonInput
                  type="datetime-local"
                  value={formData.inicio}
                  onIonChange={e => handleInputChange('inicio', e.detail.value!)}
                  required
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">{t.endDateTime}</IonLabel>
                <IonInput
                  type="datetime-local"
                  value={formData.fim}
                  onIonChange={e => handleInputChange('fim', e.detail.value!)}
                  required
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">{t.locationField}</IonLabel>
                <IonInput
                  value={formData.local}
                  onIonChange={e => handleLocalChange(e.detail.value!)}
                  placeholder={t.locationPlaceholder}
                  required
                />
              </IonItem>

              {/* Map for location selection */}
              {isLoaded && (
                <div style={{ marginTop: '10px', marginBottom: '20px' }}>
                  <IonText>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                      {t.mapHint}
                    </p>
                  </IonText>
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={{ lat: formData.lat, lng: formData.lng }}
                    zoom={11}
                    onClick={handleMapClick}
                  >
                    <Marker
                      position={{ lat: formData.lat, lng: formData.lng }}
                      title={t.locationField}
                    />
                  </GoogleMap>
                  <IonText>
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                      {t.coordinates} {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
                    </p>
                  </IonText>
                </div>
              )}

              <IonItem>
                <IonLabel position="stacked">{t.priceOptional}</IonLabel>
                <IonInput
                  type="number"
                  value={formData.preco}
                  onIonChange={e => handleInputChange('preco', e.detail.value!)}
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">{t.maxCapacity}</IonLabel>
                <IonInput
                  type="number"
                  value={formData.capacidadeMaxima}
                  onIonChange={e => handleInputChange('capacidadeMaxima', e.detail.value!)}
                  placeholder={t.maxCapacityPlaceholder}
                  required
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">{t.contactPhone}</IonLabel>
                <IonInput
                  value={formData.telefone}
                  onIonChange={e => handleInputChange('telefone', e.detail.value!)}
                  placeholder={t.contactPhonePlaceholder}
                  type="tel"
                />
                {formData.telefone && formData.telefone.replace(/[\s()-]/g, '').length < 9 && (
                  <IonText color="warning" style={{ fontSize: '12px', padding: '4px 0' }}>
                    {t.phoneTooShort}
                  </IonText>
                )}
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">{t.topicField}</IonLabel>
                <IonSelect
                  value={formData.topico}
                  onIonChange={e => handleInputChange('topico', e.detail.value!)}
                  placeholder={t.selectTopic}
                >
                  <IonSelectOption value="Música">{t.music}</IonSelectOption>
                  <IonSelectOption value="Desporto">{t.sport}</IonSelectOption>
                  <IonSelectOption value="Arte">{t.art}</IonSelectOption>
                  <IonSelectOption value="Tecnologia">{t.technology}</IonSelectOption>
                  <IonSelectOption value="Automobilismo">{t.motorsport}</IonSelectOption>
                  <IonSelectOption value="Gastronomia">{t.gastronomy}</IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">{t.subtopicField}</IonLabel>
                <IonInput
                  value={formData.subtopico}
                  onIonChange={e => handleInputChange('subtopico', e.detail.value!)}
                  placeholder={t.subtopicPlaceholder}
                  required
                />
              </IonItem>

              <IonButton
                expand="block"
                type="submit"
                style={{ marginTop: '20px' }}
                disabled={loading}
              >
                {t.createEventBtn}
              </IonButton>
            </IonCardContent>
          </IonCard>
        </form>

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

export default CreateEvent;