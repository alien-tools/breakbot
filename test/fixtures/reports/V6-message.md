### Breaking changes
Declaration | Kind | Status | Impacted clients | Broken Uses
----------- | ---- | ------ | ---------------- | -----------
[`spoon.reflect.code.CtBodyHolder.getBody()`](https://github.com/spoon/spoon/blob/main//src/main/CtCatch.java) ([diff](https://github.com/spoon/spoon/blob/main//src/main/CtCatch.java)) | [`METHOD_REMOVED`](https://alien-tools.github.io/maracas/bcs/method-removed) | :heavy_check_mark: | None | None
*1 additional breaking changes not shown.*

### Impact on clients
Client | Status | Broken Uses
------ | ------ | -----------
[ImMeta/testRepo](https://github.com/ImMeta/testRepo) | :x: | 2
— | :x: | 3
*1 additional clients not shown.*

#### [ImMeta/testRepo](https://github.com/ImMeta/testRepo)
Location | Breaking declaration | Kind | Use Type
-------- | -------------------- | ---- | --------
[`trystatement.getBody()`](https://github.com/ImMeta/testRepo/src/main.java) | `spoon.reflect.code.CtCatch.getBody()` | [`METHOD_REMOVED`](https://alien-tools.github.io/maracas/bcs/method-removed) | `METHOD_INVOCATION`
*1 additional broken uses not shown.*

#### [ImUser/OtherRepo](https://github.com/ImUser/OtherRepo)
Location | Breaking declaration | Kind | Use Type
-------- | -------------------- | ---- | --------
[`catchstatement.getBody()`](https://github.com/ImUser/OtherRepo/src/index.java) | `spoon.reflect.code.CtCatch.getBody()` | [`METHOD_REMOVED`](https://alien-tools.github.io/maracas/bcs/method-removed) | `METHOD_INVOCATION`
