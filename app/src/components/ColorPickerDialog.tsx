import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { hexToHsv, hsvToHex, parseHex, textOn, toHex, type AppColor, type Hsv } from '@/lib/colors';
import { makeStyles, radius, space, useTheme } from '@/theme';
import { AppText } from './AppText';
import { Button } from './Button';
import { DialogShell } from './Dialog';

const HUES = ['#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FF0000'];
const THUMB = 22;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

// Hộp "Màu khác" (mockup S4 màn 11b): ô sáng/đậm + thanh màu + mã hex + "Aa" xem trước chữ.
// Plain touch responders instead of gesture-handler: they work inside a Modal without a root view.
export function ColorPickerDialog({
  initial,
  onClose,
  onPick,
}: {
  initial: AppColor;
  onClose: () => void;
  onPick: (hex: `#${string}`) => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(toHex(initial)));
  const [text, setText] = useState(() => toHex(initial).slice(1));
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [barWidth, setBarWidth] = useState(0);
  const hex = hsvToHex(hsv);

  const update = (next: Hsv) => {
    setHsv(next);
    setText(hsvToHex(next).slice(1));
  };

  const onBox = (e: GestureResponderEvent) => {
    if (!box.width) return;
    const { locationX, locationY } = e.nativeEvent;
    update({ h: hsv.h, s: clamp01(locationX / box.width), v: 1 - clamp01(locationY / box.height) });
  };

  const onBar = (e: GestureResponderEvent) => {
    if (barWidth) update({ ...hsv, h: clamp01(e.nativeEvent.locationX / barWidth) * 359.9 });
  };

  const onHex = (value: string) => {
    setText(value.toUpperCase());
    const parsed = parseHex(value);
    if (parsed) setHsv(hexToHsv(parsed));
  };

  const touch = (handler: (e: GestureResponderEvent) => void) => ({
    onStartShouldSetResponder: () => true,
    onMoveShouldSetResponder: () => true,
    onResponderTerminationRequest: () => false,
    onResponderGrant: handler,
    onResponderMove: handler,
  });

  return (
    <DialogShell visible onClose={onClose}>
      <AppText variant="heading" style={styles.title}>
        {t('colorPicker.other')}
      </AppText>
      <View
        style={[styles.box, { backgroundColor: hsvToHex({ h: hsv.h, s: 1, v: 1 }) }]}
        onLayout={(e: LayoutChangeEvent) => setBox(e.nativeEvent.layout)}
        {...touch(onBox)}>
        <Svg width="100%" height="100%" pointerEvents="none">
          <Defs>
            <LinearGradient id="white" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
            <LinearGradient id="black" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#000000" stopOpacity="0" />
              <Stop offset="1" stopColor="#000000" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#white)" />
          <Rect width="100%" height="100%" fill="url(#black)" />
        </Svg>
        <View pointerEvents="none" style={[styles.thumb, styles.ring, { left: hsv.s * box.width, top: (1 - hsv.v) * box.height }]} />
      </View>
      <View style={styles.barArea} onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)} {...touch(onBar)}>
        <View style={styles.bar} pointerEvents="none">
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id="hue" x1="0" y1="0" x2="1" y2="0">
                {HUES.map((c, i) => (
                  <Stop key={i} offset={i / (HUES.length - 1)} stopColor={c} />
                ))}
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#hue)" />
          </Svg>
        </View>
        <View pointerEvents="none" style={[styles.thumb, styles.knob, { left: (hsv.h / 360) * barWidth, top: '50%' }]} />
      </View>
      <View style={styles.row}>
        <View style={[styles.swatch, { backgroundColor: hex }]} />
        <View style={styles.input}>
          <AppText color={colors.textMuted}>#</AppText>
          <TextInput
            accessibilityLabel={t('colorPicker.hex')}
            value={text}
            onChangeText={onHex}
            maxLength={7}
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.inputText}
          />
        </View>
        <View style={[styles.preview, { backgroundColor: hex }]}>
          <AppText variant="caption" weight="extrabold" color={textOn(hex)}>
            Aa
          </AppText>
        </View>
      </View>
      <View style={styles.actions}>
        <Button label={t('common.cancel')} variant="secondary" onPress={onClose} style={styles.flex} />
        <Button label={t('colorPicker.pick')} onPress={() => onPick(hex)} style={styles.flex} />
      </View>
    </DialogShell>
  );
}

const useStyles = makeStyles(({ colors, type }) => ({
  title: { textAlign: 'center', marginBottom: space.md },
  box: { height: 150, borderRadius: 16, overflow: 'hidden' },
  thumb: { position: 'absolute', width: THUMB, height: THUMB, borderRadius: THUMB / 2, marginLeft: -THUMB / 2, marginTop: -THUMB / 2 },
  ring: { borderWidth: 3, borderColor: colors.white },
  knob: { backgroundColor: colors.white, elevation: 3, shadowColor: colors.text, shadowOpacity: 0.4, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  // Taller than the 16 px bar so it is easy to grab.
  barArea: { height: 44, justifyContent: 'center' },
  bar: { height: 16, borderRadius: radius.pill, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  swatch: { width: 48, height: 48, borderRadius: 16 },
  input: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: space.md,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  inputText: { flex: 1, ...type.body, color: colors.text, padding: 0 },
  preview: { height: 32, paddingHorizontal: 10, borderRadius: radius.pill, justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 10, marginTop: space.lg },
  flex: { flex: 1 },
}));
