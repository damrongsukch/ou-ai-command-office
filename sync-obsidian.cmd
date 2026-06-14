@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\sync-obsidian.ps1" -Direction Both
pause
