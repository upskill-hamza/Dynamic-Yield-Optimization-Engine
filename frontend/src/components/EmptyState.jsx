export default function EmptyState() {
  return (
    <div className="empty-state fade-in">
      <svg className="empty-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
      <h3 className="empty-state__title">Ready to Optimize</h3>
      <p className="empty-state__text">
        Configure your simulation parameters above and click <strong>"Run Simulation"</strong> to
        see how different algorithms balance exploration and exploitation across your marketing campaigns.
      </p>
    </div>
  );
}
