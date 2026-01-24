$source = "g:\New folder\City-Of-Truth-Ministries\City-Of-Truth-Ministries-1ac902a573eaba9b0f22cda159528bf8d7b37506\New folder\New folder\Ministry"
$dest = "g:\New folder\City-Of-Truth-Ministries\City-Of-Truth-Ministries-1ac902a573eaba9b0f22cda159528bf8d7b37506\public\ministry"

# Create destination directory if it doesn't exist
if (!(Test-Path -Path $dest)) {
    New-Item -ItemType Directory -Path $dest -Force | Out-Null
    Write-Host "Created directory: $dest"
}

# Get all files
$files = Get-ChildItem -Path $source

# Select 40 images (jpg/jpeg/png)
$images = $files | Where-Object { $_.Extension -match "\.(jpg|jpeg|png)$" } | Select-Object -First 40

# Select all videos (mp4) - user said "some videos", assuming fairly low count so taking all reasonable ones
$videos = $files | Where-Object { $_.Extension -match "\.mp4$" } | Select-Object -First 10

# Copy Images
foreach ($img in $images) {
    Copy-Item -Path $img.FullName -Destination $dest -Force
    Write-Host "Copied Image: $($img.Name)"
}

# Copy Videos
foreach ($vid in $videos) {
    Copy-Item -Path $vid.FullName -Destination $dest -Force
    Write-Host "Copied Video: $($vid.Name)"
}

Write-Host "Asset migration complete. $($images.Count) images and $($videos.Count) videos copied."
