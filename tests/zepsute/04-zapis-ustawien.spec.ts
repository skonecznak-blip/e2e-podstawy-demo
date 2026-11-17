import { test, expect } from '@playwright/test';

// Wymaganie: administrator zapisuje ustawienia sklepu bez zmian. Widzi komunikat
// „Zapisano ustawienia”, a tryb konserwacji zostaje wyłączony.

test('zapis ustawień pokazuje komunikat', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('admin');
  await page.getByLabel('Hasło').fill('admin123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako admin')).toBeVisible();

  await page.goto('/admin/ustawienia');
  const poleKonserwacji = page.getByLabel('Tryb konserwacji sklepu');
  const stanKonserwacji = page.getByTestId('maintenance-state');

  // Stan przed zapisem: tryb konserwacji wyłączony, pole niezaznaczone.
  await expect(poleKonserwacji).not.toBeChecked();
  await expect(stanKonserwacji).toHaveText('Stan: wyłączony');

  // Zapisujemy bez zaznaczania niczego.
  await page.getByRole('button', { name: 'Zapisz' }).click();

  // Komunikat sprawdzamy od razu po kliknięciu, bo znika po kilku sekundach.
  // Asercja sama czeka, aż się pojawi, więc pauza nie jest potrzebna.
  await expect(page.getByText('Zapisano ustawienia')).toBeVisible();

  // Stan po zapisie się nie zmienił.
  await expect(poleKonserwacji).not.toBeChecked();
  await expect(stanKonserwacji).toHaveText('Stan: wyłączony');
});
