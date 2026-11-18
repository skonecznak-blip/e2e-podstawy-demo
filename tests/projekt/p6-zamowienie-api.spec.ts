import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// P6. Zamówienie przez API i błędne dane (API).
// Sprzątanie: klient nie anuluje zamówienia; każdy przebieg tworzy jedno nowe zamówienie (2 szt. balsamu).

test.beforeEach(async ({ request }) => {
  await zalogujPrzezApi(request);
});

test('POST /api/orders tworzy zamówienie „new” na 2 szt. „Balsam do ciała”, a GET zwraca to samo zamówienie', async ({ request }) => {
  const odpowiedz = await request.post('/api/orders', { data: { product_id: 10, qty: 2 } });

  expect(odpowiedz.status()).toBe(201);
  const zamowienie = await odpowiedz.json();
  expect(zamowienie).toMatchObject({ qty: 2, status: 'new', product: 'Balsam do ciała' });
  expect(zamowienie.number).toMatch(/^ZAM-\d+$/);

  const pobrane = await request.get(`/api/orders/${zamowienie.number}`);
  expect(pobrane.status()).toBe(200);
  expect(await pobrane.json()).toMatchObject({ number: zamowienie.number, qty: 2, status: 'new', product: 'Balsam do ciała' });
});

test('POST /api/orders z qty 0 zwraca 400 z błędem pola qty', async ({ request }) => {
  const odpowiedz = await request.post('/api/orders', { data: { product_id: 10, qty: 0 } });

  expect(odpowiedz.status()).toBe(400);
  const tresc = await odpowiedz.json();
  expect(tresc.errors).toContainEqual(expect.objectContaining({ field: 'qty' }));
});

test('POST /api/orders z niedostępnym produktem 3 zwraca 409 „Brak towaru na stanie”', async ({ request }) => {
  const odpowiedz = await request.post('/api/orders', { data: { product_id: 3, qty: 1 } });

  expect(odpowiedz.status()).toBe(409);
  expect(await odpowiedz.json()).toEqual({ error: 'Brak towaru na stanie' });
});
