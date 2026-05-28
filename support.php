<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

require __DIR__ . '/includes/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);

    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$message = trim($input['message'] ?? '');
$page = trim($input['page'] ?? '');

if ($name === '' || $email === '' || $message === '') {

    http_response_code(400);

    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields'
    ]);

    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

    http_response_code(400);

    echo json_encode([
        'success' => false,
        'message' => 'Invalid email address'
    ]);

    exit;
}

$botToken = $_ENV['TELEGRAM_BOT_TOKEN'] ?? '';
$chatId = $_ENV['TELEGRAM_CHAT_ID'] ?? '';

if (!$botToken || !$chatId) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Server configuration error'
    ]);

    exit;
}

$text = "New support request\n\n"
      . "Name: {$name}\n"
      . "Email: {$email}\n"
      . "Page: {$page}\n"
      . "Message:\n{$message}";

$url = "https://api.telegram.org/bot{$botToken}/sendMessage";

$data = [
    'chat_id' => $chatId,
    'text' => $text
];

$options = [
    'http' => [
        'header' => "Content-type: application/x-www-form-urlencoded\r\n",
        'method' => 'POST',
        'content' => http_build_query($data),
    ]
];

$context = stream_context_create($options);

$result = file_get_contents($url, false, $context);

if ($result === FALSE) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Failed to send message'
    ]);

    exit;
}

echo json_encode([
    'success' => true
]);
