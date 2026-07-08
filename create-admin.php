<?php
require __DIR__ . '/includes/config.php';
require __DIR__ . '/includes/db.php';

$username = $argv[1] ?? 'adminuser';
$password = $argv[2] ?? 'StrongPassword123';

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare('SELECT id FROM admin_users WHERE username = :u LIMIT 1');
$stmt->execute([':u' => $username]);

if ($stmt->fetch()) {
    echo "User already exists\n";
    exit;
}

$insert = $pdo->prepare('INSERT INTO admin_users (username, password_hash) VALUES (:u, :p)');
$insert->execute([':u' => $username, ':p' => $hash]);

echo "Created admin user: {$username}\n";
