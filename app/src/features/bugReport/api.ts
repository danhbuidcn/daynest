import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { getNetworkStateAsync } from 'expo-network';

import { fitWithin, imagePath } from '@/lib/bugReport';
import { supabase } from '@/lib/supabase';

export class RateLimitedError extends Error {}

export type PickedImage = { uri: string };

// Opens the system photo picker (no permission needed) and returns JPEGs with the long side ≤ 1600 px.
export async function pickImages(limit: number): Promise<PickedImage[]> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: limit,
    quality: 1,
  });
  if (result.canceled) return [];
  return Promise.all(
    result.assets.slice(0, limit).map(async (a) => {
      const size = fitWithin(a.width, a.height);
      const out = await ImageManipulator.manipulateAsync(a.uri, size ? [{ resize: size }] : [], {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      });
      return { uri: out.uri };
    }),
  );
}

async function ensureOnline() {
  const network = await getNetworkStateAsync().catch(() => null);
  if (network && (network.isConnected === false || network.isInternetReachable === false)) throw new Error('offline');
}

// Report first, then images, then the email. The id comes from the app, so a retry after a
// half-done send skips what already exists instead of making a second report.
export async function sendBugReport(id: string, body: string, images: PickedImage[], locale: string): Promise<void> {
  await ensureOnline();
  const { data } = await supabase.auth.getSession();
  const userId = data.session?.user.id;
  if (!userId) throw new Error('signed_out');
  const paths = images.map((_, i) => imagePath(userId, id, i));

  const { error } = await supabase.from('bug_reports').insert({
    id,
    body: body.trim(),
    images: paths,
    app_version: `${Constants.expoConfig?.version ?? ''} (${Constants.expoConfig?.android?.versionCode ?? ''})`,
    device: [Device.manufacturer, Device.modelName].filter(Boolean).join(' ').slice(0, 100),
    os: `${Device.osName ?? 'Android'} ${Device.osVersion ?? ''}`.trim(),
    locale,
  });
  if (error && error.message.includes('rate_limited')) throw new RateLimitedError();
  if (error && error.code !== '23505') throw error;

  for (const [i, image] of images.entries()) {
    const bytes = await (await fetch(image.uri)).arrayBuffer();
    const { error: upload } = await supabase.storage
      .from('bug-reports')
      .upload(paths[i], bytes, { contentType: 'image/jpeg', upsert: false });
    if (upload && !/exists|duplicate/i.test(upload.message)) throw upload;
  }

  // Email failures stay on the server (email_sent_at null); the report is already saved.
  await supabase.functions.invoke('send-bug-report', { body: { report_id: id } }).catch(() => {});
}
