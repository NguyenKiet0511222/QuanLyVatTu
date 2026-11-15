@echo off
title QuanLyVatTu - Backend Spring Boot
echo ===================================================
echo     DANG KHOI CHAY BACKEND SPRING BOOT (PORT 8081)
echo ===================================================
cd /d "%~dp0Backend"
if exist "C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot" (
    set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot"
    set "PATH=C:\Program Files\Eclipse Adoptium\jdk-17.0.16.8-hotspot\bin;%PATH%"
)
if exist "C:\Program Files\JetBrains\IntelliJ IDEA 2025.3.3\plugins\maven\lib\maven3\bin\mvn.cmd" (
    call "C:\Program Files\JetBrains\IntelliJ IDEA 2025.3.3\plugins\maven\lib\maven3\bin\mvn.cmd" spring-boot:run
) else (
    call mvn spring-boot:run
)
pause
