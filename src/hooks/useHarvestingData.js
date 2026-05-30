import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchHoldings, fetchCapitalGains } from "../api/mockApi";

export const useHarvestingData = () => {
  /* ── Raw state ─────────────────────────────────────────────── */
  const [holdings, setHoldings] = useState([]);
  const [capitalGains, setCapitalGains] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loadingHoldings, setLoadingHoldings] = useState(true);
  const [loadingGains, setLoadingGains] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  /* ── New interactive state ─────────────────────────────────── */
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [prioritizeLosses, setPrioritizeLosses] = useState(false);

  /* ── Data fetching ─────────────────────────────────────────── */
  const loadData = useCallback(() => {
    setLoadingHoldings(true);
    setLoadingGains(true);
    setError(null);

    fetchHoldings()
      .then((data) => {
        // Tag each holding with its original index for stable selection
        const tagged = data.map((h, i) => ({ ...h, _originalIndex: i }));
        // Default sort: total gain descending (best harvesting potential first)
        const sorted = [...tagged].sort((a, b) => {
          const gainA = a.stcg.gain + a.ltcg.gain;
          const gainB = b.stcg.gain + b.ltcg.gain;
          return gainB - gainA;
        });
        setHoldings(sorted);
      })
      .catch(() => setError("Failed to load holdings"))
      .finally(() => setLoadingHoldings(false));

    fetchCapitalGains()
      .then((data) => setCapitalGains(data.capitalGains))
      .catch(() => setError("Failed to load capital gains"))
      .finally(() => setLoadingGains(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ── Filtering + Sorting pipeline ──────────────────────────── */
  const processedHoldings = useMemo(() => {
    let list = [...holdings];

    // 1. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (h) =>
          h.coin.toLowerCase().includes(q) ||
          h.coinName.toLowerCase().includes(q)
      );
    }

    // 2. Prioritize losses toggle — surfaces assets with largest unrealised losses
    if (prioritizeLosses) {
      list.sort((a, b) => {
        const lossA = a.stcg.gain + a.ltcg.gain;
        const lossB = b.stcg.gain + b.ltcg.gain;
        return lossA - lossB; // most negative first
      });
      return list; // skip column sort when prioritizing losses
    }

    // 3. Column sort
    if (sortConfig.key) {
      const { key, direction } = sortConfig;
      const mult = direction === "asc" ? 1 : -1;

      list.sort((a, b) => {
        let valA, valB;
        switch (key) {
          case "asset":
            valA = a.coin.toLowerCase();
            valB = b.coin.toLowerCase();
            return mult * valA.localeCompare(valB);
          case "holdings":
            valA = a.totalHolding;
            valB = b.totalHolding;
            break;
          case "price":
            valA = a.currentPrice;
            valB = b.currentPrice;
            break;
          case "stcg":
            valA = a.stcg.gain;
            valB = b.stcg.gain;
            break;
          case "ltcg":
            valA = a.ltcg.gain;
            valB = b.ltcg.gain;
            break;
          default:
            return 0;
        }
        return mult * (valA - valB);
      });
    }

    return list;
  }, [holdings, searchQuery, sortConfig, prioritizeLosses]);

  /* ── Visible slice (View All / Show Less) ──────────────────── */
  const visibleHoldings = showAll
    ? processedHoldings
    : processedHoldings.slice(0, 5);

  /* ── Sort handler ──────────────────────────────────────────── */
  const handleSort = useCallback(
    (key) => {
      setSortConfig((prev) => {
        if (prev.key === key) {
          // Toggle direction, then clear
          if (prev.direction === "asc") return { key, direction: "desc" };
          return { key: null, direction: "asc" }; // 3rd click resets
        }
        return { key, direction: "asc" };
      });
      // Disable loss prioritisation when user explicitly sorts
      setPrioritizeLosses(false);
    },
    []
  );

  /* ── Selection (uses _originalIndex for stability) ─────────── */
  const toggleSelect = useCallback((originalIdx) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(originalIdx) ? next.delete(originalIdx) : next.add(originalIdx);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    const visibleOriginalIds = visibleHoldings.map((h) => h._originalIndex);
    const allSelected = visibleOriginalIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        visibleOriginalIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        visibleOriginalIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [visibleHoldings, selectedIds]);

  /* ── After-Harvesting computation ──────────────────────────── */
  const afterHarvestingGains = useMemo(() => {
    if (!capitalGains) return null;
    let stcgProfits = capitalGains.stcg.profits;
    let stcgLosses = capitalGains.stcg.losses;
    let ltcgProfits = capitalGains.ltcg.profits;
    let ltcgLosses = capitalGains.ltcg.losses;

    selectedIds.forEach((origIdx) => {
      // Find the holding by its original index tag
      const h = holdings.find((item) => item._originalIndex === origIdx);
      if (!h) return;
      const stcgGain = h.stcg.gain || 0;
      const ltcgGain = h.ltcg.gain || 0;

      if (stcgGain > 0) stcgProfits += stcgGain;
      else stcgLosses += Math.abs(stcgGain);

      if (ltcgGain > 0) ltcgProfits += ltcgGain;
      else ltcgLosses += Math.abs(ltcgGain);
    });

    return {
      stcg: { profits: stcgProfits, losses: stcgLosses },
      ltcg: { profits: ltcgProfits, losses: ltcgLosses },
    };
  }, [capitalGains, selectedIds, holdings]);

  /* ── Derived net values ────────────────────────────────────── */
  const preNetSTCG = capitalGains
    ? capitalGains.stcg.profits - capitalGains.stcg.losses
    : 0;
  const preNetLTCG = capitalGains
    ? capitalGains.ltcg.profits - capitalGains.ltcg.losses
    : 0;
  const preRealised = preNetSTCG + preNetLTCG;

  const postNetSTCG = afterHarvestingGains
    ? afterHarvestingGains.stcg.profits - afterHarvestingGains.stcg.losses
    : 0;
  const postNetLTCG = afterHarvestingGains
    ? afterHarvestingGains.ltcg.profits - afterHarvestingGains.ltcg.losses
    : 0;
  const postRealised = postNetSTCG + postNetLTCG;

  const savings = preRealised > postRealised ? preRealised - postRealised : 0;

  /* ── Checkbox helpers ──────────────────────────────────────── */
  const allVisibleSelected =
    visibleHoldings.length > 0 &&
    visibleHoldings.every((h) => selectedIds.has(h._originalIndex));
  const someSelected = visibleHoldings.some((h) =>
    selectedIds.has(h._originalIndex)
  );

  return {
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
  };
};
