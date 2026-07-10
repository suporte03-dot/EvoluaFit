$dir = Join-Path $PSScriptRoot "public\assets\sports"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$headers = @{ "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
$images = [ordered]@{
  "futebol" = "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=900"
  "futebol-2" = "https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg?auto=compress&cs=tinysrgb&w=900"
  "futebol-3" = "https://images.pexels.com/photos/3621100/pexels-photo-3621100.jpeg?auto=compress&cs=tinysrgb&w=900"
  "basquete" = "https://images.pexels.com/photos/2886244/pexels-photo-2886244.jpeg?auto=compress&cs=tinysrgb&w=900"
  "basquete-2" = "https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=900"
  "basquete-3" = "https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=900"
  "volei" = "https://images.pexels.com/photos/1618760/pexels-photo-1618760.jpeg?auto=compress&cs=tinysrgb&w=900"
  "formula1" = "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=900"
  "lutas" = "https://images.pexels.com/photos/703014/pexels-photo-703014.jpeg?auto=compress&cs=tinysrgb&w=900"
  "tenis" = "https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=900"
  "atletismo" = "https://images.pexels.com/photos/3764013/pexels-photo-3764013.jpeg?auto=compress&cs=tinysrgb&w=900"
  "olimpicos" = "https://images.pexels.com/photos/1205291/pexels-photo-1205291.jpeg?auto=compress&cs=tinysrgb&w=900"
  "radicais" = "https://images.pexels.com/photos/163407/surfing-sport-sea-wave-163407.jpeg?auto=compress&cs=tinysrgb&w=900"
  "hero" = "https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=1200"
  "fallback" = "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=900"
}
$log = Join-Path $PSScriptRoot "download-sports.log"
"" | Set-Content $log
foreach ($entry in $images.GetEnumerator()) {
  $out = Join-Path $dir "$($entry.Key).jpg"
  try {
    Invoke-WebRequest -Uri $entry.Value -OutFile $out -Headers $headers -UseBasicParsing
    $len = (Get-Item $out).Length
    "OK $($entry.Key) $len" | Add-Content $log
  } catch {
    "FAIL $($entry.Key) $($_.Exception.Message)" | Add-Content $log
  }
}
Get-ChildItem $dir | Sort-Object Name | ForEach-Object { "$($_.Name) $($_.Length)" } | Add-Content $log
