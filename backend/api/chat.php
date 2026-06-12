<?php
require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

function callGemini($prompt, $apiKey) {
    $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=' . $apiKey;
    
    $data = [
        'contents' => [
            [
                'parts' => [
                    ['text' => $prompt]
                ]
            ]
        ],
        'generationConfig' => [
            'temperature' => 0.2
        ]
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        throw new Exception("Gemini API Error: " . $response);
    }

    $result = json_decode($response, true);
    if (!isset($result['candidates'][0]['content']['parts'][0]['text'])) {
        throw new Exception("Invalid Gemini response structure");
    }

    return trim($result['candidates'][0]['content']['parts'][0]['text']);
}

try {
    $pdo = getDB();

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Method not allowed');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $userMessage = $input['message'] ?? '';
    
    if (empty($userMessage)) {
        echo json_encode(['text' => 'Please ask me a question!']);
        exit;
    }

    // 1. Get settings
    $stmt = $pdo->query("SELECT setting_key, setting_value FROM settings");
    $settings = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }

    $apiKey = $settings['gemini_api_key'] ?? '';
    if (empty($apiKey)) {
        echo json_encode(['text' => "I'm sorry, my AI brain (Gemini API Key) hasn't been configured yet! Please ask the admin to set it up."]);
        exit;
    }

    // Pass 1: Intent Detection
    $intentPrompt = "You are the TSTTOOLS intent parser.
Determine if the user is looking to search or buy a product, or if they are asking a general question/greeting.
User message: \"$userMessage\"
Reply with ONLY a JSON object exactly like this, no markdown backticks:
{\"intent\": \"search\", \"query\": \"corrected english search terms for the product\"}
OR
{\"intent\": \"general\"}
";

    $intentResponse = callGemini($intentPrompt, $apiKey);
    
    // Clean up response if Gemini added markdown backticks
    $intentResponse = preg_replace('/```json|```/', '', $intentResponse);
    $intentData = json_decode(trim($intentResponse), true);

    $finalPrompt = "";

    if (isset($intentData['intent']) && $intentData['intent'] === 'search') {
        $searchQuery = $intentData['query'] ?? '';
        
        // Search the DB
        $words = explode(' ', $searchQuery);
        $conditions = [];
        $params = [];
        foreach ($words as $word) {
            if (strlen($word) > 2) {
                $conditions[] = "(name LIKE ? OR description LIKE ?)";
                $params[] = "%$word%";
                $params[] = "%$word%";
            }
        }
        
        $productsContext = "No matching products found.";
        
        if (count($conditions) > 0) {
            $sql = "SELECT id, name, price, stock FROM products WHERE " . implode(' AND ', $conditions) . " LIMIT 5";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (count($products) > 0) {
                $productsContext = "Found these products in the database:\n";
                foreach ($products as $p) {
                    $stock = $p['stock'] > 0 ? "In Stock" : "Out of Stock";
                    $productsContext .= "- {$p['name']} (Price: AED {$p['price']}, Status: $stock, Link ID: {$p['id']})\n";
                }
            }
        }

        $finalPrompt = "You are the helpful AI assistant for TSTTOOLS (a phone repair tools shop in Dubai).
User asked: \"$userMessage\"
$productsContext

Your job is to reply to the user nicely. If products were found, list them clearly with their prices and stock status. If no products were found, suggest they browse our categories or contact us. Keep it concise, friendly, and use markdown formatting. Use emojis.";
    } else {
        // General Q&A
        $finalPrompt = "You are the helpful AI assistant for TSTTOOLS (a phone repair tools shop in Dubai).
Here is the store info:
- Name: " . ($settings['store_name'] ?? 'TSTTOOLS') . "
- Address: " . ($settings['store_address'] ?? 'Dubai') . "
- Phone/WhatsApp: " . ($settings['store_phone'] ?? '') . "
- Shipping: AED " . ($settings['shipping_cost'] ?? '20') . " (Free over AED " . ($settings['free_shipping_threshold'] ?? '200') . "). Same day in Dubai.
- Hours: " . ($settings['store_hours'] ?? '9 AM to 9 PM') . "

User asked: \"$userMessage\"
Answer the user's question directly based on the store info provided. Be friendly, concise, use emojis and markdown.";
    }

    $finalAnswer = callGemini($finalPrompt, $apiKey);
    
    echo json_encode(['text' => $finalAnswer]);

} catch (Exception $e) {
    echo json_encode(['text' => "Oops, I'm having trouble thinking right now! Error: " . $e->getMessage()]);
}
