const { Github: GithubService } = require('../services/github.service');

class Github {
 // query {owner,repo, type }
 static async getTopContributors(req, res) {
  try {
   const { owner, repo, type } = req.query;

   if (!owner || !repo || !type) {
    return res.status(400).json({ error: 'owner, repo, type are required fields' });
   }

   const response = await GithubService.getTopRepositories({ owner, repo, type });

   return res.send(response);
  } catch (error) {
   return res.status(500).json(error.message);
  }
 }
}

module.exports = { Github };
