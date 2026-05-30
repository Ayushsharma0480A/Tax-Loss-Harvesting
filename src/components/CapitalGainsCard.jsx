import React from "react";
import { formatCurrency } from "../utils/formatters";

const GainRow = ({ label, profits, losses, net, isAfter }) => {
  const netPositive = net >= 0;
  return (
    <div className="gain-row">
      <span className="gain-label">{label}</span>
      <div className="gain-figures">
        <div className="gain-item">
          <span className="gain-sublabel">Profits</span>
          <span className="gain-value profit">{formatCurrency(profits)}</span>
        </div>
        <div className="gain-separator" />
        <div className="gain-item">
          <span className="gain-sublabel">Losses</span>
          <span className="gain-value loss">{formatCurrency(losses)}</span>
        </div>
        <div className="gain-separator" />
        <div className="gain-item">
          <span className="gain-sublabel">Net Gain</span>
          <span className={`gain-value net ${netPositive ? "profit" : "loss"}`}>
            {formatCurrency(net)}
          </span>
        </div>
      </div>
    </div>
  );
};

const CapitalGainsCard = ({
  title,
  stcg,
  ltcg,
  netSTCG,
  netLTCG,
  realised,
  isAfter,
  savings,
  loading,
}) => {
  return (
    <div className={`gains-card ${isAfter ? "gains-card--after" : "gains-card--before"}`}>
      <div className="gains-card__header">
        <h3 className="gains-card__title">{title}</h3>
        {isAfter && savings > 0 && (
          <div className="savings-badge">
            <span className="savings-icon">🎉</span>
            <span>You're going to save <strong>{formatCurrency(savings)}</strong></span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="skeleton-block">
          <div className="skeleton-line" />
          <div className="skeleton-line skeleton-line--short" />
          <div className="skeleton-line" />
          <div className="skeleton-line skeleton-line--short" />
        </div>
      ) : (
        <>
          <div className="gains-rows">
            <GainRow
              label="Short-term"
              profits={stcg?.profits || 0}
              losses={stcg?.losses || 0}
              net={netSTCG}
              isAfter={isAfter}
            />
            <div className="gains-divider" />
            <GainRow
              label="Long-term"
              profits={ltcg?.profits || 0}
              losses={ltcg?.losses || 0}
              net={netLTCG}
              isAfter={isAfter}
            />
          </div>

          <div className="gains-total">
            <span className="gains-total__label">Realised Capital Gains</span>
            <span className={`gains-total__value ${realised >= 0 ? "profit" : "loss"}`}>
              {formatCurrency(realised)}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default CapitalGainsCard;
