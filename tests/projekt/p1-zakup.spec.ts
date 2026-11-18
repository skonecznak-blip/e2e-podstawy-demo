import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// P1. Zakup z płatnością przy odbiorze (E2E).
// Sprzątanie: złożonego zamówienia klient nie cofnie, a stan produktu spada o 1 przy każdym przebiegu.
// Test nie zależy od konkretnego stanu (porównuje „przed” i „po”), więc drugi przebieg daje ten sam wynik.
// Stan startowy (80 szt.) przywraca npm run db:reset.

test('zakup „Balsam do ciała” z płatnością przy odbiorze tworzy zamówienie „Nowe” i zmniejsza stan o 1', async ({ page }) => {
  await zaloguj(page);

  // Stan przed zakupem: liczba z kolumny „Stan” w wierszu produktu.
  await page.goto('/');
  const wierszProduktu = page.getByRole('row').filter({ hasText: 'Balsam do ciała' });
  const stanPrzed = Number(await wierszProduktu.getByTestId('product-stock').textContent());

  // Dodanie do koszyka i złożenie zamówienia.
  await wierszProduktu.getByRole('button', { name: 'Dodaj do koszyka: Balsam do ciała' }).click();
  // Czekamy, aż produkt trafi do koszyka. Sprawdzamy adres, a nie komunikat:
  // scenariusz komunikatu nie opisuje, a jego treść zależy od wersji aplikacji.
  await expect(page).toHaveURL(/dodano=/);
  await page.goto('/koszyk');
  await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();

  // Strona „Moje zamówienia” z jednym nowym numerem w adresie (zlozono=ZAM-…).
  await expect(page).toHaveURL(/\/zamowienia\?zlozono=ZAM-\d+$/);
  await expect(page.getByRole('heading', { name: 'Moje zamówienia' })).toBeVisible();
  const numer = new URL(page.url()).searchParams.get('zlozono') ?? '';
  await expect(page.getByText(`Złożono zamówienie: ${numer}`)).toBeVisible();

  // Na liście jest wiersz z tym numerem, produktem i statusem „Nowe”.
  // Lista ładuje się z opóźnieniem, asercja sama na nią czeka.
  // Wiersz szukamy po linku z dokładnym numerem: samo hasText: 'ZAM-103' pasowałoby też do ZAM-1030.
  const wierszZamowienia = page.getByRole('row').filter({ has: page.getByRole('link', { name: numer, exact: true }) });
  await expect(wierszZamowienia.getByRole('cell', { name: 'Balsam do ciała', exact: true })).toBeVisible();
  await expect(wierszZamowienia.getByRole('cell', { name: 'Nowe', exact: true })).toBeVisible();

  // Stan na stronie „Produkty” mniejszy o 1 niż przed zakupem.
  await page.goto('/');
  await expect(wierszProduktu.getByTestId('product-stock')).toHaveText(String(stanPrzed - 1));
});
