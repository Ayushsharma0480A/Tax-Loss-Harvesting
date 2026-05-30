import React, { useState } from "react";
import CapitalGainsCard from "./components/CapitalGainsCard";
import HoldingsTable from "./components/HoldingsTable";
import { useHarvestingData } from "./hooks/useHarvestingData";
import "./App.css";

function App() {
  const {
    holdings,
    processedHoldings,
    visibleHoldings,
    capitalGains,
    afterHarvestingGains,
    selectedIds,
    toggleSelect,
    toggleAll,
    allVisibleSelected,
    someSelected,
    loadingHoldings,
    loadingGains,
    error,
    loadData,
    showAll,
    setShowAll,
    searchQuery,
    setSearchQuery,
    sortConfig,
    handleSort,
    prioritizeLosses,
    setPrioritizeLosses,
    preNetSTCG,
    preNetLTCG,
    preRealised,
    postNetSTCG,
    postNetLTCG,
    postRealised,
    savings,
  } = useHarvestingData();

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-icon-wrap">
          <span className="error-icon">⚠</span>
        </div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button className="error-retry-btn" onClick={loadData}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="app-header">
        <div className="header-inner">
          <div className="logo-area">
            <span className="logo-mark">K</span>
            <span className="logo-text">
              oin<strong>X</strong>
            </span>
          </div>
          <nav className="header-nav">
            <span className="nav-item active">Tax Tools</span>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {/* ── Page Title ─────────────────────────────────────── */}
        <div className="page-title-area">
          <div className="page-breadcrumb">
            Tax Tools <span>/</span> Tax Optimisation
          </div>
          <div className="page-title-row">
            <h1 className="page-title">Tax Optimisation</h1>
            <div className="how-it-works-wrap">
              <span className="how-it-works-link">How it works?</span>
              <div className="how-it-works-tooltip">
                <ul>
                  <li>See your capital gains for FY 2024-25 in the left card</li>
                  <li>Check boxes for assets you plan on selling to reduce your tax liability</li>
                  <li>Instantly see your updated tax liability in the right card</li>
                </ul>
                <p className="tooltip-pro-tip">
                  <strong>Pro tip:</strong> Experiment with different combinations of your holdings to optimize your tax liability
                </p>
              </div>
            </div>
          </div>
          <div className="info-banner">
            <span className="info-icon">ℹ</span>
            <span>
              <strong>Important:</strong> Figures shown are estimates based on current prices.
              Consult a tax advisor before making investment decisions.
            </span>
          </div>
        </div>

        {/* ── Capital Gains Cards ────────────────────────────── */}
        <div className="cards-grid">
          <CapitalGainsCard
            title="Pre-Harvesting"
            stcg={capitalGains?.stcg}
            ltcg={capitalGains?.ltcg}
            netSTCG={preNetSTCG}
            netLTCG={preNetLTCG}
            realised={preRealised}
            isAfter={false}
            loading={loadingGains}
          />
          <div className="cards-connector">
            <div className="connector-line" />
            <div className="connector-icon">→</div>
            <div className="connector-line" />
          </div>
          <CapitalGainsCard
            title="After Harvesting"
            stcg={afterHarvestingGains?.stcg}
            ltcg={afterHarvestingGains?.ltcg}
            netSTCG={postNetSTCG}
            netLTCG={postNetLTCG}
            realised={postRealised}
            isAfter={true}
            savings={savings}
            loading={loadingGains}
          />
        </div>

        {/* ── Holdings Table ─────────────────────────────────── */}
        <HoldingsTable
          holdings={holdings}
          processedHoldings={processedHoldings}
          visibleHoldings={visibleHoldings}
          selectedIds={selectedIds}
          toggleSelect={toggleSelect}
          toggleAll={toggleAll}
          allVisibleSelected={allVisibleSelected}
          someSelected={someSelected}
          loading={loadingHoldings}
          showAll={showAll}
          setShowAll={setShowAll}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortConfig={sortConfig}
          handleSort={handleSort}
          prioritizeLosses={prioritizeLosses}
          setPrioritizeLosses={setPrioritizeLosses}
        />
      </main>

      <footer className="app-footer">
        <span>© 2025 KoinX · Tax Loss Harvesting Tool</span>
      </footer>
    </div>
  );
}

export default App;
