import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie: adres w profilu przyjmuje kod pocztowy w złym formacie.
// Opis API (NewProfileAddress): postal_code ma wzorzec 00-000.
const nazwa = `Polowanie kod ${Date.now()}`;

test.afterEach(async ({ request }) => {
  // Sprzątanie: gdyby aplikacja przyjęła adres, usuwamy go po nazwie.
  const adresy = await (await request.get('/api/account/addresses')).json();
  for (const adres of adresy.filter((a: { name: string }) => a.name === nazwa)) {
    await request.delete(`/api/account/addresses/${adres.id}`);
  }
});

test('adres z kodem pocztowym „00950” zostaje odrzucony: 400 i błąd pola postal_code', async ({ request }) => {
  await zalogujPrzezApi(request);

  const odpowiedz = await request.post('/api/account/addresses', {
    data: { name: nazwa, street: 'ul. Biurowa 7', postal_code: '00950', city: 'Warszawa', phone: '600 700 800' },
  });

  expect(odpowiedz.status()).toBe(400);
  const tresc = await odpowiedz.json();
  expect(tresc.errors).toContainEqual(expect.objectContaining({ field: 'postal_code' }));
});
