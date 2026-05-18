/**
 * AnimatedBackground — Floating gradient orbs for Login/Register pages
 * Pure CSS, GPU-accelerated, no external library needed.
 */
export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </div>
  );
}
