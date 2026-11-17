import { test, expect } from '@playwright/test';

// Wymaganie: po zalogowaniu klient widzi na stronie „Moje zamówienia” co najmniej jedno zamówienie.

test('klient widzi swoje zamówienia', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako user')).toBeVisible();

  await page.goto('/zamowienia');

  // Lista doładowuje się z API po chwili. Asercja web-first sama czeka,
  // aż pojawi się pierwszy wiersz zamówienia (count() nie czeka).
  // getByTestId, bo getByRole('row') złapałby też wiersz nagłówka tabeli.
  await expect(page.getByTestId('order-row').first()).toBeVisible();
});
