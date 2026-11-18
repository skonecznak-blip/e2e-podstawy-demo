import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie (UI): koszyk liczy cenę promocyjną drugi raz.
// Scenariusz P9: krem kosztuje 32,99 zł, po promocji -20% 26,39 zł, i taka cena ma być w koszyku.

test.beforeEach(async ({ request }) => {
  // Startujemy od pustego koszyka (koszyk należy do konta, nie do przeglądarki).
  await zalogujPrzezApi(request);
  expect((await request.delete('/api/cart')).status()).toBe(200);
});

test.afterEach(async ({ request }) => {
  // Sprzątanie: koszyk jest wspólny dla wszystkich testów tego konta.
  await request.delete('/api/cart');
});

test('w koszyku „Krem do twarzy na dzień” kosztuje 26,39 zł, tak jak na karcie produktu', async ({ page }) => {
  await zaloguj(page);
  await page.goto('/produkt/5');
  await expect(page.getByRole('heading', { name: 'Krem do twarzy na dzień' })).toBeVisible();
  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await expect(page).toHaveURL(/dodano=/);

  await page.goto('/koszyk');
  const wiersz = page.getByRole('row').filter({ hasText: 'Krem do twarzy na dzień' });
  // Kolumna „Wartość” dla 1 sztuki i podsumowanie koszyka.
  await expect(wiersz.getByRole('cell', { name: '26,39 zł', exact: true })).toBeVisible();
  await expect(page.getByText('Pozycji: 1, razem: 26,39 zł')).toBeVisible();
});
