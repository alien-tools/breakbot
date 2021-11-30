import { Octokit } from '@octokit/core';
import { config } from '@probot/octokit-plugin-config';

export default class BreakbotConfig {
  verbose: boolean = true;

  maxBCs: number = 50;

  maxClients: number = 50;

  maxDetections: number = 50;
}

export async function readConfigFile(octokit: Octokit, owner: string, repo: string, path: string) {
  const configFile = await config(octokit)
    .config
    .get({
      owner,
      repo,
      path,
    });

  const configData = new BreakbotConfig();

  if (configFile.config.verbose) {
    configData.verbose = true;
  }

  if ((configFile.config.maxBCs) && (typeof (configFile.config.maxBCs) === 'number')) {
    configData.maxBCs = configFile.config.maxBCs;
  }

  if ((configFile.config.maxClients) && (typeof (configFile.config.maxClients) === 'number')) {
    configData.maxClients = configFile.config.maxClients;
  }

  if ((configFile.config.maxDetections) && (typeof (configFile.config.maxDetections) === 'number')) {
    configData.maxDetections = configFile.config.maxDetections;
  }

  return configData;
}
