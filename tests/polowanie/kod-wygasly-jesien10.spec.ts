import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie: kod JESIEN10 wygasł 31.10.2026, więc koszyk ma go odrzucić.
// Wersja zwykła odpowiada 400 i komunikatem o wygaśnięciu, a koszyk zostaje bez rabatu.

test.beforeEach(async ({ request }) => {
  await zalogujPrzezApi(request);
  // Startujemy od pustego koszyka (opróżnienie usuwa też kod rabatowy).
  expect((await request.delete('/api/cart')).status()).toBe(200);
});

test.afterEach(async ({ request }) => {
  // Sprzątanie: koszyk i kod rabatowy są wspólne dla wszystkich testów tego konta.
  await request.delete('/api/cart');
});

test('wygasły kod JESIEN10 jest odrzucony komunikatem „Kod JESIEN10 wygasł 31.10.2026.”', async ({ request }) => {
  const dodanie = await request.post('/api/cart/items', { data: { product_id: 11, qty: 1 } });
  expect(dodanie.status()).toBe(201);

  const kod = await request.post('/api/cart/discount', { data: { code: 'JESIEN10' } });

  expect(kod.status()).toBe(400);
  expect(await kod.json()).toEqual({
    error: 'Błędne dane',
    errors: [{ field: 'code', message: 'Kod JESIEN10 wygasł 31.10.2026.' }],
  });

  // Rabat nie trafił do koszyka: do zapłaty pełna cena mydła 4,99 zł.
  const koszyk = await request.get('/api/cart');
  expect(koszyk.status()).toBe(200);
  expect(await koszyk.json()).toMatchObject({ discount: null, total_cents: 499 });
});
