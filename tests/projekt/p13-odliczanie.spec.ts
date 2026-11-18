import { test, expect } from '@playwright/test';

// P13. Odliczanie do Czarnego Piątku (API). Datę podaje nagłówek X-Namssor-Teraz (opis w /api/docs).

test('GET /api/promocja dla 2026-11-20 zwraca 7 dni do startu i komunikat banera', async ({ request }) => {
  const odpowiedz = await request.get('/api/promocja', { headers: { 'X-Namssor-Teraz': '2026-11-20' } });

  expect(odpowiedz.status()).toBe(200);
  expect(await odpowiedz.json()).toMatchObject({
    days_left: 7,
    message: 'Czarny Piątek w Namssorze startuje 27.11.2026. Do startu promocji zostało 7 dni.',
  });
});

test('GET /api/promocja z nagłówkiem X-Namssor-Teraz „jutro” zwraca 400', async ({ request }) => {
  const odpowiedz = await request.get('/api/promocja', { headers: { 'X-Namssor-Teraz': 'jutro' } });

  expect(odpowiedz.status()).toBe(400);
});
