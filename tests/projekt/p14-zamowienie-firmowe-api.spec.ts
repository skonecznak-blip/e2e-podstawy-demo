import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// P14. Zamówienie firmowe przez API (API). Konto „biuro” (Biuro Mikołaja) z danych demo, działa lokalnie.
// Sprzątanie: klient nie anuluje zamówienia; każdy przebieg tworzy jedno zamówienie na 10 kalendarzy.

test.beforeEach(async ({ request }) => {
  await zalogujPrzezApi(request, 'biuro', 'biuro123');
});

test('POST /api/business-orders na 10 kalendarzy tworzy zamówienie 399,90 zł z fakturą FV/2026/<numer>', async ({ request }) => {
  const odpowiedz = await request.post('/api/business-orders', {
    data: { product_id: 21, qty: 10, nip: '101-202-30-36', company: 'Biuro Mikołaja' },
  });

  expect(odpowiedz.status()).toBe(201);
  const zamowienie = await odpowiedz.json();
  expect(zamowienie).toMatchObject({ status: 'new', qty: 10, total_cents: 39990, invoice: { company: 'Biuro Mikołaja' } });

  const faktura = await request.get(`/api/orders/${zamowienie.number}/invoice`);
  expect(faktura.status()).toBe(200);
  expect((await faktura.json()).invoice_number).toBe(`FV/2026/${zamowienie.number}`);
});

test('POST /api/business-orders z qty 1001 zwraca 400 z błędem pola qty', async ({ request }) => {
  const odpowiedz = await request.post('/api/business-orders', {
    data: { product_id: 21, qty: 1001, nip: '101-202-30-36', company: 'Biuro Mikołaja' },
  });

  expect(odpowiedz.status()).toBe(400);
  expect((await odpowiedz.json()).errors).toContainEqual(expect.objectContaining({ field: 'qty' }));
});
