# Design: Media Embedding in Manual Articles

**Date:** 2026-03-14
**Feature:** Image and video embedding via URL in the manual article editor
**Status:** Approved

---

## Overview

Allow admins to embed images and videos inside manual articles by inserting URL-based media tags. Media is hosted externally (Google Drive, YouTube, etc.) — no file upload to the server.

---

## Section 1 — Content Format & Syntax

Media is stored inline in the article `content` field as custom tags:

```
[img:https://drive.google.com/file/d/ABC123/view]
[video:https://www.youtube.com/watch?v=dQw4w9WgXcQ]
```

**URL Transformation at render time:**

| Input URL | Rendered as |
|-----------|-------------|
| `youtube.com/watch?v=ID` | `<iframe src="youtube.com/embed/ID">` |
| `youtu.be/ID` | `<iframe src="youtube.com/embed/ID">` |
| `drive.google.com/file/d/ID/view` via `[img:]` | `<img src="drive.google.com/uc?export=view&id=ID">` |
| `drive.google.com/file/d/ID/view` via `[video:]` | `<iframe src="drive.google.com/file/d/ID/preview">` |
| Direct image URL (`.jpg/.png/.gif/.webp`) | `<img src="url">` |

**Auto-detect on paste (in textarea):**
- YouTube URL → auto-converted to `[video:url]`
- URL ending in `.jpg/.png/.gif/.webp` → auto-converted to `[img:url]`
- Google Drive URL → no auto-detect (can't distinguish img/video); user uses toolbar button

---

## Section 2 — Editor Toolbar UI

Two buttons added above the textarea in both editor pages:

```
[ 📷 Immagine ]  [ ▶️ Video ]
```

On click → inline input appears below the toolbar:

```
URL immagine: [________________________] [Inserisci] [×]
```

On "Inserisci": the tag is inserted at the current cursor position in the textarea (or appended if no cursor). The input field closes.

No modal — inline state with `useState`. No new dependencies.

---

## Section 3 — Renderer

A function `renderArticleContent(text: string): ReactNode[]` processes text line by line:

- Plain line → `<p className="whitespace-pre-wrap">`
- `[img:url]` → transforms URL → `<img className="max-w-full rounded my-2" />`
- `[video:url]` → transforms URL → 16:9 responsive `<iframe>` (aspect-ratio container)

YouTube/Drive iframes:
- `width="100%"`, `aspect-ratio: 16/9`
- `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"`
- `allowFullScreen`

Images:
- `max-width: 100%`, `border-radius: 0.25rem`
- Clickable → opens in new tab

The renderer is extracted into a shared component `<ArticleContent content={content} />`.

---

## Section 4 — Files

| File | Change |
|------|--------|
| `src/components/manual/ArticleContent.tsx` | **New** — shared renderer component |
| `src/components/manual/MediaToolbar.tsx` | **New** — toolbar buttons + inline URL input |
| `src/app/(dashboard)/manual/editor/page.tsx` | Add `<MediaToolbar>` + paste auto-detect |
| `src/app/(dashboard)/manual/editor/[id]/page.tsx` | Same as above |
| `src/app/(dashboard)/manual/[categorySlug]/[articleSlug]/page.tsx` | Replace plain text with `<ArticleContent>` |

**No DB, API, or Prisma changes required.**

---

## Constraints

- No file upload — external hosting only (Google Drive, YouTube)
- No new npm dependencies
- Tags stored as plain text in existing `content: String` field
- Works in both create (`/editor`) and edit (`/editor/[id]`) pages
