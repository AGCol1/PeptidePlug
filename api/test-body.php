<?php
header('Content-Type: application/json');
$raw = file_get_contents('php://input');
echo json_encode(['method' => $_SERVER['REQUEST_METHOD'] ?? null, 'raw' => $raw, 'decoded' => json_decode($raw, true)]);
