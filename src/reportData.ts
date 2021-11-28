import { Octokit } from '@octokit/core';
import { createAppAuth } from '@octokit/auth-app';
import authData from './authData';

export default class ReportData extends authData {
  static fromPost(baseRepo: string, installationId: number, prNb: number) {
    const newDatas = new ReportData(baseRepo, installationId);

    newDatas.prNb = prNb;

    // needs an octokit

    return newDatas;
  }

  async connectToGit() {
    console.log(`[connectToGit] Starting, with set id ${this.installationId}`);

    this.myOctokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: process.env.APP_ID,
        privateKey: process.env.PRIVATE_KEY,
        installationId: this.installationId,
      },
    });

    console.log('[connectToGit] Done.');
  }
}
