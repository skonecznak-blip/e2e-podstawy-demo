import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Polowanie: sortowanie „Cena: od najniższej” nie zaczyna od najtańszego produktu.
// Najtańszy produkt w sklepie to „Mydło w kostce” (4,99 zł).

test('sortowanie „Cena: od najniższej” pokazuje na początku najtańsze „Mydło w kostce”', async ({ page }) => {
  await zaloguj(page);
  await page.goto('/');

  await page.getByLabel('Sortuj').selectOption({ label: 'Cena: od najniższej' });
  await page.getByRole('button', { name: 'Filtruj' }).click();
  await expect(page).toHaveURL(/sort=cena/);

  // Kolejność nazw w tabeli po sortowaniu; pierwsza ma być najtańsza.
  const nazwy = await page.getByTestId('product-name').allTextContents();
  expect(nazwy[0]).toBe('Mydło w kostce');
});
