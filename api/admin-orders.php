<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');


require __DIR__ . '/../includes/config.php';
require __DIR__ . '/../includes/db.php';
require __DIR__ . '/../includes/admin-auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $ordersStmt = $pdo->query('SELECT * FROM orders ORDER BY created_at DESC');
    $orders = $ordersStmt->fetchAll(PDO::FETCH_ASSOC);

    $itemStmt = $pdo->prepare('SELECT * FROM order_items WHERE order_id = :order_id');

    foreach ($orders as &$order) {
        $itemStmt->execute([':order_id' => $order['id']]);
        $order['items'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode(['success' => true, 'orders' => $orders]);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to retrieve orders.']);
    exit;
}
