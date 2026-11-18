import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie (UI): w pobranej fakturze NIP nabywcy jest równy NIP-owi sprzedawcy.
// Scenariusz P10: zamówienie z koszyka z „Faktura na firmę”, NIP 101-202-30-36,
// faktura pobierana przyciskiem „Pobierz fakturę” ma dane nabywcy.
// Sprzątanie: klient nie anuluje zamówienia; test tworzy jedno własne zamówienie na swoim koncie.

test.beforeEach(async ({ request }) => {
  await zalogujPrzezApi(request);
  expect((await request.delete('/api/cart')).status()).toBe(200);
});

test.afterEach(async ({ request }) => {
  await request.delete('/api/cart');
});

test('pobrana faktura zamówienia na firmę ma NIP nabywcy 1012023036', async ({ page }) => {
  await zaloguj(page);
  await page.goto('/produkt/21');
  await expect(page.getByRole('heading', { name: 'Kalendarz adwentowy 2026' })).toBeVisible();
  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await expect(page).toHaveURL(/dodano=/);

  await page.goto('/koszyk');
  await page.getByRole('checkbox', { name: 'Faktura na firmę' }).check();
  await page.getByLabel('NIP').fill('101-202-30-36');
  await page.getByLabel('Nazwa firmy').fill('Polowanie UI faktura');
  await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();

  await expect(page).toHaveURL(/zlozono=ZAM-\d+$/);
  const numer = new URL(page.url()).searchParams.get('zlozono') ?? '';

  await page.goto(`/zamowienia/${numer}`);
  // Strona zamówienia pokazuje dane firmy z koszyka.
  await expect(page.getByText('Faktura na firmę: Polowanie UI faktura, NIP 1012023036')).toBeVisible();

  const pobieranie = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Pobierz fakturę' }).click();
  const plik = await pobieranie;
  expect(plik.suggestedFilename()).toBe(`faktura-${numer}.html`);
  const tresc = await readFile(await plik.path(), 'utf8');
  expect(tresc).toContain(`FV/2026/${numer}`);
  expect(tresc).toContain('NIP nabywcy: 1012023036');
});
