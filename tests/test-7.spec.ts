import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('about:blank');
  await page.goto('http://localhost:4100/');
  await page.getByText('namssor ProduktyKoszykMoje').click();
});