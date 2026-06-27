import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, shadows } from '../theme';
import { AppBar, Card, Chip, PrimaryButton } from '../components/UI';
import { usePatients } from '../context/PatientContext';

export default function GalleryScreen({ navigation }) {
  const { patients } = usePatients();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return patients;
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.complaints.toLowerCase().includes(s) ||
        p.sex.toLowerCase().includes(s)
    );
  }, [patients, q]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <AppBar
        title="Patient database"
        subtitle={`${patients.length} record${patients.length === 1 ? '' : 's'}`}
        onBack={() => navigation.goBack()}
      />
      <View style={{ padding: spacing.lg }}>
        <View style={styles.search}>
          <MaterialIcons name="search" size={20} color={colors.ink3} />
          <TextInput
            placeholder="Search by name, complaint..."
            placeholderTextColor={colors.ink3}
            value={q}
            onChangeText={setQ}
            style={styles.searchInput}
          />
        </View>
      </View>

      {patients.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="folder-open" size={64} color={colors.ink3} />
          <Text style={[typography.h3, { marginTop: spacing.md }]}>No patients yet</Text>
          <Text style={[typography.bodyMd, { textAlign: 'center', marginTop: 6, marginHorizontal: spacing.xl }]}>
            Add a patient to start collecting intraoral images.
          </Text>
          <View style={{ marginTop: spacing.xl, width: '80%' }}>
            <PrimaryButton
              label="Add patient"
              icon="person-add"
              onPress={() => navigation.navigate('PatientForm')}
            />
          </View>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: spacing.lg, paddingTop: 0, paddingBottom: 100 }}
          data={filtered}
          keyExtractor={(it) => it.id}
          renderItem={({ item }) => <PatientRow patient={item} navigation={navigation} />}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      )}
    </SafeAreaView>
  );
}

function PatientRow({ patient, navigation }) {
  const cover = patient.photos?.[0]?.uri;
  return (
    <Pressable onPress={() => navigation.navigate('PatientDetail', { patientId: patient.id })}>
      <Card style={styles.row}>
        <View style={styles.thumb}>
          {cover ? (
            <Image source={{ uri: cover }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <MaterialIcons name="person" size={28} color={colors.primary} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={typography.h3}>{patient.name}</Text>
          <Text style={[typography.bodyMd, { marginTop: 2 }]}>
            {patient.age} yrs · {patient.sex}
          </Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
            <Chip label={`${patient.photos?.length || 0} / 5`} icon="photo" />
            {(patient.photos?.length || 0) >= 5 ? (
              <Chip label="Complete" color={colors.success} bg={colors.successBg} icon="check" />
            ) : null}
            {patient.complaints ? (
              <Chip label="Notes" color={colors.teal} bg={colors.tealBg} icon="description" />
            ) : null}
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={colors.ink3} />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface2 },
  search: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    height: 48, borderRadius: radius.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.ink, padding: 0 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  thumb: {
    width: 56, height: 56, borderRadius: radius.md,
    backgroundColor: colors.primarySoft, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
});
