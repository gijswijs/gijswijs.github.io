---
title: Debugging LND while running a local cluster
date: 2020-11-16
publish: draft
layout: miksa/post.njk
tags: lnd, simverse, vscode
---

If you want to debug LND, or if you want to take a real deep dive into LND, you probably want to be able to set breakpoints in the source code to see what is actually happening. Not only that, you also want to have the node run in a local cluster of other nodes, so that you can perform some real Lightning actions like opening a channel and make payments. This post takes you through the setup I use based on [Delve](https://github.com/go-delve/delve) and [Simverse](https://github.com/darwin/simverse).
<!-- more -->
## Setting up a local cluster with Simverse

Simverse is an amazing tool for setting up local Lightning clusters. It uses docker-compose to manage the cluster and supports LND, c-lightning and Eclair nodes with either btcd or bitcoind back-ends. This makes it very easy to set up local clusters of any size, as long as your hardware can handle it. All nodes and back-ends are run in their own docker containers and are spun up on demand following a default recipe or a custom recipe that you can draft up yourself. It literally takes four commands to have a local cluster running with Simverse.

For our setup we will use a hybrid cluster. There are 3 types of Simverse clusters: Homogenous clusters are Simverse clusters that run either lnd + btcd nodes, eclair + bitcoind nodes or c-lightning + bitcoind nodes. More generally speaking, a homgenous cluster only contains one flavor of back-end and one flavor of Lightning node. The second type of cluster is heterogenous cluster, containing a mix of nodes and back-ends. The third type of cluster is called a hybrid cluster. This is a Simverse cluster (either homogenous or heterogenous) that interacts with an external node that runs directly on the host machine instead of in a docker container. We will use the default Simverse cluster (a homogenous lnd + btcd cluster) and make it hybrid by connecting the LND node that runs the code that we are going to debug.

Setting up the cluster with Simverse is not within the scope of this article, but the [Quickstart](https://github.com/darwin/simverse) of Simverse is all you need to do.

## Building LND

We need to build de debug version of LND, to be able to do some debugging. I will be using the repo that Simverse automatically cloned. Simverse clones repos into the `_repos` folder inside the Simverse folder. In my case the Simverse folder is located here: `~/simverse/_repos`.

```
cd ~/simverse/_repos/lnd
make build
```

The resulting binaries can be found in the repo folder itself: `lnd-debug` and `lncli-debug`

## Installing Delve

Assuming you have Vscode installed, make sure you have installed the [language support for Go](https://marketplace.visualstudio.com/items?itemName=golang.Go) extension.

