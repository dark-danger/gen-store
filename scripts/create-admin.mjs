import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://ddpyqiuphhuecnhmfsjn.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkcHlxaXVwaGh1ZWNuaG1mc2puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5OTcyNzEsImV4cCI6MjA4OTU3MzI3MX0.6mqISaD-_bTVE7fhEa3IPENJjSp1SnopjleoXu2Tt1s'
);

async function createAdmin() {
    console.log('📝 Creating admin account...');
    
    const { data, error } = await supabase.auth.signUp({
        email: 'khannayash394@gmail.com',
        password: '9211067540',
        options: {
            data: { full_name: 'Yash Khanna' }
        }
    });

    if (error) {
        console.error('❌ Signup error:', error.message);
        return;
    }

    console.log('✅ Account created! User ID:', data.user?.id);

    if (data.user?.id) {
        // Update role to admin
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: 'admin', full_name: 'Yash Khanna' })
            .eq('id', data.user.id);

        if (profileError) {
            console.error('⚠️ Profile update error:', profileError.message);
            console.log('Run this SQL in Supabase SQL Editor:');
            console.log(`UPDATE profiles SET role = 'admin' WHERE id = '${data.user.id}';`);
        } else {
            console.log('🛡️ Admin role assigned!');
        }
    }

    console.log('\n🎯 Admin Login:');
    console.log('   Email: khannayash394@gmail.com');
    console.log('   Password: 9211067540');
}

createAdmin();
