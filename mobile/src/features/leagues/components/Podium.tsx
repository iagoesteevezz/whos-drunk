import { StyleSheet, Text, View } from 'react-native';
import type { LeaderboardEntry } from '@/api/endpoints/leaderboard';
import { formatPoints, initialOf } from '../format';
import { colors } from '@/theme/colors';

interface PodiumProps {
  top: LeaderboardEntry[]; // up to 3, in rank order
  currentUserId?: string | null;
}

const PLACE_STYLE = {
  1: { medal: '🥇', color: '#F6C445', height: 92 },
  2: { medal: '🥈', color: '#C0C7D0', height: 66 },
  3: { medal: '🥉', color: '#CD8E5E', height: 46 },
} as const;

/** Top-3 podium. Center = 1st, left = 2nd, right = 3rd. */
export function Podium({ top, currentUserId }: PodiumProps) {
  const first = top[0];
  const second = top[1];
  const third = top[2];

  return (
    <View style={styles.row}>
      <PodiumSlot entry={second} place={2} currentUserId={currentUserId} />
      <PodiumSlot entry={first} place={1} currentUserId={currentUserId} />
      <PodiumSlot entry={third} place={3} currentUserId={currentUserId} />
    </View>
  );
}

function PodiumSlot({
  entry,
  place,
  currentUserId,
}: {
  entry?: LeaderboardEntry;
  place: 1 | 2 | 3;
  currentUserId?: string | null;
}) {
  const meta = PLACE_STYLE[place];

  // Keep the column width so the center stays centered even with <3 players.
  if (!entry) {
    return <View style={styles.slot} />;
  }

  const isMe = entry.userId === currentUserId;

  return (
    <View style={styles.slot}>
      <Text style={styles.medal}>{meta.medal}</Text>
      <View style={[styles.avatar, { borderColor: meta.color }]}>
        <Text style={styles.avatarText}>{initialOf(entry.displayName)}</Text>
      </View>
      <Text style={[styles.name, isMe && styles.meText]} numberOfLines={1}>
        {entry.displayName}
        {isMe ? ' (you)' : ''}
      </Text>
      <Text style={styles.points}>{formatPoints(entry.totalPoints)} pts</Text>
      <View style={[styles.pedestal, { height: meta.height, backgroundColor: meta.color }]}>
        <Text style={styles.place}>{place}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  slot: { flex: 1, alignItems: 'center', gap: 4 },
  medal: { fontSize: 24 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: colors.primary },
  name: { fontSize: 13, fontWeight: '700', color: colors.text, maxWidth: '100%' },
  meText: { color: colors.primary },
  points: { fontSize: 13, fontWeight: '800', color: colors.textMuted },
  pedestal: {
    width: '90%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 6,
    marginTop: 4,
  },
  place: { fontSize: 18, fontWeight: '900', color: 'rgba(0,0,0,0.45)' },
});
