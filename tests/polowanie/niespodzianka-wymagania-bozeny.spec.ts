import { test, expect } from '@playwright/test';

// Niespodzianka Klaudiusza: komentarz HTML na stronach („TODO(Bożena) … Nie pokazywać klientom”)
// wskazuje ukryty endpoint /api/bozena/wymagania, którego nie ma w opisie API. Zwraca flagę.
// Wygląda tak samo na rc i na wersji zwykłej (różni się tylko treść „wymagania”). Sprawdzamy wzór flagi.

test('ukryty endpoint z komentarza na stronie zwraca wymagania Bożeny z flagą', async ({ request }) => {
  // Komentarz w źródle strony głównej prowadzi do endpointu.
  const strona = await request.get('/');
  expect(await strona.text()).toContain('/api/bozena/wymagania');

  const odpowiedz = await request.get('/api/bozena/wymagania');

  expect(odpowiedz.status()).toBe(200);
  expect(await odpowiedz.json()).toMatchObject({
    autor: 'Bożena',
    status: 'ostatnia zmiana, obiecuję',
    flaga: expect.stringMatching(/^FLAGA-[A-Z0-9]+$/),
  });
});
