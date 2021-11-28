import authData from './authData';

export default class WebhookData extends authData {
  constructor(baseRepo: string, installationId: number, myOctokit: any) {
    super(baseRepo, installationId);
    this.myOctokit = myOctokit;
  }

  static fromPr(context: any) {
    const newDatas = new WebhookData(context.payload.pull_request.base.repo.full_name, context.payload.installation.id, context.octokit);

    newDatas.headSHA = context.payload.pull_request.head.sha;

    newDatas.prNb = context.payload.number;

    return newDatas;
  }

  static fromCheck(context: any) {
    const newDatas = new WebhookData(context.payload.repository.full_name, context.payload.installation.id, context.octokit);

    newDatas.headSHA = context.payload.check_run.head_sha;

    // needs prNb

    return newDatas;
  }

  async getPrNb() {
    const pullsList = await this.myOctokit.request(`GET /repos/${this.baseRepo}/pulls`);

    const myPull = pullsList.data.find((pull: any) => pull.head.sha === this.headSHA);

    this.prNb = myPull.number;
  }
}
