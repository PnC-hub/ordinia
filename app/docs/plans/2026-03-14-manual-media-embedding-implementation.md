# Implementation Plan: Manual Media Embedding

**Design doc:** `2026-03-14-manual-media-embedding-design.md`
**Date:** 2026-03-14

---

## Task 1 — Create `ArticleContent.tsx`

**File:** `src/components/manual/ArticleContent.tsx`

- `transformMediaUrl(tag: 'img'|'video', url: string): string`
  - YouTube → embed URL
  - Google Drive → uc?export=view (img) or /preview (video)
  - Direct URL → unchanged
- `renderArticleContent(text: string): ReactNode[]`
  - Split by newline
  - Match `[img:url]` → `<img>` with click-to-open
  - Match `[video:url]` → responsive 16:9 `<iframe>`
  - Else → `<p>`
- `ArticleContent` component: wraps renderArticleContent output

---

## Task 2 — Create `MediaToolbar.tsx`

**File:** `src/components/manual/MediaToolbar.tsx`

Props:
```ts
interface MediaToolbarProps {
  onInsert: (tag: string) => void
}
```

- State: `activeInput: 'img' | 'video' | null`, `urlValue: string`
- Two buttons: "📷 Immagine" / "▶️ Video"
- Inline input appears on button click
- On "Inserisci": calls `onInsert('[img:url]')` or `onInsert('[video:url]')`
- On "×": closes input

---

## Task 3 — Update editor create page

**File:** `src/app/(dashboard)/manual/editor/page.tsx`

- Import `MediaToolbar` and `ArticleContent`
- Add `textareaRef` to textarea
- `handleInsertMedia(tag: string)`: inserts at cursor position in textarea
- `handlePaste(e: ClipboardEvent)`: auto-detect YouTube/image URLs → convert to tag
- Add `<MediaToolbar onInsert={handleInsertMedia} />` above textarea
- Live preview below textarea uses `<ArticleContent>` instead of plain `<pre>`

---

## Task 4 — Update editor edit page

**File:** `src/app/(dashboard)/manual/editor/[id]/page.tsx`

- Same changes as Task 3

---

## Task 5 — Update article view page

**File:** `src/app/(dashboard)/manual/[categorySlug]/[articleSlug]/page.tsx`

- Replace plain text rendering with `<ArticleContent content={article.content} />`

---

## Task 6 — Build + Deploy

1. `npm run build` (local or server)
2. Sync `.next` to run path
3. `pm2 restart ordinia`
4. `git push origin main`

---

## Order of execution

1 → 2 → 3 → 4 → 5 → 6

Tasks 3 and 4 can be parallelized after Task 2 completes.
