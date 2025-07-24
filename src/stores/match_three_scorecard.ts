import { ref } from 'vue'
import { defineStore } from 'pinia'
import MatchThreeScorecard from '@/types/match_three_scorecard'

export const useMatchThreeScorecardStore = defineStore('match-three-scorecard', () => {
  const scorecard = ref(null);

  function $reset() {
    scorecard.value = null;
  }

  return {
    // State
    scorecard,
    // Actions
    $reset,
  };
})
