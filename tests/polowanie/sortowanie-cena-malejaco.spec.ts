import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Polowanie: sortowanie „Cena: od najwyższej” nie zaczyna od najdroższego produktu.
// Najwyższa cena w sklepie to 39,99 zł („Kalendarz adwentowy 2026”; „Serum z witaminą C” po promocji też 39,99 zł).

test('sortowanie „Cena: od najwyższej” pokazuje na początku produkt za 39,99 zł', async ({ page }) => {
  await zaloguj(page);
  await page.goto('/');

  await page.getByLabel('Sortuj').selectOption({ label: 'Cena: od najwyższej' });
  await page.getByRole('button', { name: 'Filtruj' }).click();
  await expect(page).toHaveURL(/sort=cena-malejaco/);

  // Pierwsza w tabeli ma być „Kalendarz adwentowy 2026” (39,99 zł), a nie np. „Żel pod prysznic” (9,99 zł).
  const nazwy = await page.getByTestId('product-name').allTextContents();
  expect(nazwy[0]).toBe('Kalendarz adwentowy 2026');
});
