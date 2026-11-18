import { test, expect } from '@playwright/test';
import { zalogujNaOtwartejStronie } from '../pomocnicze/logowanie';

// P2. Koszyk wymaga logowania (E2E).
// Logujemy się na stronie, na którą przekierowała aplikacja, żeby zachować parametr next.
// Konto: APP_USER i APP_PASSWORD (na wspólnym serwerze konto pary), domyślnie user / user123.

test('niezalogowany klient z /koszyk trafia na logowanie, a po zalogowaniu wraca do koszyka', async ({ page }) => {
  await page.goto('/koszyk');

  // Przed logowaniem: strona „Logowanie”, adres pamięta, skąd klient przyszedł.
  await expect(page.getByRole('heading', { name: 'Logowanie' })).toBeVisible();
  await expect(page).toHaveURL(/next=%2Fkoszyk/);

  await zalogujNaOtwartejStronie(page);

  // Po zalogowaniu: strona „Koszyk”, a nie strona główna.
  await expect(page).toHaveURL(/\/koszyk$/);
  await expect(page.getByRole('heading', { name: 'Koszyk' })).toBeVisible();
});
