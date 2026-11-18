import { test, expect } from '@playwright/test';

// Ćwiczenie 02: pierwszy test „produkt w promocji w koszyku”.
// Karta: docs/cwiczenia/02-pierwszy-test.md

test('produkt w promocji trafia do koszyka z ceną promocyjną', async ({ page }) => {
  // TODO 1: zaloguj się jako user / user123 (wzór: tests/przyklady/logowanie.spec.ts).
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako user')).toBeVisible();

  // TODO 2: na stronie „Produkty” kliknij „Dodaj do koszyka” w wierszu „Krem do twarzy na dzień”.
  // Szukamy wiersza tabeli, bo pod tabelą są kafelki z tą samą nazwą.
  await page.getByRole('link', { name: 'Produkty' }).click();
  const wierszProduktu = page.getByRole('row').filter({ hasText: 'Krem do twarzy na dzień' });
  await wierszProduktu.getByRole('button', { name: 'Dodaj do koszyka' }).click();

  // TODO 3: sprawdź komunikat „Produkt w koszyku: Krem do twarzy na dzień”.
  await expect(page.getByText('Produkt w koszyku: Krem do twarzy na dzień')).toBeVisible();

  // TODO 4: przejdź do koszyka (link „Koszyk” w menu).
  await page.getByRole('link', { name: 'Koszyk' }).click();
  await expect(page).toHaveURL(/koszyk/);

  // TODO 5: sprawdź, że w koszyku jest wiersz „Krem do twarzy na dzień” z ceną promocyjną 26,39 zł.
  const wierszKoszyka = page.getByRole('row').filter({ hasText: 'Krem do twarzy na dzień' });
  await expect(wierszKoszyka).toBeVisible();
  await expect(wierszKoszyka).toContainText('26,39 zł');
});
