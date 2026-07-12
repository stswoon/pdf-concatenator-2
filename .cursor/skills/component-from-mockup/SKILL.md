---
name: component-from-mockup
description: >-
  Builds React components from screenshots, mockups, Figma exports, or visual
  descriptions in this Vite playground. Use when the user shares an image,
  mockup, wireframe, design, or asks to recreate or match a UI layout.
---

# Component from Mockup

Верстка UI по визуальному референсу без UI-библиотек. Соглашения — rules `react-tsx`, `css-conventions`.

## Входные данные

Пользователь может дать:

- Скриншот / изображение
- Ссылку на макет (описание, если нет доступа)
- Текстовое описание layout

Если референс неясен — уточни 1 вопрос (цвета, интерактивность, адаптив).

## Чеклист

```
- [ ] Структура и иерархия блоков определена
- [ ] Семантический HTML (main, section, nav, button, label)
- [ ] CSS-переменные для повторяющихся цветов/отступов
- [ ] Colocated CSS, без Tailwind
- [ ] npm run build проходит
```

## Шаг 1: Разбор макета

Опиши для себя (не обязательно пользователю):

- **Регионы**: header, content, sidebar, footer
- **Повторяющиеся элементы**: карточки, кнопки, поля ввода
- **Состояния**: hover, active, disabled — только если видны или запрошены
- **Интерактив**: клики, ввод — минимальный state, без лишней логики

Один экран → обычно 1–2 компонента. Не дроби на 10 файлов.

## Шаг 2: Семантическая разметка

```tsx
// ✅
<section className="card">
  <h2 className="card__title">Title</h2>
  <button type="button" className="card__action">Action</button>
</section>

// ❌ div на всё
<div className="card">
  <div className="title">Title</div>
  <div onClick={...}>Action</div>
</div>
```

Правила a11y:

- Кнопки — `<button type="button">`, не `<div onClick>`
- Поля — `<label htmlFor="...">` + `<input id="...">`
- Списки — `<ul>` / `<ol>` + `<li>`
- Декоративные иконки — `aria-hidden="true"` или текстовая альтернатива

## Шаг 3: CSS без magic numbers

Вынеси в `:root` (`index.css`) или в корень компонента:

```css
:root {
  --color-surface: #ffffff;
  --color-text: #1a1a1a;
  --color-accent: #3b82f6;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --radius-md: 8px;
}
```

В компонентном CSS:

- Flexbox / Grid для layout
- Классы в kebab-case: `.hero-banner`, `.pricing-card`
- BEM-подобные модификаторы при необходимости: `.btn`, `.btn--primary`

Без `style={{ }}`, кроме динамических размеров/позиций из props.

## Шаг 4: Сопоставление с макетом

Приоритеты точности:

1. **Структура и иерархия** — обязательно
2. **Отступы и выравнивание** — близко к макету
3. **Типографика и цвета** — из макета или разумные дефолты
4. **Пиксель-перфект** — не гонись; playground, не production design system

Если в макете шрифт недоступен — системный stack из `index.css`.

## Шаг 5: Файлы и интеграция

Как в `add-react-feature`:

```
src/ComponentName.tsx
src/ComponentName.css
```

Подключи в `App.tsx`. Запусти `npm run build`.

## Scope

- Без react-router: несколько экранов — tabs или условный рендер в `App`
- Без загрузки картинок с внешних CDN без запроса — placeholder или CSS
- Сложный запрос (весь dashboard) → сначала `scope-guard`, верстай один блок

## Не делай

- Tailwind, MUI, shadcn без запроса
- SVG-спрайты и icon-fonts — простые Unicode/CSS или inline SVG для 1–2 иконок
- Анимации beyond простого `transition` без запроса
- Отдельный design-tokens слой — переменные в CSS достаточно

## Пример

**Вход:** скриншот карточки профиля (аватар, имя, кнопка Follow)

**Выход:**
- `ProfileCard.tsx` — `article.profile-card`, `img` с `alt`, `button`
- `ProfileCard.css` — flex layout, `--space-md`, `--radius-md`
- Импорт в `App.tsx`
