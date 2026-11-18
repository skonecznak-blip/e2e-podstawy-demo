import { test, expect } from '@playwright/test';

// P13. Odliczanie do Czarnego Piątku (API). Datę podaje nagłówek X-Namssor-Teraz (opis w /api/docs).
// Zmiana wymagań Bożeny z 13:00: zarząd patrzy na dzień przed startem i na dzień startu (zamiast 20.11).

const przypadki = [
  {
    data: '2026-11-26',
    dni: 1,
    komunikat: 'Czarny Piątek w Namssorze startuje 27.11.2026. Do startu promocji został 1 dzień.',
  },
  {
    data: '2026-11-27',
    dni: 0,
    komunikat: 'Czarny Piątek w Namssorze trwa! Tylko dziś najniższe ceny.',
  },
];

// Osobny test dla każdej daty: w raporcie widać wynik dla 26.11 i 27.11 osobno.
for (const { data, dni, komunikat } of przypadki) {
  test(`GET /api/promocja dla ${data} zwraca days_left ${dni} i komunikat banera`, async ({ request }) => {
    const odpowiedz = await request.get('/api/promocja', { headers: { 'X-Namssor-Teraz': data } });

    expect(odpowiedz.status()).toBe(200);
    expect(await odpowiedz.json()).toMatchObject({
      days_left: dni,
      message: komunikat,
    });
  });
}

test('GET /api/promocja z nagłówkiem X-Namssor-Teraz „jutro” zwraca 400', async ({ request }) => {
  const odpowiedz = await request.get('/api/promocja', { headers: { 'X-Namssor-Teraz': 'jutro' } });

  expect(odpowiedz.status()).toBe(400);
});
