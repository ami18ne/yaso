import { test, expect } from '@playwright/test'

test('UI visual baseline — harness and profile', async ({ page }) => {
  // hermetic harness snapshot
  await page.goto('/__e2e__')
  await expect(page.getByTestId('harness-post-content')).toHaveText('hello')
  await page.screenshot({ path: 'e2e-snapshots/baseline-harness-full.png', fullPage: true })

  // open edit dialog and snapshot it
  await page.click('text=Edit post')
  await page.waitForSelector('text=Save')
  await page.screenshot({ path: 'e2e-snapshots/baseline-harness-dialog.png' })

  // profile page full snapshot
  await page.goto('/profile')
  await page.screenshot({ path: 'e2e-snapshots/baseline-profile-full.png', fullPage: true })
})
