import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';

export default function SpectrumPlot({ result }) {
  const plotData = useMemo(() => {
    if (!result) return [];

    const spec = {
      x: result.frequency_axis,
      y: result.spectrum,
      type: 'scatter',
      mode: 'lines',
      name: 'Magnitude Spectrum',
      line: { color: '#f59e0b', width: 1.5 }
    };

    return [spec];
  }, [result]);

  if (!result) {
    return <div className="card">Run a simulation to view the spectrum.</div>;
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <Plot
        data={plotData}
        layout={{
          title: 'Frequency Domain Spectrum',
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { color: '#f8fafc', family: 'Inter' },
          xaxis: { title: 'Frequency (Hz)', gridcolor: '#334155' },
          yaxis: { title: 'Magnitude', gridcolor: '#334155' },
          margin: { l: 50, r: 20, t: 50, b: 50 },
          autosize: true,
          showlegend: false
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '400px' }}
      />
    </div>
  );
}
