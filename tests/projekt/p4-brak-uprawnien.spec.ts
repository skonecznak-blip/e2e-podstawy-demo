import { test, expect } from '@playwright/test';
import { zaloguj, zalogujAdmina } from '../pomocnicze/logowanie';

// P4. Klient nie wejdzie do panelu administratora (E2E). Konto admin działa tylko lokalnie.

test('klient na /admin widzi „Brak uprawnień”, a w jego menu nie ma „Panel admina”', async ({ page }) => {
  await zaloguj(page);
  await page.goto('/admin');

  await expect(page.getByRole('heading', { name: 'Brak uprawnień' })).toBeVisible();
  await expect(page.getByText('Ta strona wymaga roli admin.')).toBeVisible();
  const menu = page.getByRole('navigation', { name: 'Menu główne' });
  await expect(menu.getByRole('link', { name: 'Produkty' })).toBeVisible();
  await expect(menu.getByRole('link', { name: 'Panel admina' })).toHaveCount(0);
});

test('administrator ma w menu pozycję „Panel admina”', async ({ page }) => {
  await zalogujAdmina(page);

  const menu = page.getByRole('navigation', { name: 'Menu główne' });
  await expect(menu.getByRole('link', { name: 'Panel admina' })).toBeVisible();
});
