import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { DrinkSearchResult } from '@/api/endpoints/catalog';
import type { ServingFormatOption } from '@/features/consumptions/servingFormats';
import { useLogConsumption } from '@/features/consumptions/useLogConsumption';
import { DrinkSearch } from '@/features/consumptions/components/DrinkSearch';
import { FormatSelector } from '@/features/consumptions/components/FormatSelector';
import { QuantityStepper } from '@/components/QuantityStepper';
import { Button } from '@/components/Button';
import { SuccessOverlay } from '@/components/SuccessOverlay';
import { apiErrorMessage } from '@/features/leagues/errors';
import { colors } from '@/theme/colors';

export default function LogConsumptionScreen() {
  const router = useRouter();
  const { leagueId, leagueName } = useLocalSearchParams<{
    leagueId: string;
    leagueName?: string;
  }>();

  const logConsumption = useLogConsumption(leagueId);
  const [drink, setDrink] = useState<DrinkSearchResult | null>(null);
  const [format, setFormat] = useState<ServingFormatOption | null>(null);
  const [quantity, setQuantity] = useState(1);

  const canSubmit = !!drink && !!format && !logConsumption.isPending;

  function onSubmit() {
    if (!drink || !format) return;
    logConsumption.mutate({
      leagueId,
      drinkId: drink.drinkId,
      servingFormatId: format.id,
      quantity,
    });
  }

  // Success: show the animated overlay, then return to the dashboard.
  if (logConsumption.isSuccess) {
    return (
      <SuccessOverlay
        title="Drink logged!"
        points={logConsumption.data.points}
        onDone={() => router.back()}
      />
    );
  }

  const errorMessage = logConsumption.isError
    ? apiErrorMessage(logConsumption.error, {
        404: 'That drink is not in the catalog yet (the live catalog endpoint is pending).',
        422: 'This league has no active season yet — an owner must start one first.',
      })
    : null;

  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {leagueName ? <Text style={styles.context}>Logging in {leagueName}</Text> : null}

        <DrinkSearch selected={drink} onSelect={setDrink} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Format</Text>
          <FormatSelector selectedId={format?.id ?? null} onSelect={setFormat} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How many?</Text>
          <QuantityStepper value={quantity} onChange={setQuantity} />
        </View>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Log it 🍻"
          loading={logConsumption.isPending}
          disabled={!canSubmit}
          onPress={onSubmit}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20, gap: 24, paddingBottom: 32 },
  context: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  section: { gap: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.text },
  error: { color: colors.danger, fontSize: 14 },
  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
