# Options for publishing

A review of what installation, publishing, and updating options oclif provides, compared against some alternatives.

## Quick Distribution/Installation

Requires end-user to have node installed ahead of time, and requires some sort of file hosting

- `npm pack` to package everything into a tarball
- this can then be uploaded to s3, github release payload, etc. - where it can then be downloaded
- `npm install -g <mytaball>.tgz` to install it

## Robust Distribution/Installation

Some options for robust distribution that handles installation and updating are:

- publish to a public or private NPM repository
  - This requires that the end user have node installed
  - install with `npm install -g <my package name>`
  - update with `npm update -g <my package name>`
- use oclif's pack, upload, promote, and update tooling
  - This requires an s3 bucket that is also configured as a public website
  - It also requires a fairly complicated setup in package.json and ci/cd tooling
  - the installer package is not signed (at least not without more configuration somewhere), so you may need to sign it or provide instructions for how to install despite not being signed
  - install by downloading the install package from `https://mybucketaddress/stable/mycli-arm64.pkg` (for macos) and run it
    - the installer is an all-in-one package, it does not require a pre-existing node installation
    - it is remarkably small - around 50MB
  - update by running `mycli update`
  - because of the lack of direct documentation and overall complexity involved in this process, I don't recommend it - unless you really need to avoid a pre-existing node install. Even in that case, I would recommend using `oclif pack` to package things, and build your own update tooling.
- use docker to publish a small image
  - probably only an option if target audience already knows how to work with docker
  - would have to have instructions or shell that added an alias of "mycli" to "docker run ..."
  - potentially slower than other options
