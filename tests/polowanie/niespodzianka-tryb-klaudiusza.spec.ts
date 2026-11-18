import { test, expect } from '@playwright/test';

// Niespodzianka Klaudiusza: 5 kliknięć w logo „namssor” w ciągu 10 s włącza „Tryb Klaudiusza” z flagą.
// Wygląda tak samo na rc i na wersji zwykłej, więc to niespodzianka, a nie błąd.
// Sprawdzamy wzór flagi, a nie jej kod: kod jest na tablicy, a lokalnie aplikacja pokazuje inny.

test('pięć kliknięć w logo pokazuje „Tryb Klaudiusza” i flagę', async ({ page }) => {
  await page.goto('/regulamin');
  const logo = page.getByRole('link', { name: 'namssor' });

  for (let i = 0; i < 5; i++) {
    await logo.click();
    // Logo prowadzi na stronę główną. Czekamy, aż strona się wczyta,
    // bo dopiero wtedy skrypt liczący kliknięcia jest gotowy na następne.
    await page.waitForLoadState('load');
  }

  await expect(page.getByRole('status').filter({ hasText: 'Tryb Klaudiusza' })).toBeVisible();
  await expect(page.getByText(/Flaga: FLAGA-[A-Z0-9]+/)).toBeVisible();
});
