#!/usr/bin/env node

/**
 * COMPLETE DATABASE FIX SCRIPT
 * This script fixes ALL database sync issues permanently
 * - Adds missing columns
 * - Creates missing tables with proper foreign key handling
 * - Fixes column name mismatches
 */

const { Pool } = require('pg');

// Load environment variables
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL || process.env.DB_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL or DB_URL environment variable is required');
  console.error('ℹ️ This script should be run in production environment where DATABASE_URL is available');
  process.exit(1);
}

// Check if we're in production or if we can connect to the database
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
const isTestMode = process.argv.includes('--test') || process.argv.includes('-t');

if (!isProduction && !isTestMode) {
  console.log('⚠️ Running in development mode - database connection will be tested');
  console.log('ℹ️ This script is designed to run in production environment');
  console.log('💡 Use --test flag to run in test mode without database connection');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false
});

async function fixAllDatabaseIssues() {
  let client;
  
  try {
    console.log('🔧 Starting complete database fix...');
    
    if (isTestMode) {
      console.log('🧪 Running in TEST MODE - no actual database changes will be made');
      console.log('✅ Test mode completed successfully');
      return;
    }
    
    console.log('🔍 Testing database connection...');
    client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // 1. Fix CompanyFollow table - add followedAt column
    console.log('1️⃣ Fixing CompanyFollow table...');
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'company_follows' AND column_name = 'followedAt'
        ) THEN
          ALTER TABLE company_follows ADD COLUMN "followedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
          UPDATE company_follows SET "followedAt" = created_at WHERE "followedAt" IS NULL;
        END IF;
      END $$;
    `);
    console.log('✅ CompanyFollow table fixed');

    // 2. Fix CompanyReview table - add reviewDate column  
    console.log('2️⃣ Fixing CompanyReview table...');
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'company_reviews' AND column_name = 'reviewDate'
        ) THEN
          ALTER TABLE company_reviews ADD COLUMN "reviewDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
          UPDATE company_reviews SET "reviewDate" = created_at WHERE "reviewDate" IS NULL;
        END IF;
      END $$;
    `);
    console.log('✅ CompanyReview table fixed');

    // 3. Fix Payment table - add user_id and subscription_id columns
    console.log('3️⃣ Fixing Payment table...');
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'payments' AND column_name = 'user_id'
        ) THEN
          ALTER TABLE payments ADD COLUMN user_id UUID;
          -- Copy data from userId to user_id if userId exists
          IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'userId'
          ) THEN
            UPDATE payments SET user_id = "userId"::UUID WHERE user_id IS NULL AND "userId" IS NOT NULL;
          END IF;
        END IF;
        
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'payments' AND column_name = 'subscription_id'
        ) THEN
          ALTER TABLE payments ADD COLUMN subscription_id UUID;
          -- Copy data from subscriptionId to subscription_id if subscriptionId exists
          IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'subscriptionId'
          ) THEN
            UPDATE payments SET subscription_id = "subscriptionId"::UUID WHERE subscription_id IS NULL AND "subscriptionId" IS NOT NULL;
          END IF;
        END IF;
      END $$;
    `);
    console.log('✅ Payment table fixed');

    // 4. Fix UserSession table - add user_id and session_token columns
    console.log('4️⃣ Fixing UserSession table...');
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'user_sessions' AND column_name = 'user_id'
        ) THEN
          ALTER TABLE user_sessions ADD COLUMN user_id UUID;
          -- Copy data from userId to user_id if userId exists
          IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_sessions' AND column_name = 'userId'
          ) THEN
            UPDATE user_sessions SET user_id = "userId"::UUID WHERE user_id IS NULL AND "userId" IS NOT NULL;
          END IF;
        END IF;
        
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'user_sessions' AND column_name = 'session_token'
        ) THEN
          ALTER TABLE user_sessions ADD COLUMN session_token VARCHAR(255);
          -- Copy data from sessionToken to session_token if sessionToken exists
          IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_sessions' AND column_name = 'sessionToken'
          ) THEN
            UPDATE user_sessions SET session_token = "sessionToken" WHERE session_token IS NULL AND "sessionToken" IS NOT NULL;
          END IF;
        END IF;
      END $$;
    `);
    console.log('✅ UserSession table fixed');

    // 5. Fix Analytics table - add session_id column
    console.log('5️⃣ Fixing Analytics table...');
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'analytics' AND column_name = 'session_id'
        ) THEN
          ALTER TABLE analytics ADD COLUMN session_id UUID;
          -- Copy data from sessionId to session_id if sessionId exists
          IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'analytics' AND column_name = 'sessionId'
          ) THEN
            UPDATE analytics SET session_id = "sessionId"::UUID WHERE session_id IS NULL AND "sessionId" IS NOT NULL;
          END IF;
        END IF;
      END $$;
    `);
    console.log('✅ Analytics table fixed');

    // 6. Create conversations table (without foreign key to messages first)
    console.log('6️⃣ Creating conversations table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "participant1Id" UUID NOT NULL,
        "participant2Id" UUID NOT NULL, 
        "jobApplicationId" UUID,
        "jobId" UUID,
        "conversationType" VARCHAR(50) NOT NULL DEFAULT 'general',
        title VARCHAR(255),
        "lastMessageId" UUID,
        "lastMessageAt" TIMESTAMP WITH TIME ZONE,
        "unreadCount" INTEGER DEFAULT 0,
        "isActive" BOOLEAN DEFAULT true,
        "isArchived" BOOLEAN DEFAULT false,
        "archivedBy" UUID,
        "archivedAt" TIMESTAMP WITH TIME ZONE,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    // 7. Create messages table (without foreign key to conversations first)
    console.log('7️⃣ Creating messages table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "conversationId" UUID NOT NULL,
        "senderId" UUID NOT NULL,
        "receiverId" UUID NOT NULL,
        "messageType" VARCHAR(50) NOT NULL DEFAULT 'text',
        content TEXT NOT NULL,
        attachments JSONB DEFAULT '[]',
        "isRead" BOOLEAN DEFAULT false,
        "readAt" TIMESTAMP WITH TIME ZONE,
        "isDelivered" BOOLEAN DEFAULT false,
        "deliveredAt" TIMESTAMP WITH TIME ZONE,
        "isEdited" BOOLEAN DEFAULT false,
        "editedAt" TIMESTAMP WITH TIME ZONE,
        "replyToMessageId" UUID,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    // 8. Add foreign key constraints now that both tables exist
    console.log('8️⃣ Adding foreign key constraints...');
    await client.query(`
      DO $$ 
      BEGIN 
        -- Add foreign key from conversations to messages (lastMessageId)
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'conversations_lastMessageId_fkey'
        ) THEN
          ALTER TABLE conversations 
          ADD CONSTRAINT conversations_lastMessageId_fkey 
          FOREIGN KEY ("lastMessageId") REFERENCES messages(id);
        END IF;

        -- Add foreign key from messages to conversations (conversationId)  
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'messages_conversationId_fkey'
        ) THEN
          ALTER TABLE messages 
          ADD CONSTRAINT messages_conversationId_fkey 
          FOREIGN KEY ("conversationId") REFERENCES conversations(id);
        END IF;

        -- Add foreign key from messages to messages (replyToMessageId)
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'messages_replyToMessageId_fkey'
        ) THEN
          ALTER TABLE messages 
          ADD CONSTRAINT messages_replyToMessageId_fkey 
          FOREIGN KEY ("replyToMessageId") REFERENCES messages(id);
        END IF;
      END $$;
    `);

    // 9. Add missing indexes
    console.log('9️⃣ Adding missing indexes...');
    await client.query(`
      DO $$ 
      BEGIN 
        -- Index for company_follows.followedAt
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE tablename = 'company_follows' AND indexname = 'company_follows_followed_at'
        ) THEN
          CREATE INDEX company_follows_followed_at ON company_follows ("followedAt");
        END IF;

        -- Index for company_reviews.reviewDate
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE tablename = 'company_reviews' AND indexname = 'company_reviews_review_date'
        ) THEN
          CREATE INDEX company_reviews_review_date ON company_reviews ("reviewDate");
        END IF;

        -- Index for payments.user_id
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE tablename = 'payments' AND indexname = 'payments_user_id'
        ) THEN
          CREATE INDEX payments_user_id ON payments (user_id);
        END IF;

        -- Index for user_sessions.user_id
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE tablename = 'user_sessions' AND indexname = 'user_sessions_user_id'
        ) THEN
          CREATE INDEX user_sessions_user_id ON user_sessions (user_id);
        END IF;

        -- Index for analytics.session_id
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE tablename = 'analytics' AND indexname = 'analytics_session_id'
        ) THEN
          CREATE INDEX analytics_session_id ON analytics (session_id);
        END IF;
      END $$;
    `);

    console.log('🎉 ALL DATABASE ISSUES FIXED SUCCESSFULLY!');
    console.log('✅ Added missing columns: followedAt, reviewDate, user_id, session_id');
    console.log('✅ Created missing tables: conversations, messages');
    console.log('✅ Added foreign key constraints');
    console.log('✅ Added missing indexes');
    
  } catch (error) {
    console.error('💥 Database fix failed:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// Run the fix
fixAllDatabaseIssues()
  .then(() => {
    console.log('🚀 Database fix completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Database fix failed:', error);
    process.exit(1);
  });
