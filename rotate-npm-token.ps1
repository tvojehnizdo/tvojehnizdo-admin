param(
  [string]$Repo,
  [string]$VercelProject,
  [string]$VercelTeam,
  [string]$NpmToken
)

# GitHub secrets
$NpmToken | gh secret set NPM_TOKEN --repo $Repo --body -
foreach ($e in "production","preview","development") {
  $NpmToken | gh secret set NPM_TOKEN --repo $Repo -e $e --body -
}

# Vercel env (rm staré -> add nové)
$commonArgs = @("--token", $env:VERCEL_TOKEN)
if ($VercelTeam -and $VercelTeam.Trim() -ne "") { $commonArgs += @("--scope", $VercelTeam) }

vercel env rm NPM_TOKEN development -y --project $VercelProject @commonArgs 2>$null | Out-Null
vercel env rm NPM_TOKEN preview     -y --project $VercelProject @commonArgs 2>$null | Out-Null
vercel env rm NPM_TOKEN production  -y --project $VercelProject @commonArgs 2>$null | Out-Null

$NpmToken | vercel env add NPM_TOKEN development --project $VercelProject @commonArgs | Out-Null
$NpmToken | vercel env add NPM_TOKEN preview     --project $VercelProject @commonArgs | Out-Null
$NpmToken | vercel env add NPM_TOKEN production  --project $VercelProject @commonArgs | Out-Null

# Redeploy prod, aby se nové ENV načetly
vercel deploy --prod --yes --project $VercelProject @commonArgs