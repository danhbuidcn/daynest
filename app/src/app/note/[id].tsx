import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { NestableScrollContainer } from "react-native-draggable-flatlist";
import { SafeAreaView } from "react-native-safe-area-context";

import { ActionMenu, MoreButton } from "@/components/ActionMenu";
import { ConfirmDialog } from "@/components/Dialog";
import { Icon } from "@/components/Icon";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useToast } from "@/components/Toast";
import { ConflictDialog } from "@/features/events/OccurrenceDialogs";
import { deleteNoteForever } from "@/features/notes/api";
import { CategoryPickerDialog } from "@/features/notes/CategoryPickerDialog";
import { Chip } from "@/features/notes/CategoryChips";
import {
  ChecklistBlock,
  newChecklistItem,
} from "@/features/notes/editor/ChecklistBlock";
import { useNoteEditor } from "@/features/notes/editor/useNoteEditor";
import type { Note } from "@/features/notes/note";
import {
  useCategories,
  useInvalidateNotes,
  useNote,
  useTrashNote,
} from "@/features/notes/useNotes";
import { toHex } from "@/lib/colors";
import {
  CHECKLIST_MAX_ITEMS,
  NOTE_BODY_MAX,
  NOTE_TITLE_MAX,
} from "@/lib/notes";
import { colors, radius, space, type as typeScale } from "@/theme";

// Màn 17 — `/note/<id>` opens a note · `/note/<new id>?isNew=1&categoryId=…` starts one.
// Laid out like Samsung Notes (S3 C): title in the top bar, body fills the screen, tools above the keyboard.
export default function NoteEditorScreen() {
  const params = useLocalSearchParams<{
    id: string;
    isNew?: string;
    categoryId?: string;
  }>();
  const isNew = params.isNew === "1";
  const loaded = useNote(params.id, !isNew);
  const router = useRouter();

  if (!isNew && loaded.isLoading) return <SafeAreaView style={styles.screen} />;
  if (!isNew && !loaded.data) {
    return (
      <SafeAreaView edges={["top"]} style={styles.screen}>
        <ScreenHeader title="" onBack={() => router.back()} compact />
      </SafeAreaView>
    );
  }
  return (
    <NoteEditor
      id={params.id}
      note={loaded.data ?? null}
      initialCategoryId={params.categoryId || null}
    />
  );
}

