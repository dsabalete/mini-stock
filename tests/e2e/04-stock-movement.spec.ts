import { test, expect } from '@playwright/test'

test('admin records a stock movement', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.locator('#email').fill('rperegrina@superwagen.es')
  await page.locator('.login-button').click()
  await expect(page.locator('.sidebar')).toBeVisible({ timeout: 10000 })

  await page.getByRole('button', { name: /\+ Registrar movimiento/ }).click()
  await page.getByRole('button', { name: /SBD/ }).click()
  await page.getByRole('button', { name: /Salida/ }).click()
  await page.locator('input[id="quantity"]').fill('5')
  await page.locator('textarea').fill('Movimiento de prueba')
  await page.getByRole('button', { name: /Guardar movimiento/ }).click()

  await expect(page.locator('.toast-message')).toContainText(
    'Movimiento registrado exitosamente.',
  )
}