import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie: nowy adres w profilu od razu staje się domyślny.
// Scenariusz P12: adres domyślny zmienia się dopiero po „Ustaw jako domyślny”.
const nazwa = `Polowanie domyślny ${Date.now()}`;

test.beforeEach(async ({ request }) => {
  await zalogujPrzezApi(request);
  // Startujemy od stanu, w którym domyślny jest „Adres główny” (id 0).
  expect((await request.put('/api/account/addresses/0/default')).status()).toBe(200);
});

test.afterEach(async ({ request }) => {
  // Sprzątanie: usuwamy dodany adres; domyślny wraca do „Adres główny”.
  const adresy = await (await request.get('/api/account/addresses')).json();
  for (const adres of adresy.filter((a: { name: string }) => a.name === nazwa)) {
    await request.delete(`/api/account/addresses/${adres.id}`);
  }
});

test('dodany adres nie jest domyślny, domyślny zostaje „Adres główny”', async ({ request }) => {
  const dodanie = await request.post('/api/account/addresses', {
    data: { name: nazwa, street: 'ul. Biurowa 7', postal_code: '00-950', city: 'Warszawa', phone: '600 700 800' },
  });
  expect(dodanie.status()).toBe(201);
  expect(await dodanie.json()).toMatchObject({ name: nazwa, default: false });

  const adresy = await (await request.get('/api/account/addresses')).json();
  expect(adresy).toContainEqual(expect.objectContaining({ id: 0, name: 'Adres główny', default: true }));
});
