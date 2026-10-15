import { Image, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Pattern, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { gradientLayers, parseBackground, patternSpec, solidBackground } from '@/lib/theme/backgrounds';
import { useAppearance, useTheme } from '@/theme';

type ArtProps = {
  value: string;
  custom: string | null;
  photo: { uri: string; fade: number } | null;
};

// One background drawn into its parent (the whole screen, or a small swatch in the Giao diện screen).
export function BackgroundArt({ value, custom, photo }: ArtProps) {
  const { colors, dark } = useTheme();
  const { kind, index } = parseBackground(value);
  const solid = solidBackground(value, dark, custom);
  const layers = kind === 'gradient' ? gradientLayers(index, colors) : [];
  const pattern = kind === 'pattern' ? patternSpec(index, colors, dark) : null;
  const showPhoto = kind === 'photo' && photo;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: solid ?? colors.bg }]}>
      {layers.length > 0 ? (
        <Svg width="100%" height="100%" preserveAspectRatio="none">
          <Defs>
            {layers.map((l, i) =>
              l.type === 'linear' ? (
                <LinearGradient key={i} id={`g${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}>
                  {l.stops.map((s, j) => (
                    <Stop key={j} offset={s.offset} stopColor={s.color} stopOpacity={s.opacity} />
                  ))}
                </LinearGradient>
              ) : (
                <RadialGradient key={i} id={`g${i}`} cx={l.cx} cy={l.cy} rx={l.r} ry={l.r} fx={l.cx} fy={l.cy}>
                  {l.stops.map((s, j) => (
                    <Stop key={j} offset={s.offset} stopColor={s.color} stopOpacity={s.opacity} />
                  ))}
                </RadialGradient>
              ),
            )}
          </Defs>
          {layers.map((_, i) => (
            <Rect key={i} width="100%" height="100%" fill={`url(#g${i})`} />
          ))}
        </Svg>
      ) : null}
      {pattern ? (
        <Svg width="100%" height="100%">
          <Defs>
            <Pattern id="tile" patternUnits="userSpaceOnUse" width={pattern.size} height={pattern.size}>
              {pattern.shapes.map((s, i) => (
                <Path
                  key={i}
                  d={s.d}
                  fill={s.fill ? s.color : 'none'}
                  fillOpacity={s.opacity}
                  stroke={s.fill ? 'none' : s.color}
                  strokeOpacity={s.opacity}
                  strokeWidth={s.strokeWidth ?? 1}
                />
              ))}
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#tile)" />
        </Svg>
      ) : null}
      {showPhoto ? (
        <>
          <Image source={{ uri: photo.uri }} resizeMode="cover" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg, opacity: photo.fade / 100 }]} />
        </>
      ) : null}
    </View>
  );
}

// Behind the content of Lịch, Ghi chú and Chi tiêu. Cards and the tab bar keep their own `surface`
// fill, so text stays easy to read.
export function ScreenBackground() {
  const { appearance, photo } = useAppearance();
  return <BackgroundArt value={appearance.background} custom={appearance.backgroundColor} photo={photo} />;
}
