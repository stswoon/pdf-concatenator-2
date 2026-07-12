# Test cases: PDF Concatenator

## Scope

**In scope:** импорт PDF/JPG/PNG (drop + browse), превью thumbnails, удаление и reorder страниц, Export PDF (text-safe merge), Export PNG/JPG (split), compress image pages, UI-состояния (empty, loading, ready, exporting, error), ошибки (encrypted, corrupt, unsupported).

**Out of scope:** сервер, OCR, password unlock, performance benchmark 500+ страниц, i18n (достаточно одного языка UI), мобильные native apps.

**Автотесты:** не добавляются — в проекте нет test-фреймворка (Vitest/Playwright только по явной просьбе пользователя).

---

## Приоритеты

| Приоритет | Область | TC |
|-----------|---------|-----|
| **P0** | Text-safe PDF merge (SD-1, E2E-4) | TC-SD-1, TC-20, TC-21, TC-22 |
| **P0** | Encrypted PDF reject (E2E-8) | TC-07 |
| **P1** | Split PNG/ZIP (SD-2, E2E-5) | TC-SD-2, TC-30, TC-31, TC-32, TC-33 |
| **P1** | Reorder, multi-PDF, remove (E2E-3, E2E-6, E2E-9) | TC-10, TC-04, TC-11 |
| **P1** | Compress + export (SD-3, E2E-7) | TC-SD-3, TC-40, TC-41, TC-42, TC-43 |
| **P2** | Import smoke (E2E-1, E2E-2) | TC-01, TC-02, TC-03, TC-08 |
| **P2** | UI states, soft-limit, loading/exporting UX | TC-50, TC-51, TC-52, TC-53, TC-74, TC-75 |
| **P3** | Corner cases (A4, DnD, edge export/compress) | TC-60…TC-78 |

---

## Тестовые данные

| Файл | Назначение | Как получить |
|------|------------|--------------|
| `text-2p.pdf` | 2 текстовые страницы, selectable text | pdf-lib / любой текстовый PDF |
| `a.pdf` | 1 страница | pdf-lib |
| `b.pdf` | 2 страницы | pdf-lib |
| `large.png` | 4000×6000 px | canvas / stock image |
| `small.jpg` | 800×600 px | canvas / stock image |
| `tiny.png` | 100×100 px | canvas |
| `large-photo.jpg` | >2 MB JPEG | stock photo |
| `encrypted.pdf` | password-protected | pdf-lib с encryption |
| `corrupt.pdf` | невалидные байты | текстовый файл с расширением .pdf |
| `unsupported.txt` | неподдерживаемый формат | любой .txt |
| `scanned.pdf` | страница = embedded image | скан или pdf-lib с embedded image |
| `3page.pdf` | 3 страницы для split/remove | pdf-lib |

Если файлов нет в репо — QA генерирует минимальные перед шагом 6 или документирует manual setup.

---

## Happy path

Сценарии sunny-day заказчика и E2E из design.md. Колонка **P** — приоритет.

