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

test('3 szt. „Żel pod prysznic” z karty produktu dają w koszyku wartość 29,97 zł, a „razem” równa się sumie wartości', async ({ page }) => {
  await zaloguj(page);
  await page.goto('/produkt/9');
  await expect(page.getByRole('heading', { name: 'Żel pod prysznic' })).toBeVisible();

  await page.getByLabel('Ilość').fill('3');
  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await expect(page).toHaveURL(/dodano=/);

  await page.goto('/koszyk');
  const wiersz = page.getByRole('row').filter({ hasText: 'Żel pod prysznic' });
  await expect(wiersz.getByRole('cell', { name: '3', exact: true })).toBeVisible();
  await expect(wiersz.getByRole('cell', { name: '29,97 zł', exact: true })).toBeVisible();
  // Wartości: 29,97 zł (żel) + 4,99 zł (mydło) = 34,96 zł.
  await expect(page.getByText('Pozycji: 2, razem: 34,96 zł')).toBeVisible();
});
