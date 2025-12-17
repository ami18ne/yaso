import { test, expect } from '@playwright/test'

test('edit a post flow (stubbed backend)', async ({ page }) => {
  // forward browser console messages to test output for debugging
  page.on('console', (m) => console.log('BROWSER:', m.text()))
  // Navigate to the dev-only harness page which uses purely local state
  await page.goto('/__e2e__')

  // Wait for injected post to appear
  const postContent = page.locator('[data-testid="harness-post-content"]')
  await expect(postContent).toBeVisible()
  await expect(postContent).toHaveText('hello')

  await page.click('button:has-text("Edit post")')

  // Open options and click Edit

  // Edit dialog should appear — update content and save
  const textarea = page.locator('textarea').first()
  await expect(textarea).toBeVisible()
  await textarea.fill('updated by e2e')

  await page.locator('button:has-text("Save")').click()

  // wait for the harness to update its state
  await page.waitForFunction(() => document.querySelector('[data-testid="harness-post-content"]')?.textContent === 'updated by e2e')
  await expect(postContent).toHaveText('updated by e2e')
})
