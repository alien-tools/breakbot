### Breaking changes
Declaration | Kind | Status | Impacted clients | Detections
----------- | ---- | ------ | ---------------- | ----------
[`spoon.reflect.code.CtBodyHolder.getBody()`](https://github.com/spoon/spoon/blob/main//src/main/CtBodyHolder.java) | [`METHOD_REMOVED`]() | :heavy_check_mark: | None | None
[`spoon.reflect.code.CtCatch.getBody()`](https://github.com/spoon/spoon/blob/main//src/main/CtCatch.java) | [`METHOD_REMOVED`]() | :x: | 2 ([https://github.com/ImMeta/testRepo](https://github.com/ImMeta/testRepo), [https://github.com/ImUser/OtherRepo](https://github.com/ImUser/OtherRepo)) | 3

### Impact on clients
Client | Status | Detections
------ | ------ | ----------
[https://github.com/ImMeta/testRepo](https://github.com/ImMeta/testRepo) | :x: | 2
[https://github.com/ImUser/OtherRepo](https://github.com/ImUser/OtherRepo) | :x: | 1
— | :x: | 3

#### [https://github.com/ImMeta/testRepo](https://github.com/ImMeta/testRepo)
Location | Breaking declaration | Kind | Use Type
-------- | -------------------- | ---- | --------
[`trystatement.getBody()`](https://github.com/ImMeta/testRepo/src/main.java) | `spoon.reflect.code.CtCatch.getBody()` | `METHOD_REMOVED` | `METHOD_INVOCATION`
[`statement.getBody()`](https://github.com/ImMeta/testRepo/src/index.java) | `spoon.reflect.code.CtCatch.getBody()` | `METHOD_REMOVED` | `METHOD_INVOCATION`

#### [https://github.com/ImUser/OtherRepo](https://github.com/ImUser/OtherRepo)
Location | Breaking declaration | Kind | Use Type
-------- | -------------------- | ---- | --------
[`catchstatement.getBody()`](https://github.com/ImUser/OtherRepo/src/index.java) | `spoon.reflect.code.CtCatch.getBody()` | `METHOD_REMOVED` | `METHOD_INVOCATION`