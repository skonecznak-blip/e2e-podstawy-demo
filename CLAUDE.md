# Zasady pisania testów w tym repo

Repo szkoleniowe: aplikacja Namssor (`app/`, port 4100) i testy Playwright w TypeScript (`tests/`).
Testy czytają i oceniają testerzy, którzy dopiero uczą się kodu. Pisz prosto i czytelnie.

## Kod testu
- Importuj wyłącznie `import { test, expect } from '@playwright/test';`.
- Bez Page Object, własnych fixtures i funkcji pomocniczych, chyba że użytkownik o nie poprosi.
- Lokatory w tej kolejności: `getByRole`, `getByLabel`, `getByText`, dopiero potem `getByTestId`.
  Nie używaj selektorów CSS i XPath, `id` ani klas.
- Wiersz tabeli znajdź po treści: `page.getByRole('row').filter({ hasText: 'ZAM-1003' })`.
- Asercje web-first, które same czekają: `await expect(lokator).toBeVisible()`, `toHaveText`, `toHaveURL`.
- Nigdy `page.waitForTimeout()` ani stałych pauz. Nie sprawdzaj stanu przez `isVisible()` w `if`.
- Jeden test sprawdza jedno zachowanie. Nazwa testu po polsku opisuje oczekiwany wynik.
- Komentarze po polsku, krótkie: co robi krok i dlaczego, gdy to nieoczywiste.
- Testy API przez fixture `request`; sprawdzaj status i treść odpowiedzi.

## Review i dane testowe
- Test, który zmienia dane, sprząta po sobie w `afterEach` albo tworzy własne dane, żeby przechodził przy drugim uruchomieniu i niezależnie od innych testów.
- Sprawdzaj efekt biznesowy (status zamówienia, zapisane dane, treść komunikatu), a nie kolor, klasę CSS ani układ strony.
- Oczekiwane wartości (liczby, ceny, teksty) bierz z wymagania albo przypadku testowego i nigdy nie przepisuj ich ze strony.
- Napisz asercję dla każdego zdania wymagania tak, żeby padła, gdy akcja się nie uda, i nie sprawdzaj elementów widocznych już przed akcją.
- Porównuj teksty dokładnie przez `toHaveText`, a w asercjach z `not` i `toBeHidden()` używaj tylko tekstów, które aplikacja naprawdę pokazuje.
- Nie ukrywaj niejednoznacznego lokatora za `.first()`, `.nth()` ani `.last()`, tylko zawęź go do właściwego wiersza albo sekcji.
- Loguj się kontem zgodnym z wymaganiem: `user` dla wymagań klienta, `admin` dla wymagań administratora.
- Nie pisz „jestem pewien”, tylko pokaż wynik dwóch uruchomień testu i jednego uruchomienia, w którym test padł po zmianie oczekiwanej wartości.

## Uruchamianie
- `npx playwright test` (wszystkie), `npx playwright test <plik>` (jeden plik), `npm run test:smoke`.
- Playwright sam uruchamia aplikację (`webServer` w `playwright.config.ts`).
- Po zmianach: `npm run typecheck`. Polecenia mają działać w PowerShell 5.1 (bez `&&`).
- Stan bazy psuje się po testach zmieniających dane: `npm run db:reset` przy zatrzymanej aplikacji.

## Dane
- Konta demo: `user` / `user123` (klient), `admin` / `admin123` (administrator).
- Opis API: `app/openapi.json`, w przeglądarce http://localhost:4100/api/docs.
- Nie zmieniaj kodu aplikacji w `app/`, chyba że użytkownik wyraźnie o to prosi.
