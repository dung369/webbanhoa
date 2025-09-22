# PowerShell script to remove AnimatedText components
$files = @(
    "d:\New folder (7)\webbanhoa\app\page.tsx",
    "d:\New folder (7)\webbanhoa\app\products\page.tsx", 
    "d:\New folder (7)\webbanhoa\app\about\page.tsx",
    "d:\New folder (7)\webbanhoa\app\contact\page.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Remove import statement
        $content = $content -replace 'import AnimatedText from "@/components/animated-text";\r?\n', ''
        
        # Replace single line AnimatedText components
        $content = $content -replace '<AnimatedText\s+text="([^"]*)"[^>]*\s*/>', '$1'
        
        # Replace multi-line AnimatedText components (simple cases)
        $content = $content -replace '<AnimatedText[^>]*text="([^"]*)"[^>]*>', '$1'
        $content = $content -replace '<AnimatedText[^>]*>\s*([^<]*)\s*</AnimatedText>', '$1'
        
        Set-Content $file $content -NoNewline
        Write-Host "Updated: $file"
    }
}