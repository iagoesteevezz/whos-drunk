import { useRef, useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore, useTranslation } from '@/i18n';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/Button';
import { colors } from '@/theme/colors';

const SLIDES = [
  { emoji: '🏟️', titleKey: 'onb.slide1.title', subtitleKey: 'onb.slide1.subtitle' },
  { emoji: '👑', titleKey: 'onb.slide2.title', subtitleKey: 'onb.slide2.subtitle' },
  { emoji: '🔔', titleKey: 'onb.slide3.title', subtitleKey: 'onb.slide3.subtitle' },
];

export default function Welcome() {
  const { t } = useTranslation();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const onboardingDone = useSettingsStore((s) => s.onboardingDone);
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // Returning (logged-out) users skip the intro.
  if (onboardingDone) {
    return <Redirect href="/(auth)/login" />;
  }

  const isLast = index === SLIDES.length - 1;

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(next);
  }

  function onPrimary() {
    if (!isLast) {
      scrollRef.current?.scrollTo({ x: width * (index + 1), animated: true });
      setIndex(index + 1);
    } else {
      completeOnboarding();
      router.replace('/(auth)/register');
    }
  }

  function goLogin() {
    completeOnboarding();
    router.replace('/(auth)/login');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.logoBar}>
        <Logo size={0.7} />
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={styles.flex}
      >
        {SLIDES.map((slide) => (
          <View key={slide.titleKey} style={[styles.slide, { width }]}>
            <View style={styles.emojiCircle}>
              <Text style={styles.emoji}>{slide.emoji}</Text>
            </View>
            <Text style={styles.title}>{t(slide.titleKey)}</Text>
            <Text style={styles.subtitle}>{t(slide.subtitleKey)}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        <Button title={isLast ? t('onb.start') : t('onb.next')} variant="highlight" onPress={onPrimary} />
        <Pressable onPress={goLogin} style={styles.loginLink}>
          <Text style={styles.loginText}>{t('onb.haveAccount')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  flex: { flex: 1 },
  logoBar: { alignItems: 'center', paddingTop: 12 },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36, gap: 20 },
  emojiCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 84 },
  title: { fontSize: 32, fontWeight: '900', color: colors.white, textAlign: 'center' },
  subtitle: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { backgroundColor: colors.highlight, width: 22 },
  footer: { padding: 24, gap: 14 },
  loginLink: { alignItems: 'center', paddingVertical: 8 },
  loginText: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
