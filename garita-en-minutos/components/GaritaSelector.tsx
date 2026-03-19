import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { GaritaName } from '@/data/mockData';

interface GaritaSelectorProps {
  selectedGarita: GaritaName;
  onSelect: (garita: GaritaName) => void;
}

const garitas: GaritaName[] = ['Mexicali Centro', 'Mexicali Nueva'];

export default function GaritaSelector({
  selectedGarita,
  onSelect,
}: GaritaSelectorProps) {
  const safeSelectedGarita = garitas.includes(selectedGarita)
    ? selectedGarita
    : 'Mexicali Centro';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Selecciona la garita</Text>
      <View style={styles.buttonsContainer}>
        {garitas.map((garita) => (
          <TouchableOpacity
            key={garita}
            style={[
              styles.button,
              safeSelectedGarita === garita && styles.buttonSelected,
            ]}
            onPress={() => onSelect(garita)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.buttonText,
                safeSelectedGarita === garita && styles.buttonTextSelected,
              ]}>
              {garita}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  buttonSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  buttonTextSelected: {
    color: '#2563eb',
  },
});