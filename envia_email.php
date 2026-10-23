<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';
require 'PHPMailer/Exception.php';

$mail = new PHPMailer(true);

try {
    // Configurações do servidor SMTP
    $mail->isSMTP();
    $mail->Host = 'smtp0101.titan.email';
    $mail->SMTPAuth = true;
    $mail->Username = 'contato@prosperusconsultoria.com'; // Substitua
    $mail->Password = 'Agronomia40@';         // Substitua
    $mail->SMTPSecure = 'ssl';
    $mail->Port = 465;

    // Remetente e destinatário
    $mail->setFrom('contato@prosperusconsultoria.com', 'Prosperu\'s');
    $mail->addAddress('contato@prosperusconsultoria.com'); // Destinatário (pode ser o mesmo do remetente)

    // Conteúdo
    $mail->isHTML(true);
    $mail->Subject = 'Nova mensagem do site';

    // Dados do formulário
    $nome = $_POST['nome'] ?? '';
    $email = $_POST['email'] ?? '';
    $telefone = $_POST['telefone'] ?? '';
    $mensagem = $_POST['mensagem'] ?? '';

    $mail->Body = "
        <strong>Nome:</strong> {$nome}<br>
        <strong>E-mail:</strong> {$email}<br>
        <strong>Telefone:</strong> {$telefone}<br>
        <strong>Mensagem:</strong><br>{$mensagem}
    ";

    $mail->send();
    echo "Mensagem enviada com sucesso!";
} catch (Exception $e) {
    echo "Erro ao enviar a mensagem: {$mail->ErrorInfo}";
}
