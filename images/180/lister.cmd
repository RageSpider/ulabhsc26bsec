@echo off
setlocal EnableDelayedExpansion
title Enhanced File Lister
color 0A

:: --- CONFIGURATION ---
set "OutputFile=file_list.txt"
:: ---------------------

cls
echo ========================================================
echo   ENHANCED FILE LISTER
echo ========================================================
echo.
echo  Current Directory:
echo  %CD%
echo.
echo  What would you like to put BEFORE the file names?
echo  (Examples: "C:\MyFiles\", "1. ", ">> ", or leave empty)
echo.

:AskInput
set "UserPrefix="
set /p "UserPrefix=Type prefix here > "

:: If the output file already exists, delete it to start fresh
if exist "%OutputFile%" del "%OutputFile%"

echo.
echo  Processing...

:: Loop through all files and folders in the current directory
for /f "delims=" %%F in ('dir /b') do (
    
    :: Check to ensure we don't list this script itself or the output file
    if /i not "%%F"=="%~nx0" (
        if /i not "%%F"=="%OutputFile%" (
            
            :: Write the Prefix + Filename to the text file
            echo !UserPrefix!%%F>> "%OutputFile%"
        )
    )
)

echo.
echo  Done! List saved to "%OutputFile%"
echo  Opening list now...

:: Automatically open the text file
start "" "%OutputFile%"

pause