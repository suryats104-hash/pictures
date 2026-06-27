import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';
import { AppBar, Card, PrimaryButton } from '../components/UI';

const STEPS = [
  { icon: 'wb-sunny', title: 'Good lighting', text: 'Use bright, even light. Avoid harsh shadows or yellow indoor light.' },
  { icon: 'center-focus-strong', title: 'Frame the mouth', text: 'Align the patient\'s open mouth inside the on-screen guide. Face will be cropped out.' },
  { icon: 'pan-tool', title: 'Hold steady', text: 'Keep the phone ~15–20 cm from the mouth. Ask the patient to stay still.' },
  { icon: 'visibility', title: 'Open wide', text: 'Patient should open mouth wide. Use a tongue depressor or cheek retractor if available.' },
  { icon: 'crop', title: 'Auto-crop', text: 'The app saves only the guided region — no face, no background.' },
];

export default function InstructionsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <AppBar title="Capture Instructions" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 40 }}>
        <Text style={typography.h2}>Before you start</Text>
        <Text style={[typography.body, { marginTop: spacing.sm, marginBottom: spacing.lg }]}>
          Follow these steps for clean, annotatable intraoral images.
        </Text>

        {STEPS.map((s, i) => (
          <Card key={i} style={styles.step}>
            <View style={styles.stepIcon}>
              <MaterialIcons name={s.icon} size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={typography.h3}>{i + 1}. {s.title}</Text>
              <Text style={[typography.bodyMd, { marginTop: 4 }]}>{s.text}</Text>
            </View>
          </Card>
        ))}

        <View style={{ height: spacing.xl }} />
        <PrimaryButton label="Got it" icon="check" onPress={() => navigation.goBack()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface2 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.md },
  stepIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
});
