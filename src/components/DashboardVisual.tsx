export function DashboardVisual() {
  return (
    <div className="hero-dashboard" aria-label="Abstract analytics dashboard illustration">
      <div className="dashboard-head">
        <span>Analytics overview</span>
        <span className="live-dot">Live</span>
      </div>
      <div className="dashboard-grid">
        <div className="chart-panel">
          <span className="panel-label">Performance trend</span>
          <svg viewBox="0 0 320 130" role="img" aria-label="Rising trend chart">
            <defs>
              <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="currentColor" stopOpacity=".35" />
                <stop offset="1" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="grid-line" d="M0 25h320M0 65h320M0 105h320" />
            <path className="area" d="M0 110 35 96 70 101 105 72 140 82 175 48 210 61 245 27 280 38 320 12V130H0Z" />
            <path className="trend-line" d="M0 110 35 96 70 101 105 72 140 82 175 48 210 61 245 27 280 38 320 12" />
          </svg>
        </div>
        <div className="score-panel">
          <span className="panel-label">Model readiness</span>
          <strong>86%</strong>
          <span className="meter"><i /></span>
        </div>
        <div className="pipeline-panel">
          <span className="panel-label">Data workflow</span>
          <div className="pipeline">
            <b>01</b><i /><b>02</b><i /><b>03</b><i /><b>04</b>
          </div>
          <small>Collect → Clean → Analyze → Act</small>
        </div>
        <div className="mini-panel">
          <span className="panel-label">Current focus</span>
          <div className="focus-tags"><span>Data</span><span>AI</span><span>Apps</span></div>
        </div>
      </div>
    </div>
  );
}
