#!/usr/bin/env pwsh
# Wrapper for the Supabase CLI that scopes SUPABASE_DB_PASSWORD to THIS repo only.
#
# Why: the global (User-scope) SUPABASE_DB_PASSWORD env var is shared across every
# Supabase project on the machine. Set it for one project and it silently breaks (or
# worse, silently succeeds against the wrong database for) every other project. This
# wrapper reads the password from a repo-local, gitignored file and sets it only in
# this child process's environment -- it never touches the global env var.
#
# Setup (one time): create .supabase-db-password next to this script's repo root,
# containing just the database password, no trailing newline. See
# .supabase-db-password.example.
#
# Usage: .\scripts\sb.ps1 migration list
#        .\scripts\sb.ps1 db push

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$passwordFile = Join-Path $repoRoot ".supabase-db-password"

if (-not (Test-Path $passwordFile)) {
    Write-Error "Missing $passwordFile -- copy .supabase-db-password.example to .supabase-db-password and fill in this project's database password (Dashboard -> Settings -> Database)."
    exit 1
}

$password = (Get-Content $passwordFile -Raw).Trim()
if ([string]::IsNullOrEmpty($password)) {
    Write-Error "$passwordFile is empty."
    exit 1
}

$env:SUPABASE_DB_PASSWORD = $password
& supabase @args
