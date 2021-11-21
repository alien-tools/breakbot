### Breaking changes
Declaration | Kind | Status | Impacted clients | Detections
----------- | ---- | ------ | ---------------- | ----------
[`spoon.reflect.code.CtBodyHolder.getBody()`](https://github.com/spoon/spoon/blob/main//src/main/CtCatch.java) ([diff](https://github.com/spoon/spoon/blob/main//src/main/CtCatch.java)) | [`METHOD_REMOVED`]() | :heavy_check_mark: | None | None
*1 additional breaking changes not shown.*

### Impact on clients
Client | Status | Detections
------ | ------ | ----------
[https://github.com/ImMeta/testRepo](https://github.com/ImMeta/testRepo) | :x: | 2
— | :x: | 3
*1 additional clients not shown.*

#### [https://github.com/ImMeta/testRepo](https://github.com/ImMeta/testRepo)
Location | Breaking declaration | Kind | Use Type
-------- | -------------------- | ---- | --------
[`trystatement.getBody()`](https://github.com/ImMeta/testRepo/src/main.java) | `spoon.reflect.code.CtCatch.getBody()` | `METHOD_REMOVED` | `METHOD_INVOCATION`
*1 additional detections not shown.*

#### [https://github.com/ImUser/OtherRepo](https://github.com/ImUser/OtherRepo)
Location | Breaking declaration | Kind | Use Type
-------- | -------------------- | ---- | --------
[`catchstatement.getBody()`](https://github.com/ImUser/OtherRepo/src/index.java) | `spoon.reflect.code.CtCatch.getBody()` | `METHOD_REMOVED` | `METHOD_INVOCATION`