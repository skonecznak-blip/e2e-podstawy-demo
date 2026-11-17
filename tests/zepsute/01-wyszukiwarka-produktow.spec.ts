import { test, expect } from '@playwright/test';

// Wymaganie: wyszukanie słowa „szampon” pokazuje produkt „Szampon nawilżający”.

test('wyszukiwarka znajduje szampon nawilżający', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Szukaj produktu').fill('szampon');
  await page.getByRole('button', { name: 'Filtruj' }).click();

  // Pełna nazwa i exact: true, bo bez tego „Szampon” pasuje też do „Szampon dla dzieci”
  // i do komórki z przyciskiem „Dodaj do koszyka: Szampon nawilżający”.
  await expect(
    page.getByRole('cell', { name: 'Szampon nawilżający', exact: true }),
  ).toBeVisible();
});
