import * as Crypto from 'expo-crypto';
import { useNetworkState } from 'expo-network';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, TextInput, View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { AlertDialog } from '@/components/Dialog';
import { FormScreen } from '@/components/FormScreen';
import { Icon } from '@/components/Icon';
import { useToast } from '@/components/Toast';
import { pickImages, RateLimitedError, sendBugReport, type PickedImage } from '@/features/bugReport/api';
import { BODY_MAX, isBodyValid, MAX_IMAGES } from '@/lib/bugReport';
import { makeStyles, radius, space, useTheme } from '@/theme';

export default function BugReportScreen() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const network = useNetworkState();
  // One id per screen: a retry after a half-done send reuses it instead of making a second report.
  const [id] = useState(() => Crypto.randomUUID());
  const [body, setBody] = useState('');
  const [images, setImages] = useState<PickedImage[]>([]);
  const [focused, setFocused] = useState(false);
  const [busy, setBusy] = useState(false);
  const [limited, setLimited] = useState(false);

  const offline = network.isConnected === false || network.isInternetReachable === false;
  const canSend = isBodyValid(body) && !busy && !offline;

  const addImages = async () => {
    try {
      const picked = await pickImages(MAX_IMAGES - images.length);
      setImages((prev) => [...prev, ...picked].slice(0, MAX_IMAGES));
    } catch {
      toast(t('bugReport.imageFailed'), 'error');
    }
  };

  const send = async () => {
    setBusy(true);
    try {
      await sendBugReport(id, body, images, i18n.language);
      toast(t('bugReport.sent'));
      router.back();
    } catch (e) {
      if (e instanceof RateLimitedError) setLimited(true);
      else toast(t('bugReport.sendFailed'), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormScreen
      title={t('bugReport.title')}
      onBack={() => router.back()}
      footer={
        <View style={styles.footer}>
          {offline ? (
            <AppText variant="caption" color={colors.error} style={styles.center}>
              {t('common.offline')}
            </AppText>
          ) : null}
          <Button label={t('bugReport.send')} onPress={() => void send()} disabled={!canSend} />
        </View>
      }
    >
      <View>
        <AppText variant="caption" weight="extrabold" color={colors.textMuted} style={styles.label}>
          {t('bugReport.body')}
        </AppText>
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder={t('bugReport.bodyHint')}
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={BODY_MAX}
          textAlignVertical="top"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.textArea, { borderColor: focused ? colors.primary : colors.border }]}
        />
      </View>

      <View>
        <AppText variant="caption" weight="extrabold" color={colors.textMuted} style={styles.label}>
          {t('bugReport.images', { n: images.length, max: MAX_IMAGES })}
        </AppText>
        <View style={styles.thumbs}>
          {images.map((img, i) => (
            <View key={img.uri} style={styles.thumb}>
              <Image source={{ uri: img.uri }} style={styles.thumbImage} />
              <Pressable
                accessibilityLabel={t('bugReport.removeImage')}
                hitSlop={8}
                onPress={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                style={styles.remove}
              >
                <Icon name="close" size={14} color={colors.white} />
              </Pressable>
            </View>
          ))}
          {images.length < MAX_IMAGES ? (
            <Pressable onPress={() => void addImages()} style={[styles.thumb, styles.add]}>
              <Icon name="image" size={24} color={colors.primaryDark} />
              <AppText variant="micro" weight="extrabold" color={colors.primaryDark}>
                {t('bugReport.addImage')}
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </View>

      <AlertDialog
        visible={limited}
        tone="warning"
        icon="warn"
        title={t('bugReport.limitTitle')}
        text={t('bugReport.limitText')}
        buttonLabel={t('bugReport.limitOk')}
        onClose={() => setLimited(false)}
      />
    </FormScreen>
  );
}

const useStyles = makeStyles(({ colors, type }) => ({
  footer: { gap: space.sm },
  center: { textAlign: 'center' },
  label: { marginHorizontal: space.xs, marginBottom: 6 },
  textArea: {
    minHeight: 150,
    borderRadius: radius.button,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    color: colors.text,
    ...type.body,
  },
  thumbs: { flexDirection: 'row', gap: space.md },
  thumb: { width: 88, height: 88, borderRadius: radius.button, overflow: 'hidden', backgroundColor: colors.primarySoft },
  thumbImage: { width: '100%', height: '100%' },
  remove: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  add: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
  },
}));
