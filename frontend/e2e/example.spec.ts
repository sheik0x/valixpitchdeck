import { test, expect } from '@playwright/test'

test.describe('Unified Security Layer E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3001')
  })

  test('should load homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/Unified Security Layer/)
    await expect(page.locator('h1')).toContainText('Unified Security Layer')
  })

  test('should navigate to fee market', async ({ page }) => {
    await page.click('text=Fee Market')
    await expect(page).toHaveURL(/.*fee-market/)
    await expect(page.locator('h1')).toContainText('Dynamic Fee Market')
  })

  test('should navigate to validators page', async ({ page }) => {
    await page.click('text=Validators')
    await expect(page).toHaveURL(/.*validators/)
    await expect(page.locator('h1')).toContainText('Validators')
  })

  test('should navigate to ACCS monitor', async ({ page }) => {
    await page.click('text=ACCS Monitor')
    await expect(page).toHaveURL(/.*accs/)
    await expect(page.locator('h1')).toContainText('Atomic Cross-Chain Slashing')
  })

  test('should navigate to governance', async ({ page }) => {
    await page.click('text=Governance')
    await expect(page).toHaveURL(/.*governance/)
    await expect(page.locator('h1')).toContainText('Governance')
  })

  test('should show wallet connect button', async ({ page }) => {
    const connectButton = page.locator('text=Connect Wallet')
    await expect(connectButton).toBeVisible()
  })

  test('should display stats on dashboard', async ({ page }) => {
    await expect(page.locator('text=Total Validators')).toBeVisible()
    await expect(page.locator('text=Active Leases')).toBeVisible()
    await expect(page.locator('text=Total Staked')).toBeVisible()
  })

  test('should navigate to documentation', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    
    // Click docs link in footer
    await page.click('footer >> text=Documentation')
    await expect(page).toHaveURL(/.*docs/)
  })
})



