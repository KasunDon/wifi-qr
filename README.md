# WiFi QR Code Generator

A tiny, free, stateless web app that turns a WiFi network name and password into a QR code. Scan it with an **iPhone** (Camera app) or **Android** phone (Camera / Google Lens) and the device joins the network automatically — no typing required.

- No accounts, no database, no tracking.
- Network credentials are processed in memory only and are never logged, stored, or persisted.
- Runs locally with Node.js, and deploys to AWS Lambda's free tier with Terraform.

## How it works

The app encodes your network details into the standard WiFi QR payload format:

```
WIFI:T:WPA;S:<ssid>;P:<password>;H:<true|false>;;
```

Both iOS and Android camera apps recognize this format natively and prompt the user to join the network — that's the auto-connect behavior, no app install required on the scanning device.

## Project structure

```
app.js          Express app (routes + QR generation) — shared by local and Lambda
server.js       Local dev entrypoint (node server.js)
lambda.js       AWS Lambda entrypoint (wraps app.js with serverless-http)
public/         Static frontend (HTML/CSS/JS), Terms, Privacy Policy
terraform/      Infrastructure as code for the AWS Lambda free-tier deployment
```

## Run locally

Requirements: Node.js 18+.

```bash
npm install
npm start
```

Then open http://localhost:3000

## End-to-end tests (Cypress)

Regression coverage lives in `cypress/e2e/` and runs against a live local server:

```bash
npm install
npm run test:e2e   # starts the server, runs Cypress headlessly, then exits
```

Or, with the server already running (`npm start`) in another terminal:

```bash
npm run cypress:run    # headless
npm run cypress:open   # interactive runner
```

Suites:

- `home.cy.js` — page loads, form fields render, navigation to/from legal pages.
- `generate.cy.js` — happy-path QR generation for WPA, open, and hidden networks; password show/hide; download link.
- `validation.cy.js` — regression coverage for required-field validation, missing password on secured networks, the consent gate (client + server), and the malicious-content filter (links/script-like SSID or password rejected, both via the UI and direct API calls).
- `legal.cy.js` — Terms & Conditions and Privacy Policy render with the expected liability/acceptable-use/no-storage language.

These run automatically on every push via GitHub Actions (`.github/workflows/e2e.yml`).

## Deploy to AWS Lambda (free tier) with Terraform

The app deploys as a single Lambda function exposed via a **Lambda Function URL** (no API Gateway), which keeps it fully inside AWS's always-free tier:

- Lambda: 1,000,000 free requests/month + 400,000 GB-seconds of compute
- Function URLs: no additional charge beyond the Lambda invocation itself

Requirements: Terraform >= 1.5, AWS credentials configured (`aws configure`), Node.js + npm available locally (used by Terraform to install production dependencies into the deployment package).

```bash
cd terraform
terraform init
terraform apply
```

Terraform will print `function_url` — open it in a browser to use the live app.

To tear everything down:

```bash
terraform destroy
```

### Why this is optimal for the free tier

- `memory_size = 128` MB — the smallest Lambda allows, and plenty for generating a small PNG.
- `timeout = 5` seconds — QR generation takes milliseconds; this just guards against hangs.
- Only production dependencies (`express`, `qrcode`, `serverless-http`) are packaged — `npm install --omit=dev` keeps the deployment zip small for fast cold starts.
- No API Gateway, no RDS, no S3 bucket — a single Lambda function with a Function URL is the entire footprint.
- CloudWatch log retention is capped at 7 days to avoid unbounded log storage costs.

## Privacy & data handling

This app does not store generated QR codes, network names, or passwords anywhere. Each request is processed in memory and discarded once the response is sent. See [`public/privacy.html`](public/privacy.html) for full details, and [`public/terms.html`](public/terms.html) for terms of use and liability disclaimers.

## License

MIT — free to use, modify, and self-host.
