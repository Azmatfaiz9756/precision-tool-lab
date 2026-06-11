<?php
// ─── Generic Entity REST Endpoint ─────────────────────────────────────────────
// Handles CRUD operations for all entities via a single file.
// URL pattern: /entities/{EntityName}[/{id}]
//
// Supported entities: Product, Order, Review, WishlistItem, Address, CartItem,
//                     Coupon, Newsletter, ContactMessage, User

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$method     = $_SERVER['REQUEST_METHOD'];
$entityName = $entityName ?? 'Product';  // set by router
$id         = $entityId   ?? null;       // set by router

// Map entity names to DB tables and their access rules
$entityMap = [
    'Product'        => ['table' => 'products',        'public_read' => true,  'admin_write' => true],
    'Order'          => ['table' => 'orders',           'public_read' => false, 'admin_write' => false, 'owner_field' => 'user_firebase_uid'],
    'Review'         => ['table' => 'reviews',          'public_read' => true,  'admin_write' => false, 'owner_field' => 'user_firebase_uid'],
    'WishlistItem'   => ['table' => 'wishlist_items',   'public_read' => false, 'admin_write' => false, 'owner_field' => 'user_firebase_uid'],
    'Address'        => ['table' => 'addresses',        'public_read' => false, 'admin_write' => false, 'owner_field' => 'user_firebase_uid'],
    'CartItem'       => ['table' => 'cart_items',       'public_read' => false, 'admin_write' => false, 'owner_field' => 'user_firebase_uid'],
    'Coupon'         => ['table' => 'coupons',          'public_read' => false, 'admin_write' => true],
    'Newsletter'     => ['table' => 'newsletter',       'public_read' => false, 'admin_write' => true],
    'ContactMessage' => ['table' => 'contact_messages', 'public_read' => false, 'admin_write' => true],
    'User'           => ['table' => 'users',            'public_read' => false, 'admin_write' => true],
];

if (!isset($entityMap[$entityName])) {
    http_response_code(404);
    echo json_encode(['error' => "Unknown entity: $entityName"]);
    exit;
}

$config  = $entityMap[$entityName];
$table   = $config['table'];
$db      = getDB();
$body    = [];

if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
}

// ── Auth check ────────────────────────────────────────────────────────────────
$authUser = null;
if ($config['public_read'] && $method === 'GET') {
    $authUser = optionalAuth();
} else {
    $authUser = requireAuth();
}

$userUid = $authUser['sub'] ?? null;

// For admin-write entities, non-admins cannot write
if ($config['admin_write'] && in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'])) {
    requireAdmin();
}

