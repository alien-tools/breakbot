export default class BreakbotConfig {
  maxBCs: number = 50;

  maxClients: number = 50;

  maxBrokenUses: number = 50;

  constructor(other?: BreakbotConfig) {
    if (other?.maxBCs) {
      this.maxBCs = other.maxBCs;
    } if (other?.maxClients) {
      this.maxClients = other.maxClients;
    } if (other?.maxBrokenUses) {
      this.maxBrokenUses = other.maxBrokenUses;
    }
  }
}
