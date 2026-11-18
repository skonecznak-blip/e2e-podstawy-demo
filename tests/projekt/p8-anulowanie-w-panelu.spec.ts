import { test, expect } from '@playwright/test';
import { zalogujAdmina, zalogujAdminaPrzezApi, zalogujPrzezApi } from '../pomocnicze/logowanie';

// P8. Zamówienie z API anulowane w panelu (API + E2E). Konto admin działa tylko lokalnie.
// Test tworzy własne zamówienie i anuluje tylko je; nie rusza ZAM-1007 ani innych zamówień.

test('administrator anuluje w panelu zamówienie złożone przez API, inne zamówienia nie zmieniają statusu', async ({ page, request }) => {
  // Klient składa zamówienie przez API.
  await zalogujPrzezApi(request);
  const zamowienie = await (await request.post('/api/orders', { data: { product_id: 20, qty: 1 } })).json();
  const numer: string = zamowienie.number;
  expect(numer).toMatch(/^ZAM-\d+$/);

  // Statusy wszystkich zamówień przed anulowaniem (widok administratora).
  await zalogujAdminaPrzezApi(request);
  const statusy = async () => Object.fromEntries(
    (await (await request.get('/api/admin/orders')).json()).map((z: { number: string; status: string }) => [z.number, z.status]),
  );
  const przed = await statusy();

  // Panel admina › Zamówienia, wyszukanie po numerze i „Anuluj”.
  await zalogujAdmina(page);
  await page.getByRole('link', { name: 'Panel admina' }).click();
  await page.getByRole('heading', { name: 'Zamówienia' }).getByRole('link', { name: 'Zamówienia' }).click();
  await page.getByLabel('Szukaj zamówienia').fill(numer);
  await page.getByRole('button', { name: 'Szukaj' }).click();
  const wiersz = page.getByRole('row').filter({ has: page.getByRole('link', { name: numer, exact: true }) });
  await wiersz.getByRole('button', { name: 'Anuluj' }).click();

  await expect(page.getByText(`Anulowano zamówienie ${numer}`)).toBeVisible();
  await expect(wiersz.getByRole('cell', { name: 'Anulowane', exact: true })).toBeVisible();
  await expect(wiersz.getByRole('button', { name: 'Anuluj' })).toHaveCount(0);

  // API pokazuje „cancelled”.
  const pobrane = await request.get(`/api/orders/${numer}`);
  expect((await pobrane.json()).status).toBe('cancelled');

  // Inne zamówienia mają ten sam status co przed anulowaniem.
  const po = await statusy();
  delete przed[numer];
  delete po[numer];
  expect(po).toEqual(przed);
});
