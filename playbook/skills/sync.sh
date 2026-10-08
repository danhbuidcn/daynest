#!/usr/bin/env bash
# Tải đúng phần cần lấy của mỗi repo trong sources.txt vào playbook/.
# Dùng: ./sync.sh              đồng bộ tất cả
#       ./sync.sh <owner/repo>  chỉ đồng bộ 1 repo
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
PLAYBOOK="$(dirname "$HERE")"
ONLY="${1:-}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

trim() { local s="$1"; s="${s#"${s%%[![:space:]]*}"}"; printf '%s' "${s%"${s##*[![:space:]]}"}"; }

# In danh sách category trong frontmatter của 1 file .md
categories_of() {
  awk 'NR==1 && /^---/ {fm=1; next}
       fm && /^---/ {exit}
       fm && /^categories:/ {c=1; next}
       fm && c && /^[[:space:]]*-/ {gsub(/^[[:space:]]*-[[:space:]]*|["'\'' ]/, ""); print; next}
       fm && c {c=0}' "$1"
}

# Chỉ giữ file có category thuộc danh sách, rồi sinh index.md mục lục theo category
filter_categories() {
  local out="$1" cats=",$2," f c title
  for f in "$out"/*.md; do
    keep=0
    while read -r c; do
      if [[ "$cats" == *",$c,"* ]]; then keep=1; fi
    done < <(categories_of "$f")
    ((keep)) || rm "$f"
  done
  {
    echo "# Mục lục"
    echo
    echo "Nguồn: https://github.com/ByteByteGoHq/system-design-101 — đã lọc theo category."
    IFS=',' read -ra list <<<"$2"
    for c in "${list[@]}"; do
      printf '\n## %s\n\n' "$c"
      for f in "$out"/*.md; do
        [[ "$(basename "$f")" == index.md ]] && continue
        grep -qx "$c" <<<"$(categories_of "$f")" || continue
        title=$(grep -m1 '^title:' "$f" | sed -E "s/^title:[[:space:]]*[\"']?//; s/[\"'][[:space:]]*$//")
        echo "- [$title]($(basename "$f"))"
      done
    done
  } > "$out/index.md.tmp"
  mv "$out/index.md.tmp" "$out/index.md"
}

mapfile -t LINES < <(grep -vE '^[[:space:]]*(#|$)' "$HERE/sources.txt")

# Gom path theo repo để mỗi repo chỉ clone 1 lần
declare -A PATHS
for line in "${LINES[@]}"; do
  IFS='|' read -r repo path _ <<<"$line"
  repo=$(trim "$repo"); path=$(trim "$path")
  [[ -n "$ONLY" && "$repo" != "$ONLY" ]] && continue
  PATHS[$repo]+="$path "
done
[[ ${#PATHS[@]} -eq 0 ]] && { echo "Không có repo nào khớp '$ONLY' trong sources.txt"; exit 1; }

# Clone nông + sparse: chỉ tải file thuộc các path cần lấy
for repo in "${!PATHS[@]}"; do
  dir="$TMP/${repo//\//_}"
  git clone -q --depth 1 --filter=blob:none --sparse "https://github.com/$repo.git" "$dir"
  # shellcheck disable=SC2086
  git -C "$dir" sparse-checkout set ${PATHS[$repo]}
  echo "==> $repo @ $(git -C "$dir" rev-parse --short HEAD)"
done

for line in "${LINES[@]}"; do
  IFS='|' read -r repo path dest opts <<<"$line"
  repo=$(trim "$repo"); path=$(trim "$path"); dest=$(trim "$dest"); opts=$(trim "${opts:-}")
  [[ -n "$ONLY" && "$repo" != "$ONLY" ]] && continue
  out="$PLAYBOOK/$dest"
  rm -rf "$out"
  mkdir -p "$(dirname "$out")"
  cp -r "$TMP/${repo//\//_}/$path" "$out"

  IFS=';' read -ra kvs <<<"$opts"
  for kv in "${kvs[@]}"; do
    key=$(trim "${kv%%=*}"); val=$(trim "${kv#*=}")
    case "$key" in
      exclude)    IFS=',' read -ra xs <<<"$val"; for x in "${xs[@]}"; do rm -rf "${out:?}/$(trim "$x")"; done ;;
      categories) filter_categories "$out" "$val" ;;
      "")         ;;
      *)          echo "    Bỏ qua tùy chọn không hỗ trợ: $key" ;;
    esac
  done
  echo "    $dest ($(du -sh "$out" | cut -f1))"
done
