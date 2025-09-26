#!/usr/bin/env node

/**
 * PRODUCTION DATABASE FIX SCRIPT
 * This script adds missing columns that are causing sync failures
 */

const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting production database fixes...');
    
    // Check if columns exist before adding them
    const checkColumn = async (table, column) => {
      const result = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
      `, [table, column]);
      return result.rows.length > 0;
    };

    // 1. Fix user_sessions table
    console.log('🔧 Fixing user_sessions table...');
    if (!(await checkColumn('user_sessions', 'user_id'))) {
      await client.query(`
        ALTER TABLE user_sessions 
        ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE
      `);
      console.log('✅ Added user_id column to user_sessions');
    } else {
      console.log('ℹ️ user_sessions.user_id already exists');
    }

    // 2. Fix analytics table  
    console.log('🔧 Fixing analytics table...');
    if (!(await checkColumn('analytics', 'session_id'))) {
      await client.query(`
        ALTER TABLE analytics 
        ADD COLUMN session_id VARCHAR(255)
      `);
      console.log('✅ Added session_id column to analytics');
    } else {
      console.log('ℹ️ analytics.session_id already exists');
    }

    // 3. Fix payments table
    console.log('🔧 Fixing payments table...');
    if (!(await checkColumn('payments', 'user_id'))) {
      await client.query(`
        ALTER TABLE payments 
        ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE
      `);
      console.log('✅ Added user_id column to payments');
    } else {
      console.log('ℹ️ payments.user_id already exists');
    }

    // 4. Fix company_reviews table
    console.log('🔧 Fixing company_reviews table...');
    if (!(await checkColumn('company_reviews', 'review_date'))) {
      await client.query(`
        ALTER TABLE company_reviews 
        ADD COLUMN review_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      `);
      console.log('✅ Added review_date column to company_reviews');
    } else {
      console.log('ℹ️ company_reviews.review_date already exists');
    }

    // 5. Create conversations table if not exists
    console.log('🔧 Creating conversations table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        participant1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        participant2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        job_application_id UUID REFERENCES job_applications(id) ON DELETE SET NULL,
        job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
        conversation_type VARCHAR(50) DEFAULT 'general',
        title VARCHAR(255),
        last_message_id UUID,
        last_message_at TIMESTAMP WITH TIME ZONE,
        unread_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        is_archived BOOLEAN DEFAULT false,
        archived_by UUID REFERENCES users(id) ON DELETE SET NULL,
        archived_at TIMESTAMP WITH TIME ZONE,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Conversations table created/verified');

    // 6. Create messages table if not exists  
    console.log('🔧 Creating messages table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message_type VARCHAR(50) DEFAULT 'text',
        content TEXT NOT NULL,
        attachments JSONB DEFAULT '[]',
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMP WITH TIME ZONE,
        is_delivered BOOLEAN DEFAULT false,
        delivered_at TIMESTAMP WITH TIME ZONE,
        is_edited BOOLEAN DEFAULT false,
        edited_at TIMESTAMP WITH TIME ZONE,
        reply_to_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Messages table created/verified');

    // 7. Add foreign key constraint for last_message_id
    try {
      await client.query(`
        ALTER TABLE conversations 
        ADD CONSTRAINT conversations_last_message_fkey 
        FOREIGN KEY (last_message_id) REFERENCES messages(id) ON DELETE SET NULL
      `);
      console.log('✅ Added foreign key constraint for last_message_id');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ Foreign key constraint already exists');
      } else {
        console.log('⚠️ Could not add foreign key constraint:', error.message);
      }
    }

    // 8. Create indexes for performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS user_sessions_user_id_idx ON user_sessions(user_id)',
      'CREATE INDEX IF NOT EXISTS analytics_session_id_idx ON analytics(session_id)', 
      'CREATE INDEX IF NOT EXISTS payments_user_id_idx ON payments(user_id)',
      'CREATE INDEX IF NOT EXISTS company_reviews_review_date_idx ON company_reviews(review_date)',
      'CREATE INDEX IF NOT EXISTS conversations_participant1_idx ON conversations(participant1_id)',
      'CREATE INDEX IF NOT EXISTS conversations_participant2_idx ON conversations(participant2_id)',
      'CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages(conversation_id)',
      'CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON messages(sender_id)'
    ];

    console.log('🔧 Creating performance indexes...');
    for (const indexQuery of indexes) {
      try {
        await client.query(indexQuery);
      } catch (error) {
        console.log('ℹ️ Index may already exist:', error.message);
      }
    }
    console.log('✅ Indexes created/verified');

    console.log('🎉 Production database fixes completed successfully!');
    
  } catch (error) {
    console.error('❌ Database fix failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the fix
fixDatabase()
  .then(() => {
    console.log('✅ Database fix script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database fix script failed:', error);
    process.exit(1);
  });
