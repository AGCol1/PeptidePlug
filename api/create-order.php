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

$fullName = trim($input['full_name'] ?? '');
$email = trim($input['email'] ?? '');
$addressLine1 = trim($input['address_line_1'] ?? '');
$addressLine2 = trim($input['address_line_2'] ?? '');
$city = trim($input['city'] ?? '');
$postcode = trim($input['postcode'] ?? '');
$country = trim($input['country'] ?? '');
$shippingInstructions = trim($input['shipping_instructions'] ?? '');
$items = $input['items'] ?? [];
$amount = $input['amount'] ?? 0;

if ($fullName === '' || $email === '' || $addressLine1 === '' || $city === '' || $postcode === '' || $country === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please provide a valid name, email and shipping address.']);
    exit;
}

if (!is_array($items) || count($items) === 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Order must contain at least one item.']);
    exit;
}

$calculatedTotal = 0;
foreach ($items as $item) {
    $rawPrice = $item['price'] ?? 0;
    if (is_numeric($rawPrice)) {
        $itemPrice = (float) $rawPrice;
    } else {
        $clean = preg_replace('/[^0-9\.\-]/', '', (string)$rawPrice);
        $itemPrice = $clean === '' ? 0.0 : (float) $clean;
    }
    $itemQty = isset($item['qty']) ? (int) $item['qty'] : 0;
    $calculatedTotal += $itemPrice * $itemQty;
}

if (!is_numeric($amount) || is_nan((float)$amount)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid order amount supplied.']);
    exit;
}

$amount = round((float)$amount, 2);
$calculatedTotal = round($calculatedTotal, 2);

if ($amount !== $calculatedTotal) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Order total does not match items.']);
    exit;
}

$orderRef = 'ORD-' . strtoupper(bin2hex(random_bytes(5)));

try {
    $pdo->beginTransaction();

    $orderStmt = $pdo->prepare(
        'INSERT INTO orders (order_ref, full_name, email, address_line_1, address_line_2, city, postcode, country, shipping_instructions, amount, paid)
         VALUES (:order_ref, :full_name, :email, :address_line_1, :address_line_2, :city, :postcode, :country, :shipping_instructions, :amount, :paid)'
    );

    $orderStmt->execute([
        ':order_ref' => $orderRef,
        ':full_name' => $fullName,
        ':email' => $email,
        ':address_line_1' => $addressLine1,
        ':address_line_2' => $addressLine2,
        ':city' => $city,
        ':postcode' => $postcode,
        ':country' => $country,
        ':shipping_instructions' => $shippingInstructions,
        ':amount' => $amount,
        ':paid' => 'false'
    ]);

    $orderId = $pdo->lastInsertId();

    $itemStmt = $pdo->prepare(
        'INSERT INTO order_items (order_id, product_id, variant_id, product_name, quantity, price)
         VALUES (:order_id, :product_id, :variant_id, :product_name, :quantity, :price)'
    );

    foreach ($items as $item) {
        $rawPrice = $item['price'] ?? 0;
        if (is_numeric($rawPrice)) {
            $storePrice = (float) $rawPrice;
        } else {
            $clean = preg_replace('/[^0-9\.\-]/', '', (string)$rawPrice);
            $storePrice = $clean === '' ? 0.0 : (float) $clean;
        }

        $itemStmt->execute([
            ':order_id' => $orderId,
            ':product_id' => $item['product_id'] ?? null,
            ':variant_id' => $item['variantId'] ?? $item['variant_id'] ?? null,
            ':product_name' => $item['name'] ?? '',
            ':quantity' => isset($item['qty']) ? (int)$item['qty'] : 1,
            ':price' => $storePrice,
        ]);
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'orderRef' => $orderRef,
        'orderId' => $orderId,
        'amount' => number_format($amount, 2, '.', '')
    ]);
    exit;
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to create order.']);
    exit;
}
