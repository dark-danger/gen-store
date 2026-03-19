import fs from 'fs';
import google from 'googlethis';

async function main() {
    // Read current data
    const fileContent = fs.readFileSync('/home/yash/Desktop/genstore/data.js', 'utf8');
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

    const circuitBases = [
        "555 Timer", "Buck Converter", "Boost Converter", "Audio Amplifier", "Motor Driver",
        "Battery Management System", "ESP32 Dev Board", "Arduino Clone", "L298N", "MPU6050",
        "Linear Regulator", "Switching Power Supply", "Class D Amplifier", "RGB LED Driver", 
        "H-Bridge", "RF Transmitter", "RF Receiver", "LiPo Charger", "Solar Charge Controller", 
        "Overvoltage Protection", "Current Sensor", "Temperature Controller", "Relay Driver",
        "PIR Motion Sensor", "Bluetooth Audio", "Wireless Charging", "USB Type-C PD",
        "Inverter Design", "Function Generator", "Logic Analyzer", "Oscilloscope Probe",
        "BMS 3S 40A", "DC-DC Step Down", "DC-DC Step Up", "TPA3116D2 Audio", "LM317 Variable",
        "TP4056 Module", "RC Snubber", "EMI Filter", "Op-Amp Filter", "Class AB Amplifier",
        "Zero Crossing Detector", "PWM Controller", "Brushless ESC", "Stepper Driver A4988",
        "OLED Display Breakout", "VGA Controller", "HDMI Switch", "SD Card Breakout", "RTC Breakout"
    ];

    const types = ["PCB Layout", "Circuit Diagram", "Schematic", "Gerber Files"];

    let newCircuits = [];
    let idCounter = prods.length + 1;

    console.log("Generating and fetching images for 50 Circuit Designs...");

    for (let i = 0; i < 50; i++) {
        const base = circuitBases[i % circuitBases.length];
        const type = types[Math.floor(Math.random() * types.length)];
        const fullName = `${base} ${type}`;
        
        const p = {
            id: `circ_${idCounter++}`,
            name: fullName,
            category: 'Circuits',
            price: Math.floor(Math.random() * 2000 + 300),
            details: `High quality ${type.toLowerCase()} for ${base}. Perfect for custom PCB manufacturing or reference.`,
            image: ''
        };

        const searchName = `${base} PCB layout circuit schematic`;

        try {
            const images = await google.image(searchName, { safe: false });
            if (images && images.length > 0) {
                p.image = images[0].url;
                console.log(`[Success] Fetched ${fullName}: ${p.image.substring(0,30)}...`);
            } else {
                p.image = `https://image.pollinations.ai/prompt/${encodeURIComponent(searchName)}?width=400&height=400&nologo=true`;
                console.log(`[Fallback] ${fullName}`);
            }
        } catch(e) {
            console.log(`[Error] Fetching ${searchName}`);
            p.image = `https://image.pollinations.ai/prompt/${encodeURIComponent(searchName)}?width=400&height=400&nologo=true`;
        }

        newCircuits.push(p);
        await new Promise(r => setTimeout(r, 600)); // Delay to avoid rate limits
    }

    prods = prods.concat(newCircuits);

    const newContent = `export const products = ${JSON.stringify(prods, null, 4)};`;
    fs.writeFileSync('/home/yash/Desktop/genstore/data.js', newContent);
    console.log('✅ 50 Circuit Designs successfully added to the database!');
}

main();
