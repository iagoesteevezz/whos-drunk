import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

/** Large, thumb-friendly numeric stepper for the quantity field. */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 50,
  step = 1,
}: QuantityStepperProps) {
  const dec = () => onChange(Math.max(min, +(value - step).toFixed(2)));
  const inc = () => onChange(Math.min(max, +(value + step).toFixed(2)));

  return (
    <View style={styles.row}>
      <StepButton label="−" onPress={dec} disabled={value <= min} />
      <View style={styles.valueBox}>
        <Text style={styles.value}>{value}</Text>
      </View>
      <StepButton label="+" onPress={inc} disabled={value >= max} />
    </View>
  );
}

function StepButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled && styles.buttonDisabled]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontSize: 30, fontWeight: '800', color: colors.primary, lineHeight: 34 },
  valueBox: { minWidth: 64, alignItems: 'center' },
  value: { fontSize: 34, fontWeight: '900', color: colors.text },
});
