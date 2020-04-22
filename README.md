# Slack Emoji Exporter
## Usage

```
node index.js --token $SLACK_TOKEN --output ./images
```

## Detailed Step by step

### Step 1. Installing node
1. Find and install the latest LTS version of [node](https://nodejs.org) for your given platform

### Step 2. Setting up this repository
1. Open up the **Terminal** (this should be your `$HOME`)
2. Run `git clone git@github.com:lamchau/slack-emoji-exporter.git`
3. `cd slack-emoji-exporter`
4. Install [`yarn`](https://classic.yarnpkg.com/en/docs/install)

    a. `curl -o- -L https://yarnpkg.com/install.sh | bash`

5. Run `yarn` (or `yarn install`)

### Step 3. Get your `SLACK_TOKEN`

Note: This will no longer work _after_ May 5th, 2020 — I'll need to update this to work with [Slack Apps](https://api.slack.com/apps?new_app=1).
1. Go to: https://api.slack.com/legacy/custom-integrations/legacy-tokens

    <img src="https://user-images.githubusercontent.com/4911400/79959972-abe2ef00-8439-11ea-9ca3-5a80ef4f5dde.png" width="50%">

2. Generate a *legacy token*

    <img src="https://user-images.githubusercontent.com/4911400/79959982-b1403980-8439-11ea-9a32-ae6a42da6b64.png" width="50%">

3. Save your *legacy token* somewhere or reference back to [legacy tokens](https://api.slack.com/legacy/custom-integrations/legacy-tokens). You'll use this later when running the script (it should start with `xoxp-`).

   **WARNING**: Legacy tokens are just for you. Never share legacy tokens with other users or applications. Do not publish Legacy tokens in public code repositories.

### Step 4. Usage
1. Copy the token from Step 3 above and replace `$SLACK_TOKEN` and run it below with the following command
    a.  `--output` will create the output in the _same_ folder as `slack-emoji-exporter`
    b.  `--limit` is the number of concurent processes to speed this up a little faster

```bash
node index.js --token $SLACK_TOKEN  --output ./images
```
