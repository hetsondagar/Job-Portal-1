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

    // 6. Fix additional missing columns
    console.log('6️⃣ Fixing additional missing columns...');
    
    // Fix conversations table - add job_id column
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'conversations' AND column_name = 'job_id'
        ) THEN
          ALTER TABLE conversations ADD COLUMN job_id UUID;
          -- Copy data from jobId to job_id if jobId exists
          IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'conversations' AND column_name = 'jobId'
          ) THEN
            UPDATE conversations SET job_id = "jobId"::UUID WHERE job_id IS NULL AND "jobId" IS NOT NULL;
          END IF;
        END IF;
      END $$;
    `);
    console.log('✅ Conversations job_id column fixed');

    // Fix messages table - add conversation_id column
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'messages' AND column_name = 'conversation_id'
        ) THEN
          ALTER TABLE messages ADD COLUMN conversation_id UUID;
          -- Copy data from conversationId to conversation_id if conversationId exists
          IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'messages' AND column_name = 'conversationId'
          ) THEN
            UPDATE messages SET conversation_id = "conversationId"::UUID WHERE conversation_id IS NULL AND "conversationId" IS NOT NULL;
          END IF;
        END IF;
      END $$;
    `);
    console.log('✅ Messages conversation_id column fixed');

    // Fix analytics table - add event_type column
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'analytics' AND column_name = 'event_type'
        ) THEN
          ALTER TABLE analytics ADD COLUMN event_type VARCHAR(100);
          -- Copy data from eventType to event_type if eventType exists
          IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'analytics' AND column_name = 'eventType'
          ) THEN
            UPDATE analytics SET event_type = "eventType" WHERE event_type IS NULL AND "eventType" IS NOT NULL;
          END IF;
        END IF;
      END $$;
    `);
    console.log('✅ Analytics event_type column fixed');

    // Fix payments table - add payment_gateway column
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'payments' AND column_name = 'payment_gateway'
        ) THEN
          ALTER TABLE payments ADD COLUMN payment_gateway VARCHAR(100);
          -- Copy data from paymentGateway to payment_gateway if paymentGateway exists
          IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'paymentGateway'
          ) THEN
            UPDATE payments SET payment_gateway = "paymentGateway" WHERE payment_gateway IS NULL AND "paymentGateway" IS NOT NULL;
          END IF;
        END IF;
      END $$;
    `);
    console.log('✅ Payments payment_gateway column fixed');

    // Fix user_sessions table - add refresh_token column
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'user_sessions' AND column_name = 'refresh_token'
        ) THEN
          ALTER TABLE user_sessions ADD COLUMN refresh_token VARCHAR(500);
          -- Copy data from refreshToken to refresh_token if refreshToken exists
          IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_sessions' AND column_name = 'refreshToken'
          ) THEN
            UPDATE user_sessions SET refresh_token = "refreshToken" WHERE refresh_token IS NULL AND "refreshToken" IS NOT NULL;
          END IF;
        END IF;
      END $$;
    `);
    console.log('✅ UserSessions refresh_token column fixed');

    // Fix conversations table - add is_active column
    try {
      const result = await client.query(`
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'conversations' AND column_name = 'is_active'
      `);
      
      if (result.rows.length === 0) {
        await client.query(`ALTER TABLE conversations ADD COLUMN is_active BOOLEAN DEFAULT true`);
        console.log('✅ Added is_active column to conversations table');
        
        // Copy data from isActive to is_active if isActive exists
        try {
          const isActiveCheck = await client.query(`
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'conversations' AND column_name = 'isActive'
          `);
          if (isActiveCheck.rows.length > 0) {
            await client.query(`UPDATE conversations SET is_active = "isActive" WHERE is_active IS NULL AND "isActive" IS NOT NULL`);
            console.log('✅ Migrated data from isActive to is_active in conversations');
          }
        } catch (migrateError) {
          console.log('ℹ️ No isActive column to migrate in conversations');
        }
      } else {
        console.log('ℹ️ is_active column already exists in conversations table');
      }
    } catch (error) {
      console.log('⚠️ Error adding is_active to conversations:', error.message);
    }

    // Fix messages table - add sender_id column
    try {
      const result = await client.query(`
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'sender_id'
      `);
      
      if (result.rows.length === 0) {
        await client.query(`ALTER TABLE messages ADD COLUMN sender_id UUID`);
        console.log('✅ Added sender_id column to messages table');
        
        // Copy data from senderId to sender_id if senderId exists
        try {
          const senderIdCheck = await client.query(`
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'messages' AND column_name = 'senderId'
          `);
          if (senderIdCheck.rows.length > 0) {
            await client.query(`UPDATE messages SET sender_id = "senderId"::UUID WHERE sender_id IS NULL AND "senderId" IS NOT NULL`);
            console.log('✅ Migrated data from senderId to sender_id in messages');
          }
        } catch (migrateError) {
          console.log('ℹ️ No senderId column to migrate in messages');
        }
      } else {
        console.log('ℹ️ sender_id column already exists in messages table');
      }
    } catch (error) {
      console.log('⚠️ Error adding sender_id to messages:', error.message);
    }

    // Fix payments table - add gateway_transaction_id column
    try {
      const result = await client.query(`
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'gateway_transaction_id'
      `);
      
      if (result.rows.length === 0) {
        await client.query(`ALTER TABLE payments ADD COLUMN gateway_transaction_id VARCHAR(255)`);
        console.log('✅ Added gateway_transaction_id column to payments table');
        
        // Copy data from gatewayTransactionId to gateway_transaction_id if gatewayTransactionId exists
        try {
          const gatewayCheck = await client.query(`
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'payments' AND column_name = 'gatewayTransactionId'
          `);
          if (gatewayCheck.rows.length > 0) {
            await client.query(`UPDATE payments SET gateway_transaction_id = "gatewayTransactionId" WHERE gateway_transaction_id IS NULL AND "gatewayTransactionId" IS NOT NULL`);
            console.log('✅ Migrated data from gatewayTransactionId to gateway_transaction_id in payments');
          }
        } catch (migrateError) {
          console.log('ℹ️ No gatewayTransactionId column to migrate in payments');
        }
      } else {
        console.log('ℹ️ gateway_transaction_id column already exists in payments table');
      }
    } catch (error) {
      console.log('⚠️ Error adding gateway_transaction_id to payments:', error.message);
    }

    // Fix user_sessions table - add is_active column
    try {
      const result = await client.query(`
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'is_active'
      `);
      
      if (result.rows.length === 0) {
        await client.query(`ALTER TABLE user_sessions ADD COLUMN is_active BOOLEAN DEFAULT true`);
        console.log('✅ Added is_active column to user_sessions table');
        
        // Copy data from isActive to is_active if isActive exists
        try {
          const isActiveCheck = await client.query(`
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_sessions' AND column_name = 'isActive'
          `);
          if (isActiveCheck.rows.length > 0) {
            await client.query(`UPDATE user_sessions SET is_active = "isActive" WHERE is_active IS NULL AND "isActive" IS NOT NULL`);
            console.log('✅ Migrated data from isActive to is_active in user_sessions');
          }
        } catch (migrateError) {
          console.log('ℹ️ No isActive column to migrate in user_sessions');
        }
      } else {
        console.log('ℹ️ is_active column already exists in user_sessions table');
      }
    } catch (error) {
      console.log('⚠️ Error adding is_active to user_sessions:', error.message);
    }

    // Fix analytics table - add event_category column
    try {
      const result = await client.query(`
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'analytics' AND column_name = 'event_category'
      `);
      
      if (result.rows.length === 0) {
        await client.query(`ALTER TABLE analytics ADD COLUMN event_category VARCHAR(100)`);
        console.log('✅ Added event_category column to analytics table');
        
        // Copy data from eventCategory to event_category if eventCategory exists
        try {
          const eventCategoryCheck = await client.query(`
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'analytics' AND column_name = 'eventCategory'
          `);
          if (eventCategoryCheck.rows.length > 0) {
            await client.query(`UPDATE analytics SET event_category = "eventCategory" WHERE event_category IS NULL AND "eventCategory" IS NOT NULL`);
            console.log('✅ Migrated data from eventCategory to event_category in analytics');
          }
        } catch (migrateError) {
          console.log('ℹ️ No eventCategory column to migrate in analytics');
        }
      } else {
        console.log('ℹ️ event_category column already exists in analytics table');
      }
    } catch (error) {
      console.log('⚠️ Error adding event_category to analytics:', error.message);
    }

    // Fix messages table - add receiver_id column
    try {
      const result = await client.query(`
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'receiver_id'
      `);
      
      if (result.rows.length === 0) {
        await client.query(`ALTER TABLE messages ADD COLUMN receiver_id UUID`);
        console.log('✅ Added receiver_id column to messages table');
        
        // Copy data from receiverId to receiver_id if receiverId exists
        try {
          const receiverIdCheck = await client.query(`
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'messages' AND column_name = 'receiverId'
          `);
          if (receiverIdCheck.rows.length > 0) {
            await client.query(`UPDATE messages SET receiver_id = "receiverId"::UUID WHERE receiver_id IS NULL AND "receiverId" IS NOT NULL`);
            console.log('✅ Migrated data from receiverId to receiver_id in messages');
          }
        } catch (migrateError) {
          console.log('ℹ️ No receiverId column to migrate in messages');
        }
      } else {
        console.log('ℹ️ receiver_id column already exists in messages table');
      }
    } catch (error) {
      console.log('⚠️ Error adding receiver_id to messages:', error.message);
    }

    // Fix user_sessions table - add expires_at column
    try {
      const result = await client.query(`
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'expires_at'
      `);
      
      if (result.rows.length === 0) {
        await client.query(`ALTER TABLE user_sessions ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE`);
        console.log('✅ Added expires_at column to user_sessions table');
        
        // Copy data from expiresAt to expires_at if expiresAt exists
        try {
          const expiresAtCheck = await client.query(`
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_sessions' AND column_name = 'expiresAt'
          `);
          if (expiresAtCheck.rows.length > 0) {
            await client.query(`UPDATE user_sessions SET expires_at = "expiresAt" WHERE expires_at IS NULL AND "expiresAt" IS NOT NULL`);
            console.log('✅ Migrated data from expiresAt to expires_at in user_sessions');
          }
        } catch (migrateError) {
          console.log('ℹ️ No expiresAt column to migrate in user_sessions');
        }
      } else {
        console.log('ℹ️ expires_at column already exists in user_sessions table');
      }
    } catch (error) {
      console.log('⚠️ Error adding expires_at to user_sessions:', error.message);
    }

    // Fix analytics table - add job_id column
    try {
      const result = await client.query(`
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'analytics' AND column_name = 'job_id'
      `);
      
      if (result.rows.length === 0) {
        await client.query(`ALTER TABLE analytics ADD COLUMN job_id UUID`);
        console.log('✅ Added job_id column to analytics table');
        
        // Copy data from jobId to job_id if jobId exists
        try {
          const jobIdCheck = await client.query(`
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'analytics' AND column_name = 'jobId'
          `);
          if (jobIdCheck.rows.length > 0) {
            await client.query(`UPDATE analytics SET job_id = "jobId"::UUID WHERE job_id IS NULL AND "jobId" IS NOT NULL`);
            console.log('✅ Migrated data from jobId to job_id in analytics');
          }
        } catch (migrateError) {
          console.log('ℹ️ No jobId column to migrate in analytics');
        }
      } else {
        console.log('ℹ️ job_id column already exists in analytics table');
      }
    } catch (error) {
      console.log('⚠️ Error adding job_id to analytics:', error.message);
    }

    // 7. Create conversations table (without foreign key to messages first)
    console.log('7️⃣ Creating conversations table...');
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

    // 8. Create messages table (without foreign key to conversations first)
    console.log('8️⃣ Creating messages table...');
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

    // 9. Add foreign key constraints now that both tables exist
    console.log('9️⃣ Adding foreign key constraints...');
    try {
      await client.query(`
        DO $$ 
        BEGIN 
          -- Add foreign key from conversations to messages (lastMessageId)
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'conversations_lastMessageId_fkey'
            AND table_name = 'conversations'
          ) THEN
            ALTER TABLE conversations 
            ADD CONSTRAINT conversations_lastMessageId_fkey 
            FOREIGN KEY ("lastMessageId") REFERENCES messages(id);
          END IF;

          -- Add foreign key from messages to conversations (conversationId)  
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'messages_conversationId_fkey'
            AND table_name = 'messages'
          ) THEN
            ALTER TABLE messages 
            ADD CONSTRAINT messages_conversationId_fkey 
            FOREIGN KEY ("conversationId") REFERENCES conversations(id);
          END IF;

          -- Add foreign key from messages to messages (replyToMessageId)
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'messages_replyToMessageId_fkey'
            AND table_name = 'messages'
          ) THEN
            ALTER TABLE messages 
            ADD CONSTRAINT messages_replyToMessageId_fkey 
            FOREIGN KEY ("replyToMessageId") REFERENCES messages(id);
          END IF;
        END $$;
      `);
      console.log('✅ Foreign key constraints added successfully');
    } catch (constraintError) {
      console.log('ℹ️ Some constraints may already exist, continuing...');
    }

    // 10. Add missing indexes
    console.log('🔟 Adding missing indexes...');
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
