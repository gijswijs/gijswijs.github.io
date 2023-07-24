---
title: Measuring your writing progress with a git word count
date: 2021-02-26
layout: miksa/post.njk
tags: boilerplate paper, powershell, git, bash
---

Writing a scientific paper is hard. Doing your PhD is hard. Writing your thesis is hard. And to make me feel even more miserable I decided to measure my progress by counting the net change in words I achieve throughout each day.
I am by no means a productivity guru and I don't know whether word count is a useful indicator for measuring the progress of a paper. That being said, it is a reality check to see how fast my  work is progressing.
So without further ado here's the Powershell command that outputs the wordcount for the last 25 days based on git commits. (For the bash command, see the bottom of this post)

```powershell
for($i = 0; $i -lt 25; $i++){$j = $i + 1; Write-Host (get-date (get-date).addDays(-$i) -UFormat "%Y%m%d") ((git diff --word-diff=porcelain "@{$j days ago}" "@{$i days ago}"   -- "***.md"| Select-String -Pattern "^\+.*" | Measure-Object -word | select -ExpandProperty Words) - (git diff --word-diff=porcelain "@{$j days ago}" "@{$i days ago}"  -- "***.md"| Select-String -Pattern "^-.*" | Measure-Object -word | select -ExpandProperty Words)) }
```
<!-- more -->
## What does it do?

At the core of this script is the following git command:

```
git diff --word-diff=porcelain "@{$j days ago}" "@{$i days ago}"   -- "***.md"
```

This command uses `git diff` (duh!) with the `--word-diff` option which marks the actual word being changed instead of the entire line that contains it. The latter is the default behavior of `git diff` and is not what we want when performing a word count. `porcelain` denotes the special line-based format for `word-diff` meant for script consumption, which is what we will do next. `-- "***.md"` only considers markdown files which are the files that contain all the content of my paper in [Boilerplate Paper](https://github.com/neumannjs/boilerplate-paper). It is important to note that if you don't commit regularly (at least daily) this word count doesn't come up with accurate data.

If you run only this command, you would get something like this.

```
~
diff --git a/e-diff-paper/paper/03_method.md b/e-diff-paper/paper/03_method.md
index a3b4dfe..c4a565c 100644
--- a/e-diff-paper/paper/03_method.md
+++ b/e-diff-paper/paper/03_method.md
@@ -1,8 +1,8 @@
 # Method
~

~
 Our goal is to obtain differential privacy for the balance of a Lightning Network payment channel. This goal differs from the original setting of differential privacy. Originally differential privacy
-was
  meant to ensure that adding or deleting a record
-from
+in
  a database did not change the answer to statistical differential private queries significantly. To achieve that, noise is added to the query answer. By observing this noisy answer 
-a passive
+an
  observer is unable to discern if a specific record is in the database or not, regardless of the information this observer possesses about the other records in the database. This adding of noise is done through a probabilistic algorithm applied to the data set contained in the database.
~
 
~
 Our case is different in a consequential way. A passive observer can use a BDA again and again to get a reading on the balance. The information that this observer obtains is comparable to a stream of data. To cater to our situation we expand the basic definition of (approximate) differential privacy to 
-streams
+streams,
  similarly to [@Chan2011].
```

Those lines starting with `-` or `+` are the ones we are interested in, because those are the words that have been deleted and added. We pipe the results of that command into `Select-String` which is kind of like grep for Powershell.

```
Select-String -Pattern "^\+(?!\+\+\s).*"
```

The regex pattern matches with all lines starting with `+` except if it is followed by `++ ` (we use the negative lookahead to check for that) because the three plus-signs are use to indicate file names that have additions, not the addition itself. If you run the above two commands piped together you would get a result like this:

```
+#
+## Just-In-Time Routing
+Just-in-time routing or JIT routing [@Pickhardt2019] was proposed as a solution to mitigate routing failures due to insufficient funds. LN uses source based routing, where the send 
er of the payment has to guess the route over which to send a payment. Since a node is only aware of the balances of channels that it is part of, a sender node can only guess if a r
oute with other channels has enough liquidity to process the payment. This can lead to relatively large amounts of failed payments due to insufficient funds somewhere along the rout 
e.
+JIT Routing tries to make the routing process more like best effort routing known in IP-forwarding. The concept depends on nodes quickly rebalancing their channels upon receiving a
 routing request (HTLC) for which they have insufficient funds. Because a node along the route has more knowledge of its local neighborhood than the sender node, it can use that kno
wledge to perform a small transaction within its local neighborhood of channels to rebalance funds in such a way that original routing request can proceed. Given that the rebalancin 
g succeeds within the timeframe of the routing request, the requests now succeeds where it would have failed without JIT routing.
+in
+an
+streams,
```

Although there is some Markdown markup that shouldn't be counted as words (like `#` and `##`) this is good enough for my purposes. So we pipe the results into our next two commands.

```
Measure-Object -word | select -ExpandProperty Words
```

These are plain and simple, the first command performs the actual word count, but since Powershell always returns an object, we need the latter command to enumerate the values of the object and select the value. Everything piped together returns just a number.

```
248
```

Now we do the same thing for the deleted words. We run the same commands but now with a different regex expression: `Select-String -Pattern "^\-(?!\-\-\s).*"`

We substract the deleted words from the added words and we have our nett change in words for the day. All that is left to do is to wrap everything in a loop that goes back as much days as you want (25 in the above script) and outputs the date with the word count for that date.

So this is my progress for the past few days of a particular paper I am writing:

```
20210226 237
20210225 0
20210224 0
20210223 0
20210222 0
20210221 0
20210220 0
20210219 0
20210218 591
20210217 190
20210216 332
20210215 0
20210214 0
20210213 0
20210212 0
20210211 925
20210210 0
20210209 382
```

I guess I was just busy with other things...

Update 2023-03-10: Since writing this article I switched to Linux almost exclusively, so I have transpiled this command to bash:
Update 2023-07-24: Added date to bash command output 

```bash
for i in {0..24}; do j=$(($i+1)); a=$(git diff --word-diff=porcelain "@{$j days ago}" "@{$i days ago}"   -- '***.md' | grep '^+' | grep -v '^+++'| wc -w) ; b=$(git diff --word-diff=porcelain "@{$j days ago}" "@{$i days ago}"   -- '***.md' | grep '^-' | grep -v '^---'| wc -w) ; d=$(date +%Y%m%d -d "$i days ago") ; echo $d $(($a - $b)); done
```
