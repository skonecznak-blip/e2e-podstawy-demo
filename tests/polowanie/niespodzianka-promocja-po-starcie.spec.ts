import { test, expect } from '@playwright/test';

// Niespodzianka Klaudiusza: po starcie Czarnego Piątku (27.11.2026) /api/promocja zwraca
// komunikat Bożeny i flagę. Datę podajemy nagłówkiem X-Namssor-Teraz (opis w /api/docs).
// Wygląda tak samo na rc i na wersji zwykłej. Sprawdzamy wzór flagi, a nie jej kod.

test('GET /api/promocja dzień po starcie promocji zwraca komunikat Bożeny i flagę', async ({ request }) => {
  const odpowiedz = await request.get('/api/promocja', { headers: { 'X-Namssor-Teraz': '2026-11-28' } });

  expect(odpowiedz.status()).toBe(200);
  expect(await odpowiedz.json()).toMatchObject({
    start: '2026-11-27',
    today: '2026-11-28',
    days_left: 0,
    message: 'Bożena: przesuwamy na poniedziałek.',
    flag: expect.stringMatching(/^FLAGA-[A-Z0-9]+$/),
  });
});
