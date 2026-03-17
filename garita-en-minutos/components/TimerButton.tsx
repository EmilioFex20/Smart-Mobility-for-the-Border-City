import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Play, Square } from 'lucide-react-native';

interface TimerButtonProps {
  isActive: boolean;
  onPress: () => void;
  elapsedTime: number;
}

export default function TimerButton({
  isActive,
  onPress,
  elapsedTime,
}: TimerButtonProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {isActive && (
        <View style={styles.timerDisplay}>
          <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, isActive && styles.buttonActive]}
        onPress={onPress}
        activeOpacity={0.8}>
        <View style={styles.buttonContent}>
          {isActive ? (
            <Square size={24} color="#ffffff" fill="#ffffff" />
          ) : (
            <Play size={24} color="#ffffff" />
          )}
          <Text style={styles.buttonText}>
            {isActive ? 'Terminar fila' : 'Iniciar cronómetro'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 24,
  },
  timerDisplay: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginBottom: 16,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#2563eb',
    fontVariant: ['tabular-nums'],
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    minWidth: 220,
  },
  buttonActive: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});
