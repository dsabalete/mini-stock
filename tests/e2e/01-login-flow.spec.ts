import { test, expect } from '@playwright/test'

test('login with valid corporate email enters workspace', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.locator('#email').fill('test@superwagen.es')
  await page.locator('.login-button').click()
  await expect(page.locator('.sidebar')).toBeVisible({ timeout: 10000 })
})

test('login with invalid email shows error', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.locator('#email').fill('invalid-email')
  await page.locator('.login-button').click()
  await expect(page.locator('.login-error')).toContainText(
    'Introduce un correo corporativo con dominio @superwagen.es.',
  )
})