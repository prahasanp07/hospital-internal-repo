import sys
import os
import numpy as np
import matplotlib.pyplot as plt

def plot_waveform(input_path, output_path):
    try:
        # Load raw binary data (assuming 16-bit integer for standard medical telemetry if no header)
        # In a robust production setting with wfdb, you'd use wfdb.rdsamp(input_path.replace('.dat',''))
        # Here we fall back to a raw byte read for robustness without .hea files.
        data = np.fromfile(input_path, dtype=np.int16)
        
        # Take a slice of the data to avoid plotting millions of points (e.g. first 5000 samples)
        plot_data = data[:5000] if len(data) > 5000 else data

        # Setup standard ECG-like medical grid background
        fig, ax = plt.subplots(figsize=(12, 6))
        
        # Medical grid styling (pink/red grid on white background)
        ax.set_facecolor('white')
        ax.grid(which='major', color='#ffcccc', linewidth=1.5)
        ax.grid(which='minor', color='#ffe6e6', linewidth=0.5)
        ax.minorticks_on()
        
        # Plot the signal in dark blue/black
        time_axis = np.arange(len(plot_data))
        ax.plot(time_axis, plot_data, color='#000080', linewidth=1)
        
        ax.set_title("Raw Medical Waveform Signal (Binary .dat extract)", fontsize=14)
        ax.set_xlabel("Samples")
        ax.set_ylabel("Amplitude")
        
        plt.tight_layout()
        plt.savefig(output_path, dpi=150, bbox_inches='tight')
        plt.close()
        
        print("SUCCESS")
    except Exception as e:
        print(f"ERROR: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python plot_waveform.py <input.dat> <output.png>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    plot_waveform(input_file, output_file)
