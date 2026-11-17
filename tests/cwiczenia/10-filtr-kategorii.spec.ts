import { test, expect } from '@playwright/test';

// Ćwiczenie 10: test napisany skillem /test-e2e.
// Wymaganie: filtr kategorii „Dziecko” na stronie produktów pokazuje dokładnie 3 produkty.

test('filtr kategorii „Dziecko” pokazuje dokładnie 3 produkty', async ({ page }) => {
  await page.goto('/');

  // Wybieramy kategorię i zatwierdzamy filtr.
  await page.getByLabel('Kategoria').selectOption('Dziecko');
  await page.getByRole('button', { name: 'Filtruj' }).click();

  // Licznik pod filtrem: przed filtrowaniem pokazuje wszystkie produkty (21).
  await expect(page.getByTestId('product-count')).toHaveText('3');

  // Wiersze z produktami (wiersz nagłówka ma komórki „columnheader”, więc się nie liczy).
  const wierszeProduktow = page.getByRole('row').filter({ has: page.getByRole('cell') });
  await expect(wierszeProduktow).toHaveCount(3);

  // Każdy z tych produktów należy do kategorii „Dziecko”.
  await expect(wierszeProduktow.getByRole('cell', { name: 'Dziecko', exact: true })).toHaveCount(3);
});
