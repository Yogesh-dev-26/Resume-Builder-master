param(
    [int]$Port = 8080,
    [string]$Root = $PSScriptRoot
)

$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "Server running at $prefix"
    Write-Host "Serving files from: $Root"
    Write-Host "Press Ctrl+C to stop."

    $mimeTypes = @{
        ".html" = "text/html; charset=utf-8"
        ".htm"  = "text/html; charset=utf-8"
        ".css"  = "text/css; charset=utf-8"
        ".js"   = "application/javascript; charset=utf-8"
        ".json" = "application/json; charset=utf-8"
        ".png"  = "image/png"
        ".jpg"  = "image/jpeg"
        ".jpeg" = "image/jpeg"
        ".gif"  = "image/gif"
        ".svg"  = "image/svg+xml"
        ".ico"  = "image/x-icon"
        ".webp" = "image/webp"
        ".woff" = "font/woff"
        ".woff2"= "font/woff2"
        ".ttf"  = "font/ttf"
    }

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawUrl = $request.Url.LocalPath
        $urlPath = [System.Uri]::UnescapeDataString($rawUrl).TrimStart('/')
        if ([string]::IsNullOrEmpty($urlPath)) {
            $urlPath = "index.html"
        }

        $localPath = [System.IO.Path]::Combine($Root, $urlPath.Replace('/', [System.IO.Path]::DirectorySeparatorChar))

        if (Test-Path $localPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $contentType = "application/octet-stream"
            if ($mimeTypes.ContainsKey($ext)) {
                $contentType = $mimeTypes[$ext]
            }

            try {
                $bytes = [System.IO.File]::ReadAllBytes($localPath)
                $response.ContentType = $contentType
                $response.ContentLength64 = $bytes.Length
                $response.StatusCode = 200
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            }
            catch {
                $response.StatusCode = 500
            }
        }
        else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
            $response.ContentType = "text/plain; charset=utf-8"
            $response.ContentLength64 = $msg.Length
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }

        $response.Close()
    }
}
finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
    $listener.Close()
}
