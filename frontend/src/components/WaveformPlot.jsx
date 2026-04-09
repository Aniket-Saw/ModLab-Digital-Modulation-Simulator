import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';

export default function WaveformPlot({ result }) {
  const plotData = useMemo(() => {
    if (!result) return [];

    const timeAxes = result.time_axis;
    const tx = {
      x: timeAxes,
      y: result.transmitted_signal,
      type: 'scatter',
      mode: 'lines',
      name: 'Transmitted Signal',
      line: { color: '#3b82f6' }
    };

    const rx = {
      x: timeAxes,
      y: result.received_signal,
      type: 'scatter',
      mode: 'lines',
      name: 'Received (Noisy) Signal',
      line: { color: '#ef4444' }
    };

    return [tx, rx];
  }, [result]);

  if (!result) {
    return <div className="card">Run a simulation to view waveforms.</div>;
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <Plot
        data={plotData}
        layout={{
          title: 'Time Domain Waveform',
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { color: '#f8fafc', family: 'Inter' },
          xaxis: { title: 'Time (s)', gridcolor: '#334155' },
          yaxis: { title: 'Amplitude', gridcolor: '#334155' },
          margin: { l: 50, r: 20, t: 50, b: 50 },
          autosize: true,
          showlegend: true,
          legend: { orientation: 'h', y: -0.2 }
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '400px' }}
      />
    </div>
  );
}
