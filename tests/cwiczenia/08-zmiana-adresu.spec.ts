import { test, expect } from '@playwright/test';

// Ćwiczenie 08, część A: zmiana adresu dostawy.
// Przypadki testowe: docs/scenariusze/zmiana-adresu.md (TC-ADR-01, TC-ADR-02)
// i docs/scenariusze/zmiana-adresu.feature.
// Przed pierwszym uruchomieniem: npm run db:reset (przy zatrzymanej aplikacji).

test.describe('Zmiana adresu dostawy', () => {
  // Wszystkie testy zmieniają adres tego samego konta user.
  // Równolegle nadpisywałyby sobie adres, więc biegną po kolei.
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Logowanie na konto klienta.
    await page.goto('/logowanie');
    await page.getByLabel('Login').fill('user');
    await page.getByLabel('Hasło').fill('user123');
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    await expect(page.getByText('Zalogowano jako user (user)')).toBeVisible();

    // Ekran „Adres dostawy” z menu.
    await page.getByRole('link', { name: 'Adres dostawy' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Zmiana adresu dostawy' })).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    // Sprzątanie: przywróć adres startowy, żeby inne testy widziały ten sam stan.
    // afterEach działa także po nieudanym teście.
    await page.goto('/konto/adres');
    await page.getByLabel('Ulica i numer').fill('ul. Przykładowa 12/3');
    await page.getByLabel('Kod pocztowy').fill('00-001');
    await page.getByLabel('Miasto').fill('Warszawa');
    await page.getByLabel('Telefon').fill('500 100 200');
    await page.getByRole('button', { name: 'Zapisz adres' }).click();
    await expect(page.getByRole('status')).toHaveText('Zapisano adres dostawy.');
  });

  test('poprawny adres zapisuje się i zostaje po odświeżeniu strony', async ({ page }) => {
    // Przed zmianą pola zawierają adres startowy.
    await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Przykładowa 12/3');
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('00-001');
    await expect(page.getByLabel('Miasto')).toHaveValue('Warszawa');
    await expect(page.getByLabel('Telefon')).toHaveValue('500 100 200');

    // Wpisz nowy adres.
    await page.getByLabel('Ulica i numer').fill('ul. Lipowa 7');
    await page.getByLabel('Kod pocztowy').fill('31-001');
    await page.getByLabel('Miasto').fill('Kraków');
    await page.getByLabel('Telefon').fill('600 200 300');
    await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Lipowa 7');
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('31-001');
    await expect(page.getByLabel('Miasto')).toHaveValue('Kraków');
    await expect(page.getByLabel('Telefon')).toHaveValue('600 200 300');

    await page.getByRole('button', { name: 'Zapisz adres' }).click();
    await expect(page.getByRole('status')).toHaveText('Zapisano adres dostawy.');

    // F5: po zapisie aplikacja przekierowuje na /konto/adres?zapisano=1,
    // więc odświeżenie pobiera pola z bazy.
    await page.reload();
    await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Lipowa 7');
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('31-001');
    await expect(page.getByLabel('Miasto')).toHaveValue('Kraków');
    await expect(page.getByLabel('Telefon')).toHaveValue('600 200 300');
  });

  test('kod pocztowy bez myślnika blokuje zapis adresu', async ({ page }) => {
    await page.getByLabel('Kod pocztowy').fill('31001');
    await page.getByRole('button', { name: 'Zapisz adres' }).click();

    await expect(page.getByRole('alert')).toHaveText('Popraw błędy w formularzu (1).');
    await expect(page.getByText('Kod pocztowy musi mieć format 00-000', { exact: true })).toBeVisible();
    // Sprawdzane po komunikacie o błędzie, gdy strona już się przeładowała.
    await expect(page.getByText('Zapisano adres dostawy.')).not.toBeVisible();

    // Otwórz ekran jeszcze raz z menu. Bez reload(): po błędzie nie ma przekierowania,
    // więc odświeżenie wysłałoby formularz jeszcze raz.
    await page.getByRole('link', { name: 'Adres dostawy' }).click();
    await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Przykładowa 12/3');
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('00-001');
    await expect(page.getByLabel('Miasto')).toHaveValue('Warszawa');
    await expect(page.getByLabel('Telefon')).toHaveValue('500 100 200');
  });

  test('telefon z 5 cyframi blokuje zapis adresu', async ({ page }) => {
    await page.getByLabel('Telefon').fill('12345');
    await page.getByRole('button', { name: 'Zapisz adres' }).click();

    await expect(page.getByRole('alert')).toHaveText('Popraw błędy w formularzu (1).');
    await expect(page.getByText('Telefon musi mieć 9 cyfr (opcjonalnie z +48)', { exact: true })).toBeVisible();
    await expect(page.getByText('Zapisano adres dostawy.')).not.toBeVisible();

    // Adres na koncie się nie zmienił.
    await page.getByRole('link', { name: 'Adres dostawy' }).click();
    await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Przykładowa 12/3');
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('00-001');
    await expect(page.getByLabel('Miasto')).toHaveValue('Warszawa');
    await expect(page.getByLabel('Telefon')).toHaveValue('500 100 200');
  });

  test('puste miasto blokuje zapis adresu', async ({ page }) => {
    await page.getByLabel('Miasto').fill('');
    await page.getByRole('button', { name: 'Zapisz adres' }).click();

    await expect(page.getByRole('alert')).toHaveText('Popraw błędy w formularzu (1).');
    await expect(page.getByText('Podaj miasto', { exact: true })).toBeVisible();
    await expect(page.getByText('Zapisano adres dostawy.')).not.toBeVisible();

    // Adres na koncie się nie zmienił.
    await page.getByRole('link', { name: 'Adres dostawy' }).click();
    await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Przykładowa 12/3');
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('00-001');
    await expect(page.getByLabel('Miasto')).toHaveValue('Warszawa');
    await expect(page.getByLabel('Telefon')).toHaveValue('500 100 200');
  });
});
