$apiKey = "AIzaSyDCNYiFj5GFMOwBSvf50O5GEsnW400CiRA"
$uri = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$apiKey"
$body = @{
    contents = @(
        @{
            parts = @(
                @{
                    text = "Say hello"
                }
            )
        }
    )
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-RestMethod -Uri $uri -Method POST -ContentType "application/json" -Body $body
    Write-Host "API Key is working!" -ForegroundColor Green
    Write-Host "Response: $($response.candidates[0].content.parts[0].text)" -ForegroundColor Yellow
} catch {
    Write-Host "API Key test failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
