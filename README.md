> If we make this change to our code, how will it impact our clients?

> What if I remove this type? What if I deprecate this method? What if I change this field's type? What if I introduce this new method?

It is difficult for library maintainers to answer these simple—yet essential!—questions when evolving their libraries.
Understanding the impact of a change on your own code base is complicated enough, so how can you understand its impact on code that you've never even heard of?

# BreakBot
BreakBot is a GitHub App, built with [Probot](https://github.com/probot/probot), that automatically tracks the introduction of breaking changes in Java libraries and their impact on client projects.
Once installed on a repository, BreakBot listens to new and updated pull requests and creates [GitHub check runs](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks) that highlight the breaking changes introduced by the pull requests and the impact they have on client projects.
This information feeds the code review process and helps maintainers to decide whether the changes should be accepted in their current form or not.

![BreakBot check run](./images/bb-status.png)

## Reports
BreakBot reports consists of a summary that summarizes the list and impact of breaking changes, e.g.:

> This pull request introduces **3 breaking changes**, causing **22 detections** in client code.
> **3 of 30 clients** are impacted by the changes (10%).

## Configuration
Similar to other GitHub Apps, BreakBot configuration must be hosted in a file `.github/breakbot.yml` directly within the repository.

### Build
To conduct the analyses, BreakBot needs to be able to build the library and produce a JAR file for both the `base` and `head` branches of the pull requests. Currently, only Maven is supported, and BreakBot will attempt to run a `mvn package` from the repository's root, looking for a resulting JAR in the `target/` directory.
It is however possible to configure a different `pom.xml` file, goal, and properties:

```yaml
build:
  # Only build a submodule
  pom: module/pom.xml
  # Custom goals
  goals: [clean jar-goal]
  # Skipping dependency clean and assembly to speed up the analyses
  properties: [skipTests, skipDepClean, assembly.skipAssembly]
```

### Clients
BreakBot needs to know about a list of clients to analyze. Currently, they have to be supplied manually as a list of GitHub repositories (denoted `owner/repo`).
By default, BreakBot looks for client code in the latest version (HEAD) of the repository's default branch, but this can be configured.
Note that, in constrast to the library itself, BreakBot does not need to build and produce a JAR for client projects.
Instead, BreakBot needs to know where the source files to analyze are located (by default, `src` or `src/main/java`).
If the source files are located elsewhere (e.g., in a particular submodule), this can be specified using the `sources` property.

```yaml
clients:
  # Analyze the latest version (HEAD) of the default branch of user1/repo1
  - repository: user1/repo1
  # Analyze a particular module from user1/repo2, at a particular commit
  - repository: user1/repo2
    sources: module/src/main/java
    sha: a3b98f
  # Analyze a particular branch of user2/repo1
  - repository: user2/repo1
    branch: dev
```

### Exclude some APIs from the analysis
Some parts of your APIs may be exempt from compatibility guarantees: types annotated with a `@Beta` annotation, everything within a `*.internal.*` package, etc. This can also be configured in the `breakbot.yml` file. All the elements matching the given patterns will be excluded from the analysis: no breaking changes will be reported.

```yaml
excludes:
  - '@Beta'
  - '*internal*'
```

## Installation

## Which breaking changes are supported?

The underlying analysis is realized using [Maracas](https://github.com/alien-tools/maracas), which in turns relies on [japicmp](https://github.com/siom79/japicmp).

Once installed on a repository, it will publish a report as a check on each new pull request. This report contains a list of the breaking changes created by this PR, compared to the base branch, and a list of the clients impacted for each PR.

## BreakBot Reports

![A BreakBot report](./breakbot-report.png)

## Content
1. [How to start breakbot](#how-to-start-breakbot)
2. [Configure Breakbot](#configure-breakbot)
3. [Other ressources](#other-ressources)

## How to start breakbot

### Locally
This doesn't work right now unless you change the adress both in the configuration variables (the .env file) and on the app configuration page.
```sh
# Install dependencies
npm install

# Build the app
npm run build

# Run the bot
npm start
```

### Locally with heroku
Not recommended since there is an issue with accessing configuration variables (see [code details](DOC_BREAKBOT.md), the last part, Hosting, for more details).
Uses the Procfile to start, instead of the package.json
```sh
# Install dependencies
npm install

# Build the app
npm run build

# Run the bot
heroku local web
```

### Deploy on heroku
For more informations, see the last part **Hosting: Heroku**
```sh
# To push from main
git push heroku main

# To push from a different branch than main
git push heroku testbranch:main
```

## Configure Breakbot

### Configuration file

In a file named .breakbot.yml, located at the root of your repository, you can declare the following parameters:

Name | affects
--- | ---
maxDisplayedBC     |the greatest number of **breaking changes** that can be displayed  
maxDisplayedClients|the maximum of **clients** displayed for each **breaking change**


### Configuration variables

Located in .env during local developpment, and directly managed by heroku.

#### Used by probot
- APP\_ID: the id given by github to the app when registered
- GITHUB\_CLIENT\_ID: ?
- GITHUB\_CLIENT\_SECRET: ?
- PRIVATE\_KEY: the RSA access key used to connect as an app to github, read differently in heroku local development mode
- WEBHOOk\_PROXY\_URL: the adress of the app (is also declared diectly on github)
- WEBHOOK\_SECRET: ?

#### Unique to breakbot
- MARACAS\_URL: The url of Maracas API, which performs the tests

## Other ressources

### Dode Details

For more details on the code, see the [code details](DOC_BREAKBOT.md)

### Contributing

If you have suggestions for how breakbot could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## Future work

  - Automatically discover the clients to analyze, e.g. using Maven's dependency graph or GitHub's dependents list
  - Build the list of breaking changes between two versions of a library from source code only, avoiding the need for building JARs and using japicmp

### License

[ISC](LICENSE) © 2021 RIZZO Leonard <leonard.rizzo@gmx.com>
