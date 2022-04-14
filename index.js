const core = require("@actions/core");
const github = require("@actions/github");

try {
    const octokit = github.getOctokit(core.getInput("github_token"));
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
    octokit.request('GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs', {
        owner,
        repo,
        workflow_id: 'deploy-dev.aws.yml',
        per_page: 100
    })
    .then((res) => {
      const workflows = res.data.workflow_runs;
      const lastSuccessRun = workflows.find(run => run.status === 'completed' && run.conclusion === 'success');
      const commitToTake = lastSuccessRun ?? (workflows.length > 0 ? workflows[workflows.length - 1] : null)
      const lastSuccessCommitHash = commitToTake ? commitToTake.head_commit.id : "";
      core.setOutput("commit_hash", lastSuccessCommitHash);
    })
    .catch((e) => {
      core.setFailed(e.message);
    });
} catch (e) {
  core.setFailed(e.message);
}
