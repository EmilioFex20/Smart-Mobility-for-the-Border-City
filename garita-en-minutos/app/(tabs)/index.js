import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import CrossingCard from '@/components/CrossingCard';
import SectionHeader from '@/components/SectionHeader';
import ForecastChart from '@/components/ForecastChart';
import QuickSummaryCard from '@/components/QuickSummaryCard';
import {
  currentWaitTimes,
  forecastData,
  quickSummary,
} from '@/data/mockData';

export default function HomeScreen() {
  const [selectedGarita, setSelectedGarita] = useState('Mexicali Centro');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.appName}>Garita en Minutos</Text>
          <Text style={styles.subtitle}>Tiempos de espera en Mexicali</Text>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title="Tiempos actuales"
            subtitle="Actualizado en tiempo real"
          />
          {currentWaitTimes.map((waitTime, index) => (
            <CrossingCard key={index} data={waitTime} />
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
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.garitaButtonText,
                    selectedGarita === garita && styles.garitaButtonTextSelected,
                  ]}>
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
});
