-- Fix Production Database - Add Missing Job Columns
-- Run this SQL directly on your production database

-- Check if columns exist and add them if they don't
DO $$
BEGIN
    -- Add role column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jobs' AND column_name = 'role') THEN
        ALTER TABLE jobs ADD COLUMN role VARCHAR(255);
        RAISE NOTICE 'Added role column';
    ELSE
        RAISE NOTICE 'role column already exists';
    END IF;

    -- Add industrytype column (PostgreSQL converts to lowercase)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jobs' AND column_name = 'industrytype') THEN
        ALTER TABLE jobs ADD COLUMN industrytype VARCHAR(255);
        RAISE NOTICE 'Added industrytype column';
    ELSE
        RAISE NOTICE 'industrytype column already exists';
    END IF;

    -- Add rolecategory column (PostgreSQL converts to lowercase)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jobs' AND column_name = 'rolecategory') THEN
        ALTER TABLE jobs ADD COLUMN rolecategory VARCHAR(255);
        RAISE NOTICE 'Added rolecategory column';
    ELSE
        RAISE NOTICE 'rolecategory column already exists';
    END IF;

    -- Add employmenttype column (PostgreSQL converts to lowercase)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'jobs' AND column_name = 'employmenttype') THEN
        ALTER TABLE jobs ADD COLUMN employmenttype VARCHAR(255);
        RAISE NOTICE 'Added employmenttype column';
    ELSE
        RAISE NOTICE 'employmenttype column already exists';
    END IF;
END $$;

-- Test the schema
SELECT id, title, role, industrytype, rolecategory, employmenttype 
FROM jobs 
LIMIT 1;
