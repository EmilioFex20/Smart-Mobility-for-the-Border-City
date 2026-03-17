import { View, Text, StyleSheet } from 'react-native';
import { Clock } from 'lucide-react-native';
import type { CurrentWaitTime } from '@/data/mockData';

interface CrossingCardProps {
  data: CurrentWaitTime;
}

export default function CrossingCard({ data }: CrossingCardProps) {
  const statusColors = {
    rápido: '#10b981',
    moderado: '#f59e0b',
    lento: '#ef4444',
  };

  const statusBgColors = {
    rápido: '#d1fae5',
    moderado: '#fef3c7',
    lento: '#fee2e2',
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.garitaName}>{data.garita}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusBgColors[data.status] },
          ]}>
          <Text style={[styles.statusText, { color: statusColors[data.status] }]}>
            {data.status}
          </Text>
        </View>
      </View>

      <View style={styles.waitTimeContainer}>
        <Text style={styles.waitTime}>{data.waitTime}</Text>
        <Text style={styles.waitTimeLabel}>minutos</Text>
      </View>

      <View style={styles.footer}>
        <Clock size={14} color="#9ca3af" />
        <Text style={styles.lastUpdated}>{data.lastUpdated}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  garitaName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  waitTimeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  waitTime: {
    fontSize: 48,
    fontWeight: '800',
    color: '#2563eb',
    marginRight: 8,
  },
  waitTimeLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lastUpdated: {
    fontSize: 13,
    color: '#9ca3af',
  },
});
