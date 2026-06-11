<?php
// ─── Main API Router ──────────────────────────────────────────────────────────
// Entry point for all API requests. Routes to the correct endpoint handler.
// 
// URL structure: /api/{resource}[/{id}]
// Supported resources: products, orders, cart, reviews, wishlist, users, settings, contact, auth

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');          // Restrict to your domain in production
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Parse path  — strip /api prefix added by .htaccess rewrite
$requestUri  = $_SERVER['REQUEST_URI'];
$scriptPath  = dirname($_SERVER['SCRIPT_NAME']);
$path        = str_replace($scriptPath, '', parse_url($requestUri, PHP_URL_PATH));
$path        = trim($path, '/');
$segments    = explode('/', $path);

$resource = $segments[0] ?? '';
$id       = $segments[1] ?? null;

// Merge query params
$queryParams = [];
parse_str(parse_url($requestUri, PHP_URL_QUERY) ?? '', $queryParams);

// Route to handler
switch ($resource) {
    case 'auth':
        require __DIR__ . '/api/auth.php';
        break;
    case 'products':
    case 'entities':
        // entities/{EntityName}[/{id}] — generic entity routing
        $entityName = $segments[1] ?? 'Product';
        $entityId   = $segments[2] ?? null;
        require __DIR__ . '/api/entities.php';
        break;
    case 'orders':
        require __DIR__ . '/api/orders.php';
        break;
    case 'cart':
        require __DIR__ . '/api/cart.php';
        break;
    case 'settings':
        require __DIR__ . '/api/settings.php';
        break;
    case 'contact':
        require __DIR__ . '/api/contact.php';
        break;
    case 'chat':
        require __DIR__ . '/api/chat.php';
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => "Unknown resource: $resource"]);
        break;
}
