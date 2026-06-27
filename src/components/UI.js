import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, spacing, shadows, typography } from '../theme';

/* ---------- Card ---------- */
export function Card({ children, style, padded = true }) {
  return (
    <View style={[styles.card, padded && { padding: spacing.lg }, style]}>
      {children}
    </View>
  );
}

/* ---------- Primary Button ---------- */
export function PrimaryButton({ label, onPress, icon, disabled, style }) {
  return (
    <Pressable
      onPress={disabled ? null : onPress}
      android_ripple={{ color: 'rgba(255,255,255,0.18)' }}
      style={({ pressed }) => [
        styles.btnPrimary,
        disabled && styles.btnDisabled,
        pressed && !disabled && { transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      <Text style={[styles.btnPrimaryLabel, disabled && { color: colors.ink3 }]}>{label}</Text>
      {icon ? (
        <MaterialIcons name={icon} size={22} color={disabled ? colors.ink3 : colors.white} />
      ) : null}
    </Pressable>
  );
}

/* ---------- Secondary Button ---------- */
export function SecondaryButton({ label, onPress, icon, style }) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: colors.primarySoft }}
      style={({ pressed }) => [styles.btnSecondary, pressed && { opacity: 0.85 }, style]}
    >
      {icon ? <MaterialIcons name={icon} size={20} color={colors.primary} style={{ marginRight: 6 }} /> : null}
      <Text style={styles.btnSecondaryLabel}>{label}</Text>
    </Pressable>
  );
}

/* ---------- Chip ---------- */
export function Chip({ label, color = colors.primary, bg = colors.primarySoft, icon, style }) {
  return (
    <View style={[styles.chip, { backgroundColor: bg }, style]}>
      {icon ? <MaterialIcons name={icon} size={13} color={color} style={{ marginRight: 4 }} /> : null}
      <Text style={[styles.chipLabel, { color }]}>{label}</Text>
    </View>
  );
}

/* ---------- Section header ---------- */
export function SectionHeader({ title, action, onAction }) {
  return (
    <View style={styles.sectionHead}>
      <Text style={typography.h3}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* ---------- AppBar ---------- */
export function AppBar({ title, subtitle, onBack, right }) {
  return (
    <View style={styles.appbar}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.iconBtn} android_ripple={{ color: colors.surface3, borderless: true, radius: 20 }}>
          <MaterialIcons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
      ) : (
        <View style={styles.iconBtn} />
      )}
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={styles.appbarTitle} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.appbarSub} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right || <View style={styles.iconBtn} />}
    </View>
  );
}

/* ---------- Bottom navigation ---------- */
export function BottomNav({ active = 'Home', onNavigate }) {
  const items = [
    { key: 'Home',       label: 'Home',     icon: 'home' },
    { key: 'Upload',     label: 'Screen',   icon: 'medical-services' },
    { key: 'History',    label: 'History',  icon: 'history' },
    { key: 'Research',   label: 'Research', icon: 'science' },
  ];
  return (
    <View style={styles.bottomNav}>
      {items.map((it) => {
        const isActive = active === it.key;
        return (
          <Pressable
            key={it.key}
            onPress={() => onNavigate && onNavigate(it.key)}
            android_ripple={{ color: colors.surface3, borderless: true, radius: 30 }}
            style={styles.bottomItem}
          >
            <MaterialIcons name={it.icon} size={24} color={isActive ? colors.primary : colors.ink3} />
            <Text style={[styles.bottomLabel, isActive && { color: colors.primary, fontWeight: '700' }]}>{it.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.soft,
  },

  btnPrimary: {
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadows.float,
  },
  btnPrimaryLabel: { color: colors.white, fontSize: 16, fontWeight: '700', marginRight: 6 },
  btnDisabled: { backgroundColor: colors.surface3, ...{ shadowOpacity: 0, elevation: 0 } },

  btnSecondary: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryLabel: { color: colors.primary, fontSize: 14, fontWeight: '700' },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  chipLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },

  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionAction: { color: colors.primary, fontWeight: '700', fontSize: 13 },

  appbar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  iconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  appbarTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  appbarSub:   { fontSize: 11, fontWeight: '600', color: colors.ink2, marginTop: 1 },

  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 8,
  },
  bottomItem: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 4 },
  bottomLabel: { fontSize: 11, fontWeight: '500', color: colors.ink3 },
});
