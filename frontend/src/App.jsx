import ControlPanel from "./components/ControlPanel";
import ResultsSummary from "./components/ResultsSummary";
import WaveformPlot from "./components/WaveformPlot";
import SpectrumPlot from "./components/SpectrumPlot";
import { simulateModulation } from "./api";
import { useState } from "react";

function App() {
  const [config, setConfig] = useState({
    scheme: "BPSK",
    bit_count: 20,
    bit_rate: 100,
    carrier_frequency: 1000,
    amplitude: 1.0,
    sampling_frequency: 10000,
    snr_db: 10.0,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("waveform");

  const handleSimulate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await simulateModulation(config);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Simulation failed. Check parameters and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <ControlPanel
        config={config}
        setConfig={setConfig}
        onSimulate={handleSimulate}
        loading={loading}
        onResult={setResult}
      />

      <main className="main-content">
        {error && (
          <div style={{ color: "var(--error)", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <ResultsSummary result={result} />

        {result && (
          <div className="card">
            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === "waveform" ? "active" : ""}`}
                onClick={() => setActiveTab("waveform")}>
                Time Domain
              </button>
              <button
                className={`tab-btn ${activeTab === "spectrum" ? "active" : ""}`}
                onClick={() => setActiveTab("spectrum")}>
                Frequency Domain
              </button>
            </div>

            <div className="tab-content" style={{ minHeight: "400px" }}>
              {activeTab === "waveform" && <WaveformPlot result={result} />}
              {activeTab === "spectrum" && <SpectrumPlot result={result} />}
            </div>

            <div
              style={{
                marginTop: "1.5rem",
                paddingTop: "1rem",
                borderTop: "1px solid var(--border-color)",
              }}>
              <h3>Input vs Output Bits</h3>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginTop: "0.5rem",
                  fontSize: "0.9rem",
                }}>
                <div style={{ flex: "1 1 100%" }}>
                  <strong>Tx: </strong>
                  <span style={{ color: "var(--primary-color)" }}>
                    {result.input_bits.join("")}
                  </span>
                </div>
                <div style={{ flex: "1 1 100%" }}>
                  <strong>Rx: </strong>
                  <span
                    style={{
                      color:
                        result.bit_errors > 0
                          ? "var(--error)"
                          : "var(--success)",
                    }}>
                    {result.demodulated_bits.join("")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!result && !loading && (
          <div
            className="card"
            style={{
              textAlign: "center",
              padding: "3rem 1rem",
              color: "var(--text-muted)",
            }}>
            <h2>Welcome to Digital Modulation Analyzer</h2>
            <p>
              Select your parameters on the left and click "Run Simulation" to
              begin.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
