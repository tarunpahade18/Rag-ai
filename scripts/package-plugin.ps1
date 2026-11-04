$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$source = Join-Path $root "plugin-package"
$output = Join-Path $root "llmlite-plugin.zip"

if (-not (Test-Path $source)) {
  throw "Missing plugin-package directory at $source"
}

if (Test-Path $output) {
  Remove-Item -LiteralPath $output -Force
}

Compress-Archive -Path (Join-Path $source "*") -DestinationPath $output -Force

Write-Output "Created $output"
