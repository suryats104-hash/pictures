import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { colors, radius, spacing, typography, shadows } from '../theme';
import { AppBar, Card, Chip, PrimaryButton, SecondaryButton } from '../components/UI';
import { usePatients } from '../context/PatientContext';
import { PHOTO_SLOTS, REQUIRED_PHOTOS } from '../data';

export default function PatientDetailScreen({ navigation, route }) {
  const { patientId } = route.params;
  const { getPatient, deletePatient, deletePhoto, exportPatientToAlbum } = usePatients();
  const patient = getPatient(patientId);
  const [viewer, setViewer] = useState(null);
  const [exporting, setExporting] = useState(false);

  if (!patient) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <AppBar title="Patient" onBack={() => navigation.goBack()} />
        <View style={{ padding: spacing.xl }}>
          <Text style={typography.body}>Patient not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const photos = patient.photos || [];
  const bySlot = Object.fromEntries(photos.map((ph) => [ph.slotId, ph]));
  const capturedCount = PHOTO_SLOTS.filter((s) => bySlot[s.id]).length;
  const remaining = REQUIRED_PHOTOS - capturedCount;
  const pendingCount = photos.filter((ph) => !ph.exported).length;
  const exportedCount = photos.length - pendingCount;
  const allCaptured = capturedCount >= REQUIRED_PHOTOS;

  const onDeletePatient = () =>
    Alert.alert('Delete patient', `Remove ${patient.name} and all photos?`, [
      { text: 'Cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await deletePatient(patient.id);
          navigation.navigate('Gallery');
        },
      },
    ]);

  const onClearSlot = (photoId) =>
    Alert.alert('Remove photo', 'Clear this view?', [
      { text: 'Cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deletePhoto(patient.id, photoId) },
    ]);

  const onShare = async (uri) => {
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
  };

  const onSaveToAlbum = async () => {
    if (!allCaptured) {
      Alert.alert(
        'Capture all 5 views first',
        `${remaining} view${remaining === 1 ? '' : 's'} still needed before saving to Photos.`
      );
      return;
    }
    if (pendingCount === 0) {
      Alert.alert('Already saved', 'All photos are already in the Photos album.');
      return;
    }
    setExporting(true);
    const result = await exportPatientToAlbum(patientId);
    setExporting(false);
    if (result.ok && result.exported > 0) {
      Alert.alert(
        'Saved to Photos',
        `${result.exported} photo${result.exported === 1 ? '' : 's'} saved to album "${result.albumName}".` +
          (result.skipped > 0 ? `\n${result.skipped} could not be saved.` : '')
      );
    } else {
      Alert.alert(
        'Could not save',
        result.reason === 'denied'
          ? 'Photos permission denied. Enable it in Settings → Pictures.'
          : result.reason || 'Unknown error.'
      );
    }
  };

  const progress = capturedCount / REQUIRED_PHOTOS;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <AppBar
        title={patient.name}
        subtitle={`${patient.age} yrs · ${patient.sex}`}
        onBack={() => navigation.goBack()}
        right={
          <Pressable onPress={onDeletePatient} style={styles.iconBtn} hitSlop={8}>
            <MaterialIcons name="delete-outline" size={22} color={colors.danger} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 140 }}>
        {/* History */}
        <Card>
          <Text style={typography.h3}>History</Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            <Chip label={`${patient.age} yrs`} icon="cake" />
            <Chip
              label={patient.sex}
              color={colors.teal} bg={colors.tealBg}
              icon={patient.sex === 'Male' ? 'male' : patient.sex === 'Female' ? 'female' : 'transgender'}
            />
          </View>
          {patient.complaints ? (
            <>
              <Text style={[typography.label, { marginTop: spacing.md }]}>Chief complaints</Text>
              <Text style={[typography.body, { marginTop: 4 }]}>{patient.complaints}</Text>
            </>
          ) : (
            <Text style={[typography.bodyMd, { marginTop: spacing.md, fontStyle: 'italic' }]}>
              No complaints recorded.
            </Text>
          )}
        </Card>

        {/* Progress */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <Text style={typography.h3}>Intraoral photos</Text>
            <Text style={typography.h2}>
              {capturedCount}
              <Text style={{ color: colors.ink3, fontWeight: '700', fontSize: 16 }}> / {REQUIRED_PHOTOS}</Text>
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: spacing.sm, flexWrap: 'wrap' }}>
            {!allCaptured ? (
              <Chip label={`${remaining} view${remaining === 1 ? '' : 's'} left`} color={colors.warn} bg={colors.warnBg} icon="schedule" />
            ) : (
              <Chip label="All 5 captured" color={colors.success} bg={colors.successBg} icon="check-circle" />
            )}
            {pendingCount > 0 ? (
              <Chip label={`${pendingCount} pending save`} color={colors.primary} bg={colors.primarySoft} icon="cloud-upload" />
            ) : null}
            {exportedCount > 0 ? (
              <Chip label={`${exportedCount} in Photos`} color={colors.teal} bg={colors.tealBg} icon="photo-library" />
            ) : null}
          </View>
        </View>

        {/* Slots */}
        <View style={{ marginTop: spacing.lg }}>
          {PHOTO_SLOTS.map((slot, i) => {
            const ph = bySlot[slot.id];
            const filled = !!ph;
            return (
              <Pressable
                key={slot.id}
                onPress={() =>
                  filled
                    ? setViewer(ph)
                    : navigation.navigate('Camera', { patientId, slotId: slot.id })
                }
                style={styles.slotRow}
              >
                <View style={[styles.slotThumb, filled && styles.slotThumbFilled]}>
                  {filled ? (
                    <Image source={{ uri: ph.uri }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <MaterialIcons name={slot.icon} size={28} color={colors.primary} />
                  )}
                  {filled ? <View style={styles.slotRing} /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={typography.h3}>{i + 1}. {slot.title}</Text>
                  <Text style={[typography.bodyMd, { marginTop: 2 }]}>{slot.hint}</Text>
                  {filled ? (
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
                      <Chip label="Captured" color={colors.success} bg={colors.successBg} icon="check" />
                      {ph.exported ? (
                        <Chip label="Saved" color={colors.teal} bg={colors.tealBg} icon="photo-library" />
                      ) : null}
                    </View>
                  ) : null}
                </View>
                {filled ? (
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <Pressable
                      onPress={() => navigation.navigate('Camera', { patientId, slotId: slot.id })}
                      style={styles.iconActionBtn}
                      hitSlop={8}
                    >
                      <MaterialIcons name="refresh" size={20} color={colors.primary} />
                    </Pressable>
                    <Pressable onPress={() => onClearSlot(ph.id)} style={styles.iconActionBtn} hitSlop={8}>
                      <MaterialIcons name="close" size={20} color={colors.danger} />
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.addBtn}>
                    <MaterialIcons name="camera-alt" size={20} color={colors.white} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: spacing.xl }} />
        <PrimaryButton
          label={
            exporting
              ? 'Saving to Photos...'
              : !allCaptured
              ? `Save (${remaining} view${remaining === 1 ? '' : 's'} remaining)`
              : pendingCount > 0
              ? `Save ${pendingCount} to Photos album`
              : 'Saved to Photos album'
          }
          icon={!allCaptured ? 'lock' : pendingCount > 0 ? 'photo-library' : 'check'}
          onPress={onSaveToAlbum}
          disabled={!allCaptured || exporting || (allCaptured && pendingCount === 0)}
        />
        <Text style={[typography.caption, { textAlign: 'center', marginTop: 6 }]}>
          Creates a Photos album named "{patient.name}"
        </Text>
      </ScrollView>

      {/* Viewer modal */}
      <Modal visible={!!viewer} transparent animationType="fade" onRequestClose={() => setViewer(null)}>
        <View style={styles.modalRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setViewer(null)} />
          <Image source={{ uri: viewer?.uri }} style={styles.modalImg} resizeMode="contain" />
          <View style={styles.modalActions}>
            <Pressable style={styles.modalBtn} onPress={() => onShare(viewer.uri)}>
              <MaterialIcons name="share" size={20} color={colors.white} />
              <Text style={styles.modalBtnLabel}>Share</Text>
            </Pressable>
            <Pressable
              style={[styles.modalBtn, { backgroundColor: colors.danger }]}
              onPress={() => { const id = viewer.id; setViewer(null); onClearSlot(id); }}
            >
              <MaterialIcons name="delete" size={20} color={colors.white} />
              <Text style={styles.modalBtnLabel}>Remove</Text>
            </Pressable>
            <Pressable style={[styles.modalBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]} onPress={() => setViewer(null)}>
              <MaterialIcons name="close" size={20} color={colors.white} />
              <Text style={styles.modalBtnLabel}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface2 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  progressTrack: {
    height: 8, borderRadius: 4, backgroundColor: colors.surface3,
    marginTop: spacing.sm, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: colors.primary },

  slotRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderRadius: radius.lg,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line,
    marginBottom: spacing.sm, ...shadows.soft,
  },
  slotThumb: {
    width: 64, height: 64, borderRadius: radius.md,
    backgroundColor: colors.primarySoft, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
  },
  slotThumbFilled: { backgroundColor: colors.black },
  slotRing: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: radius.md, borderWidth: 2, borderColor: 'rgba(22,163,74,0.5)',
  },
  iconActionBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.line,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', ...shadows.float,
  },

  modalRoot: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' },
  modalImg: { width: '92%', height: '70%' },
  modalActions: {
    position: 'absolute', bottom: 40, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: spacing.md,
  },
  modalBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
  modalBtnLabel: { color: colors.white, fontSize: 13, fontWeight: '700' },
});