| ID | P | Сценарий | Шаги | Ожидаемый результат |
|----|---|----------|------|---------------------|
| **TC-SD-1** | P0 | **SA-acceptance:** PDF + PNG → merged PDF с сохранением текста (SD-1, E2E-4) | 1. Открыть приложение.<br>2. Импортировать `text-2p.pdf` (2 текстовые страницы).<br>3. Импортировать PNG (≤ A4 или large.png для fit).<br>4. Убедиться: 3 карточки, PNG вписан в A4, top-left, без upscale.<br>5. Перетащить PNG между 1-й и 2-й PDF-страницами.<br>6. Нажать **Export PDF**. | Порядок страниц: PDF-1, PNG, PDF-2. Скачивается один PDF из 3 страниц. Текст на PDF-страницах selectable/searchable в Chrome PDF viewer / Adobe Reader. Размер merged ≈ размер исходного PDF + вклад PNG (допуск ±15%). |
| **TC-SD-2** | P1 | **SA-acceptance:** Split PDF в PNG (SD-2, E2E-5) | 1. Импортировать PDF из N страниц (напр. `3page.pdf`, N=3).<br>2. Нажать **Export PNG**. | Скачивается ZIP с N файлами `page-001.png` … `page-00N.png`. Каждый PNG соответствует странице PDF. |
| **TC-SD-3** | P1 | **SA-acceptance:** Compress + merge images (SD-3, E2E-7) | 1. Импортировать 3 JPG.<br>2. Установить quality 70%, нажать **Apply**.<br>3. Нажать **Export PDF**. | Один PDF из 3 страниц A4; каждая страница — image top-left без upscale. Сжатые байты используются в экспорте. |
| TC-01 | P2 | Import multi-page PDF (E2E-1) | 1. Открыть приложение.<br>2. Загрузить `text-2p.pdf` через drop zone. | 2 карточки с labels (номера страниц). Статус `ready`. Thumbnails отображаются. |
| TC-02 | P2 | Import large PNG → A4 fit (E2E-2) | 1. Загрузить PNG 4000×6000. | 1 image-карточка. Внутренние bytes ≤ 2480×3508; aspect ratio сохранён. Thumbnail виден. |
| TC-03 | P2 | Import JPG + PNG together | 1. Выбрать через browse (multiple) `small.jpg` и PNG одновременно. | 2 карточки в порядке выбора файлов. Обе — image type. Статус `ready`. |
| TC-04 | P1 | Import two PDFs sequentially (E2E-6) | 1. Загрузить `a.pdf` (1 стр.).<br>2. Загрузить `b.pdf` (2 стр.).<br>3. Export PDF. | 3 страницы в порядке: a-p1, b-p1, b-p2. Экспортированный PDF содержит 3 страницы. |
| TC-08 | P2 | Import via browse (file input) | 1. Кликнуть drop zone / **Add files**.<br>2. Выбрать PDF через `<input type="file">`. | Файл импортирован так же, как при drag & drop. Статус `ready`. |
| TC-10 | P1 | Drag PNG between PDF pages (E2E-3) | 1. Workspace: [PDF-p1, PDF-p2, PNG] (из TC-SD-1 шаги 1–3).<br>2. Перетащить PNG на index 1 (между PDF-p1 и PDF-p2). | Порядок: [PDF-p1, PNG, PDF-p2]. Export PDF отражает новый порядок. |
| TC-11 | P1 | Delete middle page → export 2 pages (E2E-9) | 1. Добавить 3 страницы (любой mix).<br>2. Удалить среднюю (кнопка × на карточке).<br>3. Export PDF. | 2 страницы в экспорте. Удалённая страница отсутствует. |
| TC-20 | P0 | Merge PDF+PNG+PDF, 3 pages in order (E2E-4) | 1. Workspace: [PDF-p1, PNG, PDF-p2].<br>2. Export PDF → `merged.pdf`. | 3 страницы в указанном порядке. Файл открывается в PDF viewer. |
| TC-21 | P0 | Text selectable on original PDF pages (E2E-4) | 1. Открыть `merged.pdf` из TC-20 в Chrome PDF viewer.<br>2. Выделить текст на стр. 1 и 3. | Текст выделяется и копируется. Стр. 2 (PNG) — растровая, текст не ожидается. |
| TC-22 | P0 | Merged file size ≈ original + image, не full raster (E2E-4) | 1. Записать `fileSize(text-2p.pdf)` и `fileSize(merged.pdf)` из TC-20.<br>2. Сравнить с гипотетическим full-raster (3× PNG @300 DPI). | `merged` ≈ `originalPdf + pngContribution` (±15%). `merged` значительно меньше full-raster варианта (< 2× original PDF size). |
| TC-30 | P1 | PDF N pages → N PNG files, ZIP if N>1 (E2E-5) | 1. Загрузить 3-page PDF.<br>2. Export PNG. | 3 PNG-файла в ZIP (или 3 отдельных скачивания — по реализации). Имена `page-001.png` … |
| TC-31 | P1 | Export JPG format | 1. Workspace с ≥2 страницами.<br>2. Export JPG. | Скачиваются JPG-файлы (ZIP при >1). Формат JPEG, не PNG. |
| TC-32 | P1 | Image page export → raw bytes (не re-render) | 1. Импортировать JPG.<br>2. Записать hash/size bytes до export.<br>3. Export PNG/JPG для image-only workspace. | Экспортированный файл соответствует текущим bytes в workspace (без лишнего re-render pdf.js). |
| TC-33 | P1 | Single page → direct download (no ZIP) | 1. Workspace с 1 страницей.<br>2. Export PNG. | Прямое скачивание одного файла, без ZIP. |
| TC-40 | P1 | JPEG quality 50% → smaller bytes (E2E-7) | 1. Загрузить `large-photo.jpg`.<br>2. Записать byte size до compress.<br>3. Quality 50%, **Apply**. | Byte size уменьшился. Thumbnail обновился. |
| TC-41 | P1 | Thumbnail updates after compress | 1. После TC-40 визуально сравнить thumbnail до/после. | Thumbnail отражает сжатое изображение (визуально менее детализирован / меньше). |
| TC-42 | P1 | Compress не применяется к pdf-native pages | 1. Workspace: PDF-страница + JPG.<br>2. **Apply** compress. | Изменяются только image-страницы. PDF-native bytes и thumbnail без изменений. |
| TC-43 | P1 | Compressed images used in Export PDF | 1. Сжать JPG (quality 50%).<br>2. Export PDF. | Экспортированный PDF содержит сжатое изображение (размер страницы/файла соответствует сжатым bytes). |

