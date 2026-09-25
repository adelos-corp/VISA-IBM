// demo-app — a minimal Express server used to exercise the VISA pipeline.
// It intentionally has a health endpoint, a configurable port, and a few
// basic routes so VISA's analysis, build, and verification stages have
// something real to work with.

const express = require('express')

const app = express()
const PORT = parseInt(process.env.PORT ?? '8080', 10)

app.use(express.json())

// Health endpoint — VISA verifier probes this
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'visa-demo-app',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
})

// Home
app.get('/', (_req, res) => {
  res.json({
    message: 'Hello from the VISA demo app!',
    routes: ['GET /', 'GET /health', 'GET /items', 'POST /items'],
  })
})

// Simple in-memory resource
const items = [
  { id: 1, name: 'Widget A' },
  { id: 2, name: 'Widget B' },
]

app.get('/items', (_req, res) => {
  res.json({ items })
})

app.post('/items', (req, res) => {
  const { name } = req.body ?? {}
  if (!name) {
    return res.status(400).json({ error: 'name is required' })
  }
  const item = { id: items.length + 1, name }
  items.push(item)
  res.status(201).json({ item })
})

app.listen(PORT, () => {
  console.log(`visa-demo-app listening on http://0.0.0.0:${PORT}`)
})
