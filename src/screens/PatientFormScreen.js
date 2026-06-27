import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, shadows } from '../theme';
import { AppBar, Card, PrimaryButton } from '../components/UI';
import { usePatients } from '../context/PatientContext';

const SEX_OPTIONS = ['Male', 'Female', 'Other'];

export default function PatientFormScreen({ navigation }) {
  const { addPatient } = usePatients();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [complaints, setComplaints] = useState('');
  const [saving, setSaving] = useState(false);

  const valid = name.trim().length > 0 && age.trim().length > 0 && sex.length > 0;

  const onContinue = async () => {
    if (!valid) {
      Alert.alert('Missing info', 'Please fill name, age, and sex.');
      return;
    }
    setSaving(true);
    const patient = await addPatient({ name, age, sex, complaints });
    setSaving(false);
    navigation.replace('PatientDetail', { patientId: patient.id });
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <AppBar title="New patient" subtitle="Basic history" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 40 }}>
          <Card>
            <Text style={typography.h3}>Patient details</Text>
            <Text style={[typography.bodyMd, { marginTop: 4 }]}>
              Stored locally on this device.
            </Text>

            <Field
              label="Full name *"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Ramesh Kumar"
              icon="person"
              autoCapitalize="words"
            />

            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Field
                  label="Age *"
                  value={age}
                  onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 42"
                  icon="cake"
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>
            </View>

            <Text style={styles.label}>Sex *</Text>
            <View style={styles.sexRow}>
              {SEX_OPTIONS.map((opt) => {
                const active = sex === opt;
                return (
                  <Pressable
                    key={opt}
                    onPress={() => setSex(opt)}
                    style={[styles.sexChip, active && styles.sexChipActive]}
                  >
                    <MaterialIcons
                      name={opt === 'Male' ? 'male' : opt === 'Female' ? 'female' : 'transgender'}
                      size={18}
                      color={active ? colors.white : colors.primary}
                    />
                    <Text style={[styles.sexLabel, active && { color: colors.white }]}>{opt}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Field
              label="Chief complaints / history"
              value={complaints}
              onChangeText={setComplaints}
              placeholder="e.g. Pain in lower right molar since 3 days. Bleeding gums."
              icon="description"
              multiline
            />
          </Card>

          <View style={{ height: spacing.xl }} />
          <PrimaryButton
            label={saving ? 'Saving...' : 'Continue'}
            icon="arrow-forward"
            onPress={onContinue}
            disabled={!valid || saving}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, icon, multiline, ...rest }) {
  return (
    <View style={{ marginTop: spacing.lg }}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.input, multiline && { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
        {icon ? <MaterialIcons name={icon} size={18} color={colors.ink3} style={{ marginRight: 8, marginTop: multiline ? 2 : 0 }} /> : null}
        <TextInput
          style={[styles.inputText, multiline && { height: 80, textAlignVertical: 'top' }]}
          placeholderTextColor={colors.ink3}
          multiline={multiline}
          {...rest}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface2 },
  label: { ...typography.label, marginBottom: 6 },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
  },
  inputText: { flex: 1, fontSize: 15, color: colors.ink, padding: 0 },
  sexRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
  sexChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, height: 44, borderRadius: radius.md,
    backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.line,
  },
  sexChipActive: { backgroundColor: colors.primary, borderColor: colors.primary, ...shadows.float },
  sexLabel: { fontSize: 13, fontWeight: '700', color: colors.primary },
});
