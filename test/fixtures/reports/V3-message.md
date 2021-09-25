### Breaking changes
Declaration | Kind | Impacted clients
----------- | ---- | ----------------
[`spoon.reflect.code.CtBodyHolder.getBody()`](https://github.com/spoon/spoon/blob/main//src/main/CtBodyHolder.java) | [`METHOD_REMOVED`]() | WIP
[`spoon.reflect.code.CtCatch.getBody()`](https://github.com/spoon/spoon/blob/main//src/main/CtCatch.java) | [`METHOD_REMOVED`]() | WIP

### Impact on clients
Client | Status | Detections
------ | ------ | ----------
[https://github.com/ImMeta/testRepo](https://github.com/ImMeta/testRepo) | :x: | 2
— | :x: | 2

#### [https://github.com/ImMeta/testRepo](https://github.com/ImMeta/testRepo)
Location | Breaking declaration | Kind | Use Type
-------- | -------------------- | ---- | --------
[`trystatement.getBody()`](https://github.com/ImMeta/testRepo/src/main.java) | `spoon.reflect.code.CtCatch.getBody()` | WIP | `METHOD_INVOCATION`
[`catchstatement.getBody()`](https://github.com/ImMeta/testRepo/src/index.java) | `spoon.reflect.code.CtCatch.getBody()` | WIP | `METHOD_INVOCATION`