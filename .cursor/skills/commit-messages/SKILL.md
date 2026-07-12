---
name: commit-messages
description: >-
  Drafts git commit messages from staged and unstaged diffs for this repository.
  Use when the user asks to commit, write a commit message, or review changes
  before committing.
---

# Commit Messages

## Перед коммитом

Коммиты создавай **только по явной просьбе** пользователя.

Параллельно собери контекст:

```bash
git status
git diff
git diff --staged
git log --oneline -10
```

## Что не коммитить

- `.env`, ключи API, токены, credentials
- `dist/`, `node_modules/`, `.idea/`
- Секреты и приватные данные

Если пользователь просит закоммитить такие файлы — предупреди.

## Формат сообщения

Стиль репозитория — короткий императив, без Conventional Commits (если пользователь не попросил иначе):

```
<глагол> <что изменилось>

[опционально: 1–2 предложения — зачем, не пересказ diff]
```

Примеры из истории: `add rules`, `add agents`, `init test-ai`.

### Глаголы

| Тип изменения | Глагол |
|---------------|--------|
| Новая фича / файл | `add` |
| Правка существующего | `update` / `fix` |
| Удаление | `remove` |
| Рефакторинг без смены поведения | `refactor` |

Одна логическая задача — один коммит. Не смешивай несвязанные изменения.

## Процесс

1. Проанализируй все изменения (staged + unstaged).
2. Сформулируй сообщение: **зачем**, а не построчный пересказ diff.
3. Добавь релевантные файлы: `git add <paths>`.
4. Закоммить через HEREDOC (PowerShell — here-string):

```bash
git commit -m "$(cat <<'EOF'
add todo list component

Minimal UI with local state, no extra dependencies
EOF
)"
```

На Windows в PowerShell, если HEREDOC недоступен:

```powershell
git commit -m "add todo list component"
```

5. Проверь: `git status`.

## Ограничения

- Не меняй `git config`
- Не используй `--no-verify`, `--amend`, `push --force` без явной просьбы
- Не пушь на remote без явной просьбы
- Не создавай пустой коммит, если изменений нет

## Примеры

**Input:** новый `TodoList.tsx` + стили, подключение в `App.tsx`

**Output:**
```
add todo list component
```

**Input:** исправлен `import type` после ошибки tsc

**Output:**
```
fix type-only imports in App
```

**Input:** добавлены `.cursor/skills/` и правки `AGENTS.md`

**Output:**
```
add cursor agent skills
```
