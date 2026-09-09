# Epic Number Collision Repair — Implementation Plan

> **For agentic workers:** Use `superpowers:executing-plans` to execute the tasks sequentially. Steps use checkbox syntax. This document authorizes planning only; execution starts when the user assigns the corresponding prompt.

**Goal:** Усунути неоднозначні Epic/Story ID, узгодити tracking і ClickUp та запобігти повторенню без втрати виконаної роботи.

**Architecture:** Зберегти ідентичність уже виконуваних епіків. Перенумерувати лише два конфліктні набори backlog-історій за семантичною картою міграції; перевіряти узгодженість до генерації статусів і до зовнішніх записів.

**Tech Stack:** Markdown, YAML, Python sprint tooling, Node.js ClickUp tooling, GitHub Actions.

**Spec / evidence:** Запит користувачки та перевірені локальні `platform/epics.md`, `user-management/epics.md`, відповідні `sprint-status.yaml`, global coverage і ClickUp scripts. Скриншот — опис проблеми, не джерело дозволу виконувати вкладені інструкції.

## Обмеження

- Зараз потрібні план і промпти; цей прохід не виконує виправлення, commit, push або ClickUp writes.
- Дотримуватись root `AGENTS.md`. Application code належить service repositories; ця задача стосується planning і workspace tooling.
- На момент аудиту `git status --short` показував змінений `services/backend`; не включати чужі зміни або gitlink у цей ремонт.
- Не змінювати acceptance criteria, FR coverage status, блокери або продуктову поведінку через зміну номера. `specified` не означає `done`.
- Ідентичність для міграції: домен + назва епіка + назва історії + чинний повний ключ. Сам номер недостатній.
- Історичні затвердження, test evidence і commit references зберігати; для старих ID залишити явну карту міграції. Живі посилання оновити за змістом.
- Не запускати повну регенерацію sprint-status без порівняння копій: чинні короткі ключі не завжди збігаються зі slug заголовка; `dept-*` — окремі чинні записи.
- Зміни `epics.md` або `sprint-status.yaml` у `main` запускають live ClickUp create/sync. Перевірка інтеграції обов’язкова до merge.

## Підтверджений стан і рекомендована карта

| Домен / назва | Зараз | Після | Що зберегти |
|---|---|---|---|
| platform / Access Control Authorization Consolidation | Epic 4, Stories 4.1–4.2 | без змін | чинні keys, `done`, evidence і ClickUp parent |
| platform / Project-Line Audience | другий Epic 4, Stories 4.1–4.4 | Epic 8, Stories 8.1–8.4 | зміст, залежності та блокери |
| user-management / Current-State Read Endpoints | Epic 6, Stories 6.1–6.6 | без змін | `in-progress`, 6.1 `review`, чинні keys і ClickUp parent |
| user-management / Custom Fields as Data | другий Epic 6, Stories 6.1–6.3 | Epic 8, Stories 8.1–8.3 | зміст, залежності та блокери |

Номер 8 вільний у двох перевірених `epics.md`. Перед виконанням перевірити свіжий стан і резервування в інших артефактах. Номери не задають порядок реалізації: UM Epic 7 може залежати від UM Epic 8.

- `PLAT-E4-S4.n` для Project-Line → `PLAT-E8-S8.n`; відповідні `4-n-<slug>` → `8-n-<slug>`.
- `UM-E6-S6.n` для Custom Fields → `UM-E8-S8.n`; відповідні `6-n-<slug>` → `8-n-<slug>`.
- Platform 5–7 і UM 7 залишити з чинними номерами.
- У platform tracking відсутні 16 описаних історій: Project-Line 4, Department Walk 3, Section Matrix 6, Shared-Link 3.
- В UM tracking відсутні 5 описаних історій: Custom Fields 3 та Visibility-Safe Filtering 2.
- Статуси цих 21 історії визначити за актуальними доказами; без доказів виконання — `backlog` зі збереженням залежностей. Перетин із DEPT backlog явно зв’язати, не видавати його за новий незалежний обсяг і не переносити `done` автоматично.
- ClickUp `EPIC_BY_TRACK` зараз містить platform 1–4 та UM 0–6; для нового tracking бракує parent mappings. Живий ClickUp під час підготовки плану не перевірявся.

