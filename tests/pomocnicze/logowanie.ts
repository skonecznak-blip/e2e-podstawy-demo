import { expect, type APIRequestContext, type Page } from '@playwright/test';

// Logowanie wspólne dla wielu testów (ćwiczenie 11 i projekt).
// Bez parametrów loguje konto ze zmiennych APP_USER i APP_PASSWORD,
// a gdy ich nie ma, konto demo user / user123.
// Na wspólnym serwerze ustawiasz konto pary, np.:
//   $env:APP_USER="tester05"
//   $env:APP_PASSWORD="czarny-piatek-2026"

const domyslnyLogin = () => process.env.APP_USER || 'user';
const domyslneHaslo = () => process.env.APP_PASSWORD || 'user123';

// Logowanie przez formularz w przeglądarce.
// Wywołanie w teście: await zaloguj(page);
// Inne konto: await zaloguj(page, 'biuro', 'biuro123');
export async function zaloguj(page: Page, login = domyslnyLogin(), haslo = domyslneHaslo()) {
  await page.goto('/logowanie');
  await zalogujNaOtwartejStronie(page, login, haslo);
}

// Wypełnia formularz na stronie logowania, która jest już otwarta.
// Przydaje się, gdy aplikacja sama przekierowała na logowanie (np. z /koszyk)
// i adres ma parametr next, którego page.goto('/logowanie') by nie zachował.
// Wywołanie w teście: await zalogujNaOtwartejStronie(page);
export async function zalogujNaOtwartejStronie(page: Page, login = domyslnyLogin(), haslo = domyslneHaslo()) {
  await page.getByLabel('Login').fill(login);
  await page.getByLabel('Hasło').fill(haslo);
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  // Bez tej asercji test szedłby dalej także po nieudanym logowaniu.
  await expect(page.getByText(`Zalogowano jako ${login}`)).toBeVisible();
}

// Logowanie administratora. Konto ze zmiennych ADMIN_USER i ADMIN_PASSWORD,
// a gdy ich nie ma, konto demo admin / admin123 (działa tylko lokalnie).
// Wywołanie w teście: await zalogujAdmina(page);
export async function zalogujAdmina(page: Page) {
  await zaloguj(page, process.env.ADMIN_USER || 'admin', process.env.ADMIN_PASSWORD || 'admin123');
}

// Logowanie w testach API. Po nim `request` wysyła ciasteczko sesji w kolejnych żądaniach.
// Wywołanie w teście: await zalogujPrzezApi(request);
export async function zalogujPrzezApi(request: APIRequestContext, login = domyslnyLogin(), haslo = domyslneHaslo()) {
  const odpowiedz = await request.post('/api/login', { data: { login, password: haslo } });
  expect(odpowiedz.status(), `logowanie ${login} przez API`).toBe(200);
}
