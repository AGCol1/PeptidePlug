<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

require __DIR__ . '/../includes/config.php';
require __DIR__ . '/../includes/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = [];
}

$orderRef = trim((string)($input['order_ref'] ?? ''));
$rawPaid = $input['paid'] ?? '';

if (is_bool($rawPaid)) {
    $paid = $rawPaid ? 'true' : 'false';
} elseif (is_int($rawPaid)) {
    $paid = $rawPaid > 0 ? 'true' : 'false';
} elseif (is_string($rawPaid)) {
    $normalizedPaid = strtolower(trim($rawPaid));

    if ($normalizedPaid === 'paid' || $normalizedPaid === 'true' || $normalizedPaid === '1') {
        $paid = 'true';
    } elseif ($normalizedPaid === 'unpaid' || $normalizedPaid === 'false' || $normalizedPaid === '0' || $normalizedPaid === 'no') {
        $paid = 'false';
    } elseif ($normalizedPaid === 'pending' || $normalizedPaid === 'awaiting') {
        $paid = 'pending';
    } else {
        $paid = '';
    }
} else {
    $paid = '';
}

if ($orderRef === '' || !in_array($paid, ['true', 'false', 'pending'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid order reference or payment status.']);
    exit;
}

$update = $pdo->prepare('UPDATE orders SET paid = :paid WHERE order_ref = :order_ref');
$update->execute([':paid' => $paid, ':order_ref' => $orderRef]);

if ($update->rowCount() === 0) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Order not found.']);
    exit;
}

echo json_encode(['success' => true]);