---

## Negative / edge cases

| ID | P | Сценарий | Шаги | Ожидаемый результат |
|----|---|----------|------|---------------------|
| TC-05 | P2 | Unsupported file (.txt) → error | 1. Попытаться загрузить `unsupported.txt` (drop или browse). | Сообщение об ошибке (неподдерживаемый формат). Частичные страницы не добавляются. Статус `error` → dismiss → `ready`/`empty`. |
| TC-06 | P2 | Corrupt PDF → error, no partial pages | 1. Загрузить `corrupt.pdf`. | Ошибка парсинга. Ни одна страница не попадает в workspace. Нет «битых» thumbnails. |
| TC-07 | P0 | Encrypted PDF → error message (E2E-8) | 1. Загрузить `encrypted.pdf` (password-protected). | Сообщение: «Encrypted PDF is not supported» (или эквивалент). Частичные страницы не добавляются. |
| TC-12 | P2 | Clear all → empty state | 1. Workspace с несколькими страницами.<br>2. Нажать **Clear all**. | Workspace пуст. Только drop zone + подсказка. Статус `empty`. |
| TC-23 | P1 | Images only → PDF, A4 top-left, no upscale | 1. Импортировать `small.jpg` (800×600).<br>2. Export PDF.<br>3. Открыть в viewer, проверить размеры image на странице. | 1 страница A4. Изображение в верхнем левом углу, 800×600 pt-scale (без upscale до full A4). |
| TC-24 | P1 | copyPages fallback → warning + rasterized page | 1. Загрузить PDF, для которого `copyPages` падает (corrupt feature / специальный fixture).<br>2. Export PDF. | Warning: «Page N exported as image (original could not be copied)». Страница N в merged PDF — растровая, но экспорт завершается. |
| TC-50 | P2 | Empty state — только drop zone | 1. Открыть приложение без файлов. | Видна drop zone + подсказка «Drop PDF, JPG or PNG…». Нет сетки страниц. Export-кнопки disabled или скрыты. |
| TC-51 | P2 | Loading spinner during import | 1. Загрузить PDF 20+ страниц (или large file).<br>2. Наблюдать UI во время парсинга. | Spinner/skeleton на месте thumbnails. Кнопки неактивны до завершения. |
| TC-52 | P2 | Exporting — disabled buttons + «Processing…» | 1. Workspace ready.<br>2. Нажать Export PDF.<br>3. Наблюдать UI во время экспорта. | Кнопки disabled. Индикатор «Processing…». После завершения — статус `ready`, скачивание началось. |
| TC-53 | P2 | Error dismiss / retry | 1. Вызвать ошибку (TC-05 или TC-07).<br>2. Dismiss ошибку.<br>3. Загрузить валидный файл. | После dismiss UI возвращается в рабочее состояние. Повторный импорт успешен. |
| TC-66 | P2 | Empty workspace → Export buttons disabled | 1. Открыть app / после Clear all.<br>2. Проверить Export PDF, Export PNG, Export JPG. | Кнопки экспорта disabled или неактивны. |
| TC-74 | P2 | Soft warning when >100 pages | 1. Импортировать PDF с >100 страницами (если fixture доступен). | Предупреждение о большом количестве страниц (soft-limit). Импорт не блокируется жёстко. |
| TC-75 | P2 | Large PDF 20+ pages — import smoke | 1. Импортировать PDF 20+ страниц.<br>2. Дождаться завершения. | Импорт завершается без зависания. Все thumbnails появляются (возможно lazy). Статус `ready`. |

