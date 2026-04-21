<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$name = trim($input['name'] ?? '');
$email = trim($input['email'] ?? '');
$message = trim($input['message'] ?? '');
$page = trim($input['page'] ?? '');

if ($name === '' || $email === '' || $message === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit;
}

$botToken = '8737764645:AAEyPfx3zbhTUVfzGDSvSPE9mRqn4giG0_0';
$chatId = '-1003946516905';

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
        'header' => "Content-Type: application/json\r\n",
        'method' => 'POST',
        'content' => json_encode($data),
        'ignore_errors' => true
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to contact Telegram']);
    exit;
}

$responseData = json_decode($result, true);

if (!$responseData || empty($responseData['ok'])) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $responseData['description'] ?? 'Telegram API error'
    ]);
    exit;
}

echo json_encode(['success' => true, 'message' => 'Support request sent']);