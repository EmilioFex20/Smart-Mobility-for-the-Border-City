import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { ForecastData } from '@/data/mockData';

interface ForecastChartProps {
  data: ForecastData[];
  selectedGarita: string;
}

export default function ForecastChart({
  data,
  selectedGarita,
}: ForecastChartProps) {
  const filteredData = data.filter((d) => d.garita === selectedGarita);

  if (!filteredData.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Sin datos de pronóstico</Text>
        <Text style={styles.emptyText}>
          No hay información disponible para {selectedGarita} en este momento.
        </Text>
      </View>
    );
  }

  const allWaitTimes = filteredData.flatMap((d) =>
    d.periods.map((p) => p.avgWaitTime)
  );

  const maxWaitTime = Math.max(...allWaitTimes, 1);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartWrapper}>
          {filteredData.map((dayData, dayIndex) => (
            <View key={dayIndex} style={styles.daySection}>
              <Text style={styles.dayLabel}>{dayData.dayLabel}</Text>
              <View style={styles.barsContainer}>
                {dayData.periods.map((period, index) => {
                  const barHeight = (period.avgWaitTime / maxWaitTime) * 120;

                  return (
                    <View key={index} style={styles.barWrapper}>
                      <View style={styles.barContainer}>
                        <Text style={styles.timeValue}>
                          {period.avgWaitTime}m
                        </Text>
                        <View
                          style={[
                            styles.bar,
                            {
                              height: barHeight,
                              backgroundColor:
                                period.avgWaitTime < 30
                                  ? '#10b981'
                                  : period.avgWaitTime < 45
                                  ? '#f59e0b'
                                  : '#ef4444',
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.periodLabel}>{period.label}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartWrapper: {
    flexDirection: 'row',
    gap: 24,
  },
  daySection: {
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    height: 160,
  },
  barWrapper: {
    alignItems: 'center',
    gap: 8,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 140,
  },
  bar: {
    width: 32,
    borderRadius: 8,
    marginTop: 4,
  },
  timeValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  periodLabel: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    width: 50,
  },
  emptyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});