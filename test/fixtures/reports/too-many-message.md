### Breaking changes
Declaration | Kind | Status | Impacted clients | Broken Uses
----------- | ---- | ------ | ---------------- | -----------
[`nestedb.NestedB.nestedB()`](https://github.com/alien-tools/repository-fixture/blob/main/module-c/nested-b/src/main/java/nestedb/NestedB.java#L4-L6) ([diff](https://github.com/alien-tools/repository-fixture/pull/1/files#diff-fb67a83f3cdd140afada868502de4908e1c98fd6fefc03c05f66139278dda700L4)) | [`METHOD_REMOVED`](https://alien-tools.github.io/maracas/bcs/method-removed) | :x: | 1 ([alien-tools/client-fixture-b](https://github.com/alien-tools/client-fixture-b)) | 1
*1 additional breaking changes not shown.*

### Impact on clients
Client | Status | Broken Uses
------ | ------ | -----------
[alien-tools/client-fixture-a](https://github.com/alien-tools/client-fixture-a) | :x: | 2
— | :x: | 3
*1 additional clients not shown.*

#### [alien-tools/client-fixture-b](https://github.com/alien-tools/client-fixture-b)
File | Element | Breaking declaration | Kind | Use Type
---- | ------- | -------------------- | ---- | --------
[`ClientB.java`](https://github.com/alien-tools/client-fixture-b/blob/main/src/main/java/clientb/ClientB.java#L14-L14) | `nestedB.nestedB()` | `nestedb.NestedB.nestedB()` | [`METHOD_REMOVED`](https://alien-tools.github.io/maracas/bcs/method-removed) | `METHOD_INVOCATION`

#### [alien-tools/client-fixture-a](https://github.com/alien-tools/client-fixture-a)
File | Element | Breaking declaration | Kind | Use Type
---- | ------- | -------------------- | ---- | --------
[`ClientA.java`](https://github.com/alien-tools/client-fixture-a/blob/main/src/main/java/clienta/ClientA.java#L9-L9) | `a.a()` | `modulea.A.a()` | [`METHOD_REMOVED`](https://alien-tools.github.io/maracas/bcs/method-removed) | `METHOD_INVOCATION`
*1 additional broken uses not shown.*
