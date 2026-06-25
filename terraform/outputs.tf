output "function_url" {
  description = "Public URL for the deployed WiFi QR generator"
  value       = aws_lambda_function_url.wifi_qr_url.function_url
}

output "function_name" {
  value = aws_lambda_function.wifi_qr.function_name
}
