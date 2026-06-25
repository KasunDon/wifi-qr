terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Installs production-only dependencies into a clean build directory so the
# deployment package stays small (matters for Lambda's free-tier 512MB
# /tmp and cold-start time, and avoids shipping devDependencies).
resource "null_resource" "install_deps" {
  triggers = {
    package_json_hash = filesha256("${path.module}/../package.json")
    app_js_hash        = filesha256("${path.module}/../app.js")
    lambda_js_hash      = filesha256("${path.module}/../lambda.js")
  }

  provisioner "local-exec" {
    command = <<-EOT
      set -e
      rm -rf ${path.module}/build
      mkdir -p ${path.module}/build
      cp ${path.module}/../app.js ${path.module}/../lambda.js ${path.module}/../package.json ${path.module}/build/
      cp -r ${path.module}/../public ${path.module}/build/public
      cd ${path.module}/build
      npm install --omit=dev --no-audit --no-fund
    EOT
  }
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/build"
  output_path = "${path.module}/build.zip"

  depends_on = [null_resource.install_deps]
}

resource "aws_iam_role" "lambda_exec" {
  name = "${var.function_name}-exec-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_logs" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${var.function_name}"
  retention_in_days = 7
}

resource "aws_lambda_function" "wifi_qr" {
  function_name = var.function_name
  role          = aws_iam_role.lambda_exec.arn
  handler       = "lambda.handler"
  runtime       = "nodejs20.x"

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  memory_size = 128
  timeout     = 5

  depends_on = [aws_cloudwatch_log_group.lambda_logs]
}

# Function URL avoids API Gateway charges entirely — Lambda invocations and
# compute stay within the always-free tier (1M requests / 400,000 GB-s).
resource "aws_lambda_function_url" "wifi_qr_url" {
  function_name      = aws_lambda_function.wifi_qr.function_name
  authorization_type = "NONE"
}
