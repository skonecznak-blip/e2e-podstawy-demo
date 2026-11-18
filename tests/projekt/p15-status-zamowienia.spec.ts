import { test, expect } from '@playwright/test';
import { zalogujAdmina, zalogujPrzezApi } from '../pomocnicze/logowanie';

// P15. Status zamówienia w panelu admina (API + E2E). Konto admin działa tylko lokalnie.
// Test zmienia status tylko swojego, nowo złożonego zamówienia.

test('administrator zmienia status zamówienia na „Zapłacone”, potem „Wysłane”, a klient widzi „shipped”', async ({ page, request }) => {
  // Klient składa zamówienie przez API.
  await zalogujPrzezApi(request);
  const zamowienie = await (await request.post('/api/orders', { data: { product_id: 20, qty: 1 } })).json();
  const numer: string = zamowienie.number;
  expect(numer).toMatch(/^ZAM-\d+$/);

  await zalogujAdmina(page);
  await page.goto(`/admin/zamowienia/${numer}`);
  await expect(page.getByRole('heading', { name: `Zamówienie ${numer}` })).toBeVisible();

  await page.getByLabel('Status zamówienia').selectOption({ label: 'Zapłacone' });
  await page.getByRole('button', { name: 'Zapisz status' }).click();
  await expect(page.getByText('Status: Zapłacone', { exact: true })).toBeVisible();

  await page.getByLabel('Status zamówienia').selectOption({ label: 'Wysłane' });
  await page.getByRole('button', { name: 'Zapisz status' }).click();
  await expect(page.getByText('Status: Wysłane', { exact: true })).toBeVisible();

  // Klient (sesja API z początku testu) widzi status „shipped”.
  const pobrane = await request.get(`/api/orders/${numer}`);
  expect(pobrane.status()).toBe(200);
  expect((await pobrane.json()).status).toBe('shipped');
});
