import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import SectionHeader from '@/components/SectionHeader';

const CROSSINGS = [
  {
    id: 'centro-carro',
    label: 'Mexicali Centro - Carro',
    apiUrl: 'https://Orbit05-fila.hf.space/garita-vieja/predict',
  },
  {
    id: 'nueva-carro',
    label: 'Mexicali Nueva - Carro',
    apiUrl: 'https://Orbit05-fila.hf.space/garita-nueva/predict',
  },
  {
    id: 'centro-caminando',
    label: 'Mexicali Centro - Caminando',
    apiUrl: 'https://Orbit05-fila.hf.space/garita-vieja-caminando/predict',
  },
  {
    id: 'nueva-caminando',
    label: 'Mexicali Nueva - Caminando',
    apiUrl: 'https://Orbit05-fila.hf.space/garita-nueva-caminando/predict',
  },
];

const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DAY_NAMES_FULL  = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

const MAX_MONTHS_AHEAD = 6;

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstDay.getDay(); // 0=Sun

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));
  return cells;
}

function formatHour(hour) {
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

function getDateParams(date) {
  return {
    mes: date.getMonth() + 1,
    dia_num: date.getDay() === 0 ? 7 : date.getDay(),
  };
}

function getStatus(waitTime) {
  if (waitTime <= 30) return { label: 'Rápido',   color: '#16a34a', bg: '#dcfce7' };
  if (waitTime <= 50) return { label: 'Moderado',  color: '#d97706', bg: '#fef3c7' };
  return               { label: 'Lento',    color: '#dc2626', bg: '#fee2e2' };
}

function getDefaultHour() {
  const h = new Date().getHours();
  return h >= 6 && h <= 21 ? h : 9;
}

export default function PrediccionScreen() {
  const today = startOfDay(new Date());

  const [calYear,  setCalYear]  = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedHour, setSelectedHour] = useState(getDefaultHour);
  const [selectedCrossingId, setSelectedCrossingId] = useState(CROSSINGS[0].id);
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);

  const minYear  = today.getFullYear();
  const minMonth = today.getMonth();
  const maxDate  = new Date(today);
  maxDate.setMonth(maxDate.getMonth() + MAX_MONTHS_AHEAD);

  const canGoPrev = !(calYear === minYear && calMonth === minMonth);
  const canGoNext = new Date(calYear, calMonth + 1, 1) <= maxDate;

  const goPrevMonth = () => {
    if (!canGoPrev) return;
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };

  const goNextMonth = () => {
    if (!canGoNext) return;
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  const handleSelectDate = (date) => {
    if (!date) return;
    const d = startOfDay(date);
    if (d < today || d > maxDate) return;
    setSelectedDate(d);
    setResult(null);
  };

  const handlePredict = async () => {
    const crossing = CROSSINGS.find((c) => c.id === selectedCrossingId);
    if (!crossing) return;

    setLoading(true);
    setResult(null);

    try {
      const { mes, dia_num } = getDateParams(selectedDate);
      const response = await fetch(crossing.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mes, dia_num, hora: selectedHour }),
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      const prediction = Math.max(0, Math.round(Number(data.prediction ?? 0)));
      setResult({ prediction, crossingLabel: crossing.label });
    } catch {
      setResult({ error: 'No se pudo obtener la predicción. Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const cells  = getCalendarDays(calYear, calMonth);
  const status = result?.prediction != null ? getStatus(result.prediction) : null;

  const selectedDateLabel =
    `${DAY_NAMES_FULL[selectedDate.getDay()]} ${selectedDate.getDate()} de ${MONTH_NAMES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.appName}>Predicción</Text>
          <Text style={styles.subtitle}>Consulta tiempos estimados de espera</Text>
        </View>

        {/* ── Calendar ── */}
        <View style={styles.section}>
          <SectionHeader title="Selecciona una fecha" subtitle={selectedDateLabel} />

          <View style={styles.calendarCard}>
            <View style={styles.calNavRow}>
              <TouchableOpacity
                onPress={goPrevMonth}
                disabled={!canGoPrev}
                style={[styles.navButton, !canGoPrev && styles.navButtonDisabled]}
                activeOpacity={0.7}>
                <ChevronLeft size={20} color={canGoPrev ? '#2563eb' : '#d1d5db'} />
              </TouchableOpacity>

              <Text style={styles.calMonthTitle}>
                {MONTH_NAMES[calMonth]} {calYear}
              </Text>

              <TouchableOpacity
                onPress={goNextMonth}
                disabled={!canGoNext}
                style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
                activeOpacity={0.7}>
                <ChevronRight size={20} color={canGoNext ? '#2563eb' : '#d1d5db'} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {DAY_NAMES_SHORT.map((d) => (
                <Text key={d} style={styles.weekHeader}>{d}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {cells.map((date, index) => {
                if (!date) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }

                const d        = startOfDay(date);
                const isPast   = d < today;
                const isFuture = d > maxDate;
                const disabled = isPast || isFuture;
                const isToday  = d.getTime() === today.getTime();
                const isSelected = d.getTime() === selectedDate.getTime();

                return (
                  <TouchableOpacity
                    key={date.toISOString()}
                    style={[
                      styles.dayCell,
                      styles.dayCellTouchable,
                      isToday    && styles.dayCellToday,
                      isSelected && styles.dayCellSelected,
                      disabled   && styles.dayCellDisabled,
                    ]}
                    onPress={() => handleSelectDate(date)}
                    disabled={disabled}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.dayCellText,
                        isToday    && styles.dayCellTextToday,
                        isSelected && styles.dayCellTextSelected,
                        disabled   && styles.dayCellTextDisabled,
                      ]}>
                      {date.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Selecciona una hora" subtitle={formatHour(selectedHour)} />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hoursRow}>
            {HOURS.map((hour) => {
              const isSelected = hour === selectedHour;
              return (
                <TouchableOpacity
                  key={hour}
                  style={[styles.hourItem, isSelected && styles.hourItemSelected]}
                  onPress={() => { setSelectedHour(hour); setResult(null); }}
                  activeOpacity={0.7}>
                  <Text style={[styles.hourText, isSelected && styles.hourTextSelected]}>
                    {formatHour(hour)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Selecciona el cruce" />
          <View style={styles.crossingsContainer}>
            {CROSSINGS.map((crossing) => {
              const isSelected = crossing.id === selectedCrossingId;
              return (
                <TouchableOpacity
                  key={crossing.id}
                  style={[
                    styles.crossingButton,
                    isSelected && styles.crossingButtonSelected,
                  ]}
                  onPress={() => { setSelectedCrossingId(crossing.id); setResult(null); }}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.crossingButtonText,
                      isSelected && styles.crossingButtonTextSelected,
                    ]}>
                    {crossing.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.predictButton, loading && styles.predictButtonDisabled]}
            onPress={handlePredict}
            activeOpacity={0.8}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.predictButtonText}>Predecir tiempo de espera</Text>
            )}
          </TouchableOpacity>
        </View>

        {result && (
          <View style={styles.section}>
            {result.error ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>{result.error}</Text>
              </View>
            ) : (
              <View style={[styles.resultCard, { backgroundColor: status.bg }]}>
                <Text style={styles.resultLabel}>Tiempo estimado de espera</Text>
                <Text style={[styles.resultMinutes, { color: status.color }]}>
                  {result.prediction} min
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                  <Text style={styles.statusBadgeText}>{status.label}</Text>
                </View>
                <Text style={styles.resultCrossing}>{result.crossingLabel}</Text>
                <Text style={styles.resultDateTime}>
                  {selectedDateLabel} · {formatHour(selectedHour)}
                </Text>
              </View>
            )}
          </View>
        )}

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
  container: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
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
  subtitle: { fontSize: 15, color: '#6b7280' },
  section: { paddingHorizontal: 20, paddingTop: 24 },

  // Calendar card
  calendarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  calNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  navButtonDisabled: {
    backgroundColor: '#f9fafb',
  },
  calMonthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellTouchable: {
    borderRadius: 100,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  dayCellSelected: {
    backgroundColor: '#2563eb',
  },
  dayCellDisabled: {
    opacity: 0.3,
  },
  dayCellText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  dayCellTextToday: {
    color: '#2563eb',
  },
  dayCellTextSelected: {
    color: '#ffffff',
  },
  dayCellTextDisabled: {
    color: '#9ca3af',
  },

  // Hour selector
  hoursRow: { gap: 8, paddingVertical: 4 },
  hourItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  hourItemSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  hourText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  hourTextSelected: { color: '#2563eb' },

  // Crossing selector
  crossingsContainer: { gap: 10 },
  crossingButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  crossingButtonSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb',
  },
  crossingButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
  crossingButtonTextSelected: { color: '#2563eb' },

  // Predict button
  predictButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  predictButtonDisabled: { opacity: 0.6 },
  predictButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },

  // Result card
  resultCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  resultLabel: { fontSize: 14, fontWeight: '600', color: '#374151' },
  resultMinutes: { fontSize: 56, fontWeight: '800', lineHeight: 64 },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  statusBadgeText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  resultCrossing: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },
  resultDateTime: { fontSize: 13, color: '#6b7280', textAlign: 'center' },

  // Error card
  errorCard: {
    backgroundColor: '#fee2e2',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  errorText: { fontSize: 14, fontWeight: '600', color: '#dc2626', textAlign: 'center' },
  bottomSpacing: { height: 32 },
});
