import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Dimensions, ActivityIndicator, Alert, StatusBar as RNStatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing, typography, shadows } from '../theme';
import { PrimaryButton } from '../components/UI';
import { slotById } from '../data';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Oral cavity guide: a centered ellipse-in-rectangle. The crop region (relative to preview)
// is this rectangle. We use a 16:10 aspect (wide oval) sized at ~78% of the screen width.
const GUIDE_W_FRAC = 0.82;
const GUIDE_H_FRAC = 0.34;

export default function CameraScreen({ navigation, route }) {
  const { patientId, slotId } = route.params || {};
  const slot = slotById(slotId);
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) requestPermission();
  }, [permission]);

  if (!permission) {
    return (
      <View style={styles.permWrap}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permWrap}>
        <MaterialIcons name="camera-alt" size={64} color={colors.primary} />
        <Text style={[typography.h2, { marginTop: spacing.lg, textAlign: 'center' }]}>
          Camera permission required
        </Text>
        <Text style={[typography.body, { textAlign: 'center', marginTop: spacing.sm, marginHorizontal: spacing.xl }]}>
          Pictures needs camera access to capture intraoral photos.
        </Text>
        <View style={{ marginTop: spacing.xl, width: '100%', paddingHorizontal: spacing.xl }}>
          <PrimaryButton label="Grant camera access" icon="lock-open" onPress={requestPermission} />
        </View>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current || busy) return;
    setBusy(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.92,
        skipProcessing: false,
        exif: false,
      });

      // photo.width / photo.height are sensor pixels. Map the on-screen guide to
      // the captured-image coordinate system to crop only the oral-cavity region.
      const previewW = SCREEN_W;
      // We render the camera full-bleed; assume preview height ~ SCREEN_H minus chrome.
      // We compute crop based on the photo's aspect — typically taller than wide.
      const imgW = photo.width;
      const imgH = photo.height;

      // The preview shows a centered guide of (GUIDE_W_FRAC*W) x (GUIDE_H_FRAC*H) in screen pts.
      // The captured image fills the preview; map fractional coords directly to pixels.
      const cropW = Math.round(imgW * GUIDE_W_FRAC);
      const cropH = Math.round(imgH * GUIDE_H_FRAC);
      const cropX = Math.round((imgW - cropW) / 2);
      const cropY = Math.round((imgH - cropH) / 2);

      const cropped = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ crop: { originX: cropX, originY: cropY, width: cropW, height: cropH } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      navigation.navigate('Preview', { patientId, slotId, uri: cropped.uri });
    } catch (e) {
      Alert.alert('Capture failed', e?.message || 'Could not take photo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <RNStatusBar barStyle="light-content" />
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
        onCameraReady={() => setReady(true)}
      />

      {/* Dim overlay with cutout */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.dimRow1} />
        <View style={styles.dimRow2}>
          <View style={styles.dimSide} />
          <View style={styles.guide}>
            <View style={styles.guideOval} />
            {/* corners */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <View style={styles.dimSide} />
        </View>
        <View style={styles.dimRow3} />
      </View>

      {/* Top bar */}
      <SafeAreaView edges={['top']} style={styles.topBar} pointerEvents="box-none">
        <Pressable onPress={() => navigation.goBack()} style={styles.iconBtnDark} hitSlop={10}>
          <MaterialIcons name="arrow-back" size={22} color={colors.white} />
        </Pressable>
        <View style={styles.topTitleWrap}>
          <MaterialIcons name={slot?.icon || 'center-focus-strong'} size={16} color={colors.white} />
          <Text style={styles.topTitle}>{slot?.title || 'Align oral cavity'}</Text>
        </View>
        <Pressable
          onPress={() => setFlash(flash === 'off' ? 'on' : 'off')}
          style={styles.iconBtnDark}
          hitSlop={10}
        >
          <MaterialIcons
            name={flash === 'on' ? 'flash-on' : 'flash-off'}
            size={22}
            color={colors.white}
          />
        </Pressable>
      </SafeAreaView>

      {/* Hint */}
      <View pointerEvents="none" style={styles.hintWrap}>
        <View style={styles.hintPill}>
          <MaterialIcons name="info" size={14} color={colors.white} />
          <Text style={styles.hintText}>
            {slot?.hint || 'Only the framed area is saved — face is excluded'}
          </Text>
        </View>
      </View>

      {/* Bottom controls */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        <Pressable
          onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
          style={styles.sideBtn}
          hitSlop={10}
        >
          <MaterialIcons name="cameraswitch" size={26} color={colors.white} />
        </Pressable>

        <Pressable onPress={takePicture} disabled={!ready || busy} style={styles.shutterOuter}>
          <View style={[styles.shutterInner, busy && { backgroundColor: colors.tealLight }]}>
            {busy ? <ActivityIndicator color={colors.primary} /> : null}
          </View>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('PatientDetail', { patientId })}
          style={styles.sideBtn}
          hitSlop={10}
        >
          <MaterialIcons name="photo-library" size={26} color={colors.white} />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const GUIDE_W = SCREEN_W * GUIDE_W_FRAC;
const GUIDE_H = SCREEN_H * GUIDE_H_FRAC;
const SIDE_W = (SCREEN_W - GUIDE_W) / 2;
const ROW1_H = (SCREEN_H - GUIDE_H) / 2;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  permWrap: {
    flex: 1, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', padding: spacing.xl,
  },

  dimRow1: { height: ROW1_H, backgroundColor: 'rgba(0,0,0,0.62)' },
  dimRow2: { height: GUIDE_H, flexDirection: 'row' },
  dimSide: { width: SIDE_W, backgroundColor: 'rgba(0,0,0,0.62)' },
  dimRow3: { flex: 1, backgroundColor: 'rgba(0,0,0,0.62)' },

  guide: {
    width: GUIDE_W,
    height: GUIDE_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideOval: {
    position: 'absolute',
    width: GUIDE_W * 0.94,
    height: GUIDE_H * 0.9,
    borderRadius: GUIDE_W,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
    borderStyle: 'dashed',
  },
  corner: {
    position: 'absolute', width: 26, height: 26,
    borderColor: colors.teal,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 6 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 6 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 6 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6 },

  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.sm,
  },
  iconBtnDark: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  topTitleWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill,
  },
  topTitle: { color: colors.white, fontSize: 12.5, fontWeight: '700' },

  hintWrap: {
    position: 'absolute', left: 0, right: 0,
    top: ROW1_H + GUIDE_H + 16,
    alignItems: 'center',
  },
  hintPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill,
  },
  hintText: { color: colors.white, fontSize: 12, fontWeight: '600' },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingVertical: spacing.lg,
  },
  sideBtn: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  shutterOuter: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 4, borderColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  shutterInner: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
});
