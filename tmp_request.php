<?php
$data = json_encode(['order_ref' => 'ORD-676E30F503', 'paid' => 'false']);
$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\nAccept: application/json",
        'content' => $data,
        'ignore_errors' => true,
    ],
]);
$result = file_get_contents('http://127.0.0.1:8010/api/order-payment.php', false, $context);
echo $result;
