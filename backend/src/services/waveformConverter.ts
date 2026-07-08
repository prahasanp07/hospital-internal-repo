import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export async function convertDatToVisualPlot(buffer: Buffer): Promise<string> {
    const tempDir = os.tmpdir();
    const uniqueId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const inputPath = path.join(tempDir, `${uniqueId}.dat`);
    const outputPath = path.join(tempDir, `${uniqueId}.png`);
    const scriptPath = path.join(__dirname, '../scripts/plot_waveform.py');

    try {
        // Write the raw binary buffer to a temporary file
        await fs.writeFile(inputPath, buffer);

        // Execute the python helper script
        await new Promise<void>((resolve, reject) => {
            exec(`python "${scriptPath}" "${inputPath}" "${outputPath}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error('Python execution error:', stderr);
                    return reject(new Error(`Waveform generation failed: ${error.message}`));
                }
                resolve();
            });
        });

        // Read the freshly rendered medical-grid PNG
        const pngBuffer = await fs.readFile(outputPath);
        const base64Png = pngBuffer.toString('base64');
        return base64Png;

    } catch (err) {
        console.error("Failed to convert .dat to plot:", err);
        throw err;
    } finally {
        // Cleanup temporary files
        try { await fs.unlink(inputPath); } catch (e) { /* ignore */ }
        try { await fs.unlink(outputPath); } catch (e) { /* ignore */ }
    }
}
