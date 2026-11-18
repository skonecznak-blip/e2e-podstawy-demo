import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// P11. Kod rabatowy w koszyku (E2E). Testy dzielą koszyk konta, więc biegną po kolei.
test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ request, page }) => {
  // Klient ma w koszyku tylko „Mydło w kostce” (4,99 zł) i bez kodu.
  await zalogujPrzezApi(request);
  await request.delete('/api/cart/discount');
  await request.delete('/api/cart');
  expect((await request.post('/api/cart/items', { data: { product_id: 11, qty: 1 } })).status()).toBe(201);
  await zaloguj(page);
  await page.goto('/koszyk');
});

test.afterEach(async ({ request }) => {
  // Sprzątanie ze scenariusza: usuwamy kod i mydło.
  await request.delete('/api/cart/discount');
  await request.delete('/api/cart');
});

async function wpiszKod(page: import('@playwright/test').Page, kod: string) {
  await page.getByLabel('Kod rabatowy').fill(kod);
  await page.getByRole('button', { name: 'Użyj kodu' }).click();
}

// CZARNY20 jest ważny do 30.11.2026 włącznie (app/promocje.mjs).
// Czy kod jeszcze działa, decyduje zegar aplikacji, nie komputera z testami.
// Dlatego „dzisiaj” bierzemy z serwera: pole today w GET /api/promocja (bez nagłówka X-Namssor-Teraz).
const OSTATNI_DZIEN_CZARNY20 = '2026-11-30';

test('kod CZARNY20 do 30.11.2026 jest przyjęty i pod sumą jest linia z kwotą przed rabatem i rabatem -1,00 zł', async ({ page, request }) => {
  const { today } = await (await request.get('/api/promocja')).json();
  test.skip(today > OSTATNI_DZIEN_CZARNY20, `CZARNY20 wygasł 30.11.2026, dziś na serwerze: ${today}`);

  await wpiszKod(page, 'CZARNY20');

  await expect(page.getByText('Kod CZARNY20 przyjęty: -20% na całe zamówienie.')).toBeVisible();
  // Linia pod sumą: „Przed rabatem: 4,99 zł, rabat (CZARNY20): -1,00 zł” (20% z 4,99 zł = 0,998 zł ≈ 1,00 zł).
  // Kwoty są w osobnych elementach bez roli i etykiety, więc sprawdzamy je przez test id.
  await expect(page.getByText('Przed rabatem:')).toContainText('rabat (CZARNY20):');
  await expect(page.getByTestId('cart-subtotal')).toHaveText('4,99 zł');
  await expect(page.getByTestId('cart-discount')).toHaveText('-1,00 zł');
});

test('kod CZARNY20 od 1.12.2026 daje komunikat „Kod CZARNY20 wygasł 30.11.2026.” i nie ma rabatu', async ({ page, request }) => {
  const { today } = await (await request.get('/api/promocja')).json();
  test.skip(today <= OSTATNI_DZIEN_CZARNY20, `CZARNY20 jest jeszcze ważny, dziś na serwerze: ${today}`);

  await wpiszKod(page, 'CZARNY20');

  await expect(page.getByText('Kod CZARNY20 wygasł 30.11.2026.')).toBeVisible();
  await expect(page.getByText(/Przed rabatem:/)).toHaveCount(0);
});

test('kod NIEMA daje komunikat „Nie ma takiego kodu rabatowego: NIEMA” i nie ma rabatu', async ({ page }) => {
  await wpiszKod(page, 'NIEMA');

  await expect(page.getByText('Nie ma takiego kodu rabatowego: NIEMA')).toBeVisible();
  await expect(page.getByText(/Przed rabatem:/)).toHaveCount(0);
});

test('kod WLOSY15 bez produktów z kategorii „Włosy” daje komunikat, że w koszyku nie ma takich produktów', async ({ page }) => {
  await wpiszKod(page, 'WLOSY15');

  await expect(page.getByText('Kod WLOSY15 działa tylko na produkty z kategorii Włosy. W koszyku nie ma takich produktów.')).toBeVisible();
  await expect(page.getByText(/Przed rabatem:/)).toHaveCount(0);
});
