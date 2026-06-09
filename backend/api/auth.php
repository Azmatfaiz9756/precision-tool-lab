<?php
// ─── Auth Endpoint ────────────────────────────────────────────────────────────
// POST /auth/sync  — sync Firebase user to MySQL users table (called on first login)
// GET  /auth/me    — return current user's profile from MySQL

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $segments[1] ?? ''; // e.g. 'me', 'sync'

switch ("$method:$action") {
    // ── GET /auth/me ──────────────────────────────────────────────────────────
    case 'GET:me':
        $payload = requireAuth();
        $db      = getDB();

        $stmt = $db->prepare('SELECT id, firebase_uid, email, name, photo_url, role, created_at FROM users WHERE firebase_uid = ? LIMIT 1');
        $stmt->execute([$payload['sub']]);
        $user = $stmt->fetch();

        if (!$user) {
            // Auto-create user record on first access
            $user = autoCreateUser($db, $payload);
        }

        echo json_encode($user);
        break;

    // ── POST /auth/sync ───────────────────────────────────────────────────────
    // Call this from frontend after login to ensure user exists in MySQL
    case 'POST:sync':
        $payload = requireAuth();
        $body    = json_decode(file_get_contents('php://input'), true) ?? [];
        $db      = getDB();

        $stmt = $db->prepare('SELECT id FROM users WHERE firebase_uid = ? LIMIT 1');
        $stmt->execute([$payload['sub']]);
        $existing = $stmt->fetch();

        if ($existing) {
            // Update name/photo if changed
            $stmt = $db->prepare('UPDATE users SET name = ?, photo_url = ?, updated_at = NOW() WHERE firebase_uid = ?');
            $stmt->execute([
                $body['name']      ?? $payload['name']    ?? null,
                $body['photo_url'] ?? $payload['picture'] ?? null,
                $payload['sub']
            ]);
            $stmt = $db->prepare('SELECT id, firebase_uid, email, name, photo_url, role, created_at FROM users WHERE firebase_uid = ?');
            $stmt->execute([$payload['sub']]);
            echo json_encode($stmt->fetch());
        } else {
            $user = autoCreateUser($db, $payload, $body);
            echo json_encode($user);
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(['error' => 'Auth endpoint not found']);
}

// ─── Helper ────────────────────────────────────────────────────────────────────
function autoCreateUser(PDO $db, array $payload, array $extra = []): array {
    $uid      = $payload['sub'];
    $email    = $payload['email']   ?? $extra['email']    ?? '';
    $name     = $extra['name']      ?? $payload['name']   ?? explode('@', $email)[0];
    $photoUrl = $extra['photo_url'] ?? $payload['picture'] ?? null;
    $role     = 'user'; // First user can be promoted to admin manually

    $stmt = $db->prepare(
        'INSERT INTO users (firebase_uid, email, name, photo_url, role, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())'
    );
    $stmt->execute([$uid, $email, $name, $photoUrl, $role]);
    $newId = $db->lastInsertId();

    return [
        'id'          => (int) $newId,
        'firebase_uid'=> $uid,
        'email'       => $email,
        'name'        => $name,
        'photo_url'   => $photoUrl,
        'role'        => $role,
        'created_at'  => date('c'),
    ];
}
