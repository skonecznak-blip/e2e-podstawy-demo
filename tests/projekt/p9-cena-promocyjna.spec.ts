import { test, expect } from '@playwright/test';
import { zaloguj, zalogujPrzezApi } from '../pomocnicze/logowanie';

// P9. Ta sama cena promocyjna w trzech miejscach (E2E): kafelek, karta produktu, koszyk.

test.beforeEach(async ({ request }) => {
  // Startujemy od pustego koszyka.
  await zalogujPrzezApi(request);
  expect((await request.delete('/api/cart')).status()).toBe(200);
});

test('„Krem do twarzy na dzień” ma cenę 26,39 zł (-20% z 32,99 zł) na kafelku, karcie produktu i w koszyku', async ({ page }) => {
  await zaloguj(page);
  await page.goto('/');

  // Kafelek: stara cena przekreślona, nowa cena i plakietka.
  // „Przekreślona” to wymaganie scenariusza, więc sprawdzamy styl przekreślenia (line-through).
  const kafelek = page.getByRole('article', { name: 'Krem do twarzy na dzień' });
  await expect(kafelek.getByText('32,99 zł', { exact: true })).toHaveCSS('text-decoration-line', 'line-through');
  await expect(kafelek.getByText('26,39 zł', { exact: true })).toBeVisible();
  await expect(kafelek.getByText('-20%', { exact: true })).toBeVisible();

  // Karta produktu: te same ceny i plakietka.
  await kafelek.getByRole('link', { name: 'Krem do twarzy na dzień' }).click();
  await expect(page.getByRole('heading', { name: 'Krem do twarzy na dzień', level: 1 })).toBeVisible();
  const karta = page.getByRole('main');
  await expect(karta.getByText('32,99 zł', { exact: true })).toHaveCSS('text-decoration-line', 'line-through');
  await expect(karta.getByText('26,39 zł', { exact: true })).toBeVisible();
  await expect(karta.getByText('-20%', { exact: true })).toBeVisible();

  // Koszyk: wartość pozycji za 1 szt. to cena promocyjna.
  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await expect(page).toHaveURL(/dodano=/);
  await page.goto('/koszyk');
  const wiersz = page.getByRole('row').filter({ hasText: 'Krem do twarzy na dzień' });
  await expect(wiersz.getByRole('cell', { name: '26,39 zł', exact: true })).toBeVisible();

  // Sprzątanie ze scenariusza: usuwamy krem z koszyka.
  await wiersz.getByRole('button', { name: 'Usuń: Krem do twarzy na dzień' }).click();
  await expect(page.getByRole('row').filter({ hasText: 'Krem do twarzy na dzień' })).toHaveCount(0);
});
