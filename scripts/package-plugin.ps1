$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = Split-Path -Parent $PSScriptRoot
$source = Join-Path $root "plugin-package"
$output = Join-Path $root "llmlite-plugin.zip"

if (-not (Test-Path $source)) {
  throw "Missing plugin-package directory at $source"
}

if (Test-Path $output) {
  Remove-Item -LiteralPath $output -Force
}

$zip = [System.IO.Compression.ZipFile]::Open(
  $output,
  [System.IO.Compression.ZipArchiveMode]::Create
)

try {
  Get-ChildItem -LiteralPath $source -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Substring($source.Length + 1).Replace("\", "/")

    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
      $zip,
      $_.FullName,
      $relativePath,
      [System.IO.Compression.CompressionLevel]::Optimal
    ) | Out-Null
  }
}
finally {
  $zip.Dispose()
}

Write-Output "Created $output"
