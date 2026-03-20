/**
 * Seed Supabase products table from data.js
 * 
 * Usage:
 *   1. Set your Supabase credentials below or in .env.local
 *   2. Run: node scripts/seed-supabase.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { products } from '../data.js';

// Read from environment or hardcode for one-time use
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
    console.log(`🌱 Seeding ${products.length} products into Supabase...`);
    
    // Insert in batches of 50
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize).map(p => ({
            name: p.name,
            category: p.category,
            price: parseInt(p.price),
            image: p.image,
            details: p.details
        }));
        
        const { data, error } = await supabase
            .from('products')
            .insert(batch);
        
        if (error) {
            console.error(`❌ Error at batch ${i / batchSize + 1}:`, error.message);
        } else {
            inserted += batch.length;
            console.log(`  ✓ Inserted batch ${Math.floor(i / batchSize) + 1} (${inserted}/${products.length})`);
        }
    }
    
    console.log(`\n✅ Done! ${inserted} products seeded.`);
}

seed().catch(err => {
    console.error('Failed to seed:', err);
    process.exit(1);
});
