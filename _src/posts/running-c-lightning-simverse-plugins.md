---
title: "Running c-lightning in Simverse with plugins"
date: 2020-12-2
layout: miksa/post.njk
tags: simverse, c-lightning
---

The goal is to run c-lightning with plugins in a local testing cluster. For my cluster I use [Simverse](https://github.com/darwin/simverse).
Simverse allows for additional command line arguments to be passed to `lightningd`, so it should be possible to run `lightningd` with the `plugin` argument.

But the plugin itself is a file, and since all nodes in Simverse run inside Docker containers, that file should be made available inside the Docker context folder.

So our first task is to make the plugin available inside the Docker context folder. For each cluster you create with Simverse, the repos needed are copied from a base folder containing all the repos.

The Docker context folder containing all the repos needed for Simverse is a copy of the `_repos` folder.

Recipe

```lang_bash
#!/usr/bin/env bash

. cookbook/cookbook.sh

prelude

add bitcoind

LIGHTNINGD_EXTRA_PARAMS='--plugin=~/.lightning/plugins/jitrebalance/jitrebalance.py'

add lightningd alice
cp -r "$SIMVERSE_REPOS/plugins/jitrebalance" "$SIMVERSE_WORKSPACE/$SIMNET_NAME/_volumes/lightning-data-alice/plugins"

add lightningd bob
cp -r "$SIMVERSE_REPOS/plugins/jitrebalance" "$SIMVERSE_WORKSPACE/$SIMNET_NAME/_volumes/lightning-data-bob/plugins"

add lightningd charlie
cp -r "$SIMVERSE_REPOS/plugins/jitrebalance" "$SIMVERSE_WORKSPACE/$SIMNET_NAME/_volumes/lightning-data-charlie/plugins"


# generate init script to build connections
cat > init <<EOF
#!/usr/bin/env bash

set -e -o pipefail

# connect LN nodes
connect alice charlie
connect charlie bob
connect bob alice
EOF
chmod +x init
```