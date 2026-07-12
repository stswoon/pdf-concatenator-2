---
name: add-react-feature
description: >-
  Adds a new React feature with colocated CSS and wires it into App.tsx in this
  Vite playground. Use when the user asks to add a feature, screen, widget,
  UI block, component, or interactive element.
---

# Add React Feature

Workflow для добавления фичи в test-ai. Соглашения по коду — в rules (`react-tsx`, `css-conventions`, `typescript-strict`).

## Чеклист

```
- [ ] Scope проверен (scope-guard, если запрос большой)
- [ ] Файлы созданы в src/
- [ ] Стили colocated
- [ ] Подключено в App.tsx
- [ ] npm run build проходит
```

## Шаг 1: Scope

Перед кодом ответь себе:

- Нужна ли новая npm-зависимость? Проверь `package.json`. Без явной просьбы — не добавляй роутер, UI-kit, стейт-менеджер, Tailwind.
- Можно ли решить одним компонентом без новых слоёв (папок `types/`, `services/`, FSD)?

## Шаг 2: Структура файлов

Для одного виджета / блока UI:

```
src/
├── FeatureName.tsx
├── FeatureName.css
└── App.tsx          # импорт и рендер
```

Для логики длиннее ~15 строк — custom hook в том же файле или `useFeatureName.ts` рядом.

## Шаг 3: Компонент

Шаблон:

```tsx
import './FeatureName.css'

type FeatureNameProps = {
  // props через type, не interface
}

function FeatureName({ }: FeatureNameProps) {
  return (
    <section className="feature-name">
      {/* семантическая разметка */}
    </section>
  )
}

export default FeatureName
```

Правила:

- Функциональный компонент, именованные импорты из `react` (не `import React`)
- `export default` для компонента
- Стили через `className`, не `class`
- Одинарные кавычки, без точек с запятой

## Шаг 4: CSS

```css
/* FeatureName.css */
.feature-name {
  /* корневой класс в kebab-case, совпадает с компонентом */
}
```

- Глобальные переменные и reset — только в `index.css`
- Повторяющиеся значения — CSS-переменные в `:root`
- Без inline `style={{ }}`, кроме динамических значений из props

## Шаг 5: Интеграция в App

```tsx
import FeatureName from './FeatureName'

function App() {
  return (
    <main className="app">
      <FeatureName />
    </main>
  )
}
```

Минимальный diff: не рефакторь `App.tsx` без необходимости.

## Шаг 6: Проверка

```bash
npm run build
```

Исправь ошибки TypeScript (`noUnusedLocals`, `verbatimModuleSyntax`, `import type`).

Опционально: `npm run dev` — UI открывается, фича видна.

## Не делай

- Не меняй `vite.config.ts`, `tsconfig*.json` без необходимости
- Не добавляй тесты, README, документацию без запроса
- Не создавай лишние абстракции и папки
- Не коммить без явной просьбы

## Пример: счётчик

**Запрос:** «добавь кнопку-счётчик»

**Действия:**
1. `src/Counter.tsx` + `src/Counter.css`
2. `useState` для значения, `<button>` с `onClick`
3. Импорт в `App.tsx`
4. `npm run build`
