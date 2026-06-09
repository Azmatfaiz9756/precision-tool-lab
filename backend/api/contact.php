<?php
// ─── Contact Message Endpoint ─────────────────────────────────────────────────
// POST /contact — anyone can submit (no auth required)
// GET  /contact — admin only, list all messages

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$db     = getDB();

switch ($method) {
    case 'POST':
        // Public endpoint — no auth required to submit contact form
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $name    = trim($body['name']    ?? '');
        $email   = trim($body['email']   ?? '');
        $subject = trim($body['subject'] ?? '');
        $message = trim($body['message'] ?? '');

        if (!$name || !$email || !$message) {
            http_response_code(400);
            echo json_encode(['error' => 'name, email, and message are required']);
            exit;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid email address']);
            exit;
        }

        $stmt = $db->prepare(
            'INSERT INTO contact_messages (name, email, subject, message, status, created_at)
             VALUES (?, ?, ?, ?, "unread", NOW())'
        );
        $stmt->execute([$name, $email, $subject, $message]);
        $newId = $db->lastInsertId();

        http_response_code(201);
        echo json_encode(['id' => $newId, 'success' => true, 'message' => 'Message received']);
        break;

    case 'GET':
        requireAdmin();
        $status = $_GET['status'] ?? null;
        $limit  = (int)($_GET['limit']  ?? 50);
        $offset = (int)($_GET['offset'] ?? 0);

        if ($status) {
            $stmt = $db->prepare('SELECT * FROM contact_messages WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?');
            $stmt->execute([$status, $limit, $offset]);
        } else {
            $stmt = $db->prepare('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT ? OFFSET ?');
            $stmt->execute([$limit, $offset]);
        }

        echo json_encode($stmt->fetchAll());
        break;

    case 'PATCH':
        // Admin: mark message as read/replied
        requireAdmin();
        $id   = $id ?? null;
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID required']); exit; }

        $stmt = $db->prepare('UPDATE contact_messages SET status = ?, updated_at = NOW() WHERE id = ?');
        $stmt->execute([$body['status'] ?? 'read', $id]);
        echo json_encode(['success' => true]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
