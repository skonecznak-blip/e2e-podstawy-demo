import { test, expect } from '@playwright/test';

// Ćwiczenie 04, scenariusz A: filtr kategorii na stronie „Produkty”.
// Karta: docs/cwiczenia/04-locatory-codegen.md

test('filtr „Dziecko” pokazuje tylko produkty dla dzieci', async ({ page }) => {
  // TODO 1: otwórz stronę „Produkty” (adres /).
  await page.goto('/');

  // TODO 2: w polu „Kategoria” wybierz „Dziecko” i kliknij „Filtruj”.
  await page.getByLabel('Kategoria').selectOption('Dziecko');
  await page.getByRole('button', { name: 'Filtruj' }).click();

  // TODO 3: sprawdź, że „Liczba produktów” to 3.
  await expect(page.getByText('Liczba produktów:')).toHaveText('Liczba produktów: 3');
  // Dla szybszych 3: licznik może kłamać, więc liczymy też wiersze produktów w tabeli.
  // Wszystkie 3 wiersze muszą mieć kategorię „Dziecko”, czyli w tabeli nie ma innych produktów.
  await expect(page.getByTestId('product-row')).toHaveCount(3);
  await expect(page.getByTestId('product-row').filter({ hasText: 'Dziecko' })).toHaveCount(3);

  // TODO 4: sprawdź, że widać „Chusteczki nawilżane dla dzieci”, „Szampon dla dzieci” i „Krem ochronny dla dzieci”.
  // Szukamy kafelków (article) po pełnej nazwie produktu.
  await expect(page.getByRole('article', { name: 'Chusteczki nawilżane dla dzieci' })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Szampon dla dzieci' })).toBeVisible();
  await expect(page.getByRole('article', { name: 'Krem ochronny dla dzieci' })).toBeVisible();

  // TODO 5: sprawdź, że NIE widać „Szampon nawilżający” (kategoria Włosy).
  await expect(page.getByRole('article', { name: 'Szampon nawilżający' })).not.toBeVisible();
});
