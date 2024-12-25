# Golfc

CLI for managing code golf solutions at https://code.golf.

⚠️ Warning: This CLI is not currently stable, so future releases may cause breaking changes.

⚠️ Warning: There is currently [no API for code.golf](https://code.golf/about). Future changes to the site may break this CLI.

## Installation

```
npm install golfc --location=global
```

To uninstall, use

```
npm uninstall golfc --location=global
```

## Usage

### Preparing a golfc workspace

Simply create a blank directory for everything to go into; `~/code-golf-sols` would work well.

### Saving the code.golf token

Of course, to fetch your solutions, the script needs your token.

In Chromium-based browsers, the token can be retrieved from `__Host-session` in `about://settings/cookies/detail?site=code.golf` or from Application/Storage/Cookies in the browser developer tools (Ctrl+Shift+I).

The easiest way to provide the token is by an environment variable like `export CODE_GOLF_TOKEN=yourtoke-n123-goes-here-0123456789abcd`.

You could also put the token in a `.env` file like so:

```
CODE_GOLF_TOKEN=yourtoke-n123-goes-here-0123456789abcd
```

Here is where I would typically say "gitignore your `.env` file," but you're not going to be publishing this directory anywhere public because it includes your (private) solutions.

You will have to replace the token when it expires in a couple months.

## Development

A relatively modern nodejs install is required.

```bash
git clone https://github.com/jared-hughes/golfc.git
cd golfc
npm install
npm run build
# recommended: this will add the golfc script to your $PATH
npm install . --location=global
```

### Fetch

Run `golfc fetch` to fetch all solutions and insert them into folders.

This command will overwrite files, so be careful. You might want to use a (local) repository and commit changes.

### Submit

Run `golfc submit -h fibonacci -l python -i somedir/fibonacci.py` to submit your solution at `somedir/fibonacci.py` as python code to the Fibonacci hole.

Output, including stdout, stderr, and error messages, will be placed in the `./output/` directory. The `./output/` directory is created if it doesn't already exist.
