Add-Type -AssemblyName System.Drawing

$src = "C:\Users\berni\.gemini\antigravity\brain\76349a7c-84cf-4cf5-84d2-621e63e0ab8a\media__1780805813510.png"
$img = [System.Drawing.Image]::FromFile($src)

$width = $img.Width
$height = $img.Height

$cropHeight = [math]::Floor($height * 0.75)
$size = [math]::Min($width, $cropHeight)
$startX = [math]::Max(0, [math]::Floor(($width - $size) / 2))

$rect = New-Object System.Drawing.Rectangle($startX, 0, $size, $size)
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $size, $size)), $rect, [System.Drawing.GraphicsUnit]::Pixel)

$icon192 = New-Object System.Drawing.Bitmap($bmp, 192, 192)
$icon512 = New-Object System.Drawing.Bitmap($bmp, 512, 512)

$icon192.Save("d:\ARHAT POS\apps\web\public\icons\icon-192x192.png", [System.Drawing.Imaging.ImageFormat]::Png)
$icon512.Save("d:\ARHAT POS\apps\web\public\icons\icon-512x512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$icon512.Save("d:\ARHAT POS\apps\web\src\app\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
$icon192.Dispose()
$icon512.Dispose()
$img.Dispose()

Write-Host "Icons cropped successfully"
