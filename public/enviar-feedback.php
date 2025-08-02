<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get JSON data
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    // Sanitize inputs
    $nome = strip_tags(trim($data["name"]));
    $assunto = strip_tags(trim($data["subject"]));
    $mensagem = trim($data["message"]);
    
    // Validate required fields
    if (empty($nome) || empty($assunto) || empty($mensagem)) {
        http_response_code(400);
        echo json_encode(["error" => "Todos os campos são obrigatórios"]);
        exit();
    }
    
    $destinatario = "josuealberios@gmail.com";
    $assunto_email = "Feedback Ituber: " . $assunto;
    
    $conteudo = "Novo feedback recebido no Ituber\n\n";
    $conteudo .= "Nome: $nome\n";
    $conteudo .= "Assunto: $assunto\n\n";
    $conteudo .= "Mensagem:\n$mensagem\n\n";
    $conteudo .= "---\n";
    $conteudo .= "Enviado através do formulário de feedback do Ituber";
    
    $headers = "From: noreply@seudominio.com\r\n";
    $headers .= "Reply-To: noreply@seudominio.com\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    if (mail($destinatario, $assunto_email, $conteudo, $headers)) {
        echo json_encode(["success" => true, "message" => "Email enviado com sucesso"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Erro ao enviar email"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Método não permitido"]);
}
?>