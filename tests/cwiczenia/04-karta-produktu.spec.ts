import { test, expect } from '@playwright/test';

// Ćwiczenie 04b: ta sama cena promocyjna na kafelku, na karcie produktu i w koszyku.
// Karta: docs/cwiczenia/04-locatory-codegen.md (część 04b)
// Konto tester11 ma osobny koszyk: testy z ćwiczeń 02 i 04 dodają produkty do koszyka konta user.

test('cena promocyjna kremu jest taka sama na kafelku, karcie produktu i w koszyku', async ({ page }) => {
  // TODO 1: zaloguj się jako tester11 / czarny-piatek-2026.
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('tester11');
  await page.getByLabel('Hasło').fill('czarny-piatek-2026');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako tester11')).toBeVisible();

  // TODO 2: na stronie „Produkty” znajdź kafelek „Krem do twarzy na dzień” (sekcja „Oferta na Czarny Piątek” pod tabelą).
  //         Sprawdź w kafelku: cena 26,39 zł, stara cena 32,99 zł, plakietka -20%.
  await expect(page.getByRole('heading', { name: 'Oferta na Czarny Piątek' })).toBeVisible();
  const kafelek = page.getByRole('article', { name: 'Krem do twarzy na dzień' });
  await expect(kafelek.getByTestId('tile-price')).toHaveText('26,39 zł');
  await expect(kafelek.getByTestId('tile-old-price')).toHaveText('32,99 zł');
  await expect(kafelek.getByTestId('tile-badge')).toHaveText('-20%');

  // TODO 3: kliknij nazwę produktu w kafelku. Sprawdź nagłówek karty produktu i te same trzy rzeczy.
  await kafelek.getByRole('link', { name: 'Krem do twarzy na dzień' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Krem do twarzy na dzień' })).toBeVisible();
  await expect(page.getByTestId('product-price')).toHaveText('26,39 zł');
  await expect(page.getByTestId('product-old-price')).toHaveText('32,99 zł');
  await expect(page.getByTestId('product-badge')).toHaveText('-20%');

  // TODO 4: kliknij „Dodaj do koszyka” i sprawdź komunikat „Dodano do koszyka: Krem do twarzy na dzień”.
  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await expect(page.getByText('Dodano do koszyka: Krem do twarzy na dzień')).toBeVisible();

  // TODO 5: przejdź do koszyka (link „Koszyk” w menu). Sprawdź, że wiersz kremu ma cenę 26,39 zł.
  await page.getByRole('link', { name: 'Koszyk' }).click();
  const wierszKremu = page.getByRole('row').filter({ hasText: 'Krem do twarzy na dzień' });
  // Komórka „Cena” pokazuje też starą, przekreśloną cenę, dlatego toContainText, a nie toHaveText.
  await expect(wierszKremu.getByTestId('cart-item-price')).toContainText('26,39 zł');

  // TODO 6: usuń krem z koszyka, żeby następne uruchomienie zaczynało od pustego koszyka.
  await wierszKremu.getByRole('button', { name: 'Usuń' }).click();
  await expect(wierszKremu).toHaveCount(0);
});