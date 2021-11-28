import { Octokit } from '@octokit/core';

export default class PullRequest {
  octokit: Octokit;

  repository: string;

  installationId: number;

  prNb: number;

  headSHA: string;

  constructor(octokit: Octokit, repository: string, installationId: number, prNb: number, headSHA: string) {
    this.octokit = octokit;
    this.repository = repository;
    this.installationId = installationId;
    this.prNb = prNb;
    this.headSHA = headSHA;
  }
}
