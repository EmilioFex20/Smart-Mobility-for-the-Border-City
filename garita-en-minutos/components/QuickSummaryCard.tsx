import { View, Text, StyleSheet } from 'react-native';
import { TrendingDown, TrendingUp, Activity } from 'lucide-react-native';

interface QuickSummaryCardProps {
  icon: 'best' | 'worst' | 'avg';
  title: string;
  value: string;
}

export default function QuickSummaryCard({
  icon,
  title,
  value,
}: QuickSummaryCardProps) {
  const iconComponents = {
    best: <TrendingDown size={24} color="#10b981" />,
    worst: <TrendingUp size={24} color="#ef4444" />,
    avg: <Activity size={24} color="#2563eb" />,
  };

  const iconBgColors = {
    best: '#d1fae5',
    worst: '#fee2e2',
    avg: '#dbeafe',
  };

  return (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: iconBgColors[icon] }]}>
        {iconComponents[icon]}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 6,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
});