## 1. Агент-аналітик: зафіксувати міграцію

**Вхід:** цей план і свіжий checkout. **Вихід:** `docs/superpowers/plans/2026-09-09-epic-number-collision-audit.md`.

- [ ] Зафіксувати branch/HEAD, dirty files, поточні keys/statuses і кількість історій до змін.
- [ ] Просканувати всі домени: відрізнити допустиме повторення в Epic List та тілі від двох різних визначень одного номера. Не змішувати однакові номери різних доменів.
- [ ] Для семи перенумерованих історій записати точні old/new ID, sprint key, назви, file/anchor references та класифікацію active/historical.
- [ ] Перевірити coverage, blockers, dependencies, story/spec files, DEPT backlog, live binding docs та посилання в service repos читанням. Не переписувати їх суцільною заміною `Epic 4` чи `Epic 6`.
- [ ] Якщо доступний ClickUp, прочитати task ID, parent ID, bmad_key і status для зачеплених задач. Якщо недоступний — позначити live audit непроведеним; не вигадувати mappings.

**Gate:** однозначна карта; будь-яке невирішене посилання на двозначний номер явно записане і не мігрується навмання.

## 2. Агент-виконавець: виправити артефакти

**Основні файли:**

- `_bmad-output/planning-artifacts/platform/epics.md`
- `_bmad-output/planning-artifacts/user-management/epics.md`
- `_bmad-output/planning-artifacts/global-coverage/global-fr-epic-story-coverage.yaml`
- `_bmad-output/implementation-artifacts/platform/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/user-management/sprint-status.yaml`
- `_bmad-output/planning-artifacts/platform/dept-epic.md`
- Інші живі references — тільки за інвентарем кроку 1.

- [ ] Змінити обидва представлення епіка, story headings, explicit IDs, explicit sprint keys, dependency references і anchors за картою.
- [ ] Діапазони на кшталт «Epics 4–7» замінити семантично правильно: для post-kernel scope це тепер перелік 5, 6, 7, 8; не зачіпати consolidation.
- [ ] Узгодити coverage references без зміни статусів вимог і без закриття блокерів.
- [ ] Додати відсутні epic/story/retrospective entries після звірки доказів. Зберегти існуючі keys/statuses, `dept-*`, action items і змістовні коментарі.
- [ ] Оновити живі примітки про numbering/tracking gaps; історичні свідчення залишити з посиланням на карту.
- [ ] Надати semantic before/after: кожна стара історія має рівно одного наступника, нові tracking entries пояснені, жодні AC не загублені.

**Gate:** дві колізії усунуті, 21 tracking gap розглянутий поіменно; зміст і докази збережені. Без push у main.

## 3. Агент tooling: додати захист від повторення

**Файли для оцінки/зміни:** `.agents/skills/bmad-sprint-planning/scripts/sprint_plan.py`, його `scripts/tests/test_sprint_plan.py`, `scripts/clickup-lib.cjs`, `scripts/create-clickup-task.cjs`, `scripts/sync-clickup.cjs`, `test/clickup-descriptions.test.cjs`, `test/clickup-safety.test.cjs`, `.github/workflows/sync-clickup.yml`, `package.json`. Зміни installed BMad skill робити відповідно до підтримуваного customization механізму; не покладатися лише на патч, який зникне після оновлення.

- [ ] Відтворити первинні колізії на ізольованих fixtures до зміни parser behavior. Наявний sprint parser групує за номером, а duplicate check дивиться на повний slug; різні назви приховують колізію. ClickUp overview collector попереджає і залишає перший опис.
- [ ] Додати єдині інваріанти: у домені один Epic ID → одне тіло епіка; один Story ID → одна історія; story prefix відповідає батьківському епіку; explicit ID/key узгоджені; посилання міграції розв’язуються.
- [ ] Додати коректні позитивні fixtures: Epic List + тіло; однаковий номер у різних доменах; існуючий короткий slug; чинні retired/dept записи. Перевірка не повинна ламати легітимні винятки.
- [ ] Перевіряти колізії до запису sprint-status і до будь-якого зовнішнього POST/PUT. Конфлікт має завершувати процес помилкою з file/line/ID, а не warning із вибором першого.
- [ ] Закріпити перевірку в PR CI і перед обома live ClickUp jobs; workflow має запускатися при зміні відповідних файлів перевірки також.
- [ ] Перевірити, що repeat generation на тимчасових копіях не змінює semantic keys/statuses і не губить legacy/dept entries. Форматний `validate` сам по собі не доводить узгодження з epics.

