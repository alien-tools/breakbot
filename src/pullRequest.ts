export default class PullRequest {
  repository: string;

  installationId: number;

  prNb: number;

  headSHA: string;

  constructor(repository: string, installationId: number, prNb: number, headSHA: string) {
    this.repository = repository;
    this.installationId = installationId;
    this.prNb = prNb;
    this.headSHA = headSHA;
  }
}
