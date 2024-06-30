// eslint-disable-next-line import/no-extraneous-dependencies
const Fastq = require('fastq');
const { Github: GithubAdapter } = require('../adapter/github.adapter');

// TODO refactor add constants
const STATISTICS_TYPE = { year: 'year', all: 'all' };

class Github {
  async getTopRepositories({ repo, owner, type }) {
    // TODO refactor
    let responses;
    if (type === STATISTICS_TYPE.year) {
      responses = await this.getTopRepositoriesLastYear({ owner, repo });
    } else if (type === STATISTICS_TYPE.all) {
      responses = await this.getTopRepositoriesAll({ owner, repo });
    }
    return { data: responses, count: responses.length };
  }

  // recently = ~1year, check documentation Github api
  async getTopRepositoriesLastYear({ repo, owner }) {
    const userContributors = await this.#getUserContributors({ owner, repo });
    return this.getRepoContributedToLastYear({ owner, repo, userContributors });
  }

  async getTopRepositoriesAll({ repo, owner }) {
    const contributors = await this.#getUserContributors({ owner, repo });
    const topDuplicates = await this.#getRepoContributedToLastYear({
      owner,
      repo,
      count: 20,
      userContributors: contributors,
    });

    const countContributors = {};
    const queueGetuserRepoUniq = Fastq.promise(async (task) => {
      const { contributors: localContributors, owner: ownerTask, repo: _repo, url } = await task();

      const fullName = `${ownerTask}_${_repo}`;

      localContributors.forEach((obj) => {
        const { login } = obj;
        if (contributors.some((objData) => objData.login === login)) {
          if (countContributors[fullName]) {
            countContributors[fullName].count += 1;
          } else {
            countContributors[fullName] = {
              count: 1,
              url,
              owner: ownerTask,
              name: _repo,
            };
          }
        }
      });
    }, 20);

    for (const repositoryTop of topDuplicates) {
      queueGetuserRepoUniq.push(async () => {
      
