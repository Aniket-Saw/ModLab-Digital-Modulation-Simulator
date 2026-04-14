import numpy as np
from scipy.special import erfc

def generate_random_bits(bit_count: int):
    """Generate i.i.d. bits: b[n] ~ Bernoulli(0.5)"""
    return np.random.randint(0, 2, bit_count).tolist()

def awgn(signal, snr_db, bit_rate, fs):
    """
    Adds Additive White Gaussian Noise to a signal.

    Assuming target SNR is actually Eb/N0 in dB. 
    Bandpass SNR is calculated based on noise bandwidth (fs/2).
    SNR = (Eb/N0) * (bit_rate / (fs/2))

    Returns: (noisy_signal, noise_only)
    """
    signal_power = np.mean(signal ** 2)
    if signal_power == 0:
        noise = np.zeros(len(signal))
        return signal.copy(), noise
        
    eb_n0_linear = 10 ** (snr_db / 10.0)
    noise_bandwidth = fs / 2.0
    snr_linear = eb_n0_linear * (bit_rate / noise_bandwidth)
    
    noise_power = signal_power / snr_linear
    noise = np.sqrt(noise_power) * np.random.randn(len(signal))
    return signal + noise, noise

# ---------------------------------------------------------------------------
# BASK  (Binary Amplitude Shift Keying — On-Off Keying)
# ---------------------------------------------------------------------------
def simulate_bask(bits, bit_rate, fc, fs, A, snr_db):
    """
    Modulated signal:
        s_BASK(t) = A(b[n]) * cos(2*pi*fc*t),   nTb <= t < (n+1)Tb

    where A(b[n]) = A if b[n]=1, 0 if b[n]=0   (OOK)

    Coherent demodulation:
        y[n] = (2/Tb) * integral{ r(t)*cos(2*pi*fc*t) dt }  over bit interval
        threshold gamma = A^2 / 4  (midpoint between expected values 0 and A^2/2)

    Returns: (t, tx_signal, rx_signal, demod_bits, noise_signal, mixer_signal)
    """
    Tb = 1.0 / bit_rate
    samples_per_bit = int(fs * Tb)
    N = len(bits)
    total_samples = N * samples_per_bit
    t = np.arange(total_samples) / fs

    # Bit-to-amplitude mapping (OOK)
    amplitudes = np.array([A if b == 1 else 0.0 for b in bits])
    m_t = np.repeat(amplitudes, samples_per_bit)

    # Carrier
    c_t = np.cos(2 * np.pi * fc * t)

    # Modulated signal
    tx_signal = m_t * c_t

    # Channel
    rx_signal, noise_signal = awgn(tx_signal, snr_db, bit_rate, fs)

    # Coherent demodulation: multiply by carrier, integrate over each bit
    mixer_signal = rx_signal * c_t
    threshold = (A ** 2) / 4.0  # midpoint between 0 and A^2/2

    reshaped_mixer = mixer_signal.reshape(-1, samples_per_bit)
    y_ns = np.mean(reshaped_mixer, axis=1) * 2  # factor of 2/Tb normalisation
    demod_bits = (y_ns > threshold).astype(int).tolist()

    return t, tx_signal, rx_signal, demod_bits, noise_signal, mixer_signal

# ---------------------------------------------------------------------------
# BFSK  (Binary Frequency Shift Keying)
# ---------------------------------------------------------------------------
def simulate_bfsk(bits, bit_rate, fc, fs, A, snr_db, fc2=None):
    """
    Two carrier frequencies: f1 = fc (for bit 1), f2 = fc + bit_rate (for bit 0).
    Ensures orthogonal spacing and continuous phase FSK.
    """
    if fc2 is not None:
        f1 = fc
        f2 = fc2
    else:
        # Force carriers to be integer multiples of the bit rate to guarantee
        # Continuous Phase FSK (phase is 0 mod 2pi at every bit boundary)
        f1 = max(bit_rate, round(fc / bit_rate) * bit_rate)
        f2 = f1 + bit_rate

    Tb = 1.0 / bit_rate
    samples_per_bit = int(fs * Tb)
    N = len(bits)
    total_samples = N * samples_per_bit
    t = np.arange(total_samples) / fs

    # Vectorized Signal Generation
    f_instantaneous = np.array([f1 if b == 1 else f2 for b in bits])
    f_m = np.repeat(f_instantaneous, samples_per_bit)
    tx_signal = A * np.cos(2 * np.pi * f_m * t)

    # Channel
    rx_signal, noise_signal = awgn(tx_signal, snr_db, bit_rate, fs)

    # Coherent demodulation — two correlators
    # We store the difference (corr1 - corr0) as the mixer signal for visualization
    corr1_signal = rx_signal * np.cos(2 * np.pi * f1 * t)
    corr2_signal = rx_signal * np.cos(2 * np.pi * f2 * t)
    mixer_signal = corr1_signal - corr2_signal

    reshaped_corr1 = corr1_signal.reshape(-1, samples_per_bit)
    reshaped_corr2 = corr2_signal.reshape(-1, samples_per_bit)

    y1 = np.mean(reshaped_corr1, axis=1)
    y2 = np.mean(reshaped_corr2, axis=1)

    demod_bits = (y1 > y2).astype(int).tolist()

    return t, tx_signal, rx_signal, demod_bits, noise_signal, mixer_signal

