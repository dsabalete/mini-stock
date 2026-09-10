import { test, expect } from '@playwright/test'

test('admin views pending requests', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.locator('#email').fill('rperegrina@superwagen.es')
  await page.locator('.login-button').click()
  await expect(page.locator('.sidebar')).toBeVisible({ timeout: 10000 })

  await page
    .getByRole('button', { name: '＋ Registrar movimiento', exact: true })
    .click()
  await page.getByRole('button', { name: /Solicitudes/ }).click()
  await page.waitForSelector('.requests-panel', { state: 'visible' })
  await expect(page.locator('.requests-panel')).toBeVisible({ timeout: 5000 })
})

test('admin approves a pending request', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.locator('#email').fill('rperegrina@superwagen.es')
  await page.locator('.login-button').click()
  await expect(page.locator('.sidebar')).toBeVisible({ timeout: 10000 })

  await page.getByRole('button', { name: /Solicitudes/ }).click()
  await page.waitForSelector('.requests-panel', { state: 'visible' })
  await expect(page.locator('.requests-panel')).toBeVisible({ timeout: 5000 })

  const firstRequest = page.locator('.request-row').first()
  if (await firstRequest.count() > 0) {
    await expect(firstRequest).toBeVisible({ timeout: 5000 })

    await firstRequest.locator('.approve-button').click()
    await expect(page.locator('.toast-message')).toContainText(
      'Pedido aprobado y stock actualizado.',
    )
  } else {
    console.log('No pending requests to approve')
  }
})
