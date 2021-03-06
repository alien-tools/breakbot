# Relevant Sources BreakBot
This document contains some relevant sources used in the scope of the Alien project.

## Cases

### Report Changes
- Guava 30.0-jre and 30.1.1-jre [API Differences Between Guava 30.0-jre and Guava 30.1.1-jre](https://guava.dev/releases/30.1.1-jre/api/diffs/)
- Java SE 17 (2021) [API Differences between Java SE 16 (build 36) & Java SE 17 (build 35)](https://cr.openjdk.java.net/~iris/se/17/latestSpec/apidiffs/overview-summary.html)
- Linux Kernel (2021) [Linux Kernel Reverse CI](https://linux.kernelci.org/job/)
- Scala (2021) [Scala 2 Community Build](https://github.com/scala/community-build)


### Breaking Changes
- Web Platform (2015-2021) [Breaking Changes to the Web Platform](https://github.com/styfle/breaking-changes-web)


### Reverted Commits
- Apache Isis (2020) [ISIS-2464: remove deprecated FileAccept from @action](https://github.com/apache/isis/commit/f7f09a59f39ad64bd2f8f6ad7bce8f3521ebe792#diff-3640856c6602207617fb56928d698e3bf3619fe42095c4fc9f1407e0da53af38)
- Apache Isis (2020) [ISIS-2464: revert removal of Action#fileAccept, as was falsely marked](https://github.com/apache/isis/commit/042d2e92b160e71f23101473661bdcfeb7c69b3b)
- Apache Spark (2019) [[SPARK-25496][SQL] Deprecate from_utc_timestamp and to_utc_timestamp](https://github.com/apache/spark/pull/24195)
- Apache Spark (2020) [Revert "[SPARK-33139][SQL] protect setActionSession and clearActiveSession"](https://github.com/apache/spark/pull/30367)


### Dependabot & Pull Requests
- Dependabot (2020) [Dependabot doesn't notify about broken dependencies](https://github.com/dependabot/dependabot-core/issues/2032)


### Policies
- [nixpkgs Breaking Change Policy](https://github.com/NixOS/rfcs/blob/4a57757f2aa27f7d2f3671909f652ae72ca7f248/rfcs/0088-nixpkgs-breaking-change-policy.md)

## Papers

### Software Evolution
- Le Dilavrec et al. (2021) [Untangling Spaghetti of Evolutions in Software Histories to Identify Code and Test Co-evolutions](https://hal.inria.fr/hal-03340174/document)


### Reverted Commits
- Shimagaki et al. (2016) [Why are Commits Being Reverted?: A Comparative Study of Industrial and Open Source Projects](https://ieeexplore.ieee.org/abstract/document/7816476/)
- Yan et al. (2019) [Characterizing and identifying reverted commits](https://ink.library.smu.edu.sg/cgi/viewcontent.cgi?article=5360&context=sis_research)


## Tools

### Breaking Changes Detection
- [APIDiff](https://github.com/aserg-ufmg/apidiff)
- [Azure openapi-diff](https://github.com/Azure/openapi-diff)
- [Endjin.Assembly.ChangeDetection](https://github.com/endjin/Endjin.Assembly.ChangeDetection)
- [FerVer](https://github.com/jaredly/ferver)
- [griffe](https://github.com/pawamoy/griffe)
- [NoRegrets](https://github.com/cs-au-dk/NoRegrets)
- [swagger-brake](https://github.com/redskap/swagger-brake)

### Reverse CI
- [SemVer Stability Score](https://dependabot.com/compatibility-score/?dependency-name=com.google.guava%3Aguava&package-manager=maven&version-scheme=semver)

## Websites

### Types of Breaking Changes
- OpenJDK (2017) [Kinds of Compatibility](https://wiki.openjdk.java.net/display/csr/Kinds+of+Compatibility)