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

  // Pierwszy wiersz ma mieć najwyższą cenę 39,99 zł, a nie np. 9,99 zł („Żel pod prysznic”).
  // Sprawdzamy cenę, a nie nazwę: kalendarz i serum mają tę samą cenę, więc ich kolejność może się zmienić.
  const wiersze = await page.getByTestId('product-row').allInnerTexts();
  expect(wiersze[0]).toContain('39,99 zł');
});
