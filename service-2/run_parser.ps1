# run_parser.ps1
# 1) переходим в папку проекта
Set-Location "C:\Users\Hamza\OneDrive\Desktop\Notes of Hamza\Programming\Projects\Specula"

# 2) грузим переменные из .env (только для этой сессии)
Get-Content .env | ForEach-Object {
    if ($_ -and $_ -notmatch '^#') {
        $n,$v = $_ -split '=',2
        [System.Environment]::SetEnvironmentVariable($n, $v, 'Process')
    }
}

# 3) задаём размер партии (чтобы не останавливался на 1000 сообщений)
$env:BATCH_SIZE = "10000"

# 4) запускаем процессор
py -3 processor_min.py --groups all
