import { execSync } from 'node:child_process';

export function getGitRepoDetails(): { gitOwner: string; repoName: string } {
  const gitRemoteUrl = execSync('git config --get remote.origin.url').toString().trim();
  const urlPattern = /(?:git@|https:\/\/)([\w\.@:]+)[\/:]([\w,.,-]+)\/([\w,.,-]+?)(\.git)?$/;
  const match = gitRemoteUrl.match(urlPattern);

  if (!match) {
    throw new Error('Unable to parse git repository URL');
  }

  const [, , gitOwner, repoName] = match;
  return { gitOwner, repoName };
}
