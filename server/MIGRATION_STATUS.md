# Migration Status for Interview System

## Overview
This document outlines the migration files and database schema changes needed for the interview scheduling system to work properly.

## Required Migrations (in order)

### 1. Core Tables (Already exist)
- `20250810113820-interviews.js` - Creates the interviews table
- `20250810113813-notifications.js` - Creates the notifications table

### 2. New Migrations (Added for deployment)

#### `20250910201643-add-interview-notification-types.js`
- **Purpose**: Adds interview-related notification types to the enum
- **Changes**: 
  - Adds `interview_scheduled` to enum_notifications_type
  - Adds `interview_cancelled` to enum_notifications_type  
  - Adds `interview_reminder` to enum_notifications_type
- **Status**: ✅ Ready for deployment

#### `20250910202000-add-missing-interview-fields.js`
- **Purpose**: Adds missing fields to interviews table that are in the model but not in the original migration
- **Changes**:
  - Adds `employer_id` (UUID, references users)
  - Adds `job_id` (UUID, references jobs)
  - Adds `title` (STRING)
  - Adds `description` (TEXT)
  - Adds `timezone` (STRING, default 'UTC')
  - Adds `interviewers` (JSONB, default [])
  - Adds `agenda` (JSONB, default [])
  - Adds `requirements` (JSONB, default {})
  - Adds `next_round_details` (JSONB, default {})
  - Adds `reminder_sent` (BOOLEAN, default false)
  - Adds `reminder_sent_at` (DATE)
  - Adds `cancelled_by` (UUID, references users)
  - Adds `cancelled_at` (DATE)
  - Adds `cancellation_reason` (TEXT)
  - Adds `metadata` (JSONB, default {})
- **Status**: ✅ Ready for deployment

#### `20250910202100-add-missing-notification-fields.js`
- **Purpose**: Adds missing fields to notifications table that are in the model but not in the original migration
- **Changes**:
  - Adds `short_message` (STRING(200))
  - Adds `is_email_sent` (BOOLEAN, default false)
  - Adds `is_sms_sent` (BOOLEAN, default false)
  - Adds `is_push_sent` (BOOLEAN, default false)
  - Adds `icon` (STRING)
  - Adds `image` (STRING)
  - Adds `metadata` (JSONB, default {})
  - Adds `read_at` (DATE)
  - Adds `scheduled_at` (DATE)
  - Adds `sent_at` (DATE)
- **Status**: ✅ Ready for deployment

## Database Schema Alignment

### Interviews Table
The interviews table will have these columns after migrations:
- `id` (UUID, PK)
- `job_application_id` (UUID, FK to job_applications)
- `requirement_application_id` (UUID, FK to applications)
- `interviewer_id` (UUID, FK to users)
- `candidate_id` (UUID, FK to users)
- `employer_id` (UUID, FK to users) - **NEW**
- `job_id` (UUID, FK to jobs) - **NEW**
- `title` (STRING) - **NEW**
- `description` (TEXT) - **NEW**
- `interview_type` (ENUM)
- `round_number` (INTEGER)
- `scheduled_at` (DATE)
- `duration` (INTEGER)
- `timezone` (STRING) - **NEW**
- `location` (STRING)
- `meeting_link` (STRING)
- `meeting_id` (STRING)
- `meeting_password` (STRING)
- `interviewers` (JSONB) - **NEW**
- `agenda` (JSONB) - **NEW**
- `requirements` (JSONB) - **NEW**
- `status` (ENUM)
- `feedback` (TEXT)
- `decision` (ENUM)
- `rating` (INTEGER)
- `notes` (TEXT)
- `next_round_details` (JSONB) - **NEW**
- `reminder_sent` (BOOLEAN) - **NEW**
- `reminder_sent_at` (DATE) - **NEW**
- `cancelled_at` (DATE)
- `cancelled_by` (UUID, FK to users)
- `cancellation_reason` (TEXT)
- `rescheduled_at` (DATE)
- `rescheduled_by` (UUID, FK to users)
- `reschedule_reason` (TEXT)
- `metadata` (JSONB) - **NEW**
- `created_at` (DATE)
- `updated_at` (DATE)

### Notifications Table
The notifications table will have these columns after migrations:
- `id` (UUID, PK)
- `user_id` (UUID, FK to users)
- `type` (ENUM) - **UPDATED with interview types**
- `title` (STRING)
- `message` (TEXT)
- `short_message` (STRING(200)) - **NEW**
- `data` (JSONB)
- `is_read` (BOOLEAN)
- `is_sent` (BOOLEAN)
- `is_email_sent` (BOOLEAN) - **NEW**
- `is_sms_sent` (BOOLEAN) - **NEW**
- `is_push_sent` (BOOLEAN) - **NEW**
- `priority` (ENUM)
- `action_url` (STRING)
- `action_text` (STRING)
- `icon` (STRING) - **NEW**
- `image` (STRING) - **NEW**
- `metadata` (JSONB) - **NEW**
- `read_at` (DATE) - **NEW**
- `expires_at` (DATE)
- `scheduled_at` (DATE) - **NEW**
- `sent_at` (DATE) - **NEW**
- `created_at` (DATE)
- `updated_at` (DATE)

## Deployment Instructions

1. **Run migrations in order**:
   ```bash
   npx sequelize-cli db:migrate
   ```

2. **Verify database schema**:
   - Check that all new columns exist in interviews table
   - Check that all new columns exist in notifications table
   - Verify enum values are added correctly

3. **Test the system**:
   - Create an interview through the API
   - Check that notifications are created
   - Verify dashboard displays upcoming interviews

## Potential Issues and Solutions

### Issue 1: Enum Value Addition
- **Problem**: PostgreSQL doesn't allow removing enum values easily
- **Solution**: The migration only adds values, doesn't remove them
- **Impact**: Low - new values are backward compatible

### Issue 2: Missing Foreign Key Constraints
- **Problem**: Some new fields reference tables that might not exist
- **Solution**: All referenced tables (users, jobs, job_applications) should exist from previous migrations
- **Impact**: Medium - check table existence before running migrations

### Issue 3: Data Type Mismatches
- **Problem**: Model uses camelCase, migration uses snake_case
- **Solution**: Sequelize handles this automatically through field mapping
- **Impact**: Low - Sequelize handles the conversion

## Rollback Instructions

If issues occur, you can rollback the new migrations:

```bash
# Rollback in reverse order
npx sequelize-cli db:migrate:undo --name 20250910202100-add-missing-notification-fields.js
npx sequelize-cli db:migrate:undo --name 20250910202000-add-missing-interview-fields.js
npx sequelize-cli db:migrate:undo --name 20250910201643-add-interview-notification-types.js
```

**Note**: The enum value rollback will not actually remove the enum values due to PostgreSQL limitations, but it won't cause errors.

## Testing Checklist

- [ ] Migrations run without errors
- [ ] Interview creation works
- [ ] Interview scheduling works
- [ ] Notifications are created for interviews
- [ ] Dashboard shows upcoming interviews
- [ ] Jobseeker can view their interviews
- [ ] All API endpoints work correctly
