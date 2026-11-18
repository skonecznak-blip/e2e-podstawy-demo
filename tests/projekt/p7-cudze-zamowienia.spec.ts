import { test, expect } from '@playwright/test';
import { zalogujPrzezApi, zalogujAdminaPrzezApi } from '../pomocnicze/logowanie';

// P7. Klient nie widzi cudzych zamówień (API).
// ZAM-1001 należy do konta demo „user”, ZAM-1005 do „admin”, więc ten plik działa tylko lokalnie
// (na wspólnym serwerze konto pary ma inne zamówienia, a hasło admina zna trener).

test('klient „user” widzi swoje ZAM-1001, a cudze ZAM-1005 daje 404 „Nie ma takiego zamówienia”', async ({ request }) => {
  // Konto „user” podajemy jawnie: to jego zamówienie ZAM-1001 sprawdzamy.
  await zalogujPrzezApi(request, 'user', 'user123');

  const swoje = await request.get('/api/orders/ZAM-1001');
  expect(swoje.status()).toBe(200);
  expect(await swoje.json()).toMatchObject({ number: 'ZAM-1001', customer: 'user' });

  const cudze = await request.get('/api/orders/ZAM-1005');
  expect(cudze.status()).toBe(404);
  expect(await cudze.json()).toEqual({ error: 'Nie ma takiego zamówienia' });
});

test('administrator widzi zamówienie klienta ZAM-1001', async ({ request }) => {
  await zalogujAdminaPrzezApi(request);

  const odpowiedz = await request.get('/api/orders/ZAM-1001');

  expect(odpowiedz.status()).toBe(200);
  expect(await odpowiedz.json()).toMatchObject({ number: 'ZAM-1001' });
});

test('bez logowania GET /api/orders/ZAM-1001 zwraca 401 „Wymagane logowanie”', async ({ request }) => {
  const odpowiedz = await request.get('/api/orders/ZAM-1001');

  expect(odpowiedz.status()).toBe(401);
  expect(await odpowiedz.json()).toEqual({ error: 'Wymagane logowanie' });
});
