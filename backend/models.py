from pydantic import BaseModel, Field
from typing import List, Optional

class SimulationConfig(BaseModel):
    scheme: str = Field(..., description="Modulation scheme: BASK, BFSK, BPSK")
    bit_count: int = Field(10, description="Number of random bits to generate")
    bit_rate: float = Field(1.0, description="Bit rate in Hz")
    carrier_frequency: float = Field(5.0, description="Carrier frequency in Hz")
    amplitude: float = Field(1.0, description="Carrier amplitude")
    sampling_frequency: float = Field(100.0, description="Sampling frequency in Hz")
    snr_db: float = Field(10.0, description="Signal to Noise Ratio in decibels")
    bits: Optional[List[int]] = Field(None, description="Optional manual input bits. If None, random bits are generated based on bit_count")

class SimulationResult(BaseModel):
    input_bits: List[int]
    transmitted_signal: List[float]
    received_signal: List[float]
    demodulated_bits: List[int]
    bit_errors: int
    ber: float
    frequency_axis: List[float]
    spectrum: List[float]
    time_axis: List[float]
