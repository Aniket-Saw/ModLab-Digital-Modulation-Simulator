from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import SimulationConfig, SimulationResult
from modulation.core import simulate_bask, simulate_bfsk, simulate_bpsk, generate_random_bits, compute_spectrum
import numpy as np

app = FastAPI(title="Digital Modulation Analyzer API")

# Enable CORS for React frontend connecting to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev only. Configure strictly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/simulate", response_model=SimulationResult)
def simulate(config: SimulationConfig):
    # Validate sampling frequency > 2 * carrier_frequency (Nyquist)
    if config.sampling_frequency <= 2 * max(config.carrier_frequency, config.carrier_frequency + 2*config.bit_rate): # simplistic check for BFSK high freq
        pass # Let it go for educational aliasing, but normally we'd warn.
    
    if config.bits is None or len(config.bits) == 0:
        bits = generate_random_bits(config.bit_count)
    else:
        bits = config.bits

    if config.scheme.upper() == "BASK":
        t, tx, rx, demod = simulate_bask(bits, config.bit_rate, config.carrier_frequency, config.sampling_frequency, config.amplitude, config.snr_db)
    elif config.scheme.upper() == "BPSK":
         t, tx, rx, demod = simulate_bpsk(bits, config.bit_rate, config.carrier_frequency, config.sampling_frequency, config.amplitude, config.snr_db)
    elif config.scheme.upper() == "BFSK":
        t, tx, rx, demod = simulate_bfsk(bits, config.bit_rate, config.carrier_frequency, config.sampling_frequency, config.amplitude, config.snr_db)
    else:
        raise HTTPException(status_code=400, detail="Invalid modulation scheme. Choose BASK, BPSK, or BFSK.")

    # Calculate BER
    errors = sum(1 for b_in, b_out in zip(bits, demod) if b_in != b_out)
    ber = errors / len(bits) if len(bits) > 0 else 0.0

    # Compute Spectrum of transmitted signal
    f_axis, spectrum = compute_spectrum(tx, config.sampling_frequency)

    # Return as list
    return SimulationResult(
        input_bits=bits,
        transmitted_signal=tx.tolist(),
        received_signal=rx.tolist(),
        demodulated_bits=demod,
        bit_errors=errors,
        ber=ber,
        frequency_axis=f_axis.tolist(),
        spectrum=spectrum.tolist(),
        time_axis=t.tolist()
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
