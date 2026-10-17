type BalanceBarProps = {
  cashCents: number;
  investmentCents: number;
};

export default function BalanceBar({ cashCents, investmentCents }: BalanceBarProps) {
  const total = cashCents + investmentCents;
  const cashPercent = total > 0 ? (cashCents / total) * 100 : 0;
  const investmentPercent = total > 0 ? (investmentCents / total) * 100 : 0;

  return (
    <div className="balance-chart-bar" aria-hidden="true">
      <span className="balance-chart-cash" style={{ width: `${cashPercent}%` }} />
      <span className="balance-chart-investment" style={{ width: `${investmentPercent}%` }} />
      {cashPercent > 0 && investmentPercent > 0 && (
        <span
          className="balance-chart-blend"
          style={{
            left: `${cashPercent}%`,
            width: `min(28px, ${Math.min(cashPercent, investmentPercent) * 2}%)`,
          }}
        />
      )}
    </div>
  );
}
