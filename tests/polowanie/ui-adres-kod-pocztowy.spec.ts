import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie (UI): formularz „Dodaj adres” przyjmuje kod pocztowy w złym formacie.
// Pod polem jest podpowiedź „Format: 00-000”.
const nazwa = `Polowanie UI kod ${Date.now()}`;

test.afterEach(async ({ request }) => {
  // Sprzątanie: gdyby aplikacja przyjęła adres, usuwamy go po nazwie.
  await zalogujPrzezApi(request);
  const adresy = await (await request.get('/api/account/addresses')).json();
  for (const adres of adresy.filter((a: { name: string }) => a.name === nazwa)) {
    await request.delete(`/api/account/addresses/${adres.id}`);
  }
});

test('formularz „Dodaj adres” odrzuca kod pocztowy „00950” z komunikatem o formacie 00-000', async ({ page }) => {
  await zaloguj(page);
  await page.goto('/konto/adresy');

  await page.getByLabel('Nazwa adresu').fill(nazwa);
  await page.getByLabel('Ulica i numer').fill('ul. Biurowa 7');
  await page.getByLabel('Kod pocztowy').fill('00950');
  await page.getByLabel('Miasto').fill('Warszawa');
  await page.getByLabel('Telefon').fill('600 700 800');
  await page.getByRole('button', { name: 'Dodaj adres' }).click();

  await expect(page.getByRole('alert')).toHaveText('Popraw błędy w formularzu (1).');
  await expect(page.getByText('Kod pocztowy musi mieć format 00-000')).toBeVisible();
  // Adres nie trafił na listę.
  await expect(page.getByRole('article').filter({ hasText: nazwa })).toHaveCount(0);
});
