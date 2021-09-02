## Design document for break-bot's reports

Some design goals:
  - Get the important information (summary: what's broken? what's the impact?) at a glance
  - Full details available (client by client, statement by statement, etc.)
  - 'Obscure' terminology (kinds of BCs, use types, etc.) should be documented (e.g., links to an external documentation)
  - Source code references (breaking declarations, broken statements in client code, etc.) should point to the actual code on GitHub

---

### Summary

This pull request introduces **3 breaking changes**, causing **16 detections** in client code.
**66%** of clients are impacted by the changes.

#### Impact on clients

Client | Status | Detections
------ | ------ | ----------
[SpoonLabs/flacoco](https://github.com/SpoonLabs/flacoco) | :x: | [5]()
[SpoonLabs/coming](https://github.com/SpoonLabs/coming) | :heavy_check_mark: | [0]()
[SpoonLabs/nopol](https://github.com/SpoonLabs/nopol) | :x: | [11]()
— | :x: | 16

#### Breaking changes

Declaration | Kind
----------- | ----
[`spoon.A`]()     | [`CLASS_LESS_ACCESSIBLE`]()
[`spoon.B#m()`]() | [`METHOD_REMOVED`]()
[`spoon.B#f`]()   | [`FIELD_NOW_FINAL`]()

### Full report

#### [SpoonLabs/flacoco](https://github.com/SpoonLabs/flacoco)

Location | Breaking declaration | Kind | Use Type  
-------- | -------------------- | ---- | -------
[`flacoco.X`]()     | [`spoon.A`]()     | [`CLASS_LESS_ACCESSIBLE`]() | `EXTENDS`
[`flacoco.Y#a()`]() | [`spoon.B#f`]()   | [`FIELD_NOW_FINAL`]()       | `FIELD_ACCESS`
[`flacoco.Z#b()`]() | [`spoon.B#m()`]() | [`METHOD_REMOVED`]()        | `METHOD_INVOCATION`

#### [SpoonLabs/coming](https://github.com/SpoonLabs/coming)
...

#### [SpoonLabs/nopol](https://github.com/SpoonLabs/nopol)
...
