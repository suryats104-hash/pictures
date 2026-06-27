import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, shadows } from '../theme';
import { PrimaryButton } from '../components/UI';

export default function SplashScreen({ navigation }) {
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={['#FFFFFF', '#F5F8FC', '#E6F0FB']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.blobA} />
        <View style={styles.blobB} />

        <Animated.View style={{ alignItems: 'center', opacity: fade, transform: [{ translateY: lift }] }}>
          <View style={styles.logoWrap}>
            <LinearGradient
              colors={[colors.primary, colors.teal]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.logoInner}
            >
              <MaterialCommunityIcons name="camera-iris" size={56} color={colors.white} />
            </LinearGradient>
            <View style={styles.badge}>
              <MaterialCommunityIcons name="tooth" size={14} color={colors.white} />
            </View>
          </View>

          <Text style={[typography.display, { marginTop: 24, fontSize: 44 }]}>Pictures</Text>
          <Text style={styles.subBrand}>DHAANT</Text>
          <Text style={styles.tagline}>Intraoral Image Capture{'\n'}& Patient Database</Text>
        </Animated.View>

        <Animated.View style={{ opacity: fade }}>
          <View style={styles.illoWrap}>
            <LinearGradient colors={[colors.primaryLight, colors.tealBg]} style={styles.illoOuter} />
            <View style={styles.illoInner}>
              <MaterialCommunityIcons name="image-multiple" size={92} color={colors.primary} />
            </View>
            <MaterialIcons name="auto-awesome" size={26} color={colors.teal} style={styles.illoSparkA} />
            <MaterialIcons name="folder-special" size={22} color={colors.primary} style={styles.illoSparkB} />
            <MaterialIcons name="crop" size={20} color={colors.teal} style={styles.illoSparkC} />
          </View>
        </Animated.View>

        <View style={{ width: '100%' }}>
          <PrimaryButton
            label="Get Started"
            icon="arrow-forward"
            onPress={() => navigation.replace('Home')}
          />
          <Text style={styles.version}>v1.0  ·  Research data collection</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  blobA: { position: 'absolute', top: 80, left: -80, width: 260, height: 260, borderRadius: 200, backgroundColor: colors.primary, opacity: 0.08 },
  blobB: { position: 'absolute', bottom: 180, right: -70, width: 220, height: 220, borderRadius: 200, backgroundColor: colors.teal, opacity: 0.10 },

  logoWrap: {
    width: 112, height: 112, borderRadius: 28, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line,
    ...shadows.card,
  },
  logoInner: {
    position: 'absolute', top: 8, left: 8, right: 8, bottom: 8,
    borderRadius: 22, alignItems: 'center', justifyContent: 'center',
  },
  badge: {
    position: 'absolute', top: -6, right: -6,
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.teal,
    borderWidth: 2, borderColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
  },

  subBrand: { marginTop: 6, color: colors.primary, fontWeight: '700', letterSpacing: 3, fontSize: 12 },
  tagline: { marginTop: 18, textAlign: 'center', color: colors.ink2, fontSize: 16, lineHeight: 24 },

  illoWrap: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center' },
  illoOuter: { position: 'absolute', width: 220, height: 220, borderRadius: 110 },
  illoInner: {
    width: 168, height: 168, borderRadius: 84, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center', ...shadows.soft,
  },
  illoSparkA: { position: 'absolute', top: 8, right: 22 },
  illoSparkB: { position: 'absolute', bottom: 14, left: 10 },
  illoSparkC: { position: 'absolute', top: 50, left: -2 },

  version: { textAlign: 'center', marginTop: 14, color: colors.ink3, fontSize: 11, fontWeight: '600', letterSpacing: 1 },
});
