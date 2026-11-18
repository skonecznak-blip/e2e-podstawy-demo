import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// P10. Zamówienie na firmę i faktura (E2E). Konto „biuro” (Biuro Mikołaja) z danych demo, działa lokalnie.
// Sprzątanie: klient nie anuluje zamówienia; pierwszy test tworzy jedno zamówienie, drugi nie tworzy żadnego.
test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ request }) => {
  await zalogujPrzezApi(request, 'biuro', 'biuro123');
  expect((await request.delete('/api/cart')).status()).toBe(200);
});

test.afterEach(async ({ request }) => {
  await request.delete('/api/cart');
});

// Wspólne kroki: kalendarz w koszyku i formularz faktury.
async function zamowZFaktura(page: import('@playwright/test').Page, nip: string) {
  await zaloguj(page, 'biuro', 'biuro123');
  await page.goto('/produkt/21');
  await expect(page.getByRole('heading', { name: 'Kalendarz adwentowy 2026' })).toBeVisible();
  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await expect(page).toHaveURL(/dodano=/);
  await page.goto('/koszyk');
  await page.getByRole('checkbox', { name: 'Faktura na firmę' }).check();
  await page.getByLabel('NIP').fill(nip);
  await page.getByLabel('Nazwa firmy').fill('Biuro Mikołaja');
  await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();
}

test('zamówienie z „Faktura na firmę” ma dane firmy, a pobrana faktura numer FV i kwotę 39,99 zł', async ({ page }) => {
  await zamowZFaktura(page, '101-202-30-36');

  await expect(page.getByRole('heading', { name: 'Moje zamówienia' })).toBeVisible();
  await expect(page).toHaveURL(/zlozono=ZAM-\d+$/);
  const numer = new URL(page.url()).searchParams.get('zlozono') ?? '';

  await page.goto(`/zamowienia/${numer}`);
  await expect(page.getByText('Faktura na firmę: Biuro Mikołaja, NIP 1012023036')).toBeVisible();

  const pobieranie = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Pobierz fakturę' }).click();
  const plik = await pobieranie;
  expect(plik.suggestedFilename()).toBe(`faktura-${numer}.html`);
  const tresc = await readFile(await plik.path(), 'utf8');
  expect(tresc).toContain(`FV/2026/${numer}`);
  expect(tresc).toContain('Biuro Mikołaja');
  expect(tresc).toContain('NIP nabywcy: 1012023036');
  expect(tresc).toContain('Razem do zapłaty: 39,99 zł');
});

test('NIP 101-202-30-37 zatrzymuje zamówienie komunikatem o błędnej sumie kontrolnej, klient zostaje w koszyku', async ({ page }) => {
  await zamowZFaktura(page, '101-202-30-37');

  await expect(page.getByText('Nieprawidłowy NIP: błędna suma kontrolna')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Koszyk' })).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: 'Kalendarz adwentowy 2026' })).toBeVisible();
});
