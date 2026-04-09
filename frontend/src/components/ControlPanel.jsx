import React from "react";

export default function ControlPanel({
  config,
  setConfig,
  onSimulate,
  loading,
}) {
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
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
        <label className="label">Bit Count</label>
        <input
          type="number"
          name="bit_count"
          min="1"
          max="1000"
          value={config.bit_count}
          onChange={handleChange}
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
        <label className="label">Carrier Frequency (Hz)</label>
        <input
          type="number"
          name="carrier_frequency"
          min="1"
          value={config.carrier_frequency}
          onChange={handleChange}
        />
      </div>

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
