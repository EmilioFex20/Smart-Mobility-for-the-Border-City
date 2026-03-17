import { View, Text, StyleSheet } from 'react-native';
import { Clock, MapPin } from 'lucide-react-native';
import type { CommunityPost } from '@/data/mockData';

interface CommunityPostCardProps {
  post: CommunityPost;
}

export default function CommunityPostCard({ post }: CommunityPostCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.garitaContainer}>
          <MapPin size={16} color="#2563eb" />
          <Text style={styles.garitaName}>{post.garita}</Text>
        </View>
        <Text style={styles.timeAgo}>{post.timeAgo}</Text>
      </View>

      <View style={styles.crossingTimeContainer}>
        <Clock size={20} color="#10b981" />
        <Text style={styles.crossingTime}>{post.crossingTime} min</Text>
      </View>

      {post.comment && (
        <Text style={styles.comment}>"{post.comment}"</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  garitaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  garitaName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  timeAgo: {
    fontSize: 12,
    color: '#9ca3af',
  },
  crossingTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  crossingTime: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
  },
  comment: {
    fontSize: 14,
    color: '#4b5563',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
