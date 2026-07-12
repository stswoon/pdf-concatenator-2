# Dev tasks: PDF Concatenator

## Общий контекст

Client-side SPA (React 19 + Vite 6 + TS strict + Tailwind + shadcn + Zustand). Заменить Hello World counter на PDF Concatenator по `requirements.md` и `design.md`.

**Ключевые решения (не пересматривать без Lead):**
- `pdf-lib` — import PDF, `copyPages`, merge/export PDF, embed JPG/PNG
- `pdfjs-dist` — preview thumbnails, split PDF→PNG/JPG (растеризация только здесь)
- Canvas API — resize/compress изображений
- A4 canvas: **2480×3508 px**; PDF page: **595.28×841.89 pt**; px→pt: `pt = px * 72/300`
- Drag & drop reorder — нативный HTML5, без `@dnd-kit`
- ZIP для 2+ image exports — **`fflate`** (единственное доп. dep кроме pdf-*)
- Динамический import pdf-библиотек при первом `addFiles` (снизить initial bundle)

**Существующий код:**
- `src/App.tsx` — Hello World + counter → полностью заменить на шаге DEV-5
- `src/store/useAppStore.ts` — counter demo → заменить на `usePdfWorkspaceStore.ts` (DEV-1)
- `src/components/ui/button.tsx`, `src/lib/utils.ts` — переиспользовать
- `npm run build` обязателен перед сдачей каждой задачи (минимум typecheck для lib-задач без UI)

**Общие типы** (создаёт DEV-1, импортируют все):

```typescript
// src/types/workspace.ts — см. design.md
type SourcePdf = { id, fileName, bytes, pageCount }
type WorkspacePage = pdf-native | image
type AppStatus = 'empty' | 'loading' | 'ready' | 'exporting' | 'error'
```

---

## Задачи

### DEV-1: Foundation — deps, types, store scaffold

- **Файлы:**
  - `package.json` (через `npm install pdf-lib pdfjs-dist fflate`)
  - `src/types/workspace.ts`
  - `src/lib/constants.ts` — `A4_WIDTH_PX`, `A4_HEIGHT_PX`, `A4_WIDTH_PT`, `A4_HEIGHT_PT`, `PX_TO_PT`, soft-limit (100 pages / 200 MB)
  - `src/lib/download.ts` — `downloadBlob(blob, fileName)`, `downloadUint8Array(bytes, fileName, mime)`
  - `src/store/usePdfWorkspaceStore.ts` — полная схема state + сигнатуры actions (stub: `throw new Error('Not implemented')` или no-op с TODO)
  - Удалить/не использовать `useAppStore.ts` (можно удалить файл или оставить пустым — DEV-5 уберёт импорты)

- **Что сделать:**
  1. Установить `pdf-lib`, `pdfjs-dist`, `fflate`
  2. Перенести типы из `design.md` в `workspace.ts`, экспортировать
  3. Store: `sources`, `pages`, `status`, `error` + actions: `addFiles`, `removePage`, `reorderPages`, `compressImagePages`, `exportPdf`, `exportImages`, `clear`, `dismissError`
  4. Утилита скачивания файлов
  5. Константы A4 и лимитов

- **Критерий готовности:**
  - `npm run build` проходит
  - Типы и store экспортируются, actions объявлены с корректными сигнатурами
  - Зависимости в `package.json`, без лишних пакетов

- **Зависимости:** нет (первая задача)

---

### DEV-2: Image processing library

- **Файлы:**
  - `src/lib/image/decodeImage.ts` — `File`/`Uint8Array` → `ImageBitmap` или `HTMLImageElement`
  - `src/lib/image/fitImageToA4.ts` — логика из design.md (no upscale, proportional downscale, top-left)
  - `src/lib/image/compressImage.ts` — JPEG re-encode (quality 0.1–1); PNG — max side resize + re-encode
  - `src/lib/image/index.ts` — re-exports

- **Что сделать:**
  1. `fitImageToA4(bytes, mimeType)` → `{ bytes, width, height, mimeType }`
  2. `compressImage(pageBytes, mimeType, options: { quality?, maxSide? })` → обновлённые bytes + dimensions
  3. Только Canvas API, без UI/store

- **Критерий готовности:**
  - `npm run build` проходит
  - PNG 4000×6000 → результат ≤2480×3508, aspect ratio сохранён
  - Изображение 1000×800 не апскейлится
  - JPEG compress с quality 0.5 уменьшает byte size

- **Зависимости:** DEV-1 (`constants.ts`, типы)

---

### DEV-3: PDF & export libraries

- **Файлы:**
  - `src/lib/pdf/importPdf.ts` — `loadPdf(bytes)` → `{ pageCount }`, detect encrypted → throw
  - `src/lib/pdf/pdfDocumentCache.ts` — `Map<sourcePdfId, PDFDocument>` на время export
  - `src/lib/pdf/exportPdf.ts` — merge loop: `copyPages` для pdf-native, embed image на A4 для image; fallback rasterize + warning
  - `src/lib/pdf/index.ts`
  - `src/lib/pdf-render/setupPdfJs.ts` — worker URL через `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)`
  - `src/lib/pdf-render/renderPageToCanvas.ts` — render @ ~300 DPI для export/preview
  - `src/lib/pdf-render/index.ts`
  - `src/lib/export/createZip.ts` — ZIP через `fflate`
  - `src/lib/export/exportImages.ts` — split: pdf-native→render, image→raw bytes; 1 file direct, 2+ ZIP
  - `src/lib/thumbnails.ts` — render thumbnail ~150–200px long side (pdf-native via pdf.js, image via blob URL)

