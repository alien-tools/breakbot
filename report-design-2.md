# BreakBot Report

---
## Simple changes 3 <span style="color:grey">#5</span>
`main` ← `prepare-v2`

[Pull request](https://github.com/tdegueul/comp-changes/pull/5) opened on Jun 22 by tdegueul (5 commits)



<blockquote style="padding: 10px; background-color: #eee;"> 
	<p>I noticed the CI configuration was repeated three times, so I refactored it to use the <a href="https://docs.github.com/en/actions/learn-github-actions/managing-complex-workflows#using-a-build-matrix">build matrix</a>.</p>
	<p>Relevant changes:</p>
	<ul>
		<li>Removed Java 15 <a href="https://en.wikipedia.org/wiki/Java_version_history" rel="nofollow">being EOL</a></li>
		<li>Added Java 16, 17-ea and 18-ea</li>
		<li>Upgraded <code>actions/setup-java</code> to version 2 and enabled the <a href="https://github.com/actions/setup-java#caching-packages-dependencies">built-in Maven cache</a></li>
	</ul>
</blockquote>

---
## Summary

| Breaking Change | Cases | Impacted Clients |
|:---------------------------------------------------------------|:-----:|:------:|
| [Method No Longer Static](#bc:method-no-longer-static)         | 1     | 4      |
| [Method Abstract Now Default](#bc:method-abstract-now-default) | 1     | 2      |
| [Constructor Removed](#bc:constructor-removed)                 | 2     | 4      |
| **Total**                                                      | **4** | **10** |

---
## Breaking Changes

### Method No Longer Static <a class="anchor" id="bc:method-no-longer-static"></a>

| Id | Declaration `main` | Declaration `prepare-v2` | Impacted Clients |
|----|--------------------|--------------------------|:----------------:|
| [1]()  | [methodNoLongerStatic()](https://github.com/tdegueul/comp-changes/blob/main//src/main/methodNoLongerStatic/MethodNoLongerStatic.java#L5-L7) | [methodNoLongerStatic()](https://github.com/tdegueul/comp-changes/blob/prepare-v2/src/main/methodNoLongerStatic/MethodNoLongerStatic.java#L5-L7) | 3 |
| [2]()  | [methodNoLongerStatic2()](https://github.com/tdegueul/comp-changes/blob/main//src/main/methodNoLongerStatic/MethodNoLongerStatic.java#L5-L7) | [methodNoLongerStatic2()](https://github.com/tdegueul/comp-changes/blob/prepare-v2/src/main/methodNoLongerStatic/MethodNoLongerStatic.java#L5-L7) | 1 |

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

Client | Repository | Status | Detections
------ | ---------- | ------ | ----------
[CompChanges]() | [maracas/CompChanges](https://github.com/SpoonLabs/flacoco) | :x: | [4]()
[OtherClient]() | [venom/OtherClient](https://github.com/SpoonLabs/coming) | :heavy_check_mark: | [6]()


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