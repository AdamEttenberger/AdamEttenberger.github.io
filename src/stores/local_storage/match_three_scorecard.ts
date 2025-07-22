import { defineStore } from 'pinia'
import useLocalStorage from '@/composables/use_local_storage'

type MatchThreeScorecard = {
  quick_game?: {
		score: number,
		best_combo: number,
		best_turn_score: number,
	},
	combo_game?: {
    longest_game: number,
	  score: number,
		best_combo: number,
		best_turn_score: number,
	},
};

export const matchThreeScorecard = defineStore('match-three', {
  state: () => {
    var allow_saving_scorecards = useLocalStorage<Boolean>('match-three.consent', undefined);
    var scorecard = useLocalStorage<MatchThreeScorecard>('match-three.scorecard', undefined);
    watch(allow_saving_preferences, (new_value) => {
      if (new_value === true) {
        return;
      }
      scorecard.value = undefined;
    });
    return {
      allow_saving_scorecards,
      scorecard,
    }
  },
  actions: {
    clear: () => {
      this.allow_saving_scorecards = undefined;
      this.scorecard = undefined;
    },
    setScorecard: (new_value: MatchThreeScorecard) => {
      if (this.allow_saving_scorecards.value !== true) {
        return;
      }
      this.scorecard = new_value;
    },
  },
})