// ── Route ─────────────────────────────────────────────────────────────────────
switch ($method) {
    // ── LIST  GET /entities/{Entity} ─────────────────────────────────────────
    case 'GET':
        if ($id === null) {
            $order  = $_GET['order']  ?? 'id';
            $limit  = (int)($_GET['limit']  ?? 0);
            $offset = (int)($_GET['offset'] ?? 0);
            $search = $_GET['search'] ?? '';

            $where  = [];
            $params = [];

            // Owner filter for personal entities
            if (!empty($config['owner_field']) && !isAdminUser($db, $userUid)) {
                $where[]  = "{$config['owner_field']} = ?";
                $params[] = $userUid;
            }

            // Search filter
            if ($search) {
                $where[]  = "(name LIKE ? OR description LIKE ?)";
                $params[] = "%$search%";
                $params[] = "%$search%";
            }

            // Generic filters (exclude reserved keywords)
            $reserved = ['order', 'limit', 'offset', 'search'];
            foreach ($_GET as $key => $value) {
                if (!in_array($key, $reserved) && preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $key)) {
                    $where[] = "`$key` = ?";
                    $params[] = $value;
                }
            }

            $orderClause = buildOrderClause($order);
            $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';
            $limitClause = $limit ? "LIMIT $limit OFFSET $offset" : '';

            $sql  = "SELECT * FROM `$table` $whereClause $orderClause $limitClause";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            $results = $stmt->fetchAll();
            $formatted = array_map('formatRow', $results);
            echo json_encode($formatted);
        } else {
            // Single record
            $stmt = $db->prepare("SELECT * FROM `$table` WHERE id = ? LIMIT 1");
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) { http_response_code(404); echo json_encode(['error' => 'Not found']); exit; }
            echo json_encode(formatRow($row));
        }
        break;

    // ── CREATE  POST /entities/{Entity} ──────────────────────────────────────
    case 'POST':
        // Auto-set owner field for personal entities
        if (!empty($config['owner_field'])) {
            $body[$config['owner_field']] = $userUid;
        }
        $body['created_at'] = date('c');
        $body['updated_at'] = date('c');

        [$cols, $placeholders, $vals] = buildInsert($body);
        $stmt = $db->prepare("INSERT INTO `$table` ($cols) VALUES ($placeholders)");
        $stmt->execute($vals);
        $newId = $db->lastInsertId();

        $stmt = $db->prepare("SELECT * FROM `$table` WHERE id = ?");
        $stmt->execute([$newId]);
        http_response_code(201);
        echo json_encode(formatRow($stmt->fetch()));
        break;

    // ── UPDATE  PUT /entities/{Entity}/{id} ───────────────────────────────────
    case 'PUT':
    case 'PATCH':
        if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID required']); exit; }

        $body['updated_at'] = date('c');
        unset($body['id'], $body['created_at']); // prevent overwriting

        [$setClauses, $vals] = buildUpdate($body);
        $vals[] = $id;
        $stmt = $db->prepare("UPDATE `$table` SET $setClauses WHERE id = ?");
        $stmt->execute($vals);

        $stmt = $db->prepare("SELECT * FROM `$table` WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(formatRow($stmt->fetch()));
        break;

    // ── DELETE  DELETE /entities/{Entity}/{id} ─────────────────────────────────
    case 'DELETE':
        if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID required']); exit; }

        $stmt = $db->prepare("DELETE FROM `$table` WHERE id = ?");
        $stmt->execute([$id]);
        http_response_code(204);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRow(array $row): array {
    $jsonFields = ['images', 'specifications', 'tags', 'shipping_address', 'items'];
    foreach ($jsonFields as $field) {
        if (isset($row[$field]) && is_string($row[$field])) {
            $row[$field] = json_decode($row[$field], true);
        }
    }
    // Map backend fields to what the frontend expects
    if (isset($row['stock'])) {
        $row['stock_quantity'] = (int)$row['stock'];
    }
    if (isset($row['rating'])) {
        $row['average_rating'] = (float)$row['rating'];
    }
    if (isset($row['created_at'])) {
        $row['created_date'] = $row['created_at'];
    }
    return $row;
}

function buildInsert(array $data): array {
    $cols         = implode(', ', array_map(fn($k) => "`$k`", array_keys($data)));
    $placeholders = implode(', ', array_fill(0, count($data), '?'));
    return [$cols, $placeholders, array_values($data)];
}

function buildUpdate(array $data): array {
    $setClauses = implode(', ', array_map(fn($k) => "`$k` = ?", array_keys($data)));
    return [$setClauses, array_values($data)];
}

function buildOrderClause(string $order): string {
    if (!$order) return 'ORDER BY id DESC';
    $dir    = str_starts_with($order, '-') ? 'DESC' : 'ASC';
    $column = ltrim($order, '-');
    if ($column === 'created_date') {
        $column = 'created_at';
    }
    // Whitelist safe column names
    if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $column)) return 'ORDER BY id DESC';
    return "ORDER BY `$column` $dir";
}

function isAdminUser(PDO $db, ?string $uid): bool {
    if (!$uid) return false;
    $stmt = $db->prepare('SELECT role FROM users WHERE firebase_uid = ? LIMIT 1');
    $stmt->execute([$uid]);
    $row = $stmt->fetch();
    return $row && $row['role'] === 'admin';
}
