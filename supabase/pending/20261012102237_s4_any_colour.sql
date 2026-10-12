-- Sprint 4: any colour (hex) for events and note categories, besides the 6 named ones.
-- Spec: docs/specs/sprint-4/index.md § Màu bất kỳ. Builds before S4 only know the 6 names,
-- so they must update first: min_version_code = 6 (S4 build).
-- Kept in supabase/pending/ until the S4 release (step 8), then moved into migrations/.

alter table public.events drop constraint events_color_check;
alter table public.events add constraint events_color_check check (
  color in ('mint', 'sky', 'lavender', 'pink', 'peach', 'lemon') or color ~ '^#[0-9A-F]{6}$'
);

alter table public.note_categories drop constraint note_categories_color_check;
alter table public.note_categories add constraint note_categories_color_check check (
  color in ('mint', 'sky', 'lavender', 'pink', 'peach', 'lemon') or color ~ '^#[0-9A-F]{6}$'
);

update public.app_config set min_version_code = 6;
