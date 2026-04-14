import React, { useState } from 'react';
import ControlPanel from './components/ControlPanel';
import ProcessVisualizer from './components/ProcessVisualizer';
import { simulateModulation } from './api';

function App() {
  const [config, setConfig] = useState({
    scheme: 'BPSK',
    bit_count: 20,
    bit_rate: 10,
    carrier_frequency: 50,
    carrier_frequency_2: "",
    amplitude: 1.0,
    sampling_frequency: 1000,
    snr_db: 10.0,
    manual_bits: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSimulate = async () => {
    setLoading(true);
    setError(null);
    try {
      const sanitizedConfig = { ...config };
      if (sanitizedConfig.carrier_frequency_2 === "") {
        sanitizedConfig.carrier_frequency_2 = null;
      }
      
      if (sanitizedConfig.manual_bits && sanitizedConfig.manual_bits.trim() !== "") {
        const bitsArray = sanitizedConfig.manual_bits.split('').map(b => parseInt(b, 10));
        sanitizedConfig.bits = bitsArray;
      }
      
      const data = await simulateModulation(sanitizedConfig);
      setResult(data);
    } catch (err) {
      console.error(err);
      let errorMessage = "Simulation failed. Check parameters and try again.";
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map(d => `${d.loc.slice(-1)[0]}: ${d.msg}`).join(" | ");
        } else {
          errorMessage = err.response.data.detail;
        }
      }
      setError(errorMessage);
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
        {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>{error}</div>}
        
        {result && <ProcessVisualizer result={result} config={config} />}
        
        {!result && !loading && (
          <div className="welcome-card" style={{ maxWidth: '850px', margin: '0 auto', padding: '2rem' }}>
            <div className="welcome-icon">📡</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Digital Modulation Lab</h2>
            <p style={{ marginBottom: '2rem' }}>Configure parameters on the left and click <strong>"Run Simulation"</strong> to visualize the complete digital communication process.</p>
            
            <div className="diagram-container">
              <div className="diagram-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Bit Generation</h4>
                  <p>Randomly generates an independent and identically distributed (i.i.d) binary sequence representing the raw digital message to be transmitted.</p>
                </div>
              </div>
              
              <div className="diagram-arrow">↓</div>
              
              <div className="diagram-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Modulation Methods</h4>
                  <p>Maps bits to analog waves. Uses <strong>On-Off Keying (OOK)</strong> for BASK, <strong>Continuous Phase FSK (CPFSK)</strong> for BFSK, and <strong>Antipodal Mapping</strong> for BPSK.</p>
                </div>
              </div>
              
              <div className="diagram-arrow">↓</div>

              <div className="diagram-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>AWGN Channel</h4>
                  <p>Simulates real-world signal attenuation and transmission loss by injecting Additive White Gaussian Noise (AWGN) based on the target E<sub>b</sub>/N<sub>0</sub>.</p>
                </div>
              </div>

              <div className="diagram-arrow">↓</div>

              <div className="diagram-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Coherent Demodulation</h4>
                  <p>Recovers bits using a <strong>Coherent Correlator</strong> (carrier multiplication). An <strong>Integrate-and-Dump</strong> (Matched) filter then acts as a Sinc Low-Pass Filter to permanently cut off the 2f<sub>c</sub> multiplier spike and average out AWGN jitter to maximize SNR.</p>
                </div>
              </div>

              <div className="diagram-arrow">↓</div>

              <div className="diagram-step group-step" style={{ background: 'transparent', border: 'none', padding: 0 }}>
                <div className="step-content analysis-group">
                  <div className="analysis-box">
                    <h4>⑤ BER Analysis</h4>
                    <p>Inference: Compares empirical Bit Error Rate vs theoretical analytical curves (erfc) to assess performance resilience under noise.</p>
                  </div>
                  <div className="analysis-box">
                    <h4>⑥ FFT Analysis</h4>
                    <p>Inference: Visualizes the signal's magnitude spectrum to display carrier spikes, modulation side-lobes, orthogonal spacing, and bandwidth footprint.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="welcome-card">
            <div className="spinner"></div>
            <h2>Running Simulation...</h2>
            <p>Computing modulation, noise, and demodulation pipeline.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
