import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import CrossingCard from '@/components/CrossingCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import SectionHeader from '@/components/SectionHeader';
import ForecastChart from '@/components/ForecastChart';
import QuickSummaryCard from '@/components/QuickSummaryCard';
import { getBorderData } from '@/data/mockData';

export default function HomeScreen() {
  const [selectedGarita, setSelectedGarita] = useState('Mexicali Centro');
  const [borderData, setBorderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getBorderData();
      setBorderData(data);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentWaitTimes = borderData?.currentWaitTimes ?? [];
  const forecastData = borderData?.forecastData ?? [];
  const quickSummary = borderData?.quickSummary ?? {
    bestTime: '--',
    worstTime: '--',
    avgToday: 0,
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Cargando tiempos de espera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>Garita en Minutos</Text>
            <Text style={styles.subtitle}>Tiempos de espera en Mexicali</Text>
          </View>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => loadData(true)}
            activeOpacity={0.7}
            disabled={refreshing}
          >
            <Text style={styles.refreshButtonText}>
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Tiempos actuales"
            subtitle="Actualizado en tiempo real"
          />
          {currentWaitTimes.map((waitTime, index) => (
            <CrossingCard key={`${waitTime.garita}-${index}`} data={waitTime} />
          ))}
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Pronóstico"
            subtitle="Tiempos estimados por horario"
          />

          <View style={styles.garitaSelectorContainer}>
            {['Mexicali Centro', 'Mexicali Nueva'].map((garita) => (
              <TouchableOpacity
                key={garita}
                style={[
                  styles.garitaButton,
                  selectedGarita === garita && styles.garitaButtonSelected,
                ]}
                onPress={() => setSelectedGarita(garita)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.garitaButtonText,
                    selectedGarita === garita &&
                      styles.garitaButtonTextSelected,
                  ]}
                >
                  {garita}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ForecastChart data={forecastData} selectedGarita={selectedGarita} />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Resumen del día" />
          <View style={styles.summaryGrid}>
            <QuickSummaryCard
              icon="best"
              title="Mejor hora"
              value={quickSummary.bestTime}
            />
            <QuickSummaryCard
              icon="worst"
              title="Mayor espera"
              value={quickSummary.worstTime}
            />
            <QuickSummaryCard
              icon="avg"
              title="Promedio"
              value={`${quickSummary.avgToday} min`}
            />
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
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
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  garitaSelectorContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  garitaButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  garitaButtonSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  garitaButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  garitaButtonTextSelected: {
    color: '#2563eb',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
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
  refreshButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
