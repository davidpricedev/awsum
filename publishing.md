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
  - because of the lack of direct documentation and overall complexity involved in this process, I don't recommend it - unless you really need to avoid a pre-existing node install. Even in that case, I would recommend only using `oclif pack` to pacakge things, and build your own update tooling.
- use docker to publish a small image
  - probably only an option if target audience already knows how to work with docker
  - would have to have instructions or shell that added an alias of "mycli" to "docker run ..."
  - potentially slower than other options

## Oclif update process

Bundles node and the cli into a single executable.
Works with the oclif update plugin to allow updating.
Requires an S3 bucket with a folder structure managed by oclif's upload tooling.
Requires an actual `AWS_SECRET_ACCESS_KEY` env-var, so it won't work out of the box with SSO - you'd have to call `eval "$(aws configure export-credentials --format env)"` to get the env-vars populated for the uploader.

Note: Documentation for oclif makes it sound really easy to set this up, but their docs leave off some important information.
Putting all the pieces together into something that actually works was quite a bit of trouble.
Below is documentation that fills in many of the missing pieces, though it does not aim to be complete (I gave up on this and will be using npm instead)

- oclif pack macos|tarballs can be used to generate a macos pkg file or tgz files respectively
- oclif upload <macos|tarballs> can be used to upload the assets created by the equivalent `pack` command
  - into the specific s3 bucket structure that oclif's update tooling uses
- You must always set the `host` value of package.json -> `oclif.update.s3`
  - docs and examples imply that is optional if you are using s3, but that is incorrect - there are a bunch of code checks that skip over important pieces like manifest files if the host value is falsy.
  - further, the host value must be the public URL of s3 bucket
- Set the `oclif.update.s3.acl` value (in package.json) to "private" for any bucket that does not have ACLs enabled
  - the default is to enable and set ACL values, despite the default S3 bucket having ACLs disabled
- you cannot just pack and upload macos - you must always pair that with a pack and upload of tarballs too.
  - or the promotion will fail complaining that it can't promote the tarballs that don't exist
- If doing local testing, regularly clear your `tmp` and `dist` folders - otherwise the pkg and tarball packaging will incorporate these folders, resulting in exponentially growing artifact sizes.
- Because the update plugin (client) makes direct http calls to the `host`, you'd have to configure the S3 bucket with a public URL - it cannot remain just a private bucket.
