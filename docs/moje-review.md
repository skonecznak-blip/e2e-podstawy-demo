# Moje review

## Ćwiczenie 08: poprawki do planu

Plan pokrywa wszystkie 11 oczekiwanych wyników z `zmiana-adresu.md`. Przywraca adres startowy po teście (`afterEach`), sprawdza, że błędny adres się nie zapisał (testy 2–4, kroki 6–7), i używa konta `user` (`beforeEach`).

Poprawki:

1. Test 1, krok 6: odświeżenie ma być prawdziwym F5, czyli `page.reload()`, a nie ponowne otwarcie `/konto/adres`. Po udanym zapisie aplikacja przekierowuje na `/konto/adres?zapisano=1`, więc odświeżenie pobiera pola z bazy. Nowa nazwa testu: „poprawny adres zapisuje się i zostaje po odświeżeniu strony”.
2. Komunikaty pod polami szukać dokładnie: `getByText('…', { exact: true })`. Bez `exact` `getByText` szuka fragmentu tekstu (lista kontrolna, pytanie 5).
3. Testy 2–4, krok 6: zamiast `reload()` kliknąć w menu „Adres dostawy”, jak w kroku 4 TC-ADR-02. Po błędzie nie ma przekierowania (odpowiedź 400), więc odświeżenie wysłałoby formularz jeszcze raz.
4. Dopisać warunek startowy: przed pierwszym uruchomieniem `npm run db:reset` przy zatrzymanej aplikacji. Test 1 zaczyna od sprawdzenia adresu startowego (lista kontrolna, pytanie 9).
5. Dopisać sprawdzenie, że test potrafi paść: zmienić na chwilę oczekiwany komunikat w teście 2, uruchomić plik i zobaczyć `1 failed` (lista kontrolna, pytanie 12).
6. Asercja `not.toBeVisible()` na „Zapisano adres dostawy.” ma stać po asercji na komunikat `alert`, żeby strona zdążyła się przeładować (lista kontrolna, pytanie 13).
7. W tabeli mapowania poprawić liczbę: przypadki testowe mają 11 oczekiwanych wyników, a nie 13. Pozostałe wiersze to sprzątanie i zdanie z Gherkina.

## Ćwiczenie 08: porównanie formatów (Biuro Mikołaja)

Porównanie `docs/scenariusze/biuro-mikolaja.md` (Azure Test Plans) z `docs/scenariusze/biuro-mikolaja.feature` (Gherkin).

| Krok w Azure Test Plans | Linia w Gherkinie | Różnica |
|---|---|---|
| 1. Zaloguj się jako `@klient` → „Zalogowano jako biuro (user)” | 8 `Zakładając, że jestem zalogowany jako "biuro" z hasłem "biuro123"`, 9 `Oraz mój koszyk jest pusty` | Gherkin nie sprawdza napisu „Zalogowano jako biuro (user)” |
| 2. Karta produktu, ilość 10, „Dodaj do koszyka” → „Dodano do koszyka: Kalendarz adwentowy 2026” | 12 `Jeżeli dodam do koszyka 10 sztuk produktu "Kalendarz adwentowy 2026" z karty produktu` | Gherkin nie sprawdza komunikatu „Dodano do koszyka: …” |
| 3. Otwórz „Koszyk” → jedna pozycja, ilość 10, „Pozycji: 1, razem: 399,90 zł” | brak | Gherkin pomija cały krok: nie sprawdza koszyka ani sumy |
| 4. „Faktura na firmę”, NIP, nazwa firmy, „Złóż zamówienie (płatność przy odbiorze)” → „Złożono zamówienie: ZAM-…” | 13–15 `Oraz zaznaczę "Faktura na firmę" z danymi:` (tabela NIP, Nazwa firmy), 16 `Oraz kliknę "Złóż zamówienie (płatność przy odbiorze)"`, 17 `Wtedy zobaczę komunikat "Złożono zamówienie: <numer>"` | brak |
| 5. Numer zamówienia na liście „Moje zamówienia” → status „Nowe”, „Faktura na firmę: Biuro Mikołaja, NIP 2412241228”, przycisk „Pobierz fakturę” | 18 `Oraz na stronie zamówienia zobaczę status "Nowe" i NIP "2412241228"` | Gherkin nie sprawdza nazwy firmy ani przycisku „Pobierz fakturę” i nie mówi, jak dojść do strony zamówienia |
| 6. Wyloguj, zaloguj jako `admin`, otwórz `/admin/zamowienia/<numer>` → status „Nowe”, pole „Status zamówienia” | 19 `Jeżeli admin zmieni status zamówienia na "Opłacone", a potem na "Wysłane"` | Gherkin nie mówi o wylogowaniu i haśle admina i nie ma oczekiwanego wyniku |
| 7. Status „Opłacone”, „Zapisz status” → status „Opłacone” | 19 (ta sama linia) | Gherkin nie sprawdza statusu pośredniego „Opłacone” |
| 8. Status „Wysłane”, „Zapisz status” → status „Wysłane” | 19 (ta sama linia) | Gherkin sprawdza „Wysłane” dopiero u klienta (linia 20), nie w panelu admina |
| 9. Wyloguj, zaloguj jako `@klient`, otwórz zamówienie → status „Wysłane” | 20 `Wtedy na stronie zamówienia zobaczę status "Wysłane"` | Gherkin nie mówi, że trzeba wrócić na konto klienta |
| 10. „Pobierz fakturę” → plik `faktura-<numer>.html`, NIP nabywcy, nabywca, pozycja, „Razem do zapłaty: 399,90 zł” | 21 `Jeżeli kliknę "Pobierz fakturę"`, 22 `Wtedy pobiorę plik "faktura-<numer>.html"`, 23 `"NIP nabywcy: 2412241228"`, 24–26 tabela pozycji, 27 `"Razem do zapłaty: 399,90 zł"` | Gherkin nie sprawdza nabywcy „Biuro Mikołaja” na fakturze |

Czego brakuje w Gherkinie:
- Asercji z kroków 1, 2, 3 i 6, statusu „Opłacone” z kroku 7 oraz nazwy firmy z kroków 5 i 10. Krok 3 (koszyk) Gherkin pomija w całości.
- Zmiany kont: wylogowania, hasła `admin123` i powrotu na konto `biuro`. Linia 19 ukrywa trzy kroki w jednym zdaniu.
- Sprzątania z pola „Po teście”: zamówienie zostaje w bazie ze statusem „Wysłane”, stan startowy przywraca `npm run db:reset`.
- Adresów `/produkt/21` i `/admin/zamowienia/<numer>`.

Czego brakuje w krokach Azure Test Plans:
- Etykiety pola „Nazwa firmy”. Krok 4 mówi tylko „nazwę firmy”, a Gherkin (linia 15) podaje dokładną etykietę z formularza, przydatną do `getByLabel`.
- Nazw kolumn pozycji na fakturze: „Nazwa”, „Ilość”, „Cena”, „Wartość” (linia 25). Krok 10 podaje same wartości.
- Opisu, kto co robi i po co (linie 3–4): klient firmowy zamawia na fakturę, admin zmienia status, klient pobiera fakturę.