- **Что сделать:**
  1. pdf-lib import с reject encrypted PDF (`"Encrypted PDF is not supported"`)
  2. `exportPdf(pages, sources)` → `Uint8Array`; кэш loaded docs; fallback при copyPages error
  3. pdf.js worker корректно резолвится в Vite
  4. `exportImages(pages, sources, format: 'png' | 'jpeg')` → blob(s) или zip bytes
  5. Thumbnail helper без привязки к React

- **Критерий готовности:**
  - `npm run build` проходит
  - `exportPdf` для 2 text pages + 1 PNG возвращает 3-page PDF (smoke в devtools/console test допустим)
  - `exportImages` для 3-page PDF даёт 3 PNG blobs
  - Encrypted PDF → throw с понятным сообщением
  - Worker path не ломает production build

- **Зависимости:** DEV-1 (типы, constants)

---

### DEV-4: UI components

- **Файлы:**
  - `src/components/DropZone.tsx` — drag-over highlight, hidden `<input type="file" multiple accept=".pdf,.png,.jpg,.jpeg">`
  - `src/components/PageCard.tsx` — thumbnail, badge (PDF/Image), label, delete [×], `draggable`
  - `src/components/PageGrid.tsx` — сетка карточек, native HTML5 DnD (`onDragStart/Over/Drop`), placeholder/opacity 0.5
  - `src/components/CompressPanel.tsx` — quality slider 10–100%, Apply (disabled если нет image pages)
  - `src/components/ExportActions.tsx` — Export PDF, Export PNG, Export JPG; disabled при `exporting`/empty
  - `src/hooks/usePageThumbnail.ts` (опционально) — загрузка thumbnail async

- **Что сделать:**
  1. Layout по wireframe из `design.md`
  2. Tailwind + shadcn `Button`; Slider — нативный `<input type="range">` (без нового shadcn Slider, если не нужен)
  3. Компоненты принимают props / читают store через hooks — **не** реализовывать бизнес-логику import/export
  4. DnD вызывает `reorderPages(fromIndex, toIndex)` из store
  5. UI язык: один (EN или RU — на выбор Dev, единообразно)

- **Критерий готовности:**
  - `npm run build` проходит
  - Компоненты рендерятся с mock-данными или подключены к store (даже со stub actions)
  - DnD визуально работает (reorder вызывается)
  - Состояния empty/loading/ready/exporting/error отображаются

- **Зависимости:** DEV-1 (store types, store hook)

---

### DEV-5: Store wiring & App integration

- **Файлы:**
  - `src/store/usePdfWorkspaceStore.ts` — полная реализация всех actions
  - `src/App.tsx` — заменить Hello World на PDF Concatenator layout
  - `src/index.css` — минимальные правки layout при необходимости
  - Удалить `src/store/useAppStore.ts` если не используется

- **Что сделать:**
  1. **`addFiles(files)`:** PDF → pdf-lib load, split на `pdf-native` pages, save `SourcePdf`; JPG/PNG → `fitImageToA4` → `image` page; dynamic import libs; `status: loading → ready|error`
  2. **`removePage(id)`**, **`reorderPages(from, to)`**, **`clear()`**
  3. **`compressImagePages(quality, maxSide?)`** — только `kind: 'image'`, обновить bytes + thumbnail
  4. **`exportPdf()`** — `status: exporting`, вызов `exportPdf` lib, download `merged.pdf`, fallback warnings в UI (toast/alert)
  5. **`exportImages(format)`** — exporting → download
  6. Soft-limit warning при >100 pages или >200 MB (не блокировать)
  7. Error handling: corrupt file, unsupported format, encrypted PDF
  8. Собрать `App` из DEV-4 компонентов + toolbar (Add files, Clear all)

- **Критерий готовности:**
  - `npm run build` проходит
  - SD-1 вручную: PDF 2 text pages + PNG → reorder → Export PDF → 3 pages, text selectable on PDF pages
  - SD-2: Split PDF → ZIP с N PNG
  - SD-3: 3 JPG → compress 70% → Export PDF
  - E2E-8: encrypted PDF → error, no partial pages
  - Нет counter/Hello World в UI

- **Зависимости:** DEV-1, DEV-2, DEV-3, DEV-4 (все предыдущие)

---

## Параллельность

| Волна | Задачи | Примечание |
|-------|--------|------------|
| 1 | **DEV-1** | Gate — без него не стартуют остальные |
| 2 | **DEV-2**, **DEV-3**, **DEV-4** | Параллельно; разные директории, без конфликтов |
| 3 | **DEV-5** | Интеграция; после завершения волны 2 |

**Максимум параллельных Dev-агентов:** 3 (DEV-2 + DEV-3 + DEV-4).

Для git worktree / `best-of-n-runner`: каждый агент волны 2 работает в своей ветке/worktree; merge перед DEV-5.

---

## Конфликты файлов

| Файл | DEV-1 | DEV-2 | DEV-3 | DEV-4 | DEV-5 |
|------|-------|-------|-------|-------|-------|
| `usePdfWorkspaceStore.ts` | scaffold | — | — | read | **implement** |
| `App.tsx` | — | — | — | — | **replace** |
| `src/lib/image/*` | — | **owner** | — | — | — |
| `src/lib/pdf/*`, `pdf-render/*`, `export/*` | — | — | **owner** | — | — |
| `src/components/*` | — | — | — | **owner** | wire only |

**Правило:** только DEV-5 пишет в `usePdfWorkspaceStore.ts` (кроме scaffold DEV-1) и `App.tsx`.
