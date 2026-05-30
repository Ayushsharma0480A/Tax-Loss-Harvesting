import React, { useRef } from "react";
import { formatCurrency, formatNumber, formatPrice } from "../utils/formatters";

/* ── Coin logo with initials fallback ────────────────────────────── */
const CoinLogo = ({ logo, coin }) => (
  <div className="coin-logo-wrap">
    <img
      src={logo}
      alt={coin}
      className="coin-logo"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = `https://ui-avatars.com/api/?name=${coin}&background=1a1a2e&color=7c83fd&size=32&bold=true&font-size=0.4`;
      }}
    />
  </div>
);

/* ── Gain cell (short-term / long-term gain column) ──────────────── */
const GainCell = ({ gain, balance }) => {
  const isPos = gain > 0;
  const isNeg = gain < 0;
  return (
    <div className="gain-cell">
      <span
        className={`gain-cell__amount ${isPos ? "green" : isNeg ? "red" : "neutral"}`}
      >
        {isPos ? "+" : ""}
        {formatCurrency(gain)}
      </span>
      <span className="gain-cell__balance">{formatNumber(balance)}</span>
    </div>
  );
};

/* ── Skeleton row (loading state) ────────────────────────────────── */
const SkeletonRow = () => (
  <tr className="skeleton-row">
    {[...Array(7)].map((_, i) => (
      <td key={i}>
        <div className="skeleton-cell" />
      </td>
    ))}
  </tr>
);

/* ── Sort chevron indicator ──────────────────────────────────────── */
const SortIcon = ({ sortKey, sortConfig }) => {
  if (sortConfig.key !== sortKey) {
    return <span className="sort-icon sort-icon--inactive">⇅</span>;
  }
  return (
    <span className="sort-icon sort-icon--active">
      {sortConfig.direction === "asc" ? "↑" : "↓"}
    </span>
  );
};

