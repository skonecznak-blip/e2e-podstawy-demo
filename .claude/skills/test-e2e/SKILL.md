---
name: test-e2e
description: Pisze test E2E Playwright według zasad z CLAUDE.md. Użyj, gdy użytkownik prosi o nowy test, automatyzację przypadku testowego albo scenariusza.
---

# Procedura: nowy test E2E

Wykonaj kroki po kolei. Nie pomijaj żadnego. Zasady pisania kodu są w `CLAUDE.md`.

1. Przeczytaj przypadek testowy i wypisz oczekiwane wartości dokładnie tak, jak podaje je wymaganie.
2. Przejdź scenariusz w aplikacji (http://localhost:4100) i zapisz role, etykiety i teksty elementów, których użyje test.
3. Pokaż plan: nazwę pliku w `tests/cwiczenia/`, nazwę testu, kroki, lokatory i asercje. Poczekaj na akceptację użytkownika.
4. Napisz test.
5. Uruchom `npm run typecheck`.
6. Uruchom test dwa razy pod rząd i pokaż oba wyniki.
7. Zmień na chwilę oczekiwaną wartość, uruchom test, pokaż, że padł, i przywróć wartość.
8. Przejdź `docs/lista-kontrolna-review.md` punkt po punkcie i przy każdym napisz „tak” albo „nie” z numerem linii.
9. Na końcu podaj polecenie do uruchomienia testu: `npx playwright test <ścieżka pliku>`.
