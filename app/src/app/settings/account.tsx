import Ionicons from '@expo/vector-icons/Ionicons';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TextField } from '@/components/TextField';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/features/auth/AuthProvider';
import { NAME_MAX, validateName } from '@/features/auth/validateName';
import { colors, shadow, space } from '@/theme';

const AVATAR_SIZE = 512;

/** Cắt vuông (picker) → thu nhỏ 512px JPEG. Bước 3: tải lên Storage `avatars`. */
async function pickAvatar(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });
  if (result.canceled || !result.assets?.[0]) return null;
  const context = ImageManipulator.manipulate(result.assets[0].uri);
  context.resize({ width: AVATAR_SIZE });
  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
  return saved.uri;
}

export default function AccountScreen() {
  const { t } = useTranslation();
  const { profile, updateProfile } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(profile?.displayName ?? '');
  const [avatar, setAvatar] = useState(profile?.avatarUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!profile) return null;

  const onPickAvatar = async () => {
    try {
      const uri = await pickAvatar();
      if (uri) setAvatar(uri);
    } catch {
      toast(t('account.saveError'), 'error');
    }
  };

  const onSave = async () => {
    const { value, error: err } = validateName(name);
    if (err) {
      setError(err === 'required' ? t('account.nameRequired') : t('account.nameTooLong'));
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ displayName: value, avatarUrl: avatar });
      toast(t('account.saved'));
      router.back();
    } catch {
      toast(t('account.saveError'), 'error');
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title={t('account.title')} onBack={() => router.back()} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Pressable accessibilityRole="button" onPress={onPickAvatar} style={styles.avatarWrap}>
            <Avatar name={name || profile.displayName} uri={avatar} size={96} />
            <View style={styles.cam}>
              <Ionicons name="camera-outline" size={18} color={colors.primaryDark} />
            </View>
          </Pressable>
          <TextField
            label={t('account.name')}
            hint={t('account.nameHint')}
            error={error}
            value={name}
            maxLength={NAME_MAX + 10}
            onChangeText={(v) => {
              setName(v);
              setError(null);
            }}
          />
          <TextField label={t('account.email')} value={profile.email} locked />
          <Button label={t('account.save')} onPress={onSave} disabled={saving} style={styles.save} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  form: { paddingHorizontal: space.lg, paddingTop: space.sm, gap: space.lg },
  avatarWrap: { alignSelf: 'center', marginTop: space.xs, marginBottom: space.sm },
  cam: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  save: { marginTop: space.sm },
});
