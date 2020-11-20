---
title: Debugging LND while running a local cluster
date: 2020-11-16
layout: miksa/post.njk
tags: lnd, simverse, vscode
---

If you want to debug LND, or if you want to take a real deep dive into LND, you probably want to be able to set breakpoints in the source code to see what is actually happening. Not only that, you also want to have the node run in a local cluster of other nodes, so that you can perform some real Lightning actions like opening a channel and make payments. This post takes you through the setup I use based on [Delve](https://github.com/go-delve/delve) and [Simverse](https://github.com/darwin/simverse).
<!-- more -->
## Setting up a local cluster with Simverse

Simverse is an amazing tool for setting up local Lightning clusters. It uses docker-compose to manage the cluster and supports LND, c-lightning and Eclair nodes with either btcd or bitcoind back-ends. This makes it very easy to set up local clusters of any size, as long as your hardware can handle it. All nodes and back-ends are run in their own docker containers and are spun up on demand following a default recipe or a custom recipe that you can draft up yourself. It literally takes four commands to have a local cluster running with Simverse.

For our setup we will use a hybrid cluster. There are 3 types of Simverse clusters: Homogenous clusters are Simverse clusters that run either lnd + btcd nodes, eclair + bitcoind nodes or c-lightning + bitcoind nodes. More generally speaking, a homgenous cluster only contains one flavor of back-end and one flavor of Lightning node. The second type of cluster is heterogenous cluster, containing a mix of nodes and back-ends. The third type of cluster is called a hybrid cluster. This is a Simverse cluster (either homogenous or heterogenous) that interacts with an external node that runs directly on the host machine instead of in a docker container. We will use the default Simverse cluster (a homogenous lnd + btcd cluster) and make it hybrid by connecting the LND node that runs the code that we are going to debug.

Setting up the cluster with Simverse is not within the scope of this article, but the [Quickstart](https://github.com/darwin/simverse) of Simverse is all you need to do. That will result in having a cluster with 3 Docker containers, two running LND, and one running a btcd back-end.

## Building LND

We need to build de debug version of LND, to be able to do some debugging. I will be using the repo that Simverse automatically cloned. Simverse clones repos into the `_repos` folder inside the Simverse folder. In my case the Simverse folder is located here: `~/simverse/_repos`.

```
cd ~/simverse/_repos/lnd
make build
```

The resulting binaries can be found in the repo folder itself: `lnd-debug` and `lncli-debug`

## Create a lnd.conf file

Yes, you can start lnd with a bunch of arguments. So there is no real need for a conf-file, but I think it makes it way easier to start LND with a conf-file. You can place your file anywhere, but I find it easy to have them all at a single place, and the most logical place is the default location: `~/.lnd/`.

Give it a name that makes it easy to understand that this is a conf file not be used in a production environment, like `lnd-test.conf`.

These are the contents of my `lnd-test.conf`:

```
noseedbackup=true
bitcoin.active=true
bitcoin.regtest=true
no-macaroons=true
bitcoin.node=btcd
btcd.rpchost=default_btcd1
btcd.rpccert=/home/mini/simverse/_workspace/default/_volumes/certs/rpc.cert
btcd.rpcuser=devuser
btcd.rpcpass=devpass
debuglevel=debug
```

What this configuration does is running LND with (completely unsafe) development settings, using the btcd Docker container as the back-end.

You would have to change `btcd.rpcert` to the path to the `rpc.cert` file in your Simverse workspace and you would probably have to change the `btcd.rpchost` as well. The `default_btcd1` host pointing to your btcd Docker container is *not* automatically added to your host file so either you have to add it to your host file or you have to replace it with an IP address. You can find the IP address of the btcd1 docker container of your Simverse cluster, by using the `list_docker_ips` command that ships with Simverse. (I told you that tool was amazing). An alternative solution is to run this [extra docker container](https://github.com/dvddarias/docker-hoster) that automatically updates entries in your hostfile.

## Installing Delve

Assuming you have Vscode installed, make sure you have installed the [language support for Go](https://marketplace.visualstudio.com/items?itemName=golang.Go) extension.

Open the Command Palette, select `Go: Install/Update Tools`, and select `dlv`

<img src="/images/install-dlv.png" width="850" alt="install dlv" title="Install dlv using the Command Palette">

## Configure launch.json

Open the folder of your LND repo with Vscode and create a launch.json file by selecting the gear icon on the Run view (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>D</kbd>) top bar.

```lang-json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Launch lnd",
            "type": "go",
            "request": "launch",
            "mode": "exec",
            "program": "${workspaceFolder}/lnd-debug",
            "env": {},
            "args": ["--configfile=~/.lnd/lnd-test.conf"],
            "showLog": true
        }
    ]
}
```

The args parameter should contain the location of your conf-file.

## Set breakpoints

Now you are ready to set breakpoints, for instance in the `Main` function of the `lnd` package.

<img src="/images/set-breakpoint.png" width="850" alt="Main function" title="Main function">

If you start debugging, this breakpoint is immediately hit.

<img src="/images/hit-breakpoint.png" width="850" alt="Breakpoint hit" title="Breakpoint hit">

## Done!

And there you have it, you can now start to debugging LND operating in a local cluster.
