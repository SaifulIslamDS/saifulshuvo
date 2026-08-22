# SaifulShuvo cPanel Deploy Runner Fix v1.0.1

This patch hardens the cPanel deployment runner after the first deployment attempt produced no usable custom log and cPanel continued to show no successful deployment.

Changes:

- Uses absolute cPanel account/repository paths in `.cpanel.yml`.
- Adds a bootstrap runner log at `~/.saifulshuvo-deploy/cpanel-runner.log`.
- Removes Bash process substitution (`tee >(...)`) from the deployment script and uses simple append redirection, which is safer in restricted cPanel task-runner environments.
- Adds line/command-aware failure logging.
- Logs Node/npm/npx discovery before building.
- Keeps the fail-safe behavior: `public_html` is only replaced after WordPress verification, architecture audit, typecheck, build, and static-output validation all pass.
- Preserves `.well-known/` and `cgi-bin/`.

## Apply

Copy `.cpanel.yml` and `scripts/cpanel-build-deploy.sh` over the existing files, commit, and push to `main`. In cPanel Git Version Control choose **Update from Remote**, then **Deploy HEAD Commit**.

If deployment still fails, inspect:

1. `/home2/saifulsh/.saifulshuvo-deploy/cpanel-runner.log`
2. `/home2/saifulsh/.saifulshuvo-deploy/logs/deploy-YYYYMMDD.log`
3. cPanel's native deployment log under `/home2/saifulsh/.cpanel/logs/vc_*_git_deploy.log`

Do not enable the cron job until one manual deployment completes successfully.
