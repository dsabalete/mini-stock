import { execFileSync, spawn, type ChildProcess } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const root = process.cwd()
const wrangler = join(root, 'node_modules/.bin/wrangler')
const port = Number(process.env.TEST_PORT || 8788)
const persistTo = mkdtempSync(join(tmpdir(), 'mini-stock-d1-'))
const logPath = join(persistTo, 'wrangler.log')
let server: ChildProcess | undefined

function runWrangler(args: string[]) {
  execFileSync(wrangler, args, {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      WRANGLER_LOG_PATH: logPath,
    },
  })
}

async function waitForServer(url: string) {
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.status < 500) return
    } catch {
      // Wrangler is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`Timed out waiting for ${url}`)
}

export default async function setup() {
  mkdirSync(persistTo, { recursive: true })
  for (const file of [
    'migrations/0001_initial.sql',
    'migrations/0002_audit_log.sql',
    'seed.sql',
  ]) {
    runWrangler([
      'd1',
      'execute',
      'mini-stock',
      '--local',
      '--persist-to',
      persistTo,
      '--file',
      file,
      '--yes',
    ])
  }

  server = spawn(
    wrangler,
    [
      'pages',
      'dev',
      'dist',
      '--binding',
      'ACCESS_ALLOW_INSECURE_LOCAL=true',
      '--persist-to',
      persistTo,
      '--port',
      String(port),
      '--log-level',
      'none',
      '--show-interactive-dev-session=false',
    ],
    {
      cwd: root,
      stdio: 'ignore',
      env: {
        ...process.env,
        WRANGLER_LOG_PATH: logPath,
      },
    }
  )

  await waitForServer(`http://127.0.0.1:${port}/`)
  process.env.INTEGRATION_BASE_URL = `http://127.0.0.1:${port}`

  return () => {
    server?.kill('SIGTERM')
    rmSync(persistTo, { recursive: true, force: true })
  }
}
