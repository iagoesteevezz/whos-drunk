import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { colors } from '@/theme/colors';

interface DateFieldProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  /** Latest selectable date (e.g. the 18-years-ago cutoff). */
  maximumDate?: Date;
  error?: string | null;
}

/**
 * Platform-appropriate date picker. iOS shows an inline spinner with a Done
 * button; Android pops the native modal dialog.
 */
export function DateField({
  label,
  value,
  onChange,
  placeholder = 'Select a date',
  maximumDate,
  error,
}: DateFieldProps) {
  const [show, setShow] = useState(false);

  // Open the picker near a sensible default (the max date if provided).
  const pickerValue = value ?? maximumDate ?? new Date();

  function handleChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS !== 'ios') {
      setShow(false); // Android dialog closes itself
    }
    if (event.type === 'set' && selected) {
      onChange(selected);
    }
  }

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable
        accessibilityRole="button"
        style={[styles.input, !!error && styles.inputError]}
        onPress={() => setShow(true)}
      >
        <Text style={value ? styles.valueText : styles.placeholderText}>
          {value ? formatDate(value) : placeholder}
        </Text>
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {show && (
        <View>
          <DateTimePicker
            value={pickerValue}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={maximumDate}
            onChange={handleChange}
          />
          {Platform.OS === 'ios' && (
            <Pressable style={styles.doneButton} onPress={() => setShow(false)}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

/** Formats to YYYY-MM-DD (the format the backend expects). */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputError: { borderColor: colors.danger },
  valueText: { fontSize: 16, color: colors.text },
  placeholderText: { fontSize: 16, color: colors.textMuted },
  error: { color: colors.danger, fontSize: 13 },
  doneButton: { alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 12 },
  doneText: { color: colors.primary, fontWeight: '700', fontSize: 16 },
});
