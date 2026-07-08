<?php
require __DIR__ . '/includes/config.php';
require __DIR__ . '/includes/db.php';
$stmt = $pdo->query('SELECT order_ref, paid FROM orders ORDER BY id DESC LIMIT 5');
foreach ($stmt as $row) {
    echo $row['order_ref'] . ' | ' . $row['paid'] . PHP_EOL;
}
