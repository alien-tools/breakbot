### Design document for break-bot's reports

---

#### Impact summary

Client | Status | Detections
------ | ------ | ----------
[SpoonLabs/flacoco](https://github.com/SpoonLabs/flacoco) | :x: | [5]()
[SpoonLabs/coming](https://github.com/SpoonLabs/coming) | :heavy_check_mark: | [0]()
[SpoonLabs/nopol](https://github.com/SpoonLabs/nopol) | :x: | [11]()
— | :x: | 16

#### Breaking changes summary

Declaration | Kind
----------- | ----
[`spoon.A`]()     | [`CLASS_LESS_ACCESSIBLE`]()
[`spoon.B#m()`]() | [`METHOD_REMOVED`]()
[`spoon.B#f`]()   | [`FIELD_NOW_FINAL`]()

#### Impact report

##### [SpoonLabs/flacoco](https://github.com/SpoonLabs/flacoco)

Location | Breaking declaration | Kind | Use Type  
-------- | -------------------- | ---- | -------
[`flacoco.X`]()     | [`spoon.A`]()     | [`CLASS_LESS_ACCESSIBLE`]() | `EXTENDS`
[`flacoco.Y#a()`]() | [`spoon.B#f`]()   | [`FIELD_NOW_FINAL`]()       | `FIELD_ACCESS`
[`flacoco.Z#b()`]() | [`spoon.B#m()`]() | [`METHOD_REMOVED`]()        | `METHOD_INVOCATION`
