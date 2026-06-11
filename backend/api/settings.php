<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

header('Content-Type: application/json');

try {
    $pdo = getDB();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Fetch all settings (public read)
        $stmt = $pdo->query("SELECT setting_key, setting_value FROM settings");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $settings = [];
        foreach ($rows as $row) {
            $val = $row['setting_value'];
            // Attempt to JSON decode if it's a JSON string, otherwise keep string
            $decoded = json_decode($val, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $settings[$row['setting_key']] = $decoded;
            } else {
                $settings[$row['setting_key']] = $val;
            }
        }
        echo json_encode($settings);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        requireAdmin(); // Ensure only admins can update settings
        // Update settings (expects a JSON object of key-value pairs)
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || !is_array($input)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON input']);
            exit;
        }

        $pdo->beginTransaction();
        $stmt = $pdo->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");

        foreach ($input as $key => $value) {
            // Store as JSON string if array/object, else plain string
            if (is_array($value) || is_object($value)) {
                $valStr = json_encode($value);
            } elseif (is_bool($value)) {
                $valStr = $value ? 'true' : 'false';
            } else {
                $valStr = (string)$value;
            }
            $stmt->execute([$key, $valStr]);
        }

        $pdo->commit();
        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
