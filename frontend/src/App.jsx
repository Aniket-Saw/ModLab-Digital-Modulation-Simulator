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
    amplitude: 1.0,
    sampling_frequency: 1000,
    snr_db: 10.0,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSimulate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await simulateModulation(config);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('Simulation failed. Check parameters and try again.');
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
      />
      
      <main className="main-content">
        {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>{error}</div>}
        
        {result && <ProcessVisualizer result={result} config={config} />}
        
        {!result && !loading && (
          <div className="welcome-card">
            <div className="welcome-icon">📡</div>
            <h2>Digital Modulation Lab</h2>
            <p>Configure parameters on the left and click <strong>"Run Simulation"</strong> to visualize the complete digital communication process.</p>
            <div className="welcome-stages">
              <span>① Bit Generation</span>
              <span>→</span>
              <span>② Modulation</span>
              <span>→</span>
              <span>③ AWGN Channel</span>
              <span>→</span>
              <span>④ Demodulation</span>
              <span>→</span>
              <span>⑤ BER Analysis</span>
              <span>→</span>
              <span>⑥ FFT</span>
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
