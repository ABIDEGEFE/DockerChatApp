$files = @('backend', 'frontend', 'compose.yml', 'Dockerfile.backend', 'Dockerfile.frontend')
$ErrorActionPreference = "Stop"

for($i = 0; $i -lt $files.Length; $i++) {
    if ($i -eq 0 -or $i -eq 1) {
        New-Item -Path . -Name $files[$i] -ItemType Directory -Force
    } else {
        New-Item -Path . -Name $files[$i] -ItemType File -Force
    }
    write-output $i
}