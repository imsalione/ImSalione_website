<?php
/**
 * =======================================================
 * 🔒 GitHub Contributions API - Fixed Version
 * Author: ImSalione
 * =======================================================
 * ✅ FIXED: Better error handling and response format
 * =======================================================
 */

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't display errors in output

// CORS headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/**
 * Send JSON response
 */
function sendResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    exit;
}

/**
 * Send error response
 */
function sendError($message, $code = 500) {
    sendResponse([
        'error' => $message,
        'success' => false
    ], $code);
}

// Load environment variables from .env
$env_path = realpath(__DIR__ . '/../.env');
if (!$env_path || !file_exists($env_path)) {
    sendError('.env file not found at: ' . dirname(__DIR__) . '/.env');
}

$lines = file($env_path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
foreach ($lines as $line) {
    $line = trim($line);
    if (empty($line) || strpos($line, '#') === 0) continue;
    
    $parts = explode('=', $line, 2);
    if (count($parts) === 2) {
        $name = trim($parts[0]);
        $value = trim($parts[1]);
        if (!getenv($name)) {
            putenv("$name=$value");
        }
    }
}

// Get configuration
$username = isset($_GET['username']) ? trim($_GET['username']) : 'ImSalione';
$token = getenv('GITHUB_TOKEN');

if (!$token || empty($token)) {
    sendError('GitHub token not configured in .env file');
}

// Validate username
if (!preg_match('/^[a-zA-Z0-9-]+$/', $username)) {
    sendError('Invalid username format', 400);
}

// GraphQL query
$query = <<<'GRAPHQL'
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}
GRAPHQL;

// Prepare request
$postData = json_encode([
    'query' => $query,
    'variables' => ['username' => $username]
]);

// Initialize cURL
$ch = curl_init('https://api.github.com/graphql');

if ($ch === false) {
    sendError('Failed to initialize cURL');
}

curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'User-Agent: ImSalione-Portfolio',
        "Authorization: Bearer {$token}",
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS => $postData,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_TIMEOUT => 10,
]);

// Check for cacert.pem
$cacertPath = __DIR__ . '/cacert.pem';
if (file_exists($cacertPath)) {
    curl_setopt($ch, CURLOPT_CAINFO, $cacertPath);
}

// Execute request
$response = curl_exec($ch);

// Check for cURL errors
if (curl_errno($ch)) {
    $error = curl_error($ch);
    curl_close($ch);
    sendError("cURL Error: {$error}");
}

$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// Check HTTP status
if ($httpCode !== 200) {
    sendError("GitHub API returned HTTP {$httpCode}", $httpCode);
}

// Parse response
$data = json_decode($response, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    sendError('Failed to parse GitHub response: ' . json_last_error_msg());
}

// Check for GraphQL errors
if (isset($data['errors']) && is_array($data['errors'])) {
    $errorMsg = $data['errors'][0]['message'] ?? 'Unknown GraphQL error';
    sendError("GitHub API Error: {$errorMsg}");
}

// Validate response structure
if (!isset($data['data']['user']['contributionsCollection']['contributionCalendar']['weeks'])) {
    sendError('Invalid response structure from GitHub API');
}

// Extract contributions
$weeks = $data['data']['user']['contributionsCollection']['contributionCalendar']['weeks'];
$totalContributions = $data['data']['user']['contributionsCollection']['contributionCalendar']['totalContributions'];

$contributions = [];

foreach ($weeks as $week) {
    if (isset($week['contributionDays']) && is_array($week['contributionDays'])) {
        foreach ($week['contributionDays'] as $day) {
            $contributions[] = [
                'date' => $day['date'],
                'contributionCount' => (int)$day['contributionCount']
            ];
        }
    }
}

// Send success response
sendResponse([
    'success' => true,
    'username' => $username,
    'contributions' => $contributions,
    'total' => $totalContributions,
    'count' => count($contributions)
]);
?>