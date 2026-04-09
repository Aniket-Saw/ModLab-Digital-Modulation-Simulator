import numpy as np

def generate_random_bits(bit_count: int):
    return np.random.randint(0, 2, bit_count).tolist()

def awgn(signal, snr_db):
    """
    Adds Additive White Gaussian Noise to a signal using a given SNR in dB.
    """
    snr_linear = 10 ** (snr_db / 10.0)
    signal_power = np.mean(signal ** 2)
    noise_power = signal_power / snr_linear
    noise = np.sqrt(noise_power) * np.random.randn(len(signal))
    return signal + noise

def simulate_bask(bits, bit_rate, fc, fs, A, snr_db):
    Tb = 1.0 / bit_rate
    t = np.arange(0, len(bits) * Tb, 1.0 / fs)
    # Generate modulating signal m(t)
    m_t = np.repeat(bits, int(fs * Tb))
    # Generate carrier signal
    c_t = A * np.sin(2 * np.pi * fc * t)
    # Modulated signal
    tx_signal = m_t[:len(t)] * c_t
    
    # Passing through channel
    rx_signal = awgn(tx_signal, snr_db)
    
    # Demodulation
    mixer = rx_signal * c_t
    
    samples_per_bit = int(fs * Tb)
    demod_bits = []
    
    threshold = (A**2 / 2) / 2 # threshold
    for i in range(len(bits)):
        start = i * samples_per_bit
        end = start + samples_per_bit
        integrated_val = np.mean(mixer[start:end])
        if integrated_val > threshold:
            demod_bits.append(1)
        else:
            demod_bits.append(0)
            
    return t, tx_signal, rx_signal, demod_bits

def simulate_bpsk(bits, bit_rate, fc, fs, A, snr_db):
    Tb = 1.0 / bit_rate
    t = np.arange(0, len(bits) * Tb, 1.0 / fs)
    
    # Map bits: 1 -> 1, 0 -> -1
    mapped_bits = 2 * np.array(bits) - 1
    m_t = np.repeat(mapped_bits, int(fs * Tb))
    
    c_t = A * np.sin(2 * np.pi * fc * t)
    tx_signal = m_t[:len(t)] * c_t
    
    rx_signal = awgn(tx_signal, snr_db)
    
    mixer = rx_signal * c_t
    samples_per_bit = int(fs * Tb)
    demod_bits = []
    for i in range(len(bits)):
        start = i * samples_per_bit
        end = start + samples_per_bit
        integrated_val = np.mean(mixer[start:end])
        if integrated_val > 0:
            demod_bits.append(1)
        else:
            demod_bits.append(0)
            
    return t, tx_signal, rx_signal, demod_bits

def simulate_bfsk(bits, bit_rate, fc, fs, A, snr_db):
    # For BFSK, we need two frequencies. We'll set f1 = fc, f0 = fc + 2*bit_rate as a simple spacing.
    f1 = fc
    f0 = fc + 2 * bit_rate 
    Tb = 1.0 / bit_rate
    t = np.arange(0, len(bits) * Tb, 1.0 / fs)
    
    tx_signal = np.zeros(len(t))
    samples_per_bit = int(fs * Tb)
    
    for i, bit in enumerate(bits):
        start = i * samples_per_bit
        end = start + samples_per_bit
        t_bit = t[start:end]
        if bit == 1:
            tx_signal[start:end] = A * np.sin(2 * np.pi * f1 * t_bit)
        else:
            tx_signal[start:end] = A * np.sin(2 * np.pi * f0 * t_bit)
            
    rx_signal = awgn(tx_signal, snr_db)
    
    # Coherent demodulation with two correlators
    demod_bits = []
    for i in range(len(bits)):
        start = i * samples_per_bit
        end = start + samples_per_bit
        t_bit = t[start:end]
        r_bit = rx_signal[start:end]
        
        corr1 = np.mean(r_bit * np.sin(2 * np.pi * f1 * t_bit))
        corr0 = np.mean(r_bit * np.sin(2 * np.pi * f0 * t_bit))
        
        if corr1 > corr0:
            demod_bits.append(1)
        else:
            demod_bits.append(0)
            
    return t, tx_signal, rx_signal, demod_bits

def compute_spectrum(signal, fs):
    # Compute FFT
    fft_vals = np.fft.fft(signal)
    fft_freq = np.fft.fftfreq(len(signal), 1.0 / fs)
    
    # Shift zero frequency to center
    fft_vals = np.fft.fftshift(fft_vals)
    fft_freq = np.fft.fftshift(fft_freq)
    
    # We'll just return magnitude spectrum
    magnitude = np.abs(fft_vals) / len(signal)
    
    # Filter to positive frequencies for plotting if desired, or keep both.
    # We will keep half spectrum for clearer output
    half_idx = len(magnitude) // 2
    return fft_freq[half_idx:], magnitude[half_idx:]
