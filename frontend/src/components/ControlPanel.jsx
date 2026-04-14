import React from "react";

export default function ControlPanel({
  config,
  setConfig,
  onSimulate,
  loading,
}) {
  const handleChange = (e) => {
    let { name, value, type } = e.target;
    
    if (name === "manual_bits") {
      value = value.replace(/[^01]/g, '');
    }

    setConfig((prev) => ({
      ...prev,
      [name]: type === "number" && value !== "" ? Number(value) : value,
    }));
  };

  return (
    <div className="sidebar">
      <div className="header">
        <h1>Modulation Analyzer</h1>
        <p>Digital Communication Lab</p>
      </div>

      <div className="form-group">
        <label className="label">Modulation Scheme</label>
        <select name="scheme" value={config.scheme} onChange={handleChange}>
          <option value="BASK">BASK (Amplitude Shift Keying)</option>
          <option value="BFSK">BFSK (Frequency Shift Keying)</option>
          <option value="BPSK">BPSK (Phase Shift Keying)</option>
        </select>
      </div>

      <div className="form-group">
        <label className="label">Manual Bit Stream</label>
        <input
          type="text"
          name="manual_bits"
          value={config.manual_bits || ""}
          onChange={handleChange}
          placeholder="e.g. 1011001"
        />
        <p style={{ opacity: 0.8, fontSize: '0.75rem', marginTop: '0.5rem' }}>Overrides Random Bit Count if provided.</p>
      </div>

      <div className="form-group">
        <label className="label">Random Bit Count</label>
        <input
          type="number"
          name="bit_count"
          min="1"
          max="1000"
          value={config.bit_count}
          onChange={handleChange}
          disabled={config.manual_bits && config.manual_bits.length > 0}
          style={{ opacity: config.manual_bits && config.manual_bits.length > 0 ? 0.3 : 1 }}
        />
      </div>

      <div className="form-group">
        <label className="label">Bit Rate (Hz)</label>
        <input
          type="number"
          name="bit_rate"
          min="1"
          value={config.bit_rate}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label className="label">
          {config.scheme === 'BFSK' ? 'Mark Frequency "f1" (Hz)' : 'Carrier Frequency (Hz)'}
        </label>
        <input
          type="number"
          name="carrier_frequency"
          min="1"
          value={config.carrier_frequency}
          onChange={handleChange}
        />
      </div>

      {config.scheme === 'BFSK' && (
        <div className="form-group" style={{ background: 'rgba(59,130,246,0.1)', padding: '1rem', borderRadius: '8px' }}>
          <label className="label">Space Frequency "f2" (Hz)</label>
          <input
            type="number"
            name="carrier_frequency_2"
            min="1"
            value={config.carrier_frequency_2}
            onChange={handleChange}
            placeholder="Auto"
          />
          <p style={{ opacity: 0.85, fontSize: '0.75rem', marginTop: '0.75rem', lineHeight: '1.4' }}>
            <strong>Tip:</strong> For Continuous Phase FSK (minimal splatter), leave this blank for automatic orthogonal spacing, or ensure f_1 and f_2 are integer multiples of the Bit Rate ({config.bit_rate} Hz).
          </p>
        </div>
      )}

      <div className="form-group">
        <label className="label">Sampling Frequency (Hz)</label>
        <input
          type="number"
          name="sampling_frequency"
          min="10"
          value={config.sampling_frequency}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label className="label">Carrier Amplitude</label>
        <input
          type="number"
          name="amplitude"
          min="0.1"
          step="0.1"
          value={config.amplitude}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label className="label">SNR (dB)</label>
        <input
          type="number"
          name="snr_db"
          step="0.5"
          value={config.snr_db}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <button
          onClick={onSimulate}
          disabled={loading}
          style={{ marginTop: "1rem" }}>
          {loading ? "Simulating..." : "Run Simulation"}
        </button>
      </div>
    </div>
  );
}
