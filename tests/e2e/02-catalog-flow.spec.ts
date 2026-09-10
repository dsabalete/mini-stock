import { test, expect } from '@playwright/test'

test('browse public catalog and submit request', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.locator('#email').fill('user@superwagen.es')
  await page.locator('.login-button').click()
  await expect(page.locator('.sidebar')).toBeVisible({ timeout: 10000 })

  await page.waitForSelector(
    'input[placeholder="Buscar por producto o referencia..."]'
  )
  await page
    .locator('input[placeholder="Buscar por producto o referencia..."]')
    .fill('')
  await page.locator('button:has-text("Todos")').click()

  const productCount = await page.locator('.product-card').count()
  expect(productCount).toBeGreaterThan(0)

  const firstCard = page.locator('.product-card').first()
  await firstCard.locator('button:has-text("＋")').click()
  await firstCard.locator('button:has-text("Solicitar")').click()
  await page.waitForSelector('.toast-message', { state: 'visible' })
})
