export default function FamilyMascot({ multiplier }: { multiplier?: number }) {
  return (
    <div className="family-mascot" aria-hidden="true">
      <span className="mascot-spark">✦</span>
      <span className="mascot-face">{multiplier ? `×${multiplier}` : '••'}</span>
      <span className="mascot-smile" />
    </div>
  );
}
