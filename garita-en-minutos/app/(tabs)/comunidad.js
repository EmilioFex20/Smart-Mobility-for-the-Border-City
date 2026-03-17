import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import GaritaSelector from '@/components/GaritaSelector';
import TimerButton from '@/components/TimerButton';
import SectionHeader from '@/components/SectionHeader';
import CommunityPostCard from '@/components/CommunityPostCard';
import { communityPosts } from '@/data/mockData';

export default function CommunityScreen() {
  const [selectedGarita, setSelectedGarita] = useState('Mexicali Centro');
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [posts, setPosts] = useState(communityPosts);

  useEffect(() => {
    let interval;

    if (isTimerActive) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerActive]);

  const handleTimerToggle = () => {
    if (isTimerActive) {
      const newPost = {
        id: Date.now().toString(),
        garita: selectedGarita,
        crossingTime: Math.floor(elapsedTime / 60),
        timestamp: new Date(),
        timeAgo: 'Justo ahora',
        comment: 'Mi cruce recién completado',
      };

      setPosts([newPost, ...posts]);

      setElapsedTime(0);
      setIsTimerActive(false);
    } else {
      setIsTimerActive(true);
    }
  };

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
  feedSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  bottomSpacing: {
    height: 32,
  },
});
