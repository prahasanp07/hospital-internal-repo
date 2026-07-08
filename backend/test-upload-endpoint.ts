import fs from 'fs';
import path from 'path';

async function testUpload() {
    try {
        // Create a dummy image file
        const dummyPath = path.join(__dirname, 'dummy.png');
        fs.writeFileSync(dummyPath, Buffer.from('dummy image data'));

        const formData = new FormData();
        const fileBlob = new Blob([fs.readFileSync(dummyPath)], { type: 'image/png' });
        formData.append('files', fileBlob, 'dummy.png');

        console.log("Sending POST request to http://localhost:3000/api/triage/upload...");
        const response = await fetch('http://localhost:3000/api/triage/upload', {
            method: 'POST',
            body: formData
        });

        const responseText = await response.text();
        console.log(`Response Status: ${response.status}`);
        console.log(`Response Body: ${responseText}`);
        
        fs.unlinkSync(dummyPath);
    } catch (err) {
        console.error("Test script failed:", err);
    }
}
testUpload();
