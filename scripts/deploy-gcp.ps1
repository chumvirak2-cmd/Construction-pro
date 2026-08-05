$ErrorActionPreference = 'Stop'

function Read-Required($message) {
  $value = Read-Host $message
  if ([string]::IsNullOrWhiteSpace($value)) {
    throw "$message is required"
  }
  return $value
}

$command = Get-Command gcloud -ErrorAction SilentlyContinue
if (-not $command) {
  throw 'gcloud CLI is not installed. Install Google Cloud CLI, then run this script again.'
}

$service = $env:GCP_SERVICE_NAME
if ([string]::IsNullOrWhiteSpace($service)) {
  $service = 'construction-pro'
}

$projectId = $env:GCP_PROJECT_ID
if ([string]::IsNullOrWhiteSpace($projectId)) {
  $projectId = (gcloud config get-value project 2>$null)
}
if ([string]::IsNullOrWhiteSpace($projectId)) {
  $projectId = Read-Required 'Google Cloud project ID'
}

$region = $env:GCP_REGION
if ([string]::IsNullOrWhiteSpace($region)) {
  $region = 'asia-southeast1'
}

$baseUrl = $env:NEXT_PUBLIC_BASE_URL
$useCustomBaseUrl = -not [string]::IsNullOrWhiteSpace($baseUrl)
if (-not $useCustomBaseUrl) {
  $baseUrl = 'http://localhost:3000'
}

$credentialsFile = $env:GOOGLE_SHEETS_CREDENTIALS_FILE
if ([string]::IsNullOrWhiteSpace($credentialsFile)) {
  $credentialsFile = Read-Required 'Path to google-sheets-credentials.json'
}
if (-not (Test-Path -LiteralPath $credentialsFile)) {
  throw "Google Sheets credentials file not found: $credentialsFile"
}

$spreadsheetIdFile = $env:GOOGLE_SHEETS_SPREADSHEET_ID_FILE
if ([string]::IsNullOrWhiteSpace($spreadsheetIdFile)) {
  $spreadsheetIdFile = Read-Required 'Path to google-sheets-spreadsheet-id.txt'
}
if (-not (Test-Path -LiteralPath $spreadsheetIdFile)) {
  throw "Google Sheets spreadsheet ID file not found: $spreadsheetIdFile"
}

gcloud secrets describe GOOGLE_SHEETS_CREDENTIALS --project $projectId >$null 2>&1
if ($LASTEXITCODE -ne 0) {
  gcloud secrets create GOOGLE_SHEETS_CREDENTIALS --data-file=$credentialsFile --project $projectId
} else {
  gcloud secrets versions add GOOGLE_SHEETS_CREDENTIALS --data-file=$credentialsFile --project $projectId
}

gcloud secrets describe GOOGLE_SHEETS_SPREADSHEET_ID --project $projectId >$null 2>&1
if ($LASTEXITCODE -ne 0) {
  gcloud secrets create GOOGLE_SHEETS_SPREADSHEET_ID --data-file=$spreadsheetIdFile --project $projectId
} else {
  gcloud secrets versions add GOOGLE_SHEETS_SPREADSHEET_ID --data-file=$spreadsheetIdFile --project $projectId
}

gcloud run deploy $service `
  --source . `
  --region $region `
  --project $projectId `
  --allow-unauthenticated `
  --set-build-env-vars "NEXT_PUBLIC_BASE_URL=$baseUrl" `
  --set-secrets "GOOGLE_SHEETS_CREDENTIALS=GOOGLE_SHEETS_CREDENTIALS:latest,GOOGLE_SHEETS_SPREADSHEET_ID=GOOGLE_SHEETS_SPREADSHEET_ID:latest"

$deployedUrl = (gcloud run services describe $service --region $region --project $projectId --format 'value(status.url)' 2>$null)
if (-not $useCustomBaseUrl -and -not [string]::IsNullOrWhiteSpace($deployedUrl)) {
  gcloud run deploy $service `
    --source . `
    --region $region `
    --project $projectId `
    --allow-unauthenticated `
    --set-build-env-vars "NEXT_PUBLIC_BASE_URL=$deployedUrl" `
    --set-secrets "GOOGLE_SHEETS_CREDENTIALS=GOOGLE_SHEETS_CREDENTIALS:latest,GOOGLE_SHEETS_SPREADSHEET_ID=GOOGLE_SHEETS_SPREADSHEET_ID:latest"
}

Write-Host "Web portal URL: $deployedUrl"
