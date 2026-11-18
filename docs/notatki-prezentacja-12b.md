# Notatki na prezentację: ćwiczenie 12b

## Asercje, które padną przy następnej zmianie Bożeny

Asercje zależne od konkretnej daty, ilości albo ceny w `tests/projekt/`.

### Zależą od daty

| Test | Asercja | Kiedy padnie |
|---|---|---|
| P11 `p11-kod-rabatowy.spec.ts:28` | kod `CZARNY20` przyjęty, rabat `-1,00 zł` | **od 1.12.2026 sam z siebie**: kod jest ważny do 2026-11-30 (`app/promocje.mjs`), a test używa prawdziwej daty, bez nagłówka `X-Namssor-Teraz` |
| P13 `p13-odliczanie.spec.ts` | `days_left` 1 i 0, komunikaty dla 26.11 i 27.11 | gdy zmieni się data startu promocji albo treść komunikatu (daty w nagłówku są stałe, więc upływ czasu jej nie psuje) |
| P10 `p10-faktura-na-firme.spec.ts:47`, P14 `p14-zamowienie-firmowe-api.spec.ts:22` | numer faktury `FV/2026/<numer>` | od 1.01.2027: rok w numerze faktury to rok złożenia zamówienia (`created_at`) |
| P10, P14, P16 | produkt „Kalendarz adwentowy 2026” (id 21) | gdy w przyszłym roku kalendarz 2026 trafi do archiwum, tak jak teraz 2025 |

### Zależą od ilości albo ceny

| Test | Asercja | Kiedy padnie |
|---|---|---|
| P16 `p16-ilosc-z-karty.spec.ts` | ilość `24`, wartość `959,76 zł`, razem `964,75 zł` | zmiana ilości albo ceny kalendarza (39,99 zł) |
| P16 (przypadek graniczny) | `1001`, komunikat „od 1 do 1000” | zmiana limitu ilości `MAKS_ILOSC` |
| P14 `p14-zamowienie-firmowe-api.spec.ts:18` | `qty: 10`, `total_cents: 39990`, 1001 daje 400 | zmiana ilości, ceny kalendarza albo limitu 1000 |
| P10 `p10-faktura-na-firme.spec.ts:50` | „Razem do zapłaty: 39,99 zł” | zmiana ceny kalendarza |
| P6 `p6-zamowienie-api.spec.ts:16` | `qty: 2`, `qty: 0` daje 400 | zmiana ilości albo limitu zamówienia (1–10) |
| P9 `p9-cena-promocyjna.spec.ts` | `32,99 zł` → `26,39 zł` (-20%) | zmiana ceny kremu albo procentu promocji |
| P11 `p11-kod-rabatowy.spec.ts:35` | `4,99 zł`, rabat `-1,00 zł` | zmiana ceny mydła albo procentu kodu |
| P3 `p3-admin-dodaje-produkt.spec.ts:32` | `12,50 zł` | bezpieczne: cenę wpisuje sam test |
| P1 `p1-zakup.spec.ts:40` | stan mniejszy o 1 | bezpieczne: test liczy względem stanu przed zakupem |

## Wnioski

- Najgroźniejszy jest **P11**: padnie 1 grudnia bez żadnej zmiany wymagań. Poprawka: sprawdzać kod z nagłówkiem `X-Namssor-Teraz`, jeśli koszyk go obsługuje, albo zapisać w teście, że kod jest ważny do 30.11.
- Cena kalendarza (39,99 zł) jest wpisana w trzech testach (P10, P14, P16). Zmiana ceny to trzy poprawki.
- Wzorzec z P1 i P3 (test sam ustala dane albo liczy względem stanu początkowego) jest odporny na zmiany.
