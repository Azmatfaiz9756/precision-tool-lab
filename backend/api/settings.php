<?php
// ─── Store Settings Endpoint ──────────────────────────────────────────────────
// GET  /settings        — public endpoint, returns all settings
// PUT  /settings        — admin only, update settings

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

switch ($method) {
    case 'GET':
        // Public: no auth required
        $stmt = $db->query('SELECT setting_key, setting_value FROM settings');
        $rows = $stmt->fetchAll();

        $settings = [];
        foreach ($rows as $row) {
            $decoded = json_decode($row['setting_value'], true);
            $settings[$row['setting_key']] = $decoded !== null ? $decoded : $row['setting_value'];
        }

        echo json_encode($settings);
        break;

    case 'PUT':
    case 'PATCH':
        requireAdmin();
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        foreach ($body as $key => $value) {
            if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $key)) continue; // whitelist keys
            $encoded = json_encode($value);
            $stmt = $db->prepare(
                'INSERT INTO settings (setting_key, setting_value, updated_at)
                 VALUES (?, ?, NOW())
                 ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = NOW()'
            );
            $stmt->execute([$key, $encoded]);
        }

        echo json_encode(['success' => true, 'updated' => count($body)]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
