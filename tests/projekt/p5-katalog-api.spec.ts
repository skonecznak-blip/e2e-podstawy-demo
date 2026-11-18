import { test, expect } from '@playwright/test';

// P5. Katalog produktów w API. Oba endpointy działają bez logowania (security: [] w app/openapi.json).

test('GET /api/products?category=Dziecko zwraca 200 i 3 produkty z kategorii „Dziecko”', async ({ request }) => {
  const odpowiedz = await request.get('/api/products', { params: { category: 'Dziecko' } });

  expect(odpowiedz.status()).toBe(200);
  const produkty = await odpowiedz.json();
  expect(produkty).toHaveLength(3);
  for (const produkt of produkty) {
    expect(produkt.category).toBe('Dziecko');
  }
});

test('GET /api/products/999 zwraca 404 i błąd „Nie ma takiego produktu”', async ({ request }) => {
  const odpowiedz = await request.get('/api/products/999');

  expect(odpowiedz.status()).toBe(404);
  expect(await odpowiedz.json()).toEqual({ error: 'Nie ma takiego produktu' });
});
