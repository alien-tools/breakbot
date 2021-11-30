export default class BreakbotConfig {
  maxBCs: number = 50;

  maxClients: number = 50;

  maxDetections: number = 50;

  constructor(other?: BreakbotConfig) {
    if (other?.maxBCs) {
      this.maxBCs = other.maxBCs;
    } if (other?.maxClients) {
      this.maxClients = other.maxClients;
    } if (other?.maxDetections) {
      this.maxDetections = other.maxDetections;
    }
  }
}
