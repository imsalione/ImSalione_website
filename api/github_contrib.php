<?php
/**
 * =======================================================
 *  🔒 Secure GitHub Contribution Fetcher (Local Version)
 *  Author: ImSalione
 * =======================================================
 */

// 1. Load environment variables from .env file
$env_path = realpath(__DIR__ . '/../.env');
if ($env_path && file_exists($env_path)) {
    $lines = file($env_path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = array_map('trim', explode('=', $line, 2));
        if (!getenv($name)) putenv("$name=$value");
    }
}

// 2. Read token and target username
$username = 'imsalione';
$token = getenv('GITHUB_TOKEN');

// 3. GitHub API request
$url = "https://api.github.com/users/{$username}/repos";
$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => array_filter([
        'User-Agent: ImSalione-LocalDev',
        $token ? "Authorization: token {$token}" : null
    ]),
]);
$response = curl_exec($ch);

// 4. Error handling
if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(['error' => curl_error($ch)]);
    curl_close($ch);
    exit;
}
curl_close($ch);

// 5. Decode and output response
$data = json_decode($response, true);
if (is_array($data)) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
} else {
    echo json_encode(['error' => 'Invalid response from GitHub API']);
}
?>
