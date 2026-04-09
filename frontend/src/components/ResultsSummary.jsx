import React from 'react';

export default function ResultsSummary({ result }) {
  if (!result) return null;

  return (
    <div className="card">
      <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Simulation Summary</h2>
      <div className="summary-grid">
        <div className="summary-item">
          <div className="summary-value">{result.input_bits.length}</div>
          <div className="summary-label">Total Bits</div>
        </div>
        <div className="summary-item">
          <div className="summary-value" style={{ color: result.bit_errors > 0 ? 'var(--error)' : 'var(--success)' }}>
            {result.bit_errors}
          </div>
          <div className="summary-label">Bit Errors</div>
        </div>
        <div className="summary-item">
          <div className="summary-value" style={{ color: result.ber > 0 ? 'var(--error)' : 'var(--success)' }}>
            {(result.ber * 100).toFixed(2)}%
          </div>
          <div className="summary-label">Bit Error Rate (BER)</div>
        </div>
      </div>
    </div>
  );
}