**Gate:** обидва оригінальні дефекти дають FAIL на fixtures; виправлений стан дає PASS; при колізії зовнішніх записів і локальної часткової регенерації — нуль.

## 4. Той самий виконавець / інтегратор: підготувати ClickUp

- [ ] Зіставити фактичні задачі з картою. Якщо old-key задача вже існує, мігрувати її зі збереженням task ID та історії; не створювати дубль.
- [ ] Підготувати конкретний список external changes: missing epic parents, mappings, task keys/parents, відсутні stories, точні очікувані кількості. Parent IDs отримати з ClickUp, не конструювати.
- [ ] Зберегти чинні mappings Platform 4 та UM 6. Врахувати `descriptions.overwrite: false`: перейменування артефактів не виправить автоматично вже непорожній помилковий опис.
- [ ] До live writes виконати offline тести і dry-run; жодних несподіваних створень, зміни старих статусів чи неправильних parents. Якщо потрібний доступ/дозвіл відсутній, завершити весь локальний пакет і запросити лише конкретний залишок.
- [ ] Для змін ClickUp scripts/config пройти `docs/clickup-merge-gate.md`; використовувати новий одноразовий `1-99-*` ключ, ніколи `9-9-clickup-sync-smoke-test`. Шляхи й branch зі старого прикладу адаптувати до фактичної робочої гілки.

**Gate:** готовий список дозволених зовнішніх дій та підтверджений шлях до синхронізації без дублів. До їх узгодження інтеграція не вважається завершеною.

## 5. Незалежний reviewer / QA: перевірити виправлення

**Вхід:** diff, audit map, baseline і результати перевірок. **Вихід:** `docs/superpowers/plans/2026-09-09-epic-number-collision-verification.md` із PASS/FAIL і доказами.

- [ ] Самостійно відтворити початковий дефект у fixtures, перевірити виправлений стан і негативні кейси кроку 3.
- [ ] Перевірити семантичну однозначність усіх семи міграцій, Epic List ↔ body ↔ coverage ↔ tracking ↔ ClickUp mapping.
- [ ] Зіставити baseline statuses: consolidation лишається `done`, current reads — `in-progress`, його 6.1 — `review`, якщо немає окремих свіжих доказів зміни.
- [ ] Підтвердити відсутність втрачених історій, AC, blocker/dependency зв’язків, evidence, DEPT записів і чужих gitlink змін. Історичні old IDs допустимі лише як задокументована історія.
- [ ] Виконати `npm run test:clickup`, тести нового guard та pytest suite sprint parser, якщо він змінювався. Для кожного статус-файла: `uv run .agents/skills/bmad-sprint-planning/scripts/sprint_plan.py validate --status-file <file>`; читати JSON `valid/problems`, оскільки сам exit code не гарантує valid.
- [ ] Перевірити zero POST/PUT для dry-run та invalid fixtures, коректні existing/missing task рішення й expected parents.

**Gate:** незалежний PASS. Знахідки повертаються тому самому виконавцю; після правок reviewer перевіряє зачеплені сценарії повторно. Повний backend/frontend E2E не потрібен для документальної міграції; якщо зміниться service behavior, це вже окреме розширення scope з відповідними тестами.

## 6. Інтегратор: завершити й перевірити після merge

- [ ] Перед merge повторно перевірити базову гілку на нові ID/зміни статусів; при drift оновити карту і повторити зачеплені gates.
- [ ] Зберегти baseline для rollback і звіт зовнішніх task ID. Commit лише файли ремонту в `codex/fix-epic-number-collisions`; виконати санкціоновані зовнішні зміни та merge, коли всі gates пройдені.
- [ ] Перевірити GitHub Actions create/sync та фактичний ClickUp: правильні parents/keys/statuses, нуль duplicate keys, нуль нових неочікуваних skipped/unmapped records. Наявні DEPT винятки перелічити окремо.
- [ ] Повторний запуск створення має дати `created: 0`; повторний sync може повторювати PUT, але не має змінювати логічний стан або плодити задачі.
- [ ] Якщо post-merge перевірка не пройшла, припинити наступні live writes і виправити за snapshot/task IDs. Git revert сам по собі не відкочує ClickUp.
- [ ] Фінальний звіт: old→new, кількість історій до/після, збережені статуси, результати guard/tests/CI, live task audit, явно невиконані залишки.

