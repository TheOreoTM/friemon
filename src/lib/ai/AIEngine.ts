import { Battle } from '../battle/Battle';
import { AIDecision } from '../types/interfaces';
import { AIMindset } from '../types/enums';

export class AIEngine {
  mindset: AIMindset;
  proficiency: number;
  foresight: number;

  constructor(mindset: AIMindset, proficiency: number = 0.7, foresight: number = 1) {
    this.mindset = mindset;
    this.proficiency = proficiency;
    this.foresight = foresight;
  }

  makeDecision(battle: Battle, isUser: boolean): AIDecision {
    const myCharacter = isUser ? battle.state.userCharacter : battle.state.opponentCharacter;
    const availableTechniques = myCharacter.techniques;

    // Simple AI: randomly pick an available technique
    if (availableTechniques.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableTechniques.length);
      return {
        type: 'technique',
        data: randomIndex,
        reasoning: `Using ${availableTechniques[randomIndex]}`
      };
    }

    // If no techniques available, try to switch
    const party = isUser ? battle.state.userParty : battle.state.opponentParty;
    const availableCharacters = party.filter(char => !char.isDefeated());
    
    if (availableCharacters.length > 1) {
      const currentIndex = isUser ? battle.state.userActiveIndex : battle.state.opponentActiveIndex;
      let newIndex = Math.floor(Math.random() * party.length);
      
      // Make sure we don't switch to the same character or a defeated one
      while (newIndex === currentIndex || party[newIndex].isDefeated()) {
        newIndex = Math.floor(Math.random() * party.length);
      }
      
      return {
        type: 'switch',
        data: newIndex,
        reasoning: `Switching to ${party[newIndex].name}`
      };
    }

    // Fallback: use first technique
    return {
      type: 'technique',
      data: 0,
      reasoning: 'Fallback technique'
    };
  }
}

export { AIMindset };