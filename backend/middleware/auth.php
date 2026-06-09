<?php
// ─── Auth Middleware ──────────────────────────────────────────────────────────
// Extracts and verifies the Firebase ID token from the Authorization header.
// Populates $GLOBALS['auth_user'] with the token payload on success.

require_once __DIR__ . '/../config/firebase.php';

/**
 * Require a valid Firebase ID token.
 * Terminates with 401 if missing or invalid.
 * Returns the decoded token payload.
 */
function requireAuth(): array {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
        http_response_code(401);
        echo json_encode(['error' => 'Authorization header missing or invalid']);
        exit;
    }

    $token = substr($authHeader, 7);

    try {
        $payload = verifyFirebaseToken($token);
        $GLOBALS['auth_user'] = $payload;
        return $payload;
    } catch (RuntimeException $e) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token: ' . $e->getMessage()]);
        exit;
    }
}

/**
 * Optionally authenticate — returns payload if token present and valid, else null.
 * Use for endpoints that work for both guests and logged-in users.
 */
function optionalAuth(): ?array {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
        return null;
    }

    $token = substr($authHeader, 7);
    try {
        $payload = verifyFirebaseToken($token);
        $GLOBALS['auth_user'] = $payload;
        return $payload;
    } catch (RuntimeException $e) {
        return null;
    }
}

/**
 * Require the logged-in user to have admin role.
 * Checks the `role` column in the users table.
 */
function requireAdmin(): array {
    $payload = requireAuth();

    require_once __DIR__ . '/../config/database.php';
    $db   = getDB();
    $stmt = $db->prepare('SELECT role FROM users WHERE firebase_uid = ? LIMIT 1');
    $stmt->execute([$payload['sub']]);
    $row  = $stmt->fetch();

    if (!$row || $row['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Admin access required']);
        exit;
    }

    return $payload;
}
