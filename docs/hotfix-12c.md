# Ćwiczenie 12c: hotfix Mirka

## Wyniki

| Uruchomienie | passed | failed | skipped | did not run |
|---|---|---|---|---|
| Krok 1: `main`, wersja zwykła | 99 | 0 | 14 | 0 |
| Krok 2: `main`, `APP_VERSION=hotfix` | 79 | 16 | 13 | 5 |
| Krok 4: gałąź `hotfix-testy`, `APP_VERSION=hotfix` | 97 | 1 (P16) | 14 | 1 |
| Krok 5: z powrotem na `main`, wersja zwykła | 99 | 0 | 14 | 0 |

„Did not run”: pliki w trybie `serial` (np. P11, P16) po pierwszym błędzie nie uruchamiają kolejnych testów z tego pliku. W kroku 4 nie uruchomił się test P16 z ilością 1001. Uruchomiony osobno na hotfiksie przechodzi (`npx playwright test tests/projekt/p16 -g "1001"`), bo przy ilości 1 suma koszyka jest dobra.

## Diagnoza (krok 3)

| Test (plik i linia) | Pierwsza linia błędu | Przyczyna | Decyzja |
|---|---|---|---|
| tests/cwiczenia/02-koszyk.spec.ts:6 | toBeVisible: nie ma „Dodano do koszyka: Krem do twarzy na dzień” | na ekranie „Produkt w koszyku: Krem do twarzy na dzień”: zmieniony tekst | test do poprawy |
| tests/cwiczenia/04-adres-walidacja.spec.ts:6 | locator.click: timeout, czeka na przycisk „Zapisz adres” | przycisk ma napis „Zapisz”: zmieniony tekst | test do poprawy |
| tests/cwiczenia/04-karta-produktu.spec.ts:7 | toBeVisible: nie ma „Dodano do koszyka: Krem do twarzy na dzień” | „Produkt w koszyku: …”: zmieniony tekst | test do poprawy |
| tests/cwiczenia/04-koszyk-usuwanie.spec.ts:6 | toBeVisible: nie ma „Dodano do koszyka: Żel pod prysznic” | „Produkt w koszyku: …”: zmieniony tekst | test do poprawy |
| tests/czytanie/05-karta-produktu.spec.ts:13 | toContainText: oczekiwano „Dostępny”, jest „Na stanie: 100 szt.” | zmieniony tekst dostępności | test do poprawy |
| tests/czytanie/05-karta-produktu.spec.ts:26 | toHaveText: oczekiwano „Niedostępny”, jest „Chwilowo brak” | zmieniony tekst, przycisk dalej wyłączony | test do poprawy |
| tests/polowanie/niedostepny-produkt-przycisk.spec.ts:7 | toBeVisible: nie ma „Niedostępny” | „Chwilowo brak”: zmieniony tekst | test do poprawy |
| tests/polowanie/ui-faktura-nip-nabywcy.spec.ts:19 | waitForEvent download: timeout, czeka na link „Pobierz fakturę” | link ma napis „Faktura (HTML)”, pobieranie działa | test do poprawy |
| tests/projekt/p10-faktura-na-firme.spec.ts:32 | waitForEvent download: timeout, czeka na link „Pobierz fakturę” | „Faktura (HTML)”: zmieniony tekst | test do poprawy |
| tests/projekt/p11-kod-rabatowy.spec.ts:33 | locator.click: timeout, czeka na przycisk „Zastosuj kod” | przycisk ma napis „Użyj kodu”: zmieniony tekst | test do poprawy |
| tests/projekt/p15-status-zamowienia.spec.ts:7 | Test timeout: selectOption czeka na opcję „Opłacone” | status nazywa się „Zapłacone”, zapis działa (API: `paid`, potem `shipped`) | test do poprawy |
| **tests/projekt/p16-ilosc-z-karty.spec.ts:22** | **toBeVisible: nie ma „Pozycji: 2, razem: 964,75 zł”** | **na ekranie „razem: 44,98 zł”: aplikacja źle liczy sumę koszyka** | **błąd do zgłoszenia Mirkowi** |
| tests/review/03-adres-walidacja.spec.ts:7 | locator.click: timeout, czeka na „Zapisz adres” | „Zapisz”: zmieniony tekst | test do poprawy |
| tests/review/05-zmiana-adresu.spec.ts:6 | locator.click: timeout, czeka na „Zapisz adres” | „Zapisz”: zmieniony tekst | test do poprawy |
| tests/review/06-kod-rabatowy.spec.ts:6 | locator.click: timeout, czeka na „Zastosuj kod” | „Użyj kodu”: zmieniony tekst | test do poprawy |
| tests/smoke.spec.ts:36 | toContainText: oczekiwano „Dostępny”, jest „Na stanie: … szt.” | zmieniony tekst dostępności | test do poprawy |

Hotfix zmienia też kolejność kolumn w tabeli zamówień w panelu admina („Status” jest teraz druga). Żaden test na tym nie padł.

## Zgłoszenie dla Mirka

**Tytuł:** Suma „razem” w koszyku dodaje ceny za sztukę zamiast wartości pozycji, więc przy ilości większej niż 1 jest za niska

**Wersja:** hotfix

**Kroki:**
1. Zaloguj się jako `user` / `user123`.
2. Otwórz kartę produktu „Kalendarz adwentowy 2026” (`/produkt/21`), w pole „Ilość” wpisz 24 i kliknij „Dodaj do koszyka”.
3. Dodaj do koszyka 1 „Mydło w kostce”.
4. Otwórz „Koszyk”.

**Oczekiwany wynik:** wiersz kalendarza: ilość 24, wartość 959,76 zł; wiersz mydła: 4,99 zł; pod tabelą „Pozycji: 2, razem: 964,75 zł” (suma kolumny „Wartość”).

**Faktyczny wynik:** wartości w wierszach są dobre (959,76 zł i 4,99 zł), ale pod tabelą jest „Pozycji: 2, razem: 44,98 zł”, czyli 39,99 zł + 4,99 zł: ceny za sztukę bez mnożenia przez ilość. `GET /api/cart` zwraca `subtotal_cents: 96475`, ale `total_cents: 4498`. Przy samych pozycjach z ilością 1 błędu nie widać.

**Test:** `tests/projekt/p16-ilosc-z-karty.spec.ts` › „24 szt. „Kalendarz adwentowy 2026” z karty produktu dają w koszyku wartość 959,76 zł, a „razem” równa się sumie wartości” (failed na hotfix, passed bez `APP_VERSION`).

## Wniosek

Klaudiusz chciał „poprawić wszystkie testy, żeby były zielone”. Gdyby w P16 wpisał 44,98 zł, błąd w liczeniu sumy trafiłby do klientów. Wyłapał go tylko P16, bo to jedyny test, który sprawdza sumę koszyka przy ilości większej niż 1.
