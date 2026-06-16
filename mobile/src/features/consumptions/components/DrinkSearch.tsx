import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { AbvSource, DrinkSearchResult } from '@/api/endpoints/catalog';
import { TextField } from '@/components/TextField';
import { useDrinkSearch } from '../useDrinkSearch';
import { colors } from '@/theme/colors';

interface DrinkSearchProps {
  selected: DrinkSearchResult | null;
  onSelect: (drink: DrinkSearchResult) => void;
}

const MAX_VISIBLE = 8;

export function DrinkSearch({ selected, onSelect }: DrinkSearchProps) {
  const [query, setQuery] = useState('');
  const { enabled, isSearching, items, isSample } = useDrinkSearch(query);

  const visible = items.slice(0, MAX_VISIBLE);

  return (
    <View style={styles.wrapper}>
      <TextField
        label="What are you drinking?"
        placeholder="Search a brand or name…"
        autoCorrect={false}
        value={query}
        onChangeText={setQuery}
      />

      {/* Currently selected drink (sticky summary) */}
      {selected ? (
        <View style={styles.selectedBanner}>
          <Text style={styles.selectedText}>
            Selected: <Text style={styles.selectedName}>{selected.name}</Text> · {selected.abv}% ABV
          </Text>
        </View>
      ) : null}

      {!enabled ? (
        <Text style={styles.hint}>Type at least 2 letters to search the catalog.</Text>
      ) : isSearching && visible.length === 0 ? (
        <SearchSkeleton />
      ) : visible.length === 0 ? (
        <Text style={styles.hint}>No matches. Try another brand or a generic option.</Text>
      ) : (
        <View style={styles.results}>
          {isSample ? (
            <View style={styles.sampleBanner}>
              <Text style={styles.sampleText}>
                Sample results · live catalog (Open Food Facts) coming soon
              </Text>
            </View>
          ) : null}

          {visible.map((drink) => {
            const isSelected = selected?.drinkId === drink.drinkId;
            return (
              <Pressable
                key={drink.drinkId}
                onPress={() => onSelect(drink)}
                style={[styles.row, isSelected && styles.rowSelected]}
              >
                <View style={styles.rowMain}>
                  <Text style={styles.rowName}>{drink.name}</Text>
                  <Text style={styles.rowMeta}>
                    {drink.brandName ? `${drink.brandName} · ` : ''}
                    {drink.abv}% ABV
                  </Text>
                </View>
                <SourceBadge source={drink.abvSource} />
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

function SourceBadge({ source }: { source: AbvSource }) {
  const meta = SOURCE_META[source];
  return (
    <View style={[styles.badge, { backgroundColor: meta.bg }]}>
      <Text style={[styles.badgeText, { color: meta.fg }]}>{meta.label}</Text>
    </View>
  );
}

const SOURCE_META: Record<AbvSource, { label: string; bg: string; fg: string }> = {
  OPENFOODFACTS: { label: 'OFF', bg: '#E4F5EC', fg: colors.success },
  COCKTAILDB: { label: 'Cocktails', bg: '#E9F0FF', fg: '#2A5BD7' },
  MANUAL: { label: 'Manual', bg: '#EEE9FF', fg: colors.primary },
  DEFAULT: { label: 'Estimate', bg: '#F0F0F0', fg: colors.textMuted },
};

function SearchSkeleton() {
  return (
    <View style={styles.results}>
      <View style={styles.skeletonHeader}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.hint}>Searching the catalog…</Text>
      </View>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.skeletonRow}>
          <View style={styles.skeletonLineWide} />
          <View style={styles.skeletonLineNarrow} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 10 },
  hint: { color: colors.textMuted, fontSize: 14, paddingVertical: 4 },
  results: { gap: 8 },
  selectedBanner: {
    backgroundColor: colors.primarySoft,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  selectedText: { color: colors.primary, fontSize: 13 },
  selectedName: { fontWeight: '800' },
  sampleBanner: {
    backgroundColor: '#FFF6E5',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  sampleText: { color: '#9A6A00', fontSize: 12, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  rowSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  rowMain: { flex: 1, gap: 2 },
  rowName: { fontSize: 15, fontWeight: '700', color: colors.text },
  rowMeta: { fontSize: 13, color: colors.textMuted },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  skeletonHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  skeletonRow: {
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  skeletonLineWide: { height: 12, borderRadius: 6, backgroundColor: '#ECECEC', width: '70%' },
  skeletonLineNarrow: { height: 10, borderRadius: 5, backgroundColor: '#F2F2F2', width: '40%' },
});
