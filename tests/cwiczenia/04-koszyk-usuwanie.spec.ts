import { test, expect } from '@playwright/test';

// Ćwiczenie 04, scenariusz B: dodanie produktu do koszyka i usunięcie go.
// Karta: docs/cwiczenia/04-locatory-codegen.md

test('usunięty produkt znika z koszyka', async ({ page }) => {
  // TODO 1: zaloguj się jako user / user123.
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako user')).toBeVisible();

  // TODO 2: dodaj do koszyka „Żel pod prysznic”.
  await page.getByRole('button', { name: 'Dodaj do koszyka: Żel pod prysznic' }).click();
  await expect(page.getByText('Dodano do koszyka: Żel pod prysznic')).toBeVisible();

  // TODO 3: otwórz koszyk i sprawdź, że „Żel pod prysznic” w nim jest.
  await page.getByRole('link', { name: 'Koszyk' }).click();
  const wierszZelu = page.getByRole('row').filter({ hasText: 'Żel pod prysznic' });
  await expect(wierszZelu).toBeVisible();

  // TODO 4: kliknij „Usuń” w wierszu „Żel pod prysznic”.
  await wierszZelu.getByRole('button', { name: 'Usuń' }).click();

  // TODO 5: sprawdź, że wiersza „Żel pod prysznic” już nie ma.
  // toHaveCount(0) czeka, aż w koszyku nie będzie ani jednego takiego wiersza.
  await expect(wierszZelu).toHaveCount(0);
});
