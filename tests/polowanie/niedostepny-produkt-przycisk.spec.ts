import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Polowanie: na karcie niedostępnego produktu przycisk „Dodaj do koszyka” jest aktywny.
// Produkt 3 ma stan 0: karta pokazuje „Niedostępny”, pole „Ilość” jest wyłączone, przycisk też powinien.

test('karta niedostępnego produktu ma wyłączony przycisk „Dodaj do koszyka”', async ({ page }) => {
  await zaloguj(page);
  await page.goto('/produkt/3');

  await expect(page.getByText('Niedostępny')).toBeVisible();
  await expect(page.getByLabel('Ilość')).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Dodaj do koszyka' })).toBeDisabled();
});
