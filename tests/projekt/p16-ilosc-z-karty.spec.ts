import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// P16. Ilość z karty produktu (E2E).
// W koszyku jest też 1 „Mydło w kostce” (4,99 zł), żeby suma „razem” sprawdzała więcej niż jedną pozycję.

test.beforeEach(async ({ request }) => {
  await zalogujPrzezApi(request);
  await request.delete('/api/cart/discount');
  expect((await request.delete('/api/cart')).status()).toBe(200);
  expect((await request.post('/api/cart/items', { data: { product_id: 11, qty: 1 } })).status()).toBe(201);
});

test.afterEach(async ({ request }) => {
  await request.delete('/api/cart');
});

// Zmiana wymagań Bożeny z 13:00: Biuro Mikołaja kupuje 24 kalendarze adwentowe (zamiast 3 żeli).
test('24 szt. „Kalendarz adwentowy 2026” z karty produktu dają w koszyku wartość 959,76 zł, a „razem” równa się sumie wartości', async ({ page }) => {
  await zaloguj(page);
  await page.goto('/produkt/21');
  await expect(page.getByRole('heading', { name: 'Kalendarz adwentowy 2026' })).toBeVisible();

  await page.getByLabel('Ilość').fill('24');
  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await expect(page).toHaveURL(/dodano=/);

  await page.goto('/koszyk');
  const wiersz = page.getByRole('row').filter({ hasText: 'Kalendarz adwentowy 2026' });
  await expect(wiersz.getByRole('cell', { name: '24', exact: true })).toBeVisible();
  await expect(wiersz.getByRole('cell', { name: '959,76 zł', exact: true })).toBeVisible();
  // Wartości: 959,76 zł (24 × 39,99 zł) + 4,99 zł (mydło) = 964,75 zł.
  await expect(page.getByText('Pozycji: 2, razem: 964,75 zł')).toBeVisible();
});
