<?php
// Usage: php scripts/create_admin.php username password
require __DIR__ . '/../includes/config.php';
require __DIR__ . '/../includes/db.php';

$argvUsername = $argv[1] ?? null;
$argvPassword = $argv[2] ?? null;

if (!$argvUsername || !$argvPassword) {
    echo "Usage: php scripts/create_admin.php username password\n";
    exit(1);
}

$username = trim($argvUsername);
$password = $argvPassword;

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare('SELECT id FROM admin_users WHERE username = :u LIMIT 1');
$stmt->execute([':u' => $username]);
if ($stmt->fetch()) {
    echo "User already exists\n";
    exit(1);
}

$insert = $pdo->prepare('INSERT INTO admin_users (username, password_hash) VALUES (:u, :p)');
$insert->execute([':u' => $username, ':p' => $hash]);

echo "Created admin user: {$username}\n";
