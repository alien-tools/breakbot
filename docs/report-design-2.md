# BreakBot Report

---
## Simple changes 3 <span style="color:grey">#5</span>
`main` ← `prepare-v2`

[Pull request](https://github.com/tdegueul/comp-changes/pull/5) opened on Jun 22 by tdegueul (5 commits)

---
## Summary

| Breaking Change | Cases | Impacted Clients |
|:---------------------------------------------------------------|:-----:|:------:|
| [Method No Longer Static](#bc:method-no-longer-static)         | 1     | 4 (50%) |
| [Method Abstract Now Default](#bc:method-abstract-now-default) | 1     | 2 (25%) |
| [Constructor Removed](#bc:constructor-removed)                 | 2     | 4 (50%) |
| **Total**                                                      | **4** | **8 (100%) <sup>1</sup>** |

<small>
<sup>1</sup> The percentage of impacted clients is computed as the ratio between the number of impacted clients and the total number of unique clients.
</small>

---
## Breaking Changes

### Method No Longer Static <a class="anchor" id="bc:method-no-longer-static"></a>

| Id | Declaration `main` | Declaration `prepare-v2` | Impacted Clients |
|----|--------------------|--------------------------|:----------------:|
| [1]()  | [methodNoLongerStatic()](https://github.com/tdegueul/comp-changes/blob/main//src/main/methodNoLongerStatic/MethodNoLongerStatic.java#L5-L7) | [methodNoLongerStatic()](https://github.com/tdegueul/comp-changes/blob/prepare-v2/src/main/methodNoLongerStatic/MethodNoLongerStatic.java#L5-L7) | 3 (37.5%) |
| [2]()  | [methodNoLongerStatic2()](https://github.com/tdegueul/comp-changes/blob/main//src/main/methodNoLongerStatic/MethodNoLongerStatic.java#L5-L7) | [methodNoLongerStatic2()](https://github.com/tdegueul/comp-changes/blob/prepare-v2/src/main/methodNoLongerStatic/MethodNoLongerStatic.java#L5-L7) | 1 (12.5%) |

#### #1 methodNoLongerStatic()


| Use Type | Impacted Client | Declaration Id |
|:---------|:---------------:|:--------------------:|
| Method Invocation | CompChanges | [#1](#client:compchanges) |
| Method Invocation | CompChanges | [#2](#client:compchanges) |
| Method Override   | CompChanges | [#3](#client:compchanges) |

#### #2 methodNoLongerStatic2()

| Use Type | Impacted Client | Impacted Declaration |
|:---------|:---------------:|:--------------------:|
| Method Invocation | CompChanges | [#4](#compchanges:4) |

### Method Abstract Now Default <a class="anchor" id="bc:method-abstract-now-default"></a>
...

### Constructor Removed <a class="anchor" id="bc:constructor-removed"></a>
...

---

## Impacted Clients

Client | Repository | Status | Impacted Classes <sup>1</sup> | Impacted Methods <sup>2</sup> | 
------ | ---------- | ------ | ---------------- | ---------------- |
[CompChanges]() | [maracas/CompChanges](https://github.com/SpoonLabs/flacoco) | :x: | 2 (50%) | 4 (80%)
[OtherClient]() | [venom/OtherClient](https://github.com/SpoonLabs/coming) | :heavy_check_mark: | 6 (50%) | 2 (100%)

<small>
<sup>1</sup> The percentage of broken classes is computed as the ratio between the number of broken classes and the number of classes using the library.  
<sup>2</sup> The percentage of broken methods is computed as the ratio between the number of broken methods and the number of methods using the library.  
</small>

### [CompChanges]() <a class="anchor" id="client:compchanges"></a>

| Id | Client Declaration | Declaration `main` | Declaration `prepare-v2` | Breaking Change | Use Type |
|----|---|---|---|---|---|
| 1   | [clientMethod1()]() | [methodNoLongerStatic()](https://github.com/tdegueul/comp-changes/blob/main//src/main/methodNoLongerStatic/MethodNoLongerStatic.java#L5-L7) | [methodNoLongerStatic()](https://github.com/tdegueul/comp-changes/blob/prepare-v2/src/main/methodNoLongerStatic/MethodNoLongerStatic.java#L5-L7) | Method No Longer Static | Method Invocation | 
| 2 | [clientMethod2()]() | [methodNoLongerStatic()](https://github.com/tdegueul/comp-changes/blob/main//src/main/methodNoLongerStatic/MethodNoLongerStatic.java#L5-L7) | [methodNoLongerStatic()](https://github.com/tdegueul/comp-changes/blob/prepare-v2/src/main/methodNoLongerStatic/MethodNoLongerStatic.java#L5-L7) | Method No Longer Static | Method Invocation |
| 3 | [clientMethod3()]() | [methodNoLongerStatic()](https://github.com/tdegueul/comp-changes/blob/main//src/main/methodNoLongerStatic/MethodNoLongerStatic.java#L5-L7) | [methodNoLongerStatic()](https://github.com/tdegueul/comp-changes/blob/prepare-v2/src/main/methodNoLongerStatic/MethodNoLongerStatic.java#L5-L7) | Method No Longer Static | Method Override |
| 4 | [clientMethod4()]() | [methodNoLongerStatic2()](https://github.com/tdegueul/comp-changes/blob/main//src/main/methodNoLongerStatic/MethodNoLongerStatic.java#L5-L7) | [methodNoLongerStatic2()](https://github.com/tdegueul/comp-changes/blob/prepare-v2/src/main/methodNoLongerStatic/MethodNoLongerStatic.java#L5-L7) | Method No Longer Static | Method Invocation | 
| 5 <a class="anchor" id="compchanges:5"></a>  | [clientMethod4()]() | [methodNowAbstract()]() | [methodNowAbstract()]() | Method Now Abstract | Method Invocation | 

### [OtherClient]()
...