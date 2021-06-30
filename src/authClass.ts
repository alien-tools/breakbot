import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app"

export class authDatas {
    //owner: string;
    baseRepo: string;
    baseBranch: string; //isn't the prId enough ?
    headRepo?: string;
    headBranch: string;
    prId?: number;
    headSHA?: string;
    baseSHA?: string;
    commitSHA?: string;
    installationId?: number;
    myOctokit?: any;
    checkId?: number;

    constructor() {
        //this.owner = ""
        this.baseRepo = ""
        this.baseBranch = ""
        this.headBranch = ""
    };

    updatePr(context: any) { //why is it impossible to have multiple constructors ?
        //this.owner = context.pullRequest.base.repo.owner.login
        this.baseRepo = context.pullRequest.base.repo.fullname //fullname is better, to get rid of the owner aspect and be ok with forks
        this.baseBranch = context.pullRequest.base.ref
        this.headRepo = context.pullRequest.head.repo.fullname
        this.headBranch = context.pullRequest.head.ref

        this.prId = context.pullRequest.id
        this.headSHA = context.pullRequest.head.sha

        this.installationId = context.installation.id

        this.myOctokit = context.octokit
    }

    updateCheck(context: any) {
        // to complete
    }

    connectToGit(installationId?: number) {
        if (installationId) {
            this.installationId = installationId            
        }
        this.myOctokit = new Octokit({
            authStrategy: createAppAuth,
            auth: {
                appId: process.env.APP_ID,
                privateKey: process.env.PRIVATE_KEY,
                installationId: this.installationId
            },
        });
    }

    async getCheck ( installationId: number) {
        if (!this.myOctokit) {
            this.connectToGit(installationId)
        }

        var branchInfos = await this.myOctokit.request("GET /repos/" + this.baseRepo + "/pulls/" + this.prId)
        
        var branchName = branchInfos.data.head.ref

        var resTest = await this.myOctokit.request("/repos/" + this.baseRepo + "/commits/" + branchName + "/check-runs")

        var n = resTest.data.total_count
        const checks = resTest.data.check_runs

        for (let i = 0; i < n; i++) {
            if (checks[i].app.id == process.env.APP_ID) {
                this.checkId = checks[i].id
            }
        }
    }
}