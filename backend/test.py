from models import SimulationConfig
from main import simulate

config = SimulationConfig(
    scheme="BPSK",
    bit_count=10,
    bit_rate=2.0,
    carrier_frequency=10.0,
    amplitude=1.0,
    sampling_frequency=100.0,
    snr_db=5.0
)

res = simulate(config)
print("Input bits:", res.input_bits)
print("Demod bits:", res.demodulated_bits)
print("BER:", res.ber)
print("Tx length:", len(res.transmitted_signal))
print("Rx length:", len(res.received_signal))
