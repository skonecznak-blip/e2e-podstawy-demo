import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie (UI): nowy adres w „Moje adresy” od razu dostaje plakietkę „Domyślny”.
// Scenariusz P12: plakietka przechodzi na nowy adres dopiero po „Ustaw jako domyślny”.
const nazwa = `Polowanie UI domyślny ${Date.now()}`;

test.beforeEach(async ({ request }) => {
  // Startujemy od stanu, w którym domyślny jest „Adres główny” (id 0).
  await zalogujPrzezApi(request);
  expect((await request.put('/api/account/addresses/0/default')).status()).toBe(200);
});

test.afterEach(async ({ request }) => {
  // Sprzątanie: usuwamy dodany adres; domyślny wraca do „Adres główny”.
  const adresy = await (await request.get('/api/account/addresses')).json();
  for (const adres of adresy.filter((a: { name: string }) => a.name === nazwa)) {
    await request.delete(`/api/account/addresses/${adres.id}`);
  }
});

test('po dodaniu adresu plakietka „Domyślny” zostaje przy „Adres główny”', async ({ page }) => {
  await zaloguj(page);
  await page.goto('/konto/adresy');

  await page.getByLabel('Nazwa adresu').fill(nazwa);
  await page.getByLabel('Ulica i numer').fill('ul. Biurowa 7');
  await page.getByLabel('Kod pocztowy').fill('00-950');
  await page.getByLabel('Miasto').fill('Warszawa');
  await page.getByLabel('Telefon').fill('600 700 800');
  await page.getByRole('button', { name: 'Dodaj adres' }).click();

  const nowy = page.getByRole('article').filter({ hasText: nazwa });
  await expect(nowy).toBeVisible();
  // Nowy adres ma przycisk „Ustaw jako domyślny” i nie ma plakietki.
  await expect(nowy.getByRole('button', { name: `Ustaw jako domyślny: ${nazwa}` })).toBeVisible();
  await expect(nowy.getByText('Domyślny', { exact: true })).toHaveCount(0);
  // Plakietka „Domyślny” jest jedna i przy „Adres główny”.
  await expect(page.getByRole('heading', { name: 'Adres główny Domyślny' })).toBeVisible();
});
