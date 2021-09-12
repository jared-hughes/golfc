# Golfc

CLI for managing code golf solutions at https://code.golf.

⚠️ Warning: This CLI is not currently stable, so future releases may cause breaking changes.

⚠️ Warning: There is currently [no API for code.golf](https://code.golf/about). Future changes to the site may break this CLI.

## Installation

A relatively modern nodejs install is required.

```bash
git clone https://github.com/jared-hughes/golfc.git
cd golfc
npm install
npm run build
# recommended: this will add the golfc script to your $PATH
npm install -g .
```

## Usage

### Preparing a golfc workspace

Simply create a blank directory for everything to go into; `~/code-golf-sols` would work well.

### Saving the code.golf token

Of course, to fetch your solutions, the script needs your token.

In chromium-based browsers, the token can be retrieved from `__Host-session` in `about://settings/cookies/detail?site=code.golf`.

Put your token in a file named `golfc-config.json` in `~/code-golf-sols` like so:

```json
{
  "token": "yourtoke-n123-goes-here-dontshareitout"
}
```

You will have to replace the token when it expires within a month.

Here is where I would typically say "gitignore your token," but you're not going to be publishing this directory anywhere publish because it includes your (private) solutions.

### Fetch

Note: if you did _not_ run `npm install -g.` in the installation steps, then use `node ~/golfc/dist/cli.js` in the below instructions instead of `golfc`.

Run `golfc fetch` to fetch all solutions and insert them into folders.

This command will overwrite files, so be careful. You might want to use a (local) repository and commit changes.
