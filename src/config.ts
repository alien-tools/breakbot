import { Octokit } from '@octokit/core';
import { config } from '@probot/octokit-plugin-config';
import { Configuration } from '@probot/octokit-plugin-config/dist-types/types';

export default class BreakbotConfig {
  maxBCs: number = 50;

  maxClients: number = 50;

  maxDetections: number = 50;

  constructor(conf: Configuration) {
    if (typeof (conf.maxBCs) === 'number') {
      this.maxBCs = conf.maxBCs;
    }

    if (typeof (conf.maxClients) === 'number') {
      this.maxClients = conf.maxClients;
    }

    if (typeof (conf.maxDetections) === 'number') {
      this.maxDetections = conf.maxDetections;
    }
  }
}

export async function readConfigFile(octokit: Octokit, owner: string, repo: string, path: string) {
  const configFile = await config(octokit).config.get({ owner, repo, path });
  return new BreakbotConfig(configFile.config);
}
