import React, { useMemo } from 'react';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponentFactory from 'react-plotly.js/factory';

const createPlotlyComponent = createPlotlyComponentFactory.default || createPlotlyComponentFactory;
const Plot = createPlotlyComponent(Plotly);

const PLOT_LAYOUT_BASE = {
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  font: { color: '#f8fafc', family: 'Inter', size: 11 },
  margin: { l: 50, r: 20, t: 40, b: 45 },
  autosize: true,
  showlegend: true,
  legend: { orientation: 'h', y: -0.25, font: { size: 10 } },
};

const GRID_COLOR = '#334155';

function StageCard({ number, title, description, children }) {
  return (
    <div className="stage-card">
      <div className="stage-header">
        <div className="stage-badge">{number}</div>
        <div>
          <h3 className="stage-title">{title}</h3>
          <p className="stage-description">{description}</p>
        </div>
      </div>
      <div className="stage-content">
        {children}
      </div>
    </div>
  );
}

export default function ProcessVisualizer({ result, config }) {
  // ---- Stage 1: Bit Generation (NRZ pulse train) ----
  const bitStreamData = useMemo(() => {
    if (!result) return [];
    const bits = result.input_bits;
    const Tb = 1.0 / config.bit_rate;
    const x = [];
    const y = [];
    bits.forEach((bit, i) => {
      x.push(i * Tb);
      y.push(bit);
      x.push((i + 1) * Tb);
      y.push(bit);
    });
    return [{
      x, y,
      type: 'scatter', mode: 'lines',
      name: 'Input Bits (NRZ)',
      line: { color: '#60a5fa', width: 2.5 },
      fill: 'tozeroy',
      fillcolor: 'rgba(96, 165, 250, 0.1)',
    }];
  }, [result, config]);

  // ---- Stage 2: Modulated Signal (Transmitted) ----
  const txData = useMemo(() => {
    if (!result) return [];
    return [{
      x: result.time_axis,
      y: result.transmitted_signal,
      type: 'scatter', mode: 'lines',
      name: 'Transmitted Signal',
      line: { color: '#3b82f6', width: 1 },
    }];
  }, [result]);

  // ---- Stage 3: AWGN Channel ----
  const channelData = useMemo(() => {
    if (!result) return { combined: [], noiseOnly: [] };
    const combined = [
      {
        x: result.time_axis,
        y: result.transmitted_signal,
        type: 'scatter', mode: 'lines',
        name: 'Tx (Clean)',
        line: { color: '#3b82f6', width: 1 },
        opacity: 0.5,
      },
      {
        x: result.time_axis,
        y: result.received_signal,
        type: 'scatter', mode: 'lines',
        name: 'Rx (Noisy)',
        line: { color: '#ef4444', width: 1 },
      },
    ];
    const noiseOnly = [{
      x: result.time_axis,
      y: result.noise_signal,
      type: 'scatter', mode: 'lines',
      name: 'Noise n(t)',
      line: { color: '#f59e0b', width: 1 },
    }];
    return { combined, noiseOnly };
  }, [result]);

  // ---- Stage 4: Demodulation (Mixer Output) ----
  const demodData = useMemo(() => {
    if (!result) return [];
    return [{
      x: result.time_axis,
      y: result.demod_signal,
      type: 'scatter', mode: 'lines',
      name: 'Correlator Output',
      line: { color: '#a78bfa', width: 1 },
    }];
  }, [result]);

  // ---- Stage 5: Data Recovery ----
  const recoveryData = useMemo(() => {
    if (!result) return [];
    const bits = result.input_bits;
    const demod = result.demodulated_bits;
    const Tb = 1.0 / config.bit_rate;

    const txX = [], txY = [], rxX = [], rxY = [];
    bits.forEach((bit, i) => {
      txX.push(i * Tb); txY.push(bit);
      txX.push((i + 1) * Tb); txY.push(bit);
    });
    demod.forEach((bit, i) => {
      rxX.push(i * Tb); rxY.push(bit);
      rxX.push((i + 1) * Tb); rxY.push(bit);
    });

    return [
      {
        x: txX, y: txY,
        type: 'scatter', mode: 'lines',
        name: 'Input Bits',
        line: { color: '#60a5fa', width: 2.5 },
      },
      {
        x: rxX, y: rxY,
        type: 'scatter', mode: 'lines',
        name: 'Demodulated Bits',
        line: { color: '#10b981', width: 2, dash: 'dot' },
      },
    ];
  }, [result, config]);

  // ---- Stage 6: FFT ----
  const fftData = useMemo(() => {
    if (!result) return [];
    return [{
      x: result.frequency_axis,
      y: result.spectrum,
      type: 'scatter', mode: 'lines',
      name: 'Magnitude Spectrum',
      line: { color: '#f59e0b', width: 1.5 },
      fill: 'tozeroy',
      fillcolor: 'rgba(245, 158, 11, 0.08)',
    }];
  }, [result]);

  if (!result) return null;

  const plotStyle = { width: '100%', height: '280px' };

  return (
    <div className="process-visualizer">
      {/* Stage 1: Bit Generation */}
      <StageCard number="1" title="Information Source — Bit Generation" description="Random binary sequence b[n] ∈ {0, 1}, generated using Bernoulli(0.5)">
        <Plot
          data={bitStreamData}
          layout={{
            ...PLOT_LAYOUT_BASE,
            title: { text: 'Digital Bit Stream (NRZ)', font: { size: 13 } },
            xaxis: { title: 'Time (s)', gridcolor: GRID_COLOR, zeroline: false },
            yaxis: { title: 'Bit Value', gridcolor: GRID_COLOR, range: [-0.2, 1.4], dtick: 1 },
          }}
          useResizeHandler style={plotStyle}
        />
      </StageCard>

      {/* Stage 2: Modulation */}
      <StageCard number="2" title={`Modulation — ${config.scheme}`} description={`Carrier: cos(2πf_c t), f_c = ${config.carrier_frequency} Hz, A = ${config.amplitude}`}>
        <Plot
          data={txData}
          layout={{
            ...PLOT_LAYOUT_BASE,
            title: { text: `${config.scheme} Modulated Signal s(t)`, font: { size: 13 } },
            xaxis: { title: 'Time (s)', gridcolor: GRID_COLOR },
            yaxis: { title: 'Amplitude', gridcolor: GRID_COLOR },
          }}
          useResizeHandler style={plotStyle}
        />
      </StageCard>

      {/* Stage 3: AWGN Channel */}
      <StageCard number="3" title="AWGN Channel" description={`Noise power Pₙ = Pₛ / 10^(SNR/10), SNR = ${config.snr_db} dB`}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <Plot
            data={channelData.combined}
            layout={{
              ...PLOT_LAYOUT_BASE,
              title: { text: 'Tx vs Rx Signal', font: { size: 12 } },
              xaxis: { title: 'Time (s)', gridcolor: GRID_COLOR },
              yaxis: { title: 'Amplitude', gridcolor: GRID_COLOR },
            }}
            useResizeHandler style={{ width: '100%', height: '260px' }}
          />
          <Plot
            data={channelData.noiseOnly}
            layout={{
              ...PLOT_LAYOUT_BASE,
              title: { text: 'Noise Component n(t)', font: { size: 12 } },
              xaxis: { title: 'Time (s)', gridcolor: GRID_COLOR },
              yaxis: { title: 'Amplitude', gridcolor: GRID_COLOR },
              showlegend: false,
            }}
            useResizeHandler style={{ width: '100%', height: '260px' }}
          />
        </div>
      </StageCard>

      {/* Stage 4: Demodulation */}
      <StageCard number="4" title="Coherent Demodulation" description="Multiply received signal by reference carrier, then integrate over each bit interval">
        <Plot
          data={demodData}
          layout={{
            ...PLOT_LAYOUT_BASE,
            title: { text: 'Correlator / Mixer Output', font: { size: 13 } },
            xaxis: { title: 'Time (s)', gridcolor: GRID_COLOR },
            yaxis: { title: 'Correlation Value', gridcolor: GRID_COLOR },
          }}
          useResizeHandler style={plotStyle}
        />
      </StageCard>

      {/* Stage 5: Data Recovery */}
      <StageCard number="5" title="Data Recovery — BER Analysis" description={`Simulated BER = ${(result.ber * 100).toFixed(4)}%  |  Theoretical BER = ${(result.theoretical_ber * 100).toFixed(6)}%`}>
        <Plot
          data={recoveryData}
          layout={{
            ...PLOT_LAYOUT_BASE,
            title: { text: 'Input vs Demodulated Bits', font: { size: 13 } },
            xaxis: { title: 'Time (s)', gridcolor: GRID_COLOR },
            yaxis: { title: 'Bit Value', gridcolor: GRID_COLOR, range: [-0.2, 1.4], dtick: 1 },
          }}
          useResizeHandler style={plotStyle}
        />
        <div className="ber-comparison">
          <div className="ber-card">
            <span className="ber-label">Simulated BER</span>
            <span className="ber-value" style={{ color: result.ber > 0 ? '#ef4444' : '#10b981' }}>
              {result.ber.toExponential(4)}
            </span>
          </div>
          <div className="ber-card">
            <span className="ber-label">Theoretical BER</span>
            <span className="ber-value" style={{ color: '#a78bfa' }}>
              {result.theoretical_ber.toExponential(4)}
            </span>
          </div>
          <div className="ber-card">
            <span className="ber-label">Bit Errors</span>
            <span className="ber-value" style={{ color: result.bit_errors > 0 ? '#ef4444' : '#10b981' }}>
              {result.bit_errors} / {result.input_bits.length}
            </span>
          </div>
        </div>
      </StageCard>

      {/* Stage 6: FFT */}
      <StageCard number="6" title="Frequency Domain — FFT Analysis" description={`|S[m]| / L, positive frequencies, fₛ = ${config.sampling_frequency} Hz`}>
        <Plot
          data={fftData}
          layout={{
            ...PLOT_LAYOUT_BASE,
            title: { text: 'Magnitude Spectrum', font: { size: 13 } },
            xaxis: { title: 'Frequency (Hz)', gridcolor: GRID_COLOR },
            yaxis: { title: 'Magnitude', gridcolor: GRID_COLOR },
            showlegend: false,
          }}
          useResizeHandler style={plotStyle}
        />
      </StageCard>
    </div>
  );
}
