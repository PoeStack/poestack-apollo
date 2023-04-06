import { Octokit } from "octokit";
import { singleton } from "tsyringe";

@singleton()
export default class GithubService {
  private readonly octokit = new Octokit({
    auth: process.env.GITHUB_PUBLIC_DATA_TOKEN,
  });

  public async uploadContentToFile(
    path: string,
    content: string,
    message: string
  ) {
    const blobSha = await this.createBlob(content);
    const lastCommitSha = await this.getLastCommitSha();
    const treeSha = await this.createTree(lastCommitSha, [
      {
        path: path,
        sha: blobSha,
      },
    ]);
    const commitSha = await this.createCommit(message, lastCommitSha, treeSha);
    await this.updateMaster(commitSha);
  }

  private async updateMaster(commitSha: string): Promise<string> {
    const resp = await this.octokit.request(
      "POST /repos/:owner/:repo/git/refs/heads/master",
      {
        owner: "PoeStack",
        repo: "poestack-public-data",
        ref: "refs/heads/master",
        sha: commitSha,
      }
    );
    const data = resp?.data;
    return data?.sha;
  }

  private async createCommit(
    message: string,
    lastCommitSha: string,
    treeSha: string
  ): Promise<string> {
    const resp = await this.octokit.request(
      "POST /repos/:owner/:repo/git/commits",
      {
        owner: "PoeStack",
        repo: "poestack-public-data",
        message: message,
        author: { name: "zach-herridge", email: "zgherridge@gmail.com" },
        parents: [lastCommitSha],
        tree: treeSha,
      }
    );
    const data = resp?.data;
    return data?.sha;
  }

  private async getLastCommitSha(): Promise<string> {
    const resp = await this.octokit.request(
      "GET /repos/:owner/:repo/branches/:branchName",
      {
        owner: "PoeStack",
        repo: "poestack-public-data",
        branchName: "master",
      }
    );
    const data = resp?.data;
    return data?.commit?.sha;
  }

  private async createTree(
    baseTree: string,
    tree: Array<{ path: string; sha: string }>
  ): Promise<any> {
    const mappedTree = tree.map((e) => ({
      ...e,
      mode: "100644",
      type: "blob",
    }));
    const blobResp = await this.octokit.request(
      "POST /repos/:owner/:repo/git/trees",
      {
        owner: "PoeStack",
        repo: "poestack-public-data",

        base_tree: baseTree,
        tree: mappedTree,
      }
    );
    const blobData = blobResp?.data;
    return blobData?.sha;
  }

  private async createBlob(content: string): Promise<string> {
    const blobResp = await this.octokit.request(
      "POST /repos/:owner/:repo/git/blobs",
      {
        owner: "PoeStack",
        repo: "poestack-public-data",
        content,
        encoding: "utf-8",
      }
    );
    const blobData = blobResp?.data;
    return blobData?.sha;
  }
}
