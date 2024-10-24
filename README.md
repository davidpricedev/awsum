# gacs

aws sso cli utility

This tool allows you to populate your ~/.aws/config with all the sso roles that you have access to - and makes it easy to switch between profiles.
It uses [oclif](https://oclif.io/) as the cli framework to make things easy to develop and extend.

<!-- toc -->

- [gacs](#gacs)
<!-- tocstop -->

## Dependencies

- AWS CLI

## Usage

<!-- usage -->

```sh-session
$ npm install -g gacs
$ gacs COMMAND
running command...
$ gacs (--version)
gacs/0.1.0 darwin-arm64 node-v22.9.0
$ gacs --help [COMMAND]
USAGE
  $ gacs COMMAND
...
```

<!-- usagestop -->

## Commands

<!-- commands -->

- [`gacs help [COMMAND]`](#gacs-help-command)
- [`gacs update [CHANNEL]`](#gacs-update-channel)

## `gacs help [COMMAND]`

Display help for gacs.

```
USAGE
  $ gacs help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for gacs.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.11/src/commands/help.ts)_

## `gacs update [CHANNEL]`

update the gacs CLI

```
USAGE
  $ gacs update [CHANNEL] [--force |  | [-a | -v <value> | -i]] [-b ]

FLAGS
  -a, --available        See available versions.
  -b, --verbose          Show more details about the available versions.
  -i, --interactive      Interactively select version to install. This is ignored if a channel is provided.
  -v, --version=<value>  Install a specific version.
      --force            Force a re-download of the requested version.

DESCRIPTION
  update the gacs CLI

EXAMPLES
  Update to the stable channel:

    $ gacs update stable

  Update to a specific version:

    $ gacs update --version 1.0.0

  Interactively select version:

    $ gacs update --interactive

  See available versions:

    $ gacs update --available
```

_See code: [@oclif/plugin-update](https://github.com/oclif/plugin-update/blob/v4.6.3/src/commands/update.ts)_

<!-- commandsstop -->

- [gacs](#gacs)
  - [Dependencies](#dependencies)
  - [Usage](#usage)
  - [Commands](#commands)
  - [`gacs help [COMMAND]`](#gacs-help-command)
  - [`gacs update [CHANNEL]`](#gacs-update-channel)
  - [`gacs sso setup`](#gacs-sso-setup)
  - [`gacs sso login`](#gacs-sso-login)
  - [`gacs sso profile`](#gacs-sso-profile)
  - [`gacs sso installSwitcher`](#gacs-sso-installswitcher)
  - [Contributing](#contributing)
  - [Publishing](#publishing)
  - [Future](#future)

## `gacs sso setup`

Usage:

Arguments:

Flags:

## `gacs sso login`

Usage:

Arguments:

Flags:

## `gacs sso profile`

Usage:

Arguments:

Flags:

## `gacs sso installSwitcher`

Usage:

Arguments:

Flags:

## Contributing

- Clone the repo
- `npm install` to install dependencies
- `npm install -g oclif` for the oclif command line tools
- `npm run build` to build the project
- `bin/run.js ...` to run the cli tooling without installing it

## [Publishing](./publishing.md)

## Future

- switch to the built-in dataDir in oclif instead of custom file locations (`this.config.dataDir` and `this.config.configDir` within a command)
- add common functionality for things like code artifact logins, ecr login, lambda invokes, ssm connections, etc.