# ---------------------------------------------------------------------------
# BPSK  (Binary Phase Shift Keying)
# ---------------------------------------------------------------------------
def simulate_bpsk(bits, bit_rate, fc, fs, A, snr_db):
    """
    Bit-to-symbol mapping (antipodal):
        a[n] = +1 if b[n]=1, -1 if b[n]=0

    Modulated signal:
        s_BPSK(t) = A * a[n] * cos(2*pi*fc*t),   nTb <= t < (n+1)Tb

    Coherent demodulation:
        y[n] = (2/Tb) integral{ r(t)*cos(2*pi*fc*t) dt }
        b_hat = 1 if y[n] >= 0, else 0

    Returns: (t, tx_signal, rx_signal, demod_bits, noise_signal, mixer_signal)
    """
    Tb = 1.0 / bit_rate
    samples_per_bit = int(fs * Tb)
    N = len(bits)
    total_samples = N * samples_per_bit
    t = np.arange(total_samples) / fs

    # Antipodal mapping
    mapped = np.array([1 if b == 1 else -1 for b in bits])
    m_t = np.repeat(mapped, samples_per_bit)

    # Carrier
    c_t = np.cos(2 * np.pi * fc * t)

    # Modulated signal
    tx_signal = A * m_t * c_t

    # Channel
    rx_signal, noise_signal = awgn(tx_signal, snr_db, bit_rate, fs)

    # Coherent demodulation
    mixer_signal = rx_signal * c_t
    
    reshaped_mixer = mixer_signal.reshape(-1, samples_per_bit)
    y_ns = np.mean(reshaped_mixer, axis=1)
    demod_bits = (y_ns >= 0).astype(int).tolist()

    return t, tx_signal, rx_signal, demod_bits, noise_signal, mixer_signal

# ---------------------------------------------------------------------------
# FFT / Spectrum
# ---------------------------------------------------------------------------
def compute_spectrum(signal, fs):
    """
    Compute magnitude spectrum using FFT.
    Returns positive-frequency half only.
    """
    L = len(signal)
    fft_vals = np.fft.fft(signal)
    fft_freq = np.fft.fftfreq(L, 1.0 / fs)

    # Shift zero-frequency to center
    fft_vals = np.fft.fftshift(fft_vals)
    fft_freq = np.fft.fftshift(fft_freq)

    # Normalized magnitude
    magnitude = np.abs(fft_vals) / L

    # Positive-frequency half
    half_idx = L // 2
    return fft_freq[half_idx:], magnitude[half_idx:]

# ---------------------------------------------------------------------------
# Theoretical BER
# ---------------------------------------------------------------------------
def theoretical_ber(scheme: str, snr_db: float) -> float:
    """
    Compute theoretical BER for AWGN channel.

    BPSK:  BER = Q(sqrt(2*Eb/N0)) = 0.5 * erfc(sqrt(Eb/N0))
    BASK (OOK): BER = Q(sqrt(Eb/N0)) = 0.5 * erfc(sqrt(Eb/(2*N0)))
    BFSK (coherent): BER = Q(sqrt(Eb/N0)) = 0.5 * erfc(sqrt(Eb/(2*N0)))
    """
    eb_n0 = 10 ** (snr_db / 10.0)

    scheme_upper = scheme.upper()
    if scheme_upper == "BPSK":
        return float(0.5 * erfc(np.sqrt(eb_n0)))
    elif scheme_upper == "BASK":
        return float(0.5 * erfc(np.sqrt(eb_n0 / 2.0)))
    elif scheme_upper == "BFSK":
        return float(0.5 * erfc(np.sqrt(eb_n0 / 2.0)))
    else:
        return 0.0
