import { test, expect } from '@playwright/test';
import { zalogujAdmina } from '../pomocnicze/logowanie';

// P3. Administrator dodaje produkt (E2E). Konto admin działa tylko lokalnie.
// Sprzątanie: aplikacja nie ma usuwania produktów. Unikalna nazwa (data i godzina)
// sprawia, że kolejne przebiegi sobie nie przeszkadzają. Listę czyści npm run db:reset.

test('administrator dodaje produkt, a klient znajduje go w wyszukiwarce jako dostępny w cenie 12,50 zł', async ({ page }) => {
  const nazwa = `Produkt testowy P3 ${new Date().toISOString()}`;

  await zalogujAdmina(page);

  // Panel admina › Produkty.
  await page.getByRole('link', { name: 'Panel admina' }).click();
  await page.getByRole('heading', { name: 'Produkty' }).getByRole('link', { name: 'Produkty' }).click();

  await page.getByLabel('Nazwa').fill(nazwa);
  await page.getByLabel('Kategoria').fill('Testowe');
  await page.getByLabel('Cena (zł)').fill('12,50');
  await page.getByLabel('Stan').fill('5');
  await page.getByRole('button', { name: 'Dodaj produkt' }).click();

  await expect(page.getByText(`Dodano produkt: ${nazwa}`)).toBeVisible();

  // Strona „Produkty”: wyszukiwarka znajduje nowy produkt.
  await page.goto('/');
  await page.getByLabel('Szukaj produktu').fill(nazwa);
  await page.getByRole('button', { name: 'Filtruj' }).click();

  // Kafelki pod tabelą powtarzają nazwę i cenę, więc sprawdzamy w wierszu tabeli.
  const wiersz = page.getByRole('row').filter({ hasText: nazwa });
  await expect(wiersz.getByRole('cell', { name: '12,50 zł', exact: true })).toBeVisible();
  await expect(wiersz.getByRole('cell', { name: 'Dostępny', exact: true })).toBeVisible();
  await expect(wiersz.getByRole('button', { name: `Dodaj do koszyka: ${nazwa}` })).toBeEnabled();
});
