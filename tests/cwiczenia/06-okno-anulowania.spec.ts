import { test, expect } from '@playwright/test';

// Ćwiczenie 06, część B: okno potwierdzenia <dialog>.
// Karta: docs/cwiczenia/06-dynamiczne-id.md
// Strona: /admin/zamowienia/potwierdzenie. „Anuluj” otwiera okno z przyciskami „Wróć” i „Tak, anuluj”.

// Numer zamówienia utworzonego przed testem
let numer: string;

test.beforeEach(async ({ request, page }) => {
  // Dane przez API: nowe zamówienie klienta user.
  const logowanie = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
  const { token } = await logowanie.json();
  const odpowiedz = await request.post('/api/orders', {
    headers: { Authorization: `Bearer ${token}` },
    data: { product_id: 17, qty: 1 },
  });
  expect(odpowiedz.status()).toBe(201);
  numer = (await odpowiedz.json()).number;

  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('admin');
  await page.getByLabel('Hasło').fill('admin123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako admin')).toBeVisible();
  await page.goto('/admin/zamowienia/potwierdzenie');
});

test.afterEach(async ({ request }) => {
  // Sprzątanie: anuluj zamówienie. 409 oznacza, że test już je anulował.
  const logowanie = await request.post('/api/login', { data: { login: 'admin', password: 'admin123' } });
  const { token } = await logowanie.json();
  const odpowiedz = await request.post(`/api/admin/orders/${numer}/cancel`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect([200, 409]).toContain(odpowiedz.status());
});

test('„Wróć” zamyka okno i zamówienie zostaje nowe', async ({ page }) => {
  // Numer zamówienia jest inny w każdym przebiegu, więc wiersz szukamy po nim
  const wiersz = page.getByRole('row').filter({ hasText: numer });
  const okno = page.getByRole('dialog');

  await wiersz.getByRole('button', { name: 'Anuluj' }).click();

  // Okno <dialog> to zwykły element strony, więc działają na nim locatory i asercje
  await expect(okno).toBeVisible();
  await expect(okno.getByRole('heading')).toHaveText(`Anulować zamówienie ${numer}?`);

  await okno.getByRole('button', { name: 'Wróć' }).click();

  await expect(okno).toBeHidden();
  await expect(wiersz).toContainText('Nowe');
});

test('„Tak, anuluj” anuluje zamówienie', async ({ page }) => {
  const wiersz = page.getByRole('row').filter({ hasText: numer });

  await wiersz.getByRole('button', { name: 'Anuluj' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Tak, anuluj' }).click();

  await expect(page.getByText(`Anulowano zamówienie ${numer}`)).toBeVisible();
  await expect(wiersz).toContainText('Anulowane');
});
