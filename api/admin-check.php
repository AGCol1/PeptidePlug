<?php
header('Content-Type: application/json');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!empty($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true) {
    echo json_encode(['success' => true, 'username' => $_SESSION['admin_user'] ?? null]);
    exit;
}

http_response_code(401);
echo json_encode(['success' => false]);
