<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

require __DIR__ . '/../includes/config.php';
require __DIR__ . '/../includes/db.php';
require __DIR__ . '/../includes/admin-auth.php';

$method = $_SERVER['REQUEST_METHOD'];

// Use $_POST for form uploads and fall back to JSON body for API calls
$isMultipart = str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'multipart/form-data');
$input = $isMultipart ? $_POST : (json_decode(file_get_contents('php://input'), true) ?: []);

try {
    if ($method === 'GET') {
        $stmt = $pdo->query('SELECT * FROM products ORDER BY created_at DESC');
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'products' => $products]);
        exit;
    }

    if ($method === 'POST') {
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        $name = trim($input['name'] ?? '');
        $slug = trim($input['slug'] ?? '');
        $price = isset($input['price']) ? (float)$input['price'] : 0;
        $category = trim($input['category'] ?? '');
        $short = trim($input['short_description'] ?? '');
        $desc = trim($input['description'] ?? '');
        $image = trim($input['image'] ?? '');
        $active = !empty($input['active']) ? 1 : 0;

        if ($isMultipart && isset($_FILES['productImageFile']) && $_FILES['productImageFile']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../assets/images/uploads';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $fileTmp = $_FILES['productImageFile']['tmp_name'];
            $fileName = basename($_FILES['productImageFile']['name']);
            $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

            if (in_array($extension, $allowed, true)) {
                $newName = sprintf('product-%s-%s.%s', time(), bin2hex(random_bytes(6)), $extension);
                $destination = $uploadDir . '/' . $newName;

                if (move_uploaded_file($fileTmp, $destination)) {
                    $image = '/assets/images/uploads/' . $newName;
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file.']);
                    exit;
                }
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Invalid image file type.']);
                exit;
            }
        }

        if ($name === '' || $slug === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Name and slug required']);
            exit;
        }

        if ($id > 0) {
            $fields = ['slug','name','description','short_description','category','price','image','active'];
            $setSql = [];
            $params = [':id' => $id];

            foreach ($fields as $f) {
                if ($f === 'image' && $image === '') {
                    continue;
                }
                $setSql[] = "{$f} = :{$f}";
                $params[":{$f}"] = ${$f};
            }

            if (empty($setSql)) {
                echo json_encode(['success' => false, 'message' => 'Nothing to update']);
                exit;
            }

            $sql = 'UPDATE products SET ' . implode(', ', $setSql) . ' WHERE id = :id';
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            echo json_encode(['success' => true]);
            exit;
        }

        $stmt = $pdo->prepare('INSERT INTO products (slug, name, description, short_description, category, price, image, active) VALUES (:slug, :name, :desc, :short, :cat, :price, :image, :active)');
        $stmt->execute([
            ':slug' => $slug,
            ':name' => $name,
            ':desc' => $desc,
            ':short' => $short,
            ':cat' => $category,
            ':price' => $price,
            ':image' => $image,
            ':active' => $active,
        ]);

        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        exit;
    }

    if ($method === 'PUT') {
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid product id']);
            exit;
        }

        $fields = ['slug','name','description','short_description','category','price','image','active'];
        $setSql = [];
        $params = [':id' => $id];

        foreach ($fields as $f) {
            if (array_key_exists($f, $input)) {
                $setSql[] = "{$f} = :{$f}";
                $params[":{$f}"] = $input[$f];
            }
        }

        if (empty($setSql)) {
            echo json_encode(['success' => false, 'message' => 'Nothing to update']);
            exit;
        }

        $sql = 'UPDATE products SET ' . implode(', ', $setSql) . ' WHERE id = :id';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode(['success' => true]);
        exit;
    }

    if ($method === 'DELETE') {
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid product id']);
            exit;
        }

        $stmt = $pdo->prepare('DELETE FROM products WHERE id = :id');
        $stmt->execute([':id' => $id]);

        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error']);
    exit;
}
