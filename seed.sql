INSERT OR IGNORE INTO products (id, line, name, sku, ref, stock_sc, stock_sbd, incoming, cost, price, accent, locked) VALUES
(1, 'DRIVER', 'Camiseta Authentic de piloto Hombre Talla L', '31 3260294', 'KE9091', 1, 1, 0, 57.60, 120, 'red', 0),
(2, 'DRIVER', 'Camiseta Authentic de piloto Hombre Talla XL', '31 3260295', 'KE9091', 1, 0, 3, 57.60, 120, 'amber', 1),
(3, 'DRIVER', 'Camiseta Authentic de piloto Hombre Talla 2XL', '31 3260296', 'KE9091', 1, 0, 0, 57.60, 120, 'red', 0),
(4, 'APPAREL', 'Polo de manga corta de ingeniero Hombre Talla L', '31 3262504', 'KE7324', 1, 1, 2, 48, 100, 'amber', 0),
(5, 'APPAREL', 'Polo de manga corta de ingeniero Hombre Talla XL', '31 3262505', 'KE7324', 1, 1, 0, 48, 100, 'amber', 0),
(6, 'APPAREL', 'Chaqueta tipo chándal de ingeniero Mujer Talla L', '31 3262706', 'KE9104', 1, 1, 0, 57.60, 120, 'amber', 0),
(7, 'APPAREL', 'Chaqueta tipo chándal de ingeniero Hombre Talla L', '31 3262706', 'KE9104', 2, 2, 0, 57.60, 120, 'green', 0),
(8, 'ACCESSORIES', 'Gorra de team con logo Audi en frontal', '31 3263003', 'KE9081', 0, 1, 0, 16.80, 35, 'red', 0),
(9, 'ACCESSORIES', 'Sudadera de triple capucha Hombre Talla L', '31 3267044', 'KE6787', 1, 1, 0, 33.60, 70, 'amber', 0),
(10, 'ACCESSORIES', 'Sudadera de triple capucha Hombre Talla XL', '31 3267045', 'KE6787', 1, 1, 0, 33.60, 70, 'amber', 0),
(11, 'FAN RANGE', 'Chaqueta de chándal Hombre Talla XL', '31 3261405', 'KE6784', 1, 1, 0, 33.60, 70, 'amber', 0),
(12, 'FAN RANGE', 'Chaqueta de chándal Hombre Talla 2XL', '31 3261406', 'KE6784', 1, 1, 0, 26.40, 55, 'amber', 0);

INSERT OR IGNORE INTO order_requests (id, product_id, email, quantity, status, created_at)
VALUES (101, 2, 'marina.garcia@audi.com', 1, 'pending', '2026-09-08T10:14:00.000Z');

INSERT OR IGNORE INTO movements (id, title, detail, amount, type, created_at) VALUES
(1, 'Entrada de mercancía', 'Pedido AD-2026-041 · 3 referencias', 12, 'in', '2026-09-08T09:42:00.000Z'),
(2, 'Despacho a hospitality', 'GP Barcelona · Zona Paddock', 8, 'out', '2026-09-07T17:18:00.000Z'),
(3, 'Reserva actualizada', 'Kit piloto · Evento Mónaco', 4, 'out', '2026-09-07T12:06:00.000Z');
