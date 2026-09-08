CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  line TEXT NOT NULL,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  ref TEXT NOT NULL,
  stock_sc INTEGER NOT NULL DEFAULT 0,
  stock_sbd INTEGER NOT NULL DEFAULT 0,
  incoming INTEGER NOT NULL DEFAULT 0,
  cost REAL NOT NULL DEFAULT 0,
  price REAL NOT NULL DEFAULT 0,
  accent TEXT NOT NULL,
  locked INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS order_requests (
  id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  email TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('in', 'out')),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_requests_status ON order_requests(status);
CREATE INDEX IF NOT EXISTS idx_movements_created_at ON movements(created_at DESC);
