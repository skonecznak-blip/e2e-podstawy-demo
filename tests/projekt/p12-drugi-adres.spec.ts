import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// P12. Drugi adres w profilu (E2E). Test sam usuwa dodany adres; wtedy „Domyślny” wraca do „Adres główny”.

test('nowy adres ustawiony jako domyślny ma jedyną plakietkę „Domyślny”, a po jego usunięciu wraca ona do „Adres główny”', async ({ page }) => {
  const nazwa = `Praca ${new Date().toISOString()}`;
  await zaloguj(page);
  await page.goto('/konto/adresy');

  await page.getByLabel('Nazwa adresu').fill(nazwa);
  await page.getByLabel('Ulica i numer').fill('ul. Biurowa 7');
  await page.getByLabel('Kod pocztowy').fill('00-950');
  await page.getByLabel('Miasto').fill('Warszawa');
  await page.getByLabel('Telefon').fill('600 700 800');
  await page.getByRole('button', { name: 'Dodaj adres' }).click();

  await expect(page.getByText(`Dodano adres: ${nazwa}`)).toBeVisible();
  const nowy = page.getByRole('article').filter({ hasText: nazwa });
  await expect(nowy).toContainText('ul. Biurowa 7');

  await nowy.getByRole('button', { name: `Ustaw jako domyślny: ${nazwa}` }).click();
  await expect(nowy.getByText('Domyślny', { exact: true })).toBeVisible();
  await expect(page.getByText('Domyślny', { exact: true })).toHaveCount(1);

  // „Adres główny” nie ma przycisku „Usuń”.
  const glowny = page.getByRole('article').filter({ has: page.getByRole('heading', { name: /^Adres główny/ }) });
  await expect(glowny.getByRole('button', { name: /Usuń/ })).toHaveCount(0);

  // Sprzątanie ze scenariusza: usuwamy swój adres.
  await nowy.getByRole('button', { name: `Usuń adres: ${nazwa}` }).click();
  await expect(page.getByRole('article').filter({ hasText: nazwa })).toHaveCount(0);
  await expect(glowny.getByText('Domyślny', { exact: true })).toBeVisible();
});
