import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, shadows } from '../theme';
import { Card, PrimaryButton } from '../components/UI';
import { usePatients } from '../context/PatientContext';

export default function HomeScreen({ navigation }) {
  const { patients } = usePatients();
  const totalPhotos = patients.reduce((s, p) => s + (p.photos?.length || 0), 0);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.hello}>Welcome,</Text>
            <Text style={typography.h1}>Pictures</Text>
          </View>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="camera-iris" size={26} color={colors.white} />
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <MaterialIcons name="people" size={22} color={colors.primary} />
            <Text style={styles.statNum}>{patients.length}</Text>
            <Text style={styles.statLabel}>Patients</Text>
          </Card>
          <Card style={styles.statCard}>
            <MaterialIcons name="photo-library" size={22} color={colors.teal} />
            <Text style={styles.statNum}>{totalPhotos}</Text>
            <Text style={styles.statLabel}>Photos</Text>
          </Card>
        </View>

        {/* Actions */}
        <Text style={[typography.h3, { marginTop: spacing.xl, marginBottom: spacing.md }]}>Actions</Text>

        <Pressable onPress={() => navigation.navigate('PatientForm')}>
          <Card style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: colors.primarySoft }]}>
              <MaterialIcons name="person-add" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={typography.h3}>New patient</Text>
              <Text style={styles.actionSub}>Add name, age, sex, complaints</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.ink3} />
          </Card>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Gallery')}>
          <Card style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: colors.tealBg }]}>
              <MaterialIcons name="folder-shared" size={24} color={colors.teal} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={typography.h3}>Patient database</Text>
              <Text style={styles.actionSub}>Browse {patients.length} record{patients.length === 1 ? '' : 's'}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.ink3} />
          </Card>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Instructions')}>
          <Card style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: colors.primarySoft }]}>
              <MaterialIcons name="menu-book" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={typography.h3}>Capture instructions</Text>
              <Text style={styles.actionSub}>How to take good intraoral photos</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.ink3} />
          </Card>
        </Pressable>

        <View style={{ height: spacing.xl }} />
        <PrimaryButton
          label="Start new capture"
          icon="camera-alt"
          onPress={() => navigation.navigate('PatientForm')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  hello: { ...typography.label, color: colors.ink2 },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', ...shadows.float,
  },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  statCard: { flex: 1, alignItems: 'flex-start' },
  statNum: { ...typography.h1, marginTop: 6 },
  statLabel: { ...typography.label, marginTop: 2 },

  actionCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md },
  actionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actionSub: { ...typography.bodyMd, marginTop: 2 },
});
