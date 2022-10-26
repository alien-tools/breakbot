### Breaking changes
Declaration | Kind | Status | Impacted clients | Broken Uses
----------- | ---- | ------ | ---------------- | -----------
[`modulea.A.a()`](https://github.com/alien-tools/repository-fixture/blob/main/module-a/src/main/java/modulea/A.java#L4-L6) ([diff](https://github.com/alien-tools/repository-fixture/pull/1/files#diff-fbb607db0239487679342dbde80c69e4105cd269a5fa594c3d90d3baf91a8e6eL4)) | [`METHOD_REMOVED`](https://alien-tools.github.io/maracas/bcs/method-removed) | :x: | 1 ([alien-tools/client-fixture-a](https://github.com/alien-tools/client-fixture-a)) | 1

### Impact on clients
Client | Status | Broken Uses
------ | ------ | -----------
[alien-tools/client-fixture-b](https://github.com/alien-tools/client-fixture-b) | :heavy_check_mark: | 0
[alien-tools/client-fixture-a](https://github.com/alien-tools/client-fixture-a) | :x: | 1
— | :x: | 1

#### [alien-tools/client-fixture-a](https://github.com/alien-tools/client-fixture-a)
Location | Breaking declaration | Kind | Use Type
-------- | -------------------- | ---- | --------
[`a.a()`](https://github.com/alien-tools/client-fixture-a/blob/main/src/main/java/clienta/ClientA.java#L9-L9) | `modulea.A.a()` | [`METHOD_REMOVED`](https://alien-tools.github.io/maracas/bcs/method-removed) | `METHOD_INVOCATION`