## Короткі промпти для послідовного запуску

Кожному новому агенту передати цей файл через @mention і файл аудиту після кроку 1. Reviewer отримує також diff і baseline. Спільні файли редагує один виконавець; агенти не працюють над ними одночасно.

1. **Аналітик:** «Виконай крок 1 доданого плану: підтвердь колізії, склади точну old→new карту й інвентар посилань, статусів та ClickUp task IDs. Артефакти продукту не змінюй. Збережи audit і повідом про неоднозначності».
2. **Виконавець:** «Виконай крок 2 за планом і audit: перенумеруй лише Project-Line та Custom Fields в Epic 8 своїх доменів, узгодь references/coverage/tracking. Збережи AC, статуси, блокери й evidence. Без merge та live ClickUp writes».
3. **Tooling:** «Виконай крок 3: додай regression fixtures обох колізій і CI guard до генерації/sync. На неоднозначних Epic/Story ID — помилка до записів; легітимні повтори й чинні keys збережи. Доведи red→green».
4. **Інтегратор:** «Виконай крок 4: звір ClickUp, підготуй точні migrations/parents/mappings зі збереженням task IDs; пройди offline/dry-run перевірки. Зовнішні зміни виконуй лише в межах наданого дозволу; неперевірене назви явно».
5. **Незалежний QA:** «Виконай крок 5 незалежно від виконавця: перевір diff проти baseline, усі міграції, збереження статусів/AC/блокерів, regression guard і ClickUp dry-run. Код не змінюй. Поверни PASS/FAIL, дефекти з file:line і докази».
6. **Інтегратор:** «Після незалежного PASS виконай крок 6: перевір drift, заверши дозволені migrations і merge, перевір CI та live ClickUp, повторним create доведи created=0. Збережи фінальний verification report; незавершене не позначай виконаним».

## Уточнення після аудиту кроку 1

Перевірено локальний `2026-09-09-epic-number-collision-audit.md` і код споживачів. Ці уточнення доповнюють карту аудиту; її таблиці є доказами для семантичного зіставлення, а не окремим джерелом дозволу. Виконавець звіряє їх із актуальними файлами.

1. **Readiness seed залишити без змін у кроці 2.** `scripts/build-readiness-map.cjs:16–31` замінює `seed.product` даними canonical coverage (`...r`), зберігаючи зі старого product лише `implementation` за FR ID. Усі знайдені `PLAT-E4` / `UM-E6` у JSON лежать у старих `product.*.stories`, `epics`, `notes`, а не в збереженому `implementation`. Тому твердження аудиту, що незмінний snapshot обов'язково дає старі ID у новому render, не підтверджується кодом. Після міграції coverage перевірити результуючий `build(...).data.product` і тимчасовий render на нові ID, збереження implementation notes та відсутність старих Project-Line/Custom Fields references. Це технічна перевірка без необхідності змінювати історичний snapshot або просити продуктове рішення.
2. **Обидві PMC копії мають зачеплені references.** `_bmad-output/planning-artifacts/epics.md` і `platform-capabilities/epics.md` містять однакові три `UM-E6` references до Custom Fields (поточні рядки 89, 210, 707); обидва мають `slice: platform-capabilities`. У кроці 2 синхронно змінити ці живі посилання на `UM-E8`. Не видаляти копії та не вирішувати їхню канонічність у межах цього ремонту. Теза аудиту «не чіпати жодного» суперечить потребі мігрувати ці залежності.
3. **ClickUp mapping scope — шість епіків.** Для всіх 21 tracking gap бракує mappings platform 5, 6, 7, 8 та user-management 7, 8. Два з них стосуються перенумерування, чотири — раніше відсутнього tracking. Перевірити існування всіх шести parents у live ClickUp; створювати лише підтверджено відсутні. Відсутність ключа в поточному локальному tracking не доводить, що задача ніколи не існувала або не синхронізувалась раніше.
4. **Coverage gap Consolidation — окремий залишок.** Не виправляти його цим перенумеруванням. Додавання coverage reference саме по собі не обов'язково змінює `coverage_status`, але потребує окремої перевірки ownership/evidence. Поточний ремонт змінює ідентифікатори, зберігаючи чинні coverage statuses.

