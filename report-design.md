## Design document for break-bot's reports

Some design goals:
  - Get the important information (summary: what's broken? what's the impact?) at a glance
  - Full details available (client by client, statement by statement, etc.)
  - 'Obscure' terminology (kinds of BCs, use types, etc.) should be documented (e.g., links to an external documentation)
  - Source code references (breaking declarations, broken statements in client code, etc.) should point to the actual code on GitHub
  - TODO: check GitHub Checks' annotations API (can we weave BCs/detections directly in source code listings?)

---

### Summary

This pull request introduces **3 breaking changes**, causing **16 detections** in client code.
**2 of 3 clients are impacted** by the changes (66%).

#### Breaking changes

| Status             | Declaration       | Kind                        | Impacted clients                                                                                                     |
|--------------------|-------------------|-----------------------------|----------------------------------------------------------------------------------------------------------------------|
| :x:                | [`spoon.A`]()     | [`CLASS_LESS_ACCESSIBLE`]() | 1 ([SpoonLabs/nopol](https://github.com/SpoonLabs/nopol))                                                            |
| :x:                | [`spoon.B#m()`]() | [`METHOD_REMOVED`]()        | 2 ([SpoonLabs/nopol](https://github.com/SpoonLabs/nopol), [SpoonLabs/flacoco](https://github.com/SpoonLabs/flacoco)) |
| :heavy_check_mark: | [`spoon.B#f`]()   | [`FIELD_NOW_FINAL`]()       | 0                                                                                                                    |

#### Impact on clients

| Status             | Client                                                    | Detections |
|--------------------|-----------------------------------------------------------|------------|
| :x:                | [SpoonLabs/flacoco](https://github.com/SpoonLabs/flacoco) | [5]()      |
| :x:                | [SpoonLabs/nopol](https://github.com/SpoonLabs/nopol)     | [11]()     |
| :heavy_check_mark: | [SpoonLabs/coming](https://github.com/SpoonLabs/coming)   | [0]()      |

### Full report

#### [SpoonLabs/flacoco](https://github.com/SpoonLabs/flacoco)

Location | Code | Breaking declaration | Kind | Use Type  
-------- | ---- | -------------------- | ---- | --------
[`X.java:11`]() | flacoco.X     | [`spoon.A`]()     | [`CLASS_LESS_ACCESSIBLE`]() | `EXTENDS`
[`Y.java:23-31`]() | flacoco.Y#a() | [`spoon.B#f`]()   | [`FIELD_NOW_FINAL`]()       | `FIELD_ACCESS`
[`Z.java:112-118`]() | flacoco.Z#b() | [`spoon.B#m()`]() | [`METHOD_REMOVED`]()        | `METHOD_INVOCATION`

#### [SpoonLabs/coming](https://github.com/SpoonLabs/coming)
...

#### [SpoonLabs/nopol](https://github.com/SpoonLabs/nopol)
...
