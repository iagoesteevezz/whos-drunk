import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SERVING_FORMATS, type ServingFormatOption } from '../servingFormats';
import { colors } from '@/theme/colors';

interface FormatSelectorProps {
  selectedId: number | null;
  onSelect: (format: ServingFormatOption) => void;
}

/** Big, tap-friendly grid of serving formats. */
export function FormatSelector({ selectedId, onSelect }: FormatSelectorProps) {
  return (
    <View style={styles.grid}>
      {SERVING_FORMATS.map((format) => {
        const selected = format.id === selectedId;
        return (
          <Pressable
            key={format.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onSelect(format)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={styles.emoji}>{format.emoji}</Text>
            <Text style={[styles.label, selected && styles.labelSelected]}>{format.label}</Text>
            <Text style={[styles.hint, selected && styles.hintSelected]}>{format.hint}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  chip: {
    width: '47%',
    flexGrow: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingVertical: 16,
    paddingHorizontal: 14,
    gap: 2,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  emoji: { fontSize: 26 },
  label: { fontSize: 16, fontWeight: '700', color: colors.text },
  labelSelected: { color: colors.primary },
  hint: { fontSize: 12, color: colors.textMuted },
  hintSelected: { color: colors.primary },
});