function NoteEditor({
  id,
  note,
  initialCategoryId,
}: {
  id: string;
  note: Note | null;
  initialCategoryId: string | null;
}) {
  const { t } = useTranslation();
  const toast = useToast();
  const navigation = useNavigation();
  const router = useRouter();
  const editor = useNoteEditor({ id, note, initialCategoryId });
  const { draft, setDraft } = editor;
  const categories = useCategories().data ?? [];
  const trash = useTrashNote();
  const invalidate = useInvalidateNotes();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [emptyAsk, setEmptyAsk] = useState(false);
  const [unsavedAsk, setUnsavedAsk] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const bodyRef = useRef<TextInput>(null);
  const leaving = useRef(false);
  const pendingLeave = useRef<(() => void) | null>(null);
  const category = categories.find((c) => c.id === draft.categoryId);

  const leaveNow = useCallback(() => {
    leaving.current = true;
    const go = pendingLeave.current;
    pendingLeave.current = null;
    if (go) go();
    else router.back();
  }, [router]);

  // Back / swipe back: save first; empty → ask to delete; failed → ask to leave without saving.
  useEffect(() => {
    return navigation.addListener("beforeRemove", (e) => {
      if (leaving.current) return;
      e.preventDefault();
      pendingLeave.current = () => navigation.dispatch(e.data.action);
      void editor.save().then((result) => {
        if (result === "ok") leaveNow();
        else if (result === "empty") {
          if (editor.exists()) setEmptyAsk(true);
          else leaveNow();
        } else if (result === "error") setUnsavedAsk(true);
      });
    });
  }, [navigation, editor, leaveNow]);

  useEffect(() => {
    if (editor.failed) toast(t("notes.saveFailed"), "error");
  }, [editor.failed, toast, t]);

  const addItem = () => {
    if (draft.checklist.length >= CHECKLIST_MAX_ITEMS) return;
    const item = newChecklistItem();
    setDraft({ ...draft, checklist: [...draft.checklist, item] });
    setFocusId(item.id);
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
      <View style={styles.bar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => router.back()}
          style={styles.barButton}
        >
          <Icon name="back" size={24} color={colors.text} />
        </Pressable>
        <TextInput
          value={draft.title}
          onChangeText={(title) => setDraft({ ...draft, title })}
          placeholder={t("notes.titlePlaceholder")}
          placeholderTextColor={colors.textMuted}
          maxLength={NOTE_TITLE_MAX}
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => bodyRef.current?.focus()}
          style={styles.title}
        />
        <MoreButton onPress={() => setMenuOpen(true)} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <NestableScrollContainer
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            ref={bodyRef}
            autoFocus={!note}
            value={draft.body}
            onChangeText={(body) => setDraft({ ...draft, body })}
            placeholder={t("notes.bodyPlaceholder")}
            placeholderTextColor={colors.textMuted}
            maxLength={NOTE_BODY_MAX}
            multiline
            scrollEnabled={false}
            style={styles.body}
          />
          <ChecklistBlock
            items={draft.checklist}
            onChange={(checklist, next) => {
              setDraft({ ...draft, checklist });
              if (next) setFocusId(next);
            }}
            focusId={focusId}
            onFocusHandled={() => setFocusId(null)}
          />
          {/* The empty space under the text still belongs to the body, as in Samsung Notes. */}
          <Pressable
            accessible={false}
            onPress={() => bodyRef.current?.focus()}
            style={styles.rest}
          />
        </NestableScrollContainer>
        <View style={styles.toolbar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("notes.checklist")}
            onPress={addItem}
            style={styles.tool}
          >
            <Icon name="checklist" size={22} color={colors.primaryDark} />
          </Pressable>
          <Chip
            label={category ? category.name : t("notes.addCategory")}
            dot={category ? toHex(category.color) : undefined}
            onPress={() => {
              Keyboard.dismiss();
              setPickerOpen(true);
            }}
          />
        </View>
      </KeyboardAvoidingView>

      <ActionMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        actions={[
          {
            icon: "pin",
            label: draft.pinned ? t("notes.unpin") : t("notes.pin"),
            onPress: () => setDraft({ ...draft, pinned: !draft.pinned }),
          },
          {
            icon: "folder",
            label: t("notes.category"),
            onPress: () => setPickerOpen(true),
          },
          {
            icon: "trash",
            label: t("notes.delete"),
            danger: true,
            onPress: async () => {
              if (!editor.exists()) return leaveNow();
              if (await trash(id)) leaveNow();
            },
          },
        ]}
      />
      <CategoryPickerDialog
        visible={pickerOpen}
        title={t("notes.category")}
        selected={draft.categoryId}
        onClose={() => setPickerOpen(false)}
        onSelect={(categoryId) => {
          setPickerOpen(false);
          setDraft({ ...draft, categoryId });
        }}
      />
      <ConfirmDialog
        visible={emptyAsk}
        icon="trash"
        title={t("notes.emptyTitle")}
        text={t("notes.emptyText")}
        cancelLabel={t("notes.keepEditing")}
        confirmLabel={t("notes.delete")}
        onCancel={() => {
          setEmptyAsk(false);
          pendingLeave.current = null;
        }}
        onConfirm={async () => {
          setEmptyAsk(false);
          await deleteNoteForever(id).catch(() => {});
          void invalidate();
          leaveNow();
        }}
      />
      <ConfirmDialog
        visible={unsavedAsk}
        icon="warn"
        title={t("notes.unsavedTitle")}
        text={t("notes.unsavedText")}
        cancelLabel={t("notes.keepEditing")}
        confirmLabel={t("notes.leave")}
        onCancel={() => {
          setUnsavedAsk(false);
          pendingLeave.current = null;
        }}
        onConfirm={() => {
          setUnsavedAsk(false);
          leaveNow();
        }}
      />
      <ConflictDialog
        visible={editor.conflict.visible}
        onReload={() => void editor.conflict.onReload()}
        onOverwrite={() => void editor.conflict.onOverwrite()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  barButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { ...typeScale.title, flex: 1, color: colors.text, padding: 0 },
  content: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 14, gap: 6 },
  rest: { flexGrow: 1, minHeight: space.xxl },
  body: {
    ...typeScale.body,
    color: colors.text,
    textAlignVertical: "top",
    padding: 0,
    minHeight: 44,
  },
  toolbar: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  tool: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.icon + 2,
    backgroundColor: colors.primarySoft,
  },
});
