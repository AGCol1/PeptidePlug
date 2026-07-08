<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

require __DIR__ . '/../includes/config.php';
require __DIR__ . '/../includes/db.php';

try {
    $category = $_GET['category'] ?? null;

    if ($category) {
        $stmt = $pdo->prepare('SELECT * FROM products WHERE active = 1 AND category = :cat ORDER BY name ASC');
        $stmt->execute([':cat' => $category]);
    } else {
        $stmt = $pdo->query('SELECT * FROM products WHERE active = 1 ORDER BY name ASC');
    }

    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['success' => true, 'products' => $products]);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
    exit;
}
