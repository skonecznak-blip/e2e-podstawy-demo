import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie: na fakturze NIP nabywcy jest równy NIP-owi sprzedawcy, a nie NIP-owi z zamówienia.
// Scenariusz P10: NIP 101-202-30-36 na fakturze jako 1012023036.
// Sprzątanie: klient nie anuluje zamówienia; test tworzy jedno własne zamówienie firmowe na swoim koncie.

test('faktura zamówienia firmowego ma NIP nabywcy 1012023036 podany w zamówieniu', async ({ request }) => {
  await zalogujPrzezApi(request);

  const zamowienie = await request.post('/api/business-orders', {
    data: { product_id: 21, qty: 1, nip: '101-202-30-36', company: 'Polowanie faktura' },
  });
  expect(zamowienie.status()).toBe(201);
  const { number } = await zamowienie.json();

  const faktura = await request.get(`/api/orders/${number}/invoice`);
  expect(faktura.status()).toBe(200);
  const tresc = await faktura.json();
  expect(tresc.invoice_number).toBe(`FV/2026/${number}`);
  expect(tresc.buyer).toEqual({ name: 'Polowanie faktura', nip: '1012023036' });
});
