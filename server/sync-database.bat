@echo off
echo ========================================
echo    Database Synchronization Script
echo ========================================
echo.

REM Set your PostgreSQL connection details here
set PGHOST=localhost
set PGPORT=5432
set PGDATABASE=your_database_name
set PGUSER=your_username
set PGPASSWORD=your_password

echo Running complete database synchronization...
echo.

REM Run the SQL script
psql -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -U %PGUSER% -f complete-database-sync.sql

echo.
echo ========================================
echo    Synchronization Complete!
echo ========================================
echo.
echo Your database should now be perfectly synced with all required tables.
echo.
pause