/* ── Main HoldingsTable component ────────────────────────────────── */
const HoldingsTable = ({
  holdings,
  visibleHoldings,
  selectedIds,
  toggleSelect,
  toggleAll,
  allVisibleSelected,
  someSelected,
  loading,
  showAll,
  setShowAll,
  processedHoldings,
  searchQuery,
  setSearchQuery,
  sortConfig,
  handleSort,
  prioritizeLosses,
  setPrioritizeLosses,
}) => {
  const headerCheckboxRef = useRef(null);

  // Sync indeterminate state imperatively via ref
  React.useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate =
        someSelected && !allVisibleSelected;
    }
  }, [someSelected, allVisibleSelected]);

  return (
    <div className="table-section" id="holdings-table">
      {/* ── Table header bar ──────────────────────────────────── */}
      <div className="table-header-row">
        <div>
          <h2 className="table-title">Holdings</h2>
          <p className="table-subtitle">
            Select assets to simulate tax-loss harvesting
          </p>
        </div>
        <div className="table-header-actions">
          {selectedIds.size > 0 && (
            <span className="selected-badge" id="selected-count-badge">
              {selectedIds.size} selected
            </span>
          )}
        </div>
      </div>

      {/* ── Toolbar: search + prioritize toggle ───────────────── */}
      <div className="table-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            id="holdings-search"
            type="text"
            placeholder="Search by coin name or ticker…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              className="search-clear"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <button
          className={`priority-toggle ${prioritizeLosses ? "priority-toggle--active" : ""}`}
          onClick={() => setPrioritizeLosses((prev) => !prev)}
          id="prioritize-losses-btn"
          title="Sort by largest unrealised losses first"
        >
          <span className="priority-icon">📉</span>
          <span className="priority-text">Best Loss Candidates</span>
        </button>
      </div>

      {/* ── Data table ────────────────────────────────────────── */}
      <div className="table-wrapper">
        <table className="holdings-table">
          <thead>
            <tr>
              <th className="th-check">
                <label className="checkbox-wrap">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    ref={headerCheckboxRef}
                    onChange={toggleAll}
                  />
                  <span className="checkmark" />
                </label>
              </th>
              <th
                className="th-sortable"
                onClick={() => handleSort("asset")}
              >
                <span>Asset</span>
                <SortIcon sortKey="asset" sortConfig={sortConfig} />
              </th>
              <th
                className="th-sortable"
                onClick={() => handleSort("holdings")}
              >
                <span>Holdings / Avg Buy</span>
                <SortIcon sortKey="holdings" sortConfig={sortConfig} />
              </th>
              <th
                className="th-sortable th-price"
                onClick={() => handleSort("price")}
              >
                <span>Current Price</span>
                <SortIcon sortKey="price" sortConfig={sortConfig} />
              </th>
              <th
                className="th-sortable th-stcg"
                onClick={() => handleSort("stcg")}
              >
                <span>Short-Term</span>
                <SortIcon sortKey="stcg" sortConfig={sortConfig} />
              </th>
              <th
                className="th-sortable th-ltcg"
                onClick={() => handleSort("ltcg")}
              >
                <span>Long-Term</span>
                <SortIcon sortKey="ltcg" sortConfig={sortConfig} />
              </th>
              <th>Amount to Sell</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              : visibleHoldings.length === 0
                ? (
                  <tr>
                    <td colSpan="7" className="empty-row">
                      {searchQuery
                        ? `No holdings found matching "${searchQuery}"`
                        : "No holdings available"}
                    </td>
                  </tr>
                )
                : visibleHoldings.map((holding) => {
                    const origIdx = holding._originalIndex;
                    const isSelected = selectedIds.has(origIdx);
                    return (
                      <tr
                        key={`${holding.coin}-${origIdx}`}
                        className={`holding-row ${isSelected ? "holding-row--selected" : ""}`}
                        onClick={() => toggleSelect(origIdx)}
                      >
                        <td
                          className="td-check"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <label
                            className="checkbox-wrap"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelect(origIdx);
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                            />
                            <span className="checkmark" />
                          </label>
                        </td>
                        <td>
                          <div className="coin-info">
                            <CoinLogo logo={holding.logo} coin={holding.coin} />
                            <div>
                              <div className="coin-symbol">{holding.coin}</div>
                              <div className="coin-name" title={holding.coinName}>
                                {holding.coinName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="holding-figures">
                            <span className="holding-amount">
                              {formatNumber(holding.totalHolding)}
                            </span>
                            <span className="holding-avg">
                              Avg: {formatPrice(holding.averageBuyPrice)}
                            </span>
                          </div>
                        </td>
                        <td className="td-price">
                          <span
                            className="current-price"
                            title={`₹${holding.currentPrice.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
                          >
                            {formatPrice(holding.currentPrice)}
                          </span>
                        </td>
                        <td className="td-stcg">
                          <GainCell
                            gain={holding.stcg.gain}
                            balance={holding.stcg.balance}
                          />
                        </td>
                        <td className="td-ltcg">
                          <GainCell
                            gain={holding.ltcg.gain}
                            balance={holding.ltcg.balance}
                          />
                        </td>
                        <td>
                          <span
                            className={`amount-to-sell ${isSelected ? "amount-to-sell--active" : ""}`}
                          >
                            {isSelected
                              ? `${formatNumber(holding.totalHolding)} ${holding.coin}`
                              : "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
          </tbody>
        </table>
      </div>

      {/* ── View All / Show Less toggle ───────────────────────── */}
      {!loading && processedHoldings.length > 5 && (
        <button
          className="view-all-btn"
          onClick={() => setShowAll(!showAll)}
          id="view-all-btn"
        >
          {showAll ? (
            <>
              <span>Show Less</span>
              <span className="btn-arrow">↑</span>
            </>
          ) : (
            <>
              <span>View All {processedHoldings.length} Holdings</span>
              <span className="btn-arrow">↓</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default HoldingsTable;
