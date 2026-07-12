# QA task: PDF Concatenator

## Scope тестирования

Ручное тестирование client-side SPA после code review Lead (шаг 5→6). Автотесты — только smoke/playwright по желанию QA, **без добавления test-фреймворка в CI** без запроса пользователя.

**In scope:**
- Импорт PDF/JPG/PNG (drop + browse)
- Превью thumbnails, удаление страниц, reorder
- Export PDF (text-safe merge), Export PNG/JPG (split)
- Compress image pages
- Состояния UI: empty, loading, ready, exporting, error
- Ошибки: encrypted PDF, corrupt file, unsupported format

**Out of scope:**
- Сервер, мобильные native apps, OCR, password unlock
- Performance benchmark на 500+ страниц
- i18n (достаточно проверить один язык UI)

**Артефакты для QA:**
- `requirements.md`, `design.md` (E2E-1…E2E-9, SD-1…SD-3)
- `test-cases.md` — создать на шаге 4а (до имплементации Dev)

---

## Приоритеты

| Приоритет | Область | Почему |
|-----------|---------|--------|
| **P0** | SD-1, E2E-4 | Ключевое требование заказчика — text-safe PDF merge |
| **P0** | E2E-8 | Encrypted PDF reject |
| **P1** | SD-2, E2E-5 | Split to PNG/ZIP |
| **P1** | E2E-3, E2E-6, E2E-9 | Reorder, multi-PDF merge, remove page |
| **P1** | SD-3, E2E-7 | Compress + export |
| **P2** | E2E-1, E2E-2 | Import smoke |
| **P2** | Soft-limit warning, loading/exporting UX | |
| **P3** | Edge cases (см. ниже) | |

---

## Обязательные TC

Сформировать в `test-cases.md` с ID, шагами, expected result. Минимальный набор:

### Import & workspace

| ID | Название | Основа |
|----|----------|--------|
| TC-01 | Import multi-page PDF | E2E-1 |
| TC-02 | Import large PNG → A4 fit | E2E-2 |
| TC-03 | Import JPG + PNG together | requirements |
| TC-04 | Import two PDFs sequentially | E2E-6 |
| TC-05 | Unsupported file (.txt) → error | requirements |
| TC-06 | Corrupt PDF → error, no partial pages | design fallback |
| TC-07 | Encrypted PDF → error message | E2E-8 |

### Reorder & delete

| ID | Название | Основа |
|----|----------|--------|
| TC-10 | Drag PNG between PDF pages | E2E-3, SD-1 step 4 |
| TC-11 | Delete middle page → export 2 pages | E2E-9 |
| TC-12 | Clear all → empty state | design states |

### Export PDF

| ID | Название | Основа |
|----|----------|--------|
| TC-20 | Merge PDF+PNG+PDF, 3 pages in order | SD-1 |
| TC-21 | Text selectable on original PDF pages | SD-1, E2E-4 |
| TC-22 | Merged file size ≈ original PDF + image (не растр всего документа) | SD-1, design acceptance |
| TC-23 | Images only → PDF, A4 top-left, no upscale | SD-3 |
| TC-24 | copyPages fallback → warning + rasterized page | design.md fallback table |

### Export images (split)

| ID | Название | Основа |
|----|----------|--------|
| TC-30 | PDF N pages → N PNG files (ZIP if N>1) | SD-2, E2E-5 |
| TC-31 | Export JPG format | requirements |
| TC-32 | Image page export → raw bytes (не re-render) | design |
| TC-33 | Single page → direct download (no ZIP) | design |

### Compress

| ID | Название | Основа |
|----|----------|--------|
| TC-40 | JPEG quality 50% → smaller bytes | E2E-7 |
| TC-41 | Thumbnail updates after compress | design |
| TC-42 | Compress не применяется к pdf-native pages | requirements |
| TC-43 | Compressed images used in Export PDF | SD-3 |

### UI states

| ID | Название | Основа |
|----|----------|--------|
| TC-50 | Empty state — только drop zone | design |
| TC-51 | Loading spinner during import | design |
| TC-52 | Exporting — disabled buttons + «Processing…» | design |
| TC-53 | Error dismiss / retry | design state diagram |

---

## Corner cases для покрытия

### A4 / image placement
- Image **smaller** than A4 (e.g. 800×600) — no upscale, top-left in export
- Image **wider** than A4 — scale down to fit width, height proportional
- Image **taller** than A4 — scale down to fit height
- Very small image (100×100) — still no upscale in merged PDF

### PDF edge cases
- PDF already scanned (page = embedded image) — copyPages preserves as-is (expected)
- Single-page PDF import
- Empty workspace → Export buttons disabled
- Re-import same file twice → duplicate pages allowed (document behavior)

### Export edge cases
- Export PDF with only image pages (no pdf-native)
- Export images with only image pages (no pdf-native) → direct files
- Mixed workspace: pdf-native + image in Export PNG → pdf rendered, image raw

### Compress edge cases
- PNG compress — primary lever max dimensions (not quality slider semantics for PNG)
- Quality 10% and 100% boundaries
- Apply compress with zero image pages — button disabled or no-op

### Memory / scale (P2–P3)
- Soft warning when >100 pages (if test files available)
- Large PDF (20+ pages) — import completes without hang (smoke)

### DnD
- Drag card to same position — no-op
- Drag to first/last index
- Visual feedback: opacity 0.5 while dragging

---

## Ссылка на e2e из design.md

| Design ID | QA TC (маппинг) | Приоритет |
|-----------|-----------------|-----------|
| E2E-1 | TC-01 | P2 |
| E2E-2 | TC-02 | P2 |
| E2E-3 | TC-10 | P1 |
| E2E-4 | TC-20, TC-21, TC-22 | **P0** |
| E2E-5 | TC-30 | P1 |
| E2E-6 | TC-04 | P1 |
| E2E-7 | TC-40 | P1 |
| E2E-8 | TC-07 | **P0** |
| E2E-9 | TC-11 | P1 |

**Sunny-day для SA (шаг 7):** SD-1 (P0), SD-2 (P1), SD-3 (P1) — дублировать в test-cases с пометкой `SA-acceptance`.

---

## Тестовые данные (рекомендации)

Подготовить или описать в `test-cases.md`:

| Файл | Назначение |
|------|------------|
| `text-2p.pdf` | 2 text pages, selectable text |
| `a.pdf` (1 page), `b.pdf` (2 pages) | Multi-PDF merge |
| `large.png` (4000×6000) | A4 fit |
| `small.jpg` (800×600) | No upscale |
| `large-photo.jpg` | Compress test |
| `encrypted.pdf` | Password-protected |
| `corrupt.pdf` | Invalid bytes |

Если файлов нет в репо — QA генерирует минимальные (pdf-lib / canvas) или документирует manual setup.

---

## Критерий готовности QA (шаг 6)

- [ ] `test-cases.md` создан на шаге 4а
- [ ] Все P0 TC пройдены после Lead review OK
- [ ] P1 TC пройдены или заведены баги в `bug-report.md`
- [ ] `npm run build` подтверждён QA
- [ ] Блокеры P0 — возврат Dev через `bug-report.md`
