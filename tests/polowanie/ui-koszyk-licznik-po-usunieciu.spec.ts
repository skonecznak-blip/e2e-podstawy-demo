import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie (UI): po usunięciu ostatniej pozycji koszyk ma pokazać „Pozycji: 0”.
// Na rc strona zaraz po kliknięciu „Usuń” pokazuje „Pozycji: 1”, choć koszyk jest pusty.

test.beforeEach(async ({ request }) => {
  // Startujemy od pustego koszyka (koszyk należy do konta, nie do przeglądarki).
  await zalogujPrzezApi(request);
  expect((await request.delete('/api/cart')).status()).toBe(200);
});

test.afterEach(async ({ request }) => {
  // Sprzątanie: koszyk jest wspólny dla wszystkich testów tego konta.
  await request.delete('/api/cart');
});

test('po usunięciu jedynego produktu koszyk pokazuje „Pozycji: 0, razem: 0,00 zł”', async ({ page }) => {
  await zaloguj(page);
  await page.goto('/');
  await page.getByRole('button', { name: 'Dodaj do koszyka: Mydło w kostce' }).click();
  await expect(page).toHaveURL(/dodano=/);

  await page.goto('/koszyk');
  await expect(page.getByText('Pozycji: 1, razem: 4,99 zł')).toBeVisible();

  await page.getByRole('button', { name: 'Usuń: Mydło w kostce' }).click();

  await expect(page.getByText('Koszyk jest pusty.')).toBeVisible();
  await expect(page.getByText('Pozycji: 0, razem: 0,00 zł')).toBeVisible();
});
