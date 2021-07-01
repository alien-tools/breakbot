import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app"

export class authDatas {
    baseRepo: string;
    baseBranch: string; //isn't the prId enough ?
    headRepo?: string;
    headBranch: string;
    prNb?: number; // seems to be the number and not the id
    headSHA?: string;
    baseSHA?: string;
    commitSHA?: string;
    installationId?: number;
    myOctokit?: any;
    checkId?: number;

    constructor() {
        this.baseRepo = ""
        this.baseBranch = ""
        this.headBranch = ""
    };

    updatePr(context: any) { //why is it impossible to have multiple constructors ?
        //this.owner = context.payload.pull_request.base.repo.owner.login

        //fullname is better, to get rid of the owner aspect and be ok with forks
        this.baseRepo = context.payload.pull_request.base.repo.full_name
        this.baseBranch = context.payload.pull_request.base.ref
        this.headRepo = context.payload.pull_request.head.repo.full_name
        this.headBranch = context.payload.pull_request.head.ref

        this.prNb = context.payload.number
        this.headSHA = context.payload.pull_request.head.sha

        this.installationId = context.payload.installation.id

        this.myOctokit = context.octokit
    }

    updateCheck(context: any) {
        // to complete
    }

    connectToGit(installationId?: number) {
        console.log("[connectToGit] Starting...")

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

        console.log("[connectToGit] Done.")
    }

    async getCheck(installationId?: number) {
        console.log("[getCheck] Starting...")

        if (!this.myOctokit) {
            this.connectToGit(installationId)
        }
        else {
            console.log("I don't need an octokit")
        }

        var branchInfos = await this.myOctokit.request("GET /repos/" + this.baseRepo + "/pulls/" + this.prNb)
        
        var branchSHA = branchInfos.data.head.sha

        var resTest = await this.myOctokit.request("/repos/" + this.baseRepo + "/commits/" + branchSHA + "/check-runs")

        var n = resTest.data.total_count
        const checks = resTest.data.check_runs

        console.log("[getCheck] Datas received from git about the checks :\n[getCheck] total_count: " + n + "\n[getCheck] checks: " + checks )

        for (let i = 0; i < n; i++) {
            if (checks[i].app.id == process.env.APP_ID) {
                this.checkId = checks[i].id
                console.log("[getCheck] My checkId is:" + this.checkId)
            }
        }
        console.log("[getCheck] Done.")
    }
}