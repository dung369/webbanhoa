# Script để loại bỏ tất cả AnimatedText
$files = @(
    "d:\New folder (7)\webbanhoa\app\about\page.tsx",
    "d:\New folder (7)\webbanhoa\app\contact\page.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Replace simple AnimatedText with text attribute
        $content = $content -replace '<AnimatedText\s+text="([^"]*)"[^>]*\s*/>', '$1'
        
        # Replace complex AnimatedText patterns
        $content = $content -replace '<AnimatedText\s+text=\{([^}]*)\}[^>]*\s*/>', '{$1}'
        
        # Replace multiline AnimatedText 
        $content = $content -replace '<AnimatedText[^>]*text="([^"]*)"[^>]*>', '$1'
        $content = $content -replace '<AnimatedText[^>]*text=\{([^}]*)\}[^>]*>', '{$1}'
        
        Set-Content $file $content -NoNewline
        Write-Host "Updated: $file"
    }
}