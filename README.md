# awsum

<!-- readme is partially auto-generated and the oclif generator doesn't follow the mdlint rules I'd prefer -->
<!-- markdownlint-disable MD040 -->

aws cli utility for sso

This tool allows you to populate your ~/.aws/config with all the sso roles that you have access to - and makes it easy to switch between profiles.
It uses [oclif](https://oclif.io/) as the cli framework to make things easy to develop and extend.

Purpose and goals:

- provide simple, opinionated ways to do common things with the aws cli
- provide simple, opinionated ways to do common things with aws using the local shell
- easy to install and update
- easy to extend

This tool has been initially developed on macos, ymmv on elsewhere.
I'd be happy to accept contributions that enable or improve functionality on other systems.

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
@davidpricedev/awsum/0.1.0 darwin-arm64 node-v22.9.0
$ awsum --help [COMMAND]
USAGE
  $ awsum COMMAND
...
```

<!-- usagestop -->

## Commands

<!-- commands -->

- [awsum](#awsum)
  - [Dependencies](#dependencies)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Commands](#commands)
  - [`awsum help [COMMAND]`](#awsum-help-command)
  - [`awsum sso info`](#awsum-sso-info)
  - [`awsum sso install-switcher SHELL`](#awsum-sso-install-switcher-shell)
  - [`awsum sso login`](#awsum-sso-login)
  - [`awsum sso profile`](#awsum-sso-profile)
  - [`awsum sso setup`](#awsum-sso-setup)
  - [Contributing](#contributing)
  - [Publishing](#publishing)
  - [Future](#future)

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

## `awsum sso info`

Show current AWS context information

```
USAGE
  $ awsum sso info

DESCRIPTION
  Show current AWS context information

EXAMPLES
  $ awsum sso info
```

## `awsum sso install-switcher SHELL`

Install a profile switcher function into your .zshr/.basrc file

```
USAGE
  $ awsum sso install-switcher SHELL

ARGUMENTS
  SHELL  shell (bash or zsh)

DESCRIPTION
  Install a profile switcher function into your .zshr/.basrc file

EXAMPLES
  $ awsum sso install-switcher
```

## `awsum sso login`

Login to AWS SSO

```
USAGE
  $ awsum sso login [-p <value>]

FLAGS
  -p, --profile=<value>  AWS profile to use

DESCRIPTION
  Login to AWS SSO

EXAMPLES
  $ awsum sso login
```

## `awsum sso profile`

choose an aws profile

```
USAGE
  $ awsum sso profile [-q]

FLAGS
  -q, --quiet  suppress text output

DESCRIPTION
  choose an aws profile

EXAMPLES
  $ awsum sso profile
```

## `awsum sso setup`

Sets up SSO for the first time

```
USAGE
  $ awsum sso setup [-r <value>] [-s <value>]

FLAGS
  -r, --ssoRegion=<value>  sso region
  -s, --startUrl=<value>   sso start url

DESCRIPTION
  Sets up SSO for the first time

EXAMPLES
  $ awsum sso setup
```

<!-- commandsstop -->

## Contributing

- Clone the repo
- Run `npm install` to install dependencies
- Run `npm run install-precommit` - to install the pre-commit hooks that keep things nicely formatted
  - First install pre-commit, if you haven't yet, via `brew install pre-commit`
- Run `npm install -g oclif` to install the oclif command line tools
- Abide by the [code of conduct](https://opensource.creativecommons.org/community/code-of-conduct/)
- Development Workflow
  - `npm run build` to build the project
  - `bin/run.js ...` to run the cli tooling without installing it
  - add tests to the test folder corresponding to the command

## [Publishing](./publishing.md)

## Future

- switch to the built-in dataDir in oclif instead of custom file locations (`this.config.dataDir` and `this.config.configDir` within a command)
- add common functionality for common things beyond sso: code artifact logins, ecr login, lambda invokes, ssm connections, etc.
