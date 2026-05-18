/**
 * LoadingSpinner — 3D rotating cube with glow effect
 */
export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-4">
      <div className="loading-cube-wrapper">
        <div className="loading-cube">
          <div className="loading-cube-face" />
          <div className="loading-cube-face" />
          <div className="loading-cube-face" />
          <div className="loading-cube-face" />
          <div className="loading-cube-face" />
          <div className="loading-cube-face" />
        </div>
      </div>
      <p className="text-sm text-gray-400 animate-pulse tracking-wide">Loading...</p>
    </div>
  );
}