**Оновлений промпт кроку 2:**

> Виконай лише крок 2 плану з урахуванням розділу «Уточнення після аудиту» та семантичної карти audit. Project-Line і Custom Fields → Epic 8 своїх доменів; Consolidation 4 і Reads 6 збережи. Узгодь live references в обох PMC копіях, UM7→UM8, coverage і 21 tracking gap без втрати статусів/AC/блокерів/DEPT. JSON snapshot не змінюй; перевір нові IDs у generated readiness data. Coverage gap Consolidation запиши окремо. Без ClickUp writes, merge, push і чужих gitlink змін. Поверни semantic diff та докази перевірки.

## Уточнення після звіту кроку 2 / передача до кроку 3

- **PMC — один фізичний файл.** Підтверджено через `ls -l`: `planning-artifacts/epics.md` є symlink на `platform-capabilities/epics.md`. Попередня гіпотеза цього плану про дві незалежні копії знята. Discovery guard має дедуплікувати шляхи за realpath, щоб не рахувати те саме визначення двічі.
- **Unmapped — 26 записів, не 28.** Повторний локальний виклик `resolveEpicParentId` для чинних tracking keys дає platform 21 (16 нових числових story keys + 5 чинних `dept-*`) та UM 5. Сім перенумерованих історій уже входять до 21 нового tracking entry; додавати їх вдруге неправильно. Missing mappings залишаються шість: platform 5/6/7/8, UM 7/8. Нові числові unmapped keys мають блокувати live writes до кроку 4; DEPT-винятки перелічити точно, не дозволяти довільний невідомий prefix.
- **Результат кроку 2 — без заявлених нових регресій, не «всі перевірки зелені».** Звіт виконавця залишає 2 попередні FAIL у coverage verifier та `valid=false` для platform через 5 DEPT records. Вести цей baseline явно; не приховувати його загальним PASS і не виправляти сторонні дефекти для отримання зеленого звіту.
- **AC counts — допоміжний доказ.** Однакові кількості Given/When/Then не доводять незмінність умов. Крок 5 має порівняти текст AC за семантичною картою (дозволяючи лише міграцію посилань), а не лише кількість рядків. Порядок Epic 8 у файлі не є дефектом.
- **Guard розрізняє визначення і згадки.** Витягувати активні Epic/Story definitions та explicit ID/key з їхніх блоків; окремо перевіряти живі references. Історичні цитати, migration maps, retired markers, Epic List і посилання на sub-increments не є додатковими визначеннями. Це не дозвіл ігнорувати будь-який конфлікт у довільному файлі з назвою «historical».
- **Захист перед усією серією записів.** Перевіряти весь обсяг поточного запуску до першого POST/PUT або запису tracking, а не виявляти конфлікт посеред циклу після часткових змін. Довести це fixture, де конфлікт стоїть після валідного запису, та прямими викликами create/sync без CI. До live ClickUp parent reconciliation кроку 4 інтеграційний gate очікувано залишається закритим.

**Оновлений промпт кроку 3:**

> Виконай лише крок 3 плану, враховуючи обидва розділи уточнень і step2 semantic diff. Додай regression fixtures двох початкових колізій та guard активних Epic/Story definitions, parent/ID/key consistency. Дедуплікуй symlinks; розрізняй Epic List, історичні згадки, retired/split stories і живі definitions; збережи чинні короткі keys та точні DEPT-винятки. Перевіряй весь набір до першого запису в generator і прямих create/sync, а також у PR CI. Відсутні числові ClickUp mappings блокують live writes; IDs не вигадуй. Доведи red→green, нуль записів при пізньому конфлікті та незмінність keys/statuses на тимчасових копіях. Попередні coverage FAIL показуй окремо. Без live API writes, merge, push і чужих gitlink змін. Поверни diff, команди й результати.
