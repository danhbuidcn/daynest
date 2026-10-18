import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Linking, Pressable, View } from "react-native";

import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { Icon } from "@/components/Icon";
import { SettingRow } from "@/components/SettingRow";
import { Switch } from "@/components/Switch";
import { useAuth } from "@/features/auth/AuthProvider";
import { useNotificationPermission } from "@/features/reminders/useNotificationPermission";
import { makeStyles, radius, space, useTheme } from "@/theme";
import { DailyReminderDialog } from "./DailyReminderDialog";
import { useSettingSaver } from "./useSettingSaver";

// Digest rows (todos of the day): a switch each, tap the row to change the time.
type Digest = "morning" | "evening";

// F3 "Công tắc Cho phép thông báo": on → ask for OS permission; denied → warning + system settings link.
export function NotificationSettings() {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const { settings } = useAuth();
  const save = useSettingSaver();
  const permission = useNotificationPermission();
  const [editing, setEditing] = useState<Digest | null>(null);
  const blocked =
    settings.notificationsEnabled && permission.status === "denied";

  const onToggle = async (on: boolean) => {
    await save({ notificationsEnabled: on });
    if (on) await permission.request();
  };

  const digest = {
    morning: {
      on: settings.dailyMorning,
      time: settings.dailyMorningTime,
      label: t("settings.dailyMorning"),
      icon: "bell" as const,
    },
    evening: {
      on: settings.dailyEvening,
      time: settings.dailyEveningTime,
      label: t("settings.dailyEvening"),
      icon: "moon" as const,
    },
  };
  const patch = (kind: Digest, on: boolean, time: string) =>
    kind === "morning"
      ? { dailyMorning: on, dailyMorningTime: time }
      : { dailyEvening: on, dailyEveningTime: time };
  // Turning one on also asks the OS for permission, same as the main switch.
  const onDigest = async (kind: Digest, on: boolean) => {
    await save(patch(kind, on, digest[kind].time));
    if (on) await permission.request();
  };

  return (
    <>
      <Card>
        <SettingRow
          first
          icon="bell"
          label={t("settings.allowNotifications")}
          trailing={
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={onToggle}
            />
          }
        />
        {blocked ? (
          <View style={styles.warn}>
            <Icon name="warn" size={18} color={colors.warning} />
            <View style={styles.flex}>
              <AppText variant="caption">{t("settings.blocked")}</AppText>
              <Pressable
                accessibilityRole="link"
                hitSlop={8}
                onPress={() => Linking.openSettings()}
              >
                <AppText
                  variant="caption"
                  weight="extrabold"
                  color={colors.primaryDark}
                >
                  {t("settings.openSystemSettings")}
                </AppText>
              </Pressable>
            </View>
          </View>
        ) : null}
        {settings.notificationsEnabled
          ? (["morning", "evening"] as const).map((kind) => (
              <SettingRow
                key={kind}
                icon={digest[kind].icon}
                label={digest[kind].label}
                sublabel={digest[kind].on ? digest[kind].time : undefined}
                onPress={digest[kind].on ? () => setEditing(kind) : undefined}
                trailing={
                  <Switch
                    value={digest[kind].on}
                    onValueChange={(on) => onDigest(kind, on)}
                  />
                }
              />
            ))
          : null}
      </Card>
      <DailyReminderDialog
        visible={editing !== null}
        title={editing ? digest[editing].label : ""}
        time={editing ? digest[editing].time : "08:00"}
        onSave={(time) => {
          if (editing) void save(patch(editing, true, time));
          setEditing(null);
        }}
        onClose={() => setEditing(null)}
      />
    </>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  warn: {
    flexDirection: "row",
    gap: space.sm,
    marginHorizontal: space.md,
    marginBottom: space.md,
    padding: space.md,
    borderRadius: radius.button,
    backgroundColor: colors.warningSoft,
  },
  flex: { flex: 1, gap: 2 },
}));
