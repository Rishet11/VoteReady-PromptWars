import { test, expect } from '@playwright/test';

test('PIN lookup shows state guidance', async ({ page }) => {
  // Use baseUrl if configured, otherwise default to local
  await page.goto('/');
  
  // Fill in a known working PIN (Delhi)
  const pinInput = page.getByTestId('pin-input');
  await pinInput.fill('110001');
  
  // The result should appear
  const stateResult = page.getByTestId('state-result');
  await expect(stateResult).toBeVisible();
  
  // Check if state name is present
  await expect(stateResult).toContainText('Delhi');
});

test('Accessibility check on landing page', async ({ page }) => {
  await page.goto('/');
  // Basic check for title
  await expect(page).toHaveTitle(/VoteReady/);
});