---

## Corner cases

| ID | P | Сценарий | Шаги | Ожидаемый результат |
|----|---|----------|------|---------------------|
| TC-60 | P3 | Image smaller than A4 — no upscale | 1. Импортировать `small.jpg` (800×600).<br>2. Export PDF. | Изображение 800×600, top-left (0,0). Не растянуто до 2480×3508. |
| TC-61 | P3 | Image wider than A4 — scale down to fit width | 1. Импортировать широкое изображение (напр. 5000×2000).<br>2. Проверить internal dimensions.<br>3. Export PDF. | Масштаб: `scale = min(2480/w, 3508/h)`. Ширина ≤ 2480, пропорции сохранены. |
| TC-62 | P3 | Image taller than A4 — scale down to fit height | 1. Импортировать высокое изображение (напр. 2000×5000).<br>2. Проверить internal dimensions. | Высота ≤ 3508, пропорции сохранены, top-left placement. |
| TC-63 | P3 | Very small image (100×100) — no upscale | 1. Импортировать `tiny.png` (100×100).<br>2. Export PDF. | 100×100 на A4 canvas, top-left. Без upscale. |
| TC-64 | P3 | PDF already scanned — copyPages preserves as-is | 1. Импортировать `scanned.pdf` (embedded image page).<br>2. Export PDF. | Страница остаётся embedded image (ожидаемо). Экспорт без ошибки. |
| TC-65 | P3 | Single-page PDF import | 1. Загрузить `a.pdf` (1 стр.). | 1 карточка. Label показывает page 1. Export PDF → 1 страница. |
| TC-67 | P3 | Re-import same file twice — duplicate pages | 1. Загрузить `small.jpg` дважды подряд. | 2 карточки с одинаковым содержимым. Поведение документировано (дубликаты разрешены). |
| TC-68 | P3 | Export PDF with only image pages | 1. Workspace: 2 JPG + 1 PNG, без PDF-native.<br>2. Export PDF. | Один PDF, каждая страница A4 с image top-left. Без ошибок. |
| TC-69 | P3 | Export images with only image pages — direct files | 1. Workspace: 2 image pages.<br>2. Export PNG. | 2 отдельных файла или ZIP — по design. Image bytes без pdf.js render. |
| TC-70 | P3 | Mixed workspace Export PNG — pdf rendered, image raw | 1. Workspace: PDF-native + image page.<br>2. Export PNG. | PDF-страница — растр через pdf.js @300 DPI. Image-страница — raw bytes. |
| TC-71 | P3 | PNG compress — primary lever max dimensions | 1. Импортировать large PNG.<br>2. Apply compress (без JPEG quality semantics). | Уменьшение dimensions (max side) — основной эффект. PNG re-encode. |
| TC-72 | P3 | Quality 10% and 100% boundaries | 1. JPG в workspace.<br>2. Apply quality 10%. Записать size.<br>3. Apply quality 100%. | 10% — минимальный размер. 100% — максимальное качество/размер. Оба значения принимаются без ошибки. |
| TC-73 | P3 | Compress with zero image pages — disabled/no-op | 1. Workspace: только PDF-native страницы.<br>2. Попытаться **Apply** compress. | Кнопка disabled или no-op без изменений workspace. |
| TC-76 | P3 | Drag card to same position — no-op | 1. Перетащить карточку на ту же позицию. | Порядок не меняется. Нет ошибок в консоли. |
| TC-77 | P3 | Drag to first/last index | 1. Workspace ≥3 страниц.<br>2. Перетащить последнюю на index 0.<br>3. Перетащить первую на last index. | Порядок корректно обновляется в обоих случаях. Export отражает порядок. |
| TC-78 | P3 | Visual feedback: opacity 0.5 while dragging | 1. Начать drag карточки.<br>2. Наблюдать стиль перетаскиваемой карточки. | Opacity ~0.5 (или эквивалентный visual feedback) во время drag. |

