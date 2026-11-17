import { test, expect } from '@playwright/test';
import fs from 'node:fs';

// Ćwiczenie 08, część B: zamówienie firmowe „Biuro Mikołaja” → status → faktura.
// Przypadek testowy: docs/scenariusze/biuro-mikolaja.md (kroki 1–10),
// ten sam scenariusz w Gherkinie: docs/scenariusze/biuro-mikolaja.feature.
// Każdy przebieg zakłada nowe zamówienie (10 sztuk). ZAM-1007 test nie rusza.
//
// Uruchomienie:
//   npx playwright test tests/cwiczenia/08-biuro-mikolaja.spec.ts

test('Biuro Mikołaja: zamówienie na firmę, status „Wysłane” i faktura z NIP nabywcy', async ({ page }) => {
  // Krok 1. Logowanie klienta firmowego. Koszyk musi być pusty (warunek wstępny):
  // po nieudanym przebiegu mogły w nim zostać kalendarze. DELETE /api/cart opróżnia koszyk
  // zalogowanego klienta; page.request korzysta z logowania z tej przeglądarki.
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('biuro');
  await page.getByLabel('Hasło').fill('biuro123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako biuro (user)')).toBeVisible();
  await page.request.delete('/api/cart');

  // Krok 2. Karta produktu, ilość 10, dodanie do koszyka.
  await page.goto('/produkt/21');
  await page.getByLabel('Ilość').fill('10');
  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await expect(page.getByText('Dodano do koszyka: Kalendarz adwentowy 2026')).toBeVisible();

  // Krok 3. Koszyk: jedna pozycja, ilość 10, razem 399,90 zł.
  await page.getByRole('link', { name: 'Koszyk' }).click();
  const wierszKoszyka = page.getByRole('row').filter({ hasText: 'Kalendarz adwentowy 2026' });
  await expect(wierszKoszyka.getByRole('cell', { name: '10', exact: true })).toBeVisible();
  await expect(page.getByText('Pozycji: 1, razem: 399,90 zł')).toBeVisible();

  // Krok 4. Faktura na firmę i złożenie zamówienia.
  await page.getByRole('checkbox', { name: 'Faktura na firmę' }).check();
  await page.getByLabel('NIP', { exact: true }).fill('241-224-12-28');
  await page.getByLabel('Nazwa firmy').fill('Biuro Mikołaja');
  await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();
  // Komunikat znika po kilku sekundach, więc sprawdzamy go od razu.
  await expect(page.getByText(/^Złożono zamówienie: ZAM-\d+$/)).toBeVisible();
  // Numer nowego zamówienia jest w adresie strony: /zamowienia?zlozono=ZAM-1008.
  const numer = new URL(page.url()).searchParams.get('zlozono') ?? '';
  expect(numer).toMatch(/^ZAM-\d+$/);

  // Krok 5. Strona zamówienia z listy „Moje zamówienia”.
  await page.getByRole('link', { name: numer, exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: `Zamówienie ${numer}` })).toBeVisible();
  await expect(page.getByText('Status: Nowe')).toBeVisible();
  // NIP na stronie zamówienia jest bez myślników.
  await expect(page.getByText('Faktura na firmę: Biuro Mikołaja, NIP 2412241228')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Pobierz fakturę' })).toBeVisible();

  // Krok 6. Wylogowanie, logowanie jako admin i zamówienie w panelu admina.
  await page.getByRole('button', { name: 'Wyloguj' }).click();
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('admin');
  await page.getByLabel('Hasło').fill('admin123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako admin')).toBeVisible();
  await page.goto(`/admin/zamowienia/${numer}`);
  await expect(page.getByText('Status: Nowe')).toBeVisible();
  await expect(page.getByLabel('Status zamówienia')).toBeVisible();

  // Krok 7. Status „Opłacone”.
  await page.getByLabel('Status zamówienia').selectOption('Opłacone');
  await page.getByRole('button', { name: 'Zapisz status' }).click();
  await expect(page.getByText('Status: Opłacone')).toBeVisible();

  // Krok 8. Status „Wysłane”.
  await page.getByLabel('Status zamówienia').selectOption('Wysłane');
  await page.getByRole('button', { name: 'Zapisz status' }).click();
  await expect(page.getByText('Status: Wysłane')).toBeVisible();

  // Krok 9. Klient widzi status „Wysłane”.
  await page.getByRole('button', { name: 'Wyloguj' }).click();
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('biuro');
  await page.getByLabel('Hasło').fill('biuro123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako biuro (user)')).toBeVisible();
  await page.goto(`/zamowienia/${numer}`);
  await expect(page.getByText('Status: Wysłane')).toBeVisible();

  // Krok 10. Pobranie faktury: czekanie na pobieranie zaczynamy PRZED kliknięciem.
  const pobieranie = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Pobierz fakturę' }).click();
  const plik = await pobieranie;
  expect(plik.suggestedFilename()).toBe(`faktura-${numer}.html`);

  // Zapisz fakturę w folderze wyników testu (test-results/…), żeby została po teście.
  const sciezka = test.info().outputPath(plik.suggestedFilename());
  await plik.saveAs(sciezka);
  expect(fs.existsSync(sciezka)).toBe(true);

  // Faktura to strona HTML: wczytujemy zapisany plik do przeglądarki i sprawdzamy zwykłymi lokatorami.
  const tresc = fs.readFileSync(sciezka, 'utf8');
  await page.setContent(tresc);
  await expect(page.getByText('NIP nabywcy: 2412241228')).toBeVisible();
  await expect(page.getByText('Biuro Mikołaja')).toBeVisible();
  // Pozycja faktury: Lp., Nazwa, Ilość, Cena, Wartość.
  const pozycja = page.getByRole('row').filter({ hasText: 'Kalendarz adwentowy 2026' });
  await expect(pozycja.getByRole('cell')).toHaveText(['1', 'Kalendarz adwentowy 2026', '10', '39,99 zł', '399,90 zł']);
  await expect(page.getByText('Razem do zapłaty: 399,90 zł')).toBeVisible();
});
