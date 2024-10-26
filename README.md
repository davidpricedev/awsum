# awsum

aws cli utility for sso

This tool allows you to populate your ~/.aws/config with all the sso roles that you have access to - and makes it easy to switch between profiles.
It uses [oclif](https://oclif.io/) as the cli framework to make things easy to develop and extend.

<!-- toc -->

- [awsum](#awsum)
<!-- tocstop -->

## Dependencies

- AWS CLI
- Node runtime

## Installation

install node, then install this package via `npm install -g @davidpricedev/awsum`

## Usage

<!-- usage -->

```sh-session
$ npm install -g @davidpricedev/awsum
$ awsum COMMAND
running command...
$ awsum (--version)
awsum/0.1.0 darwin-arm64 node-v22.9.0
$ awsum --help [COMMAND]
USAGE
  $ awsum COMMAND
...
```

<!-- usagestop -->

## Commands

<!-- commands -->

- [`awsum help [COMMAND]`](#awsum-help-command)
- [`awsum update [CHANNEL]`](#awsum-update-channel)

## `awsum help [COMMAND]`

Display help for awsum.

```
USAGE
  $ awsum help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for awsum.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.11/src/commands/help.ts)_

## `awsum update [CHANNEL]`

update the awsum CLI

```
USAGE
  $ awsum update [CHANNEL] [--force |  | [-a | -v <value> | -i]] [-b ]

FLAGS
  -a, --available        See available versions.
  -b, --verbose          Show more details about the available versions.
  -i, --interactive      Interactively select version to install. This is ignored if a channel is provided.
  -v, --version=<value>  Install a specific version.
      --force            Force a re-download of the requested version.

DESCRIPTION
  update the awsum CLI

EXAMPLES
  Update to the stable channel:

    $ awsum update stable

  Update to a specific version:

    $ awsum update --version 1.0.0

  Interactively select version:

    $ awsum update --interactive

  See available versions:

    $ awsum update --available
```

_See code: [@oclif/plugin-update](https://github.com/oclif/plugin-update/blob/v4.6.3/src/commands/update.ts)_

<!-- commandsstop -->

- [awsum](#awsum)
  - [Dependencies](#dependencies)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Commands](#commands)
  - [`awsum help [COMMAND]`](#awsum-help-command)
  - [`awsum update [CHANNEL]`](#awsum-update-channel)
  - [`awsum sso setup`](#awsum-sso-setup)
  - [`awsum sso login`](#awsum-sso-login)
  - [`awsum sso profile`](#awsum-sso-profile)
  - [`awsum sso installSwitcher`](#awsum-sso-installswitcher)
  - [Contributing](#contributing)
  - [Publishing](#publishing)
  - [Future](#future)

## `awsum sso setup`

Usage:

Arguments:

Flags:

## `awsum sso login`

Usage:

Arguments:

Flags:

## `awsum sso profile`

Usage:

Arguments:

Flags:

## `awsum sso installSwitcher`

Usage:

Arguments:

Flags:

## Contributing

- Clone the repo
- Run `npm install` to install dependencies
- Run `npm run prepare` - to install the pre-commit hooks that keep things nicely formatted
- Run `npm install -g oclif` to install the oclif command line tools
- Development Workflow
  - `npm run build` to build the project
  - `bin/run.js ...` to run the cli tooling without installing it

## [Publishing](./publishing.md)

## Future

- switch to the built-in dataDir in oclif instead of custom file locations (`this.config.dataDir` and `this.config.configDir` within a command)
- add common functionality for common things beyond sso: code artifact logins, ecr login, lambda invokes, ssm connections, etc.