---

## Regression

| ID | P | Сценарий | Шаги | Ожидаемый результат |
|----|---|----------|------|---------------------|
| TC-R01 | P2 | App loads without errors | 1. `npm run dev`.<br>2. Открыть localhost в браузере.<br>3. Проверить console. | Приложение рендерится. Нет критических ошибок в console. PDF Concatenator layout (не Hello World). |
| TC-R02 | P2 | `npm run build` passes | 1. Выполнить `npm run build`. | Exit code 0. Нет ошибок TypeScript и Vite. |
| TC-R03 | P3 | Global styles / layout intact | 1. Открыть app.<br>2. Проверить базовый layout, шрифты, отсутствие сломанных стилей. | UI читаемый, Tailwind/shadcn стили применены. Нет визуальных регрессий базового shell. |

---

## Маппинг Design E2E → TC

| Design ID | QA TC | Приоритет |
|-----------|-------|-----------|
| E2E-1 | TC-01 | P2 |
| E2E-2 | TC-02 | P2 |
| E2E-3 | TC-10 | P1 |
| E2E-4 | TC-SD-1, TC-20, TC-21, TC-22 | **P0** |
| E2E-5 | TC-SD-2, TC-30 | P1 |
| E2E-6 | TC-04 | P1 |
| E2E-7 | TC-SD-3, TC-40 | P1 |
| E2E-8 | TC-07 | **P0** |
| E2E-9 | TC-11 | P1 |

---

## Статус шага 4а / 6

- [x] `test-cases.md` создан
- [x] Ручное тестирование (шаг 6) — **P0 пройдены** (2026-07-12)
- [x] Автотесты — не добавлены (нет фреймворка в проекте)

### Шаг 6 — P0 результаты

| TC | Результат | Доказательство |
|----|-----------|----------------|
| **TC-SD-1** | ✅ PASS | text-2p.pdf + test.png → reorder → Export PDF → 3 стр., порядок PDF-1/PNG/PDF-2 |
| **TC-07** | ✅ PASS | `encrypted-real.pdf` (pypdf) → ошибка «…is encrypted…», 0 страниц в workspace |
| **TC-20** | ✅ PASS | 3 страницы, kinds: pdf-native, image, pdf-native |
| **TC-21** | ✅ PASS | Текст ALPHA/BETA selectable (pdfjs getTextContent), 0 export warnings (copyPages) |
| **TC-22** | ✅ PASS | merged/original ratio **1.52** (< 2×), warnings=[] |
| **TC-R01** | ✅ PASS | App loads, «PDF Concatenator», drop zone |
| **TC-R02** | ✅ PASS | `npm run build` exit 0 |

**Блокеры:** нет.

**Known deviations (не блокеры):** TC-07 с pdf-lib fixture `encrypted.pdf` не воспроизводит ошибку (нет /Encrypt); для QA использован `encrypted-real.pdf`. Сообщение — pdf-lib default, не кастомный текст из design (review P2).

**Автотесты:** не добавлены — Vitest/Playwright не установлены по scope проекта.

**Готовность:** → Analyst шаг 7
