import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie: API zwraca 200 dla zamówienia, którego nie ma.
// Oczekiwana odpowiedź jak w scenariuszu P7: 404 i { "error": "Nie ma takiego zamówienia" }.

test('GET /api/orders/ZAM-9999 zwraca 404 i błąd „Nie ma takiego zamówienia”', async ({ request }) => {
  await zalogujPrzezApi(request);

  const odpowiedz = await request.get('/api/orders/ZAM-9999');

  expect(odpowiedz.status()).toBe(404);
  expect(await odpowiedz.json()).toEqual({ error: 'Nie ma takiego zamówienia' });
});
