import fs from 'fs';
import google from 'googlethis';
import { products } from './data.js'; // Assuming we re-export data cleanly or just read it

async function main() {
    // Read current data
    const fileContent = fs.readFileSync('/home/yash/Desktop/genstore/data.js', 'utf8');
    // Extract array since it's "export const products = [...]"
    const jsonMatch = fileContent.match(/export const products = (\[[\s\S]*\]);/);
    if (!jsonMatch) {
       console.error("Could not parse products data");
       return;
    }
    
    let prods = [];
    try {
        prods = eval(jsonMatch[1]);
    } catch(err) {
        console.log(err);
        return;
    }

    // We have 80 unique types to search (20 sensors, 20 modules, 20 projects, 20 actuators)
    // To speed up, we'll cache by base name
    const imageCache = {};

    console.log("Fetching real images from Google...");

    for (const p of prods) {
        // Strip out version tags for better searching
        const searchName = p.name.replace(/v1|v2|Pro|Max|Lite|Mini|Shield|Breakout|Core|Module|Kit/g, '').trim() + " electronic module";
        
        if (imageCache[searchName]) {
            p.image = imageCache[searchName];
        } else {
            try {
                // Search for image
                const images = await google.image(searchName, { safe: false });
                if (images && images.length > 0) {
                    p.image = images[0].url;
                    imageCache[searchName] = p.image;
                    console.log(`[Success] Fetched ${searchName}: ${p.image.substring(0,30)}...`);
                } else {
                    console.log(`[Fail] No images for ${searchName}`);
                }
            } catch(e) {
                console.log(`[Error] Fetching ${searchName} - substituting placeholder`);
                // Placeholder fallback
                p.image = `https://image.pollinations.ai/prompt/${encodeURIComponent(searchName)}?width=400&height=400&nologo=true`;
                imageCache[searchName] = p.image;
            }
            // Small delay to prevent rate limit
            await new Promise(r => setTimeout(r, 600));
        }
    }

    const newContent = `export const products = ${JSON.stringify(prods, null, 4)};`;
    fs.writeFileSync('/home/yash/Desktop/genstore/data.js', newContent);
    console.log('✅ Correct Google images assigned to all products!');
}

main();
