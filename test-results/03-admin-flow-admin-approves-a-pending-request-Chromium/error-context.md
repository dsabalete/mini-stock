# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 03-admin-flow.spec.ts >> admin approves a pending request
- Location: tests/e2e/03-admin-flow.spec.ts:16:1

# Error details

```
TimeoutError: page.waitForSelector: Timeout 5000ms exceeded.
Call log:
  - waiting for locator('.request-list') to be visible

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - generic [ref=e10]:
        - paragraph [ref=e11]: Stock F1
        - paragraph [ref=e12]: Revolut hospitality
      - navigation "Navegación principal" [ref=e13]:
        - paragraph [ref=e14]: Workspace
        - button "▦ Panel de control" [ref=e15] [cursor=pointer]:
          - generic [ref=e16]: ▦
          - text: Panel de control
        - button "♢ Solicitudes 0" [active] [ref=e17] [cursor=pointer]:
          - generic [ref=e18]: ♢
          - text: Solicitudes
          - generic [ref=e19]: "0"
        - button "＋ Nuevo producto" [ref=e20] [cursor=pointer]:
          - generic [ref=e21]: ＋
          - text: Nuevo producto
        - text: ">"
        - button "⌘ Ver catálogo" [ref=e22] [cursor=pointer]:
          - generic [ref=e23]: ⌘
          - text: Ver catálogo
        - paragraph [ref=e24]: Estado
        - generic [ref=e27]:
          - strong [ref=e28]: Operativo
          - generic [ref=e29]: Última sincronizaciónhace 2 min
      - generic [ref=e31]:
        - generic [ref=e32]: OP
        - generic [ref=e33]:
          - strong [ref=e34]: Operations
          - generic [ref=e35]: Administrator
        - button "Cerrar sesión" [ref=e36] [cursor=pointer]: ↪
    - main [ref=e37]:
      - generic [ref=e38]:
        - generic [ref=e39]:
          - generic [ref=e40]: Workspace
          - generic [ref=e41]: /
          - strong [ref=e42]: Panel de control
        - generic [ref=e43]:
          - generic [ref=e44]: Administrador
          - button "Abrir ayuda" [ref=e45] [cursor=pointer]: "?"
      - generic [ref=e46]:
        - generic [ref=e47]:
          - paragraph [ref=e48]: Zona privada · Operations
          - heading "Centro de control" [level=1] [ref=e49]
          - paragraph [ref=e50]: Gestiona las solicitudes y modifica el stock del programa de regalos.
        - button "＋ Registrar movimiento" [ref=e51] [cursor=pointer]
        - button "＋ Añadir producto" [ref=e52] [cursor=pointer]
      - region "Resumen de inventario" [ref=e53]:
        - generic [ref=e54]:
          - generic [ref=e55]:
            - generic [ref=e56]: Unidades en stock
            - generic [ref=e57]: +8.4% ↗
          - strong [ref=e58]: "23"
          - generic [ref=e59]: unidades físicas
        - generic [ref=e70]:
          - generic [ref=e71]:
            - generic [ref=e72]: Solicitudes
            - generic [ref=e73]: "!"
          - strong [ref=e74]: "0"
          - generic [ref=e75]:
            - generic [ref=e76]: pendientes de gestión
            - generic [ref=e77]: Acción requerida
        - generic [ref=e78]:
          - generic [ref=e79]:
            - generic [ref=e80]: Artículos bloqueados
            - generic [ref=e81]: ▣
          - strong [ref=e82]: "0"
          - generic [ref=e83]:
            - generic [ref=e84]: reservas en revisión
            - generic [ref=e85]: En espera
        - generic [ref=e86]:
          - generic [ref=e87]:
            - generic [ref=e88]: Valor de inventario
            - generic [ref=e89]: €
          - strong [ref=e90]: 1039 €
          - generic [ref=e91]:
            - generic [ref=e92]: precio de coste
            - generic [ref=e93]: estable
      - generic [ref=e94]:
        - generic [ref=e95]:
          - generic [ref=e96]:
            - paragraph [ref=e97]: Zona restringida · Operations
            - heading "Solicitudes pendientes" [level=2] [ref=e98]
            - paragraph [ref=e99]: Los artículos permanecen bloqueados hasta tomar una decisión.
          - generic [ref=e100]: ▣ Solo administrador
        - generic [ref=e101]:
          - generic [ref=e102]: ✓
          - strong [ref=e103]: No hay solicitudes pendientes
          - paragraph [ref=e104]: Los nuevos pedidos aparecerán aquí para su gestión.
      - generic [ref=e105]:
        - generic [ref=e106]:
          - generic [ref=e107]:
            - heading "Inventario actual" [level=2] [ref=e108]
            - paragraph [ref=e109]: Solo el administrador puede modificar las unidades.
          - button "⇩ Exportar" [ref=e111] [cursor=pointer]
        - generic [ref=e112]:
          - generic [ref=e113]:
            - generic [ref=e114]: ⌕
            - searchbox "⌕" [ref=e115]
          - generic [ref=e116]:
            - button "Todos 12" [ref=e117] [cursor=pointer]
            - button "Disponibles" [ref=e118] [cursor=pointer]
            - button "Stock bajo" [ref=e119] [cursor=pointer]
        - table [ref=e121]:
          - rowgroup [ref=e122]:
            - row [ref=e123]:
              - columnheader "Línea" [ref=e124]
              - columnheader "Producto / descripción" [ref=e125]
              - columnheader "SKU" [ref=e126]
              - columnheader "Ref." [ref=e127]
              - columnheader "Total" [ref=e128]
              - columnheader "SC" [ref=e129]
              - columnheader "SBD" [ref=e130]
              - columnheader "Por recibir" [ref=e131]
              - columnheader "P. coste" [ref=e132]
              - columnheader "PVP" [ref=e133]
              - columnheader [ref=e134]
          - rowgroup [ref=e135]:
            - row [ref=e136]:
              - cell "DRIVER" [ref=e137]
              - cell "Camiseta Authentic de piloto Hombre Talla L" [ref=e138]
              - cell "31 3260294" [ref=e140]
              - cell "KE9091" [ref=e141]
              - cell "2" [ref=e142]
              - cell "1" [ref=e145]
              - cell "1" [ref=e146]
              - cell "0" [ref=e147]
              - cell "57,60 €" [ref=e148]
              - cell "120,00 €" [ref=e149]
              - cell [ref=e150]:
                - button "Registrar movimiento para Camiseta Authentic de piloto Hombre Talla L" [ref=e151] [cursor=pointer]: ↗
            - row [ref=e152]:
              - cell "DRIVER" [ref=e153]
              - cell "Camiseta Authentic de piloto Hombre Talla XL" [ref=e154]
              - cell "31 3260295" [ref=e156]
              - cell "KE9091" [ref=e157]
              - cell "1" [ref=e158]
              - cell "1" [ref=e161]
              - cell "0" [ref=e162]
              - cell "3" [ref=e163]
              - cell "57,60 €" [ref=e164]
              - cell "120,00 €" [ref=e165]
              - cell [ref=e166]:
                - button "Registrar movimiento para Camiseta Authentic de piloto Hombre Talla XL" [ref=e167] [cursor=pointer]: ↗
            - row [ref=e168]:
              - cell "DRIVER" [ref=e169]
              - cell "Camiseta Authentic de piloto Hombre Talla 2XL" [ref=e170]
              - cell "31 3260296" [ref=e172]
              - cell "KE9091" [ref=e173]
              - cell "1" [ref=e174]
              - cell "1" [ref=e177]
              - cell "0" [ref=e178]
              - cell "0" [ref=e179]
              - cell "57,60 €" [ref=e180]
              - cell "120,00 €" [ref=e181]
              - cell [ref=e182]:
                - button "Registrar movimiento para Camiseta Authentic de piloto Hombre Talla 2XL" [ref=e183] [cursor=pointer]: ↗
            - row [ref=e184]:
              - cell "APPAREL" [ref=e185]
              - cell "Polo de manga corta de ingeniero Hombre Talla L" [ref=e186]
              - cell "31 3262504" [ref=e188]
              - cell "KE7324" [ref=e189]
              - cell "2" [ref=e190]
              - cell "1" [ref=e193]
              - cell "1" [ref=e194]
              - cell "2" [ref=e195]
              - cell "48,00 €" [ref=e196]
              - cell "100,00 €" [ref=e197]
              - cell [ref=e198]:
                - button "Registrar movimiento para Polo de manga corta de ingeniero Hombre Talla L" [ref=e199] [cursor=pointer]: ↗
            - row [ref=e200]:
              - cell "APPAREL" [ref=e201]
              - cell "Polo de manga corta de ingeniero Hombre Talla XL" [ref=e202]
              - cell "31 3262505" [ref=e204]
              - cell "KE7324" [ref=e205]
              - cell "2" [ref=e206]
              - cell "1" [ref=e209]
              - cell "1" [ref=e210]
              - cell "0" [ref=e211]
              - cell "48,00 €" [ref=e212]
              - cell "100,00 €" [ref=e213]
              - cell [ref=e214]:
                - button "Registrar movimiento para Polo de manga corta de ingeniero Hombre Talla XL" [ref=e215] [cursor=pointer]: ↗
            - row [ref=e216]:
              - cell "APPAREL" [ref=e217]
              - cell "Chaqueta tipo chándal de ingeniero Mujer Talla L" [ref=e218]
              - cell "31 3262706" [ref=e220]
              - cell "KE9104" [ref=e221]
              - cell "2" [ref=e222]
              - cell "1" [ref=e225]
              - cell "1" [ref=e226]
              - cell "0" [ref=e227]
              - cell "57,60 €" [ref=e228]
              - cell "120,00 €" [ref=e229]
              - cell [ref=e230]:
                - button "Registrar movimiento para Chaqueta tipo chándal de ingeniero Mujer Talla L" [ref=e231] [cursor=pointer]: ↗
            - row [ref=e232]:
              - cell "APPAREL" [ref=e233]
              - cell "Chaqueta tipo chándal de ingeniero Hombre Talla L" [ref=e234]
              - cell "31 3262706" [ref=e236]
              - cell "KE9104" [ref=e237]
              - cell "4" [ref=e238]
              - cell "2" [ref=e241]
              - cell "2" [ref=e242]
              - cell "0" [ref=e243]
              - cell "57,60 €" [ref=e244]
              - cell "120,00 €" [ref=e245]
              - cell [ref=e246]:
                - button "Registrar movimiento para Chaqueta tipo chándal de ingeniero Hombre Talla L" [ref=e247] [cursor=pointer]: ↗
            - row [ref=e248]:
              - cell "ACCESSORIES" [ref=e249]
              - cell "Gorra de team con logo Audi en frontal" [ref=e250]
              - cell "31 3263003" [ref=e252]
              - cell "KE9081" [ref=e253]
              - cell "1" [ref=e254]
              - cell "0" [ref=e257]
              - cell "1" [ref=e258]
              - cell "0" [ref=e259]
              - cell "16,80 €" [ref=e260]
              - cell "35,00 €" [ref=e261]
              - cell [ref=e262]:
                - button "Registrar movimiento para Gorra de team con logo Audi en frontal" [ref=e263] [cursor=pointer]: ↗
            - row [ref=e264]:
              - cell "ACCESSORIES" [ref=e265]
              - cell "Sudadera de triple capucha Hombre Talla L" [ref=e266]
              - cell "31 3267044" [ref=e268]
              - cell "KE6787" [ref=e269]
              - cell "2" [ref=e270]
              - cell "1" [ref=e273]
              - cell "1" [ref=e274]
              - cell "0" [ref=e275]
              - cell "33,60 €" [ref=e276]
              - cell "70,00 €" [ref=e277]
              - cell [ref=e278]:
                - button "Registrar movimiento para Sudadera de triple capucha Hombre Talla L" [ref=e279] [cursor=pointer]: ↗
            - row [ref=e280]:
              - cell "ACCESSORIES" [ref=e281]
              - cell "Sudadera de triple capucha Hombre Talla XL" [ref=e282]
              - cell "31 3267045" [ref=e284]
              - cell "KE6787" [ref=e285]
              - cell "2" [ref=e286]
              - cell "1" [ref=e289]
              - cell "1" [ref=e290]
              - cell "0" [ref=e291]
              - cell "33,60 €" [ref=e292]
              - cell "70,00 €" [ref=e293]
              - cell [ref=e294]:
                - button "Registrar movimiento para Sudadera de triple capucha Hombre Talla XL" [ref=e295] [cursor=pointer]: ↗
            - row [ref=e296]:
              - cell "FAN RANGE" [ref=e297]
              - cell "Chaqueta de chándal Hombre Talla XL" [ref=e298]
              - cell "31 3261405" [ref=e300]
              - cell "KE6784" [ref=e301]
              - cell "2" [ref=e302]
              - cell "1" [ref=e305]
              - cell "1" [ref=e306]
              - cell "0" [ref=e307]
              - cell "33,60 €" [ref=e308]
              - cell "70,00 €" [ref=e309]
              - cell [ref=e310]:
                - button "Registrar movimiento para Chaqueta de chándal Hombre Talla XL" [ref=e311] [cursor=pointer]: ↗
            - row [ref=e312]:
              - cell "FAN RANGE" [ref=e313]
              - cell "Chaqueta de chándal Hombre Talla 2XL" [ref=e314]
              - cell "31 3261406" [ref=e316]
              - cell "KE6784" [ref=e317]
              - cell "2" [ref=e318]
              - cell "1" [ref=e321]
              - cell "1" [ref=e322]
              - cell "0" [ref=e323]
              - cell "26,40 €" [ref=e324]
              - cell "55,00 €" [ref=e325]
              - cell [ref=e326]:
                - button "Registrar movimiento para Chaqueta de chándal Hombre Talla 2XL" [ref=e327] [cursor=pointer]: ↗
      - generic [ref=e328]:
        - generic [ref=e329]:
          - generic [ref=e331]:
            - heading "Actividad reciente" [level=2] [ref=e332]
            - paragraph [ref=e333]: Solicitudes y movimientos del equipo
          - generic [ref=e334]:
            - generic [ref=e335]:
              - generic [ref=e336]: ↘
              - generic [ref=e337]:
                - strong [ref=e338]: Solicitud rechazada
                - generic [ref=e339]: marina.garcia@audi.com · Camiseta Authentic de piloto Hombre Talla XL
              - generic [ref=e340]: +1 uds.
              - time [ref=e341]: 2026-09-08T16:56:09.060Z
            - generic [ref=e342]:
              - generic [ref=e343]: ↘
              - generic [ref=e344]:
                - strong [ref=e345]: Entrada de mercancía
                - generic [ref=e346]: Pedido AD-2026-041 · 3 referencias
              - generic [ref=e347]: +12 uds.
              - time [ref=e348]: 2026-09-08T09:42:00.000Z
            - generic [ref=e349]:
              - generic [ref=e350]: ↗
              - generic [ref=e351]:
                - strong [ref=e352]: Despacho a hospitality
                - generic [ref=e353]: GP Barcelona · Zona Paddock
              - generic [ref=e354]: "-8 uds."
              - time [ref=e355]: 2026-09-07T17:18:00.000Z
            - generic [ref=e356]:
              - generic [ref=e357]: ↗
              - generic [ref=e358]:
                - strong [ref=e359]: Reserva actualizada
                - generic [ref=e360]: Kit piloto · Evento Mónaco
              - generic [ref=e361]: "-4 uds."
              - time [ref=e362]: 2026-09-07T12:06:00.000Z
        - generic [ref=e363]:
          - generic [ref=e365]:
            - heading "Reglas de acceso" [level=2] [ref=e366]
            - paragraph [ref=e367]: Permisos activos en este workspace
          - generic [ref=e368]:
            - generic [ref=e369]:
              - generic [ref=e370]: "@"
              - paragraph [ref=e371]:
                - strong [ref=e372]: Identificación corporativa
                - generic [ref=e373]: Solo correos autorizados pueden solicitar
              - generic [ref=e374]: ✓
            - generic [ref=e375]:
              - generic [ref=e376]: ▣
              - paragraph [ref=e377]:
                - strong [ref=e378]: Bloqueo automático
                - generic [ref=e379]: El artículo queda retenido al solicitar
              - generic [ref=e380]: ✓
            - generic [ref=e381]:
              - generic [ref=e382]: ⌘
              - paragraph [ref=e383]:
                - strong [ref=e384]: Gestión centralizada
                - generic [ref=e385]: Solo Operations modifica el stock
              - generic [ref=e386]: ✓
  - generic [ref=e387]:
    - button "Toggle Nuxt DevTools" [ref=e388] [cursor=pointer]
    - generic "App load time" [ref=e392]:
      - generic [ref=e393]: "110"
      - generic [ref=e394]: ms
    - button "Toggle Component Inspector" [ref=e396] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test('admin views pending requests', async ({ page }) => {
  4  |   await page.goto('/')
  5  |   await page.waitForLoadState('networkidle')
  6  |   await page.locator('#email').fill('rperegrina@superwagen.es')
  7  |   await page.locator('.login-button').click()
  8  |   await expect(page.locator('.sidebar')).toBeVisible({ timeout: 10000 })
  9  | 
  10 |   await page.getByRole('button', { name: /\+ Registrar movimiento/ }).click()
  11 |   await page.getByRole('button', { name: /Solicitudes/ }).click()
  12 |   await page.waitForSelector('.request-list', { state: 'visible' })
  13 |   await expect(page.locator('.request-list')).toBeVisible({ timeout: 5000 })
  14 | })
  15 | 
  16 | test('admin approves a pending request', async ({ page }) => {
  17 |   await page.goto('/')
  18 |   await page.waitForLoadState('networkidle')
  19 |   await page.locator('#email').fill('rperegrina@superwagen.es')
  20 |   await page.locator('.login-button').click()
  21 |   await expect(page.locator('.sidebar')).toBeVisible({ timeout: 10000 })
  22 | 
  23 |   await page.getByRole('button', { name: /Solicitudes/ }).click()
> 24 |   await page.waitForSelector('.request-list', { state: 'visible' })
     |              ^ TimeoutError: page.waitForSelector: Timeout 5000ms exceeded.
  25 |   await expect(page.locator('.request-list')).toBeVisible({ timeout: 5000 })
  26 | 
  27 |   const firstRequest = page.locator('.request-row').first()
  28 |   await expect(firstRequest).toBeVisible({ timeout: 5000 })
  29 | 
  30 |   await firstRequest.locator('.approve-button').click()
  31 |   await expect(page.locator('.toast-message')).toContainText(
  32 |     'Pedido aprobado y stock actualizado.'
  33 |   )
  34 | })
  35 | 
```