const sparkles = Array.from({ length: 12 }, (_, index) => ({
  id: index,
  style: {
    top: `${10 + (index % 6) * 14}%`,
    left: `${8 + Math.floor(index / 2) * 14}%`,
    animationDelay: `${index * 0.15}s`,
  },
}));

export default function SplashScreen() {
  return (
    <div className="splash-screen" role="status" aria-live="polite">
      <div className="splash-noise" />
      <div className="splash-orbit splash-orbit-one" />
      <div className="splash-orbit splash-orbit-two" />

      {sparkles.map((sparkle) => (
        <span
          key={sparkle.id}
          className="splash-sparkle"
          style={sparkle.style}
          aria-hidden="true"
        />
      ))}

      <div className="splash-content">
        <div className="splash-logo-wrap">
          <img
            src="/owner-pranjal.png"
            alt="Pranjal Boutique Logo"
            className="splash-logo"
          />
        </div>
        <p className="splash-tag">
          <span className="splash-tag-text">Pranjal Boutique</span>
        </p>
      </div>
    </div>
  );
}
