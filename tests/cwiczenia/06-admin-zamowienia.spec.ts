import { test, expect } from '@playwright/test';

// Ćwiczenie 06: tabela zamówień w panelu admina (/admin/zamowienia).
// Każdy wiersz dostaje nowe, losowe id przy każdym wyświetleniu strony
// i nie ma data-testid. Wiersz trzeba znaleźć po treści.
//
// Gdy test jest gotowy, zamień test.fixme na test i uruchom:
//   npx playwright test tests/cwiczenia/06-admin-zamowienia.spec.ts

test.describe('Panel admina: zamówienia', () => {
  test.beforeEach(async ({ page }) => {
    // Logowanie jako administrator i przejście do listy zamówień
    await page.goto('/logowanie');
    await page.getByLabel('Login').fill('admin');
    await page.getByLabel('Hasło').fill('admin123');
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    await expect(page.getByText('Zalogowano jako admin')).toBeVisible();
    await page.goto('/admin/zamowienia');
  });

  test('anulowanie ZAM-1003 zmienia jego status na „Anulowane”', async ({ page }) => {
    // Wiersz szukamy po treści, bo jego id zmienia się przy każdym odświeżeniu
    const wiersz = page.getByRole('row').filter({ hasText: 'ZAM-1003' });

    // Stan przed akcją: zamówienie jest nowe
    await expect(wiersz).toContainText('Nowe');

    // Klikamy „Anuluj” tylko w tym wierszu (na stronie jest wiele takich przycisków)
    await wiersz.getByRole('button', { name: 'Anuluj' }).click();

    await expect(page.getByText('Anulowano zamówienie ZAM-1003')).toBeVisible();
    await expect(wiersz).toContainText('Anulowane');
    await expect(wiersz.getByRole('button', { name: 'Anuluj' })).toHaveCount(0);
  });

  test('wyszukanie „Mydło” zostawia jedno zamówienie, ZAM-1006', async ({ page }) => {
    await page.getByLabel('Szukaj zamówienia').fill('Mydło');
    await page.getByRole('button', { name: 'Szukaj' }).click();

    await expect(page.getByText('Znaleziono: 1')).toBeVisible();

    // Wiersze z danymi zawierają „ZAM-”, wiersz nagłówka nie
    const wierszeZDanymi = page.getByRole('row').filter({ hasText: 'ZAM-' });
    await expect(wierszeZDanymi).toHaveCount(1);
    await expect(wierszeZDanymi).toContainText('ZAM-1006');
  });

  test('wyszukanie nieistniejącego numeru daje pustą tabelę', async ({ page }) => {
    await page.getByLabel('Szukaj zamówienia').fill('ZAM-9999');
    await page.getByRole('button', { name: 'Szukaj' }).click();

    await expect(page.getByText('Znaleziono: 0')).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: 'ZAM-' })).toHaveCount(0);
  });
});
