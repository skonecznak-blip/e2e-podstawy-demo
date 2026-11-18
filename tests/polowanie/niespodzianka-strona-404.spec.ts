import { test, expect } from '@playwright/test';

// Niespodzianka Klaudiusza: strona „nie znaleziono” pokazuje flagę.
// Wygląda tak samo na rc i na wersji zwykłej, więc to niespodzianka, a nie błąd.
// Sprawdzamy wzór flagi, a nie jej kod: kod jest na tablicy, a lokalnie aplikacja pokazuje inny.

test('strona nieistniejącego produktu pokazuje flagę niespodzianki', async ({ page }) => {
  await page.goto('/produkt/999');

  await expect(page.getByText(/FLAGA-[A-Z0-9]+/)).toBeVisible();
});
