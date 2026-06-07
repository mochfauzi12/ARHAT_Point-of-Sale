Add-Type -AssemblyName System.Drawing

$src = "C:\Users\berni\.gemini\antigravity\brain\76349a7c-84cf-4cf5-84d2-621e63e0ab8a\media__1780834435216.png"
$img = [System.Drawing.Image]::FromFile($src)

$icon192 = New-Object System.Drawing.Bitmap($img, 192, 192)
$icon512 = New-Object System.Drawing.Bitmap($img, 512, 512)

$icon192.Save("d:\ARHAT POS\apps\web\public\icons\icon-192x192.png", [System.Drawing.Imaging.ImageFormat]::Png)
$icon512.Save("d:\ARHAT POS\apps\web\public\icons\icon-512x512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$icon512.Save("d:\ARHAT POS\apps\web\src\app\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)

$icon192.Dispose()
$icon512.Dispose()
$img.Dispose()

Write-Host "Icons resized and saved successfully"
