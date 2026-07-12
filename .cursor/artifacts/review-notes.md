# Review notes

## Решение: **APPROVED**

Код Dev готов к **шагу 6 (QA manual testing)**.

---

## Code review

### Сильные стороны

- **SD-1 / copyPages:** `exportPdf.ts` использует `copyPages` для `pdf-native`; pdf.js только в fallback catch — соответствует design.
- **Store wiring:** атомарный `addFiles` (ошибка → без partial pages), soft-limit warning, dynamic import pdf-библиотек.
- **A4 fit:** `computeFitDimensions` — no upscale, proportional downscale, top-left через PDF y-coord.
- **UI:** layout по wireframe, состояния empty/loading/ready/exporting/error, DnD reorder, compress/export panels.
- **Scope:** без лишних deps/arch layers; `npm run build` ✅ exit 0.
- **AGENTS.md:** функциональные компоненты, strict TS, minimal diff в `src/`.

### Замечания (не блокеры)

| # | Файл | Замечание | Приоритет |
|---|------|-----------|-----------|
| 1 | `importPdf.ts` | `isEncrypted` check недостижим — pdf-lib бросает `EncryptedPDFError` на `load()` раньше. Пользователь видит msg pdf-lib («…is encrypted…»), не кастомный. TC-07 допускает «эквивалент» — OK для QA, но лучше catch + remap. | P2 |
| 2 | `exportImages.ts` | Имена файлов `{source}-p{N}.png`, не `page-001.png` из design/TC-SD-2 | P1 (QA) |
| 3 | `index.html` | `<title>Hello World</title>` — не обновлён | P3 |
| 4 | `useAppStore.ts` | Файл остался, не используется — удалить | P3 |
| 5 | `CompressPanel.tsx` | PNG compress без `maxSide` UI — для JPEG OK, PNG lever слабый (TC-71 P3) | P3 |

---

## E2E smoke (design.md)

| ID | Статус | Доказательство |
|----|--------|----------------|
| **E2E-1** Import PDF multi-page | ✅ | Browser UI: `text-2p.pdf` → «Pages (2)», thumbnails |
| **E2E-2** Image A4 fit | ✅ | Browser: 4000×6000 → 2338×3508, aspect preserved |
| **E2E-3** Reorder | ⚠️ code | `reorderPages` + DnD в PageGrid; UI drag не прогнан end-to-end |
| **E2E-4** Export PDF text preservation | ✅ | Browser: `exportPdf` SD-1 fixture → 3 pages, **0 warnings** (copyPages, не raster), merged/original ratio 1.67 < 2× |
| **E2E-5** Split to PNG | ✅ | Browser: 3-page PDF → `exportImages` mode `zip` (PK header) |
| **E2E-6** Merge two PDFs | ⚠️ code | Логика store/import OK; UI upload a+b прерван file chooser |
| **E2E-7** Compress JPEG | ✅ | Browser: quality 50% → byte size уменьшился |
| **E2E-8** Encrypted PDF | ⚠️ code | pdf-lib `load()` throws для real /Encrypt PDFs; fixture pdf-lib save не создаёт /Encrypt. Partial pages не добавляются |
| **E2E-9** Remove page | ⚠️ code | `removePage` + prune sources; UI test не завершён |

### SD-1 (P0) — критично

**PASS.** Smoke в браузере подтвердил:

- 3 страницы в порядке PDF-1, PNG, PDF-2
- `warnings.length === 0` → **copyPages**, не растеризация
- Размер merged ≈ 1.67× original (< 2× порога design)

---

## Блокеры

_Нет._

---

## E2E: пройдено / не пройдено

**P0 smoke: пройдено** (SD-1 copyPages, build OK).

**P1/P2 UI flows:** частично — QA шаг 6 закрывает reorder, remove, multi-PDF, encrypted PDF с реальным fixture.

---

## Следующий шаг

→ **QA шаг 6:** ручное прогон `test-cases.md`, приоритет P0 (TC-SD-1, TC-07, TC-20–22), затем P1.

Рекомендации QA:

1. Для TC-07 использовать **реальный** password-protected PDF (Acrobat/qpdf), не pdf-lib fixture.
2. Проверить naming PNG export vs TC-SD-2 — зафиксировать как known deviation или bug.
3. E2E-3 drag: opacity 0.5 + порядок после export.
