import { supabase } from '../lib/supabase';

async function verifyDatabase() {
  console.log('🔍 Starting database verification...\n');

  try {
    console.log('1️⃣ Checking Users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Users table error:', usersError);
    } else {
      console.log('✅ Users table exists and is accessible');
    }

    console.log('\n2️⃣ Checking Properties table...');
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .limit(1);
    
    if (propertiesError) {
      console.error('❌ Properties table error:', propertiesError);
    } else {
      console.log('✅ Properties table exists and is accessible');
    }

    console.log('\n3️⃣ Checking Conversations table...');
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('*')
      .limit(1);
    
    if (conversationsError) {
      console.error('❌ Conversations table error:', conversationsError);
    } else {
      console.log('✅ Conversations table exists and is accessible');
    }

    console.log('\n4️⃣ Checking Messages table...');
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);
    
    if (messagesError) {
      console.error('❌ Messages table error:', messagesError);
    } else {
      console.log('✅ Messages table exists and is accessible');
    }

    console.log('\n5️⃣ Checking Favorites table...');
    const { data: favorites, error: favoritesError } = await supabase
      .from('favorites')
      .select('*')
      .limit(1);
    
    if (favoritesError) {
      console.error('❌ Favorites table error:', favoritesError);
    } else {
      console.log('✅ Favorites table exists and is accessible');
    }

    console.log('\n📊 Summary:');
    const errors = [usersError, propertiesError, conversationsError, messagesError, favoritesError].filter(e => e);
    
    if (errors.length === 0) {
      console.log('✅ All tables are created and accessible!');
      console.log('\n📝 Next steps:');
      console.log('1. Make sure you ran the SUPABASE_COMPLETE_SETUP.sql in Supabase SQL Editor');
      console.log('2. Check that Row Level Security policies are enabled');
      console.log('3. Verify indexes and triggers are created');
    } else {
      console.log(`❌ ${errors.length} table(s) have issues`);
      console.log('\n🔧 To fix:');
      console.log('1. Go to Supabase Dashboard: https://dcsoudthcmkrficgcbio.supabase.co');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the entire SUPABASE_COMPLETE_SETUP.sql file');
      console.log('4. Click "Run" to execute the script');
      console.log('5. Run this verification script again');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

verifyDatabase();
