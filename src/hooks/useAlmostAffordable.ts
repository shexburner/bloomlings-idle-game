// =============================================================================
// useAlmostAffordable — Returns true when balance >= 80% of cost but < cost
// =============================================================================

import { useMemo } from "react";

export function useAlmostAffordable(cost: number, balance: number) {
  return useMemo(() => {
    const percentage = cost > 0 ? balance / cost : 0;
    return {
      isAlmostAffordable: percentage >= 0.8 && percentage < 1,
      percentage,
    };
  }, [cost, balance]);
}
