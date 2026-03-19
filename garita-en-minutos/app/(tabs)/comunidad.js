import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import GaritaSelector from '@/components/GaritaSelector';
import TimerButton from '@/components/TimerButton';
import SectionHeader from '@/components/SectionHeader';
import CommunityPostCard from '@/components/CommunityPostCard';
import { getBorderData } from '@/data/mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GARITAS = {
  'Mexicali Centro': {
    latitude: 32.6337756,
    longitude: -115.3819591,
    radiusMeters: 1,
  },
  'Mexicali Nueva': {
    latitude: 32.66769727180555,
    longitude: -115.38768233725204,
    radiusMeters: 3200,
  },
};

const CALEXICO_ZONE = {
  latitude: 32.6337756,
  longitude: -115.3819591,
  radiusMeters: 10,
};

const toRad = (value) => (Number(value) * Math.PI) / 180;

const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const aLat1 = Number(lat1);
  const aLon1 = Number(lon1);
  const aLat2 = Number(lat2);
  const aLon2 = Number(lon2);

  if ([aLat1, aLon1, aLat2, aLon2].some((v) => Number.isNaN(v))) {
    return Number.POSITIVE_INFINITY;
  }

  const R = 6371000;
  const dLat = toRad(aLat2 - aLat1);
  const dLon = toRad(aLon2 - aLon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat1)) * Math.cos(toRad(aLat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function CommunityScreen() {
  const [selectedGarita, setSelectedGarita] = useState('Mexicali Centro');
  const [isTimerActive, setIsTimerActive] = useState(false);
  //tiempos
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startedAt, setStartedAt] = useState(null);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedSpeed, setSelectedSpeed] = useState(null);
  const [finishingPost, setFinishingPost] = useState(false);
  const [distanceToCalexico, setDistanceToCalexico] = useState(null);
  const [timerVerification, setTimerVerification] = useState({
    verified: false,
    reason: null,
    distance: null,
    coords: null,
  });
  const [crossingVerified, setCrossingVerified] = useState(false);

  useEffect(() => {
    const restoreTimer = async () => {
      const values = await AsyncStorage.multiGet([
        'timer_active',
        'timer_started_at',
        'timer_garita',
      ]);

      const data = Object.fromEntries(values);

      if (data.timer_active === 'true' && data.timer_started_at) {
        const savedStartedAt = Number(data.timer_started_at);

        setStartedAt(savedStartedAt);
        setSelectedGarita(data.timer_garita || 'Mexicali Centro');
        setIsTimerActive(true);
        setElapsedTime(Math.floor((Date.now() - savedStartedAt) / 1000));
      }
    };

    restoreTimer();
  }, []);

  useEffect(() => {
    let interval;

    if (isTimerActive && startedAt) {
      interval = setInterval(() => {
        const seconds = Math.floor((Date.now() - startedAt) / 1000);
        setElapsedTime(seconds);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, startedAt]);

  useEffect(() => {
    let mounted = true;

    async function loadCommunityData() {
      try {
        const data = await getBorderData();
        if (mounted) {
          setPosts(data.communityPosts ?? []);
        }
      } catch (error) {
        console.error('Error loading community data:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCommunityData();

    return () => {
      mounted = false;
    };
  }, []);

  const startAutoStopTracking = async () => {
    try {
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 5,
        },
        async (location) => {
          const coords = location.coords;

          const distanceToCalexico = getDistanceInMeters(
            coords.latitude,
            coords.longitude,
            CALEXICO_ZONE.latitude,
            CALEXICO_ZONE.longitude,
          );
          setDistanceToCalexico(distanceToCalexico);
          // Logs para validar
          /*console.log('WATCH user coords:', coords.latitude, coords.longitude);
          console.log('WATCH distance to Calexico:', distanceToCalexico);
          console.log('WATCH zone radius:', CALEXICO_ZONE.radiusMeters);*/

          if (distanceToCalexico <= CALEXICO_ZONE.radiusMeters) {
            sub.remove();
            setLocationSubscription(null);
            setIsTimerActive(false);
            setCrossingVerified(true);

            Alert.alert(
              'Cruce detectado',
              'Detectamos que cruzaste la garita, publica y ayuda a los demás.',
              [
                {
                  text: 'Después',
                  style: 'cancel',
                },
                {
                  text: 'Publicar',
                  onPress: stopTimerAndOpenPost,
                },
              ],
            );
          }
        },
      );

      setLocationSubscription(sub);
    } catch (error) {
      console.error('Error starting auto-stop tracking:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [locationSubscription]);

  const verifyUserAtGarita = async () => {
    try {
      const garita = GARITAS[selectedGarita];

      if (!garita) {
        return {
          verified: false,
          reason: 'Garita sin coordenadas configuradas',
        };
      }

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        return {
          verified: false,
          reason: 'Permiso de ubicación denegado',
        };
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const userLat = Number(position.coords.latitude);
      const userLon = Number(position.coords.longitude);
      const garitaLat = Number(garita.latitude);
      const garitaLon = Number(garita.longitude);

      const baseRadius = Number(garita.radiusMeters);
      const gpsAccuracy = Number(position.coords.accuracy ?? 0);

      const distance = getDistanceInMeters(
        userLat,
        userLon,
        garitaLat,
        garitaLon,
      );

      const allowedRadius = baseRadius + gpsAccuracy;

      // Logs para verificar la funcionalidad de la ubicacion
      /*console.log('selectedGarita:', selectedGarita);
      console.log('userLat/userLon:', userLat, userLon);
      console.log('garitaLat/garitaLon:', garitaLat, garitaLon);
      console.log('distance:', distance);
      console.log('baseRadius:', baseRadius, typeof baseRadius);
      console.log('gpsAccuracy:', gpsAccuracy);
      console.log('allowedRadius:', allowedRadius);
      console.log('verified?:', distance <= allowedRadius);*/

      if (
        [
          userLat,
          userLon,
          garitaLat,
          garitaLon,
          baseRadius,
          distance,
          allowedRadius,
        ].some((v) => Number.isNaN(v))
      ) {
        return {
          verified: false,
          reason: 'Hay valores inválidos en la verificación de ubicación',
        };
      }

      return {
        verified: distance <= allowedRadius,
        distance,
        allowedRadius,
        coords: position.coords,
      };
    } catch (error) {
      console.error('Error checking location:', error);
      return {
        verified: false,
        reason: 'No se pudo verificar la ubicación',
      };
    }
  };

  const handleStartTimer = async () => {
    const locationCheck = await verifyUserAtGarita();

    if (locationCheck.verified) {
      setTimerVerification(locationCheck);
      const now = Date.now();
      setStartedAt(now);
      setElapsedTime(0);
      setIsTimerActive(true);
      await AsyncStorage.multiSet([
        ['timer_active', 'true'],
        ['timer_started_at', String(now)],
        ['timer_garita', selectedGarita],
      ]);
      startAutoStopTracking();
      return;
    }

    Alert.alert(
      'No pudimos verificar tu ubicación',
      locationCheck.reason
        ? `${locationCheck.reason}. ¿Quieres iniciar el cronómetro de todos modos?`
        : 'No parece que estés cerca de la garita. Intentalo nuevamente',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
    );
  };

  const clearTimerStorage = async () => {
    await AsyncStorage.multiRemove([
      'timer_active',
      'timer_started_at',
      'timer_garita',
    ]);
  };
  const askToFinishTimer = () => {
    if (!crossingVerified) {
      Alert.alert('Terminar cronómetro', '¿Quieres terminar este cruce?', [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Terminar',
          onPress: stopTimerWithoutPost,
        },
      ]);
    } else {
      Alert.alert('Terminar cronómetro', '¿Quieres publicar este cruce?', [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Terminar sin publicar',
          onPress: stopTimerWithoutPost,
        },
        {
          text: 'Publicar',
          onPress: stopTimerAndOpenPost,
        },
      ]);
    }
    clearTimerStorage();
  };
  const stopTimerWithoutPost = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }

    setIsTimerActive(false);
    setElapsedTime(0);
    setDistanceToCalexico(null);
    setTimerVerification({
      verified: false,
      reason: null,
      distance: null,
      coords: null,
    });
  };

  const stopTimerAndOpenPost = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }

    setIsTimerActive(false);
    setCommentModalVisible(true);
  };
  const handleTimerToggle = () => {
    if (isTimerActive) {
      askToFinishTimer();
    } else {
      handleStartTimer();
    }
  };

  const finishAndCreatePost = async () => {
    if (!crossingVerified) {
      Alert.alert(
        'Cruce no verificado',
        'Solo puedes publicar cuando la app detecte que ya cruzaste.',
      );
      return;
    }
    if (!selectedSpeed) {
      Alert.alert(
        'Selecciona una opción',
        'Elige si tu cruce fue rápido, normal o lento.',
      );
      return;
    }

    try {
      setFinishingPost(true);

      const crossingTime = Math.max(1, Math.floor(elapsedTime / 60));

      const newPost = {
        id: Date.now().toString(),
        garita: selectedGarita,
        crossingTime,
        timestamp: new Date(),
        timeAgo: 'Justo ahora',
        trafficLevel: selectedSpeed,
        verified: true,
        distance: timerVerification.distance ?? null,
        verificationReason: null,
      };

      setPosts((prevPosts) => [newPost, ...prevPosts]);
      setSelectedSpeed(null);
      setCommentModalVisible(false);
      setElapsedTime(0);
      setDistanceToCalexico(null);
      setCrossingVerified(false);
      setTimerVerification({
        verified: false,
        reason: null,
        distance: null,
        coords: null,
      });
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'No se pudo publicar el reporte.');
    } finally {
      setFinishingPost(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Cargando reportes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.appName}>Comunidad</Text>
          <Text style={styles.subtitle}>Comparte y mira tiempos reales</Text>
        </View>

        <View style={styles.timerSection}>
          <SectionHeader
            title="Cronómetro de fila"
            subtitle="Inicia al entrar a la fila"
          />

          {!isTimerActive && (
            <GaritaSelector
              selectedGarita={selectedGarita}
              onSelect={setSelectedGarita}
            />
          )}

          <TimerButton
            isActive={isTimerActive}
            onPress={handleTimerToggle}
            elapsedTime={elapsedTime}
          />

          {isTimerActive && (
            <View style={styles.activeInfo}>
              <Text style={styles.activeInfoText}>
                Cronómetro activo en: {selectedGarita}
              </Text>

              <Text style={styles.activeInfoSubtext}>
                {timerVerification.verified
                  ? 'Ubicación verificada al iniciar'
                  : 'Cronómetro iniciado sin verificación'}
              </Text>

              {distanceToCalexico !== null && (
                <Text style={styles.debugDistanceText}>
                  Distancia a zona de llegada: {Math.round(distanceToCalexico)}{' '}
                  m
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.feedSection}>
          <SectionHeader
            title="Reportes de la comunidad"
            subtitle={`${posts.length} cruces reportados`}
          />
          {posts.map((post) => (
            <CommunityPostCard key={post.id} post={post} />
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Modal
        visible={commentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>¿Cómo estuvo tu cruce?</Text>
            <Text style={styles.modalSubtitle}>
              Elige una sola opción para ayudar a la comunidad
            </Text>

            {['Rapido', 'Normal', 'Lento'].map((option) => {
              const selected = selectedSpeed === option;

              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    selected && styles.optionButtonSelected,
                  ]}
                  onPress={() => setSelectedSpeed(option)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.radioOuter,
                      selected && styles.radioOuterSelected,
                    ]}
                  >
                    {selected && <View style={styles.radioInner} />}
                  </View>

                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setSelectedSpeed(null);
                  setCommentModalVisible(false);
                }}
                disabled={finishingPost}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.publishButton]}
                onPress={finishAndCreatePost}
                disabled={finishingPost}
              >
                <Text style={styles.publishButtonText}>
                  {finishingPost ? 'Publicando...' : 'Publicar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
  },
  timerSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  activeInfo: {
    backgroundColor: '#dbeafe',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  activeInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
    textAlign: 'center',
  },
  activeInfoSubtext: {
    marginTop: 4,
    fontSize: 13,
    color: '#1d4ed8',
    textAlign: 'center',
  },
  feedSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  bottomSpacing: {
    height: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    marginBottom: 12,
  },

  optionButtonSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },

  optionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },

  optionTextSelected: {
    color: '#2563eb',
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#9ca3af',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  radioOuterSelected: {
    borderColor: '#2563eb',
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  publishButton: {
    backgroundColor: '#2563eb',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '700',
  },
  publishButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  debugDistanceText: {
    marginTop: 8,
    fontSize: 13,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '600',
  },
});
