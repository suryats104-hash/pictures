import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography, shadows } from '../theme';
import { AppBar, Card, PrimaryButton, SecondaryButton, Chip } from '../components/UI';
import { usePatients } from '../context/PatientContext';
import { slotById } from '../data';

export default function PreviewScreen({ navigation, route }) {
  const { patientId, slotId, uri } = route.params;
  const { setPhoto, getPatient } = usePatients();
  const patient = getPatient(patientId);
  const slot = slotById(slotId);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await setPhoto(patientId, slotId, uri);
      navigation.navigate('PatientDetail', { patientId });
    } catch (e) {
      Alert.alert('Save failed', e?.message || 'Could not save photo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <AppBar
        title={slot?.title || 'Review capture'}
        subtitle={patient?.name}
        onBack={() => navigation.goBack()}
      />
      <View style={{ padding: spacing.xl, flex: 1 }}>
        <View style={styles.imgWrap}>
          <Image source={{ uri }} style={styles.img} resizeMode="cover" />
        </View>

        <Card style={{ marginTop: spacing.lg }}>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Chip label={slot?.title || 'View'} icon={slot?.icon || 'photo'} />
            <Chip label="Cropped" color={colors.teal} bg={colors.tealBg} icon="crop" />
            <Chip label="Face excluded" color={colors.ink} bg={colors.surface3} icon="visibility-off" />
          </View>
          <Text style={[typography.bodyMd, { marginTop: spacing.md }]}>
            Only the framed oral-cavity region was saved. The original face/background were discarded.
          </Text>
        </Card>

        <View style={{ flex: 1 }} />
        <SecondaryButton
          label="Retake"
          icon="refresh"
          onPress={() => navigation.replace('Camera', { patientId, slotId })}
        />
        <View style={{ height: spacing.md }} />
        <PrimaryButton
          label={saving ? 'Saving...' : 'Use this photo'}
          icon="check"
          onPress={save}
          disabled={saving}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface2 },
  imgWrap: {
    borderRadius: radius.xl, overflow: 'hidden',
    backgroundColor: colors.black,
    ...shadows.card,
  },
  img: { width: '100%', aspectRatio: 16 / 10 },
});
