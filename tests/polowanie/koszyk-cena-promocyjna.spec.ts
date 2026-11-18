import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie: koszyk liczy cenę promocyjną drugi raz.
// Katalog: „Krem do twarzy na dzień” 32,99 zł -20% = 26,39 zł (scenariusz P9: w koszyku cena 26,39 zł).

test.beforeEach(async ({ request }) => {
  await zalogujPrzezApi(request);
  // Startujemy od pustego koszyka.
  expect((await request.delete('/api/cart')).status()).toBe(200);
});

test.afterEach(async ({ request }) => {
  // Sprzątanie: koszyk jest wspólny dla wszystkich testów tego konta.
  await request.delete('/api/cart');
});

test('koszyk ma dla „Krem do twarzy na dzień” cenę promocyjną z katalogu 26,39 zł, a nie niższą', async ({ request }) => {
  const katalog = await request.get('/api/catalog/5');
  expect(katalog.status()).toBe(200);
  expect(await katalog.json()).toMatchObject({ name: 'Krem do twarzy na dzień', promo_price_cents: 2639 });

  const dodanie = await request.post('/api/cart/items', { data: { product_id: 5, qty: 1 } });
  expect(dodanie.status()).toBe(201);

  const koszyk = await request.get('/api/cart');
  expect(koszyk.status()).toBe(200);
  const tresc = await koszyk.json();
  expect(tresc.items).toEqual([
    expect.objectContaining({ product_id: 5, name: 'Krem do twarzy na dzień', qty: 1, unit_price_cents: 2639, total_cents: 2639 }),
  ]);
  expect(tresc.total_cents).toBe(2639);
});
