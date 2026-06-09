<?php
// ─── Firebase Token Verifier ──────────────────────────────────────────────────
// Verifies Firebase ID tokens WITHOUT requiring the Firebase Admin PHP SDK.
// Uses Firebase's public keys fetched from Google's JWKS endpoint.
//
// Requirements: PHP 7.4+, openssl extension enabled (standard on all hosts).

define('FIREBASE_PROJECT_ID', getenv('FIREBASE_PROJECT_ID') ?: 'your-project-id');
define('FIREBASE_JWKS_URL', 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');

/**
 * Verify a Firebase ID token and return the decoded payload.
 * Returns the payload array on success, or throws an exception on failure.
 */
function verifyFirebaseToken(string $idToken): array {
    // Split JWT into parts
    $parts = explode('.', $idToken);
    if (count($parts) !== 3) {
        throw new RuntimeException('Invalid token format');
    }

    [$headerB64, $payloadB64, $signatureB64] = $parts;

    // Decode header to get key ID (kid)
    $header = json_decode(base64url_decode($headerB64), true);
    if (!$header || !isset($header['kid'])) {
        throw new RuntimeException('Invalid token header');
    }

    // Decode payload
    $payload = json_decode(base64url_decode($payloadB64), true);
    if (!$payload) {
        throw new RuntimeException('Invalid token payload');
    }

    // Basic validation
    $now = time();
    if (($payload['exp'] ?? 0) < $now) {
        throw new RuntimeException('Token expired');
    }
    if (($payload['iat'] ?? 0) > $now + 300) {
        throw new RuntimeException('Token issued in the future');
    }
    if (($payload['aud'] ?? '') !== FIREBASE_PROJECT_ID) {
        throw new RuntimeException('Invalid token audience');
    }
    if (($payload['iss'] ?? '') !== 'https://securetoken.google.com/' . FIREBASE_PROJECT_ID) {
        throw new RuntimeException('Invalid token issuer');
    }

    // Fetch Google public certificates (cached in APCu/file for 1 hour)
    $certs = getFirebasePublicCerts();
    $kid   = $header['kid'];

    if (!isset($certs[$kid])) {
        throw new RuntimeException('Unknown key ID in token');
    }

    // Verify signature
    $publicKey = openssl_get_publickey($certs[$kid]);
    if (!$publicKey) {
        throw new RuntimeException('Failed to load public key');
    }

    $dataToVerify = $headerB64 . '.' . $payloadB64;
    $signature    = base64url_decode($signatureB64);

    $valid = openssl_verify($dataToVerify, $signature, $publicKey, OPENSSL_ALGO_SHA256);
    if ($valid !== 1) {
        throw new RuntimeException('Invalid token signature');
    }

    return $payload;
}

/**
 * Fetch Firebase's public X.509 certificates with caching.
 */
function getFirebasePublicCerts(): array {
    // Try APCu cache first (available on most PHP hosts)
    if (function_exists('apcu_fetch')) {
        $cached = apcu_fetch('firebase_public_certs', $success);
        if ($success) return $cached;
    }

    // Fallback: file-based cache in sys_get_temp_dir()
    $cacheFile = sys_get_temp_dir() . '/firebase_certs.json';
    if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < 3600) {
        $data = json_decode(file_get_contents($cacheFile), true);
        if ($data) return $data;
    }

    // Fetch fresh certs from Google
    $response = @file_get_contents(FIREBASE_JWKS_URL);
    if (!$response) {
        throw new RuntimeException('Failed to fetch Firebase public certificates');
    }
    $certs = json_decode($response, true);
    if (!$certs) {
        throw new RuntimeException('Invalid Firebase certificate response');
    }

    // Cache results
    if (function_exists('apcu_store')) {
        apcu_store('firebase_public_certs', $certs, 3600);
    }
    file_put_contents($cacheFile, json_encode($certs));

    return $certs;
}

/**
 * URL-safe base64 decode.
 */
function base64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
}
