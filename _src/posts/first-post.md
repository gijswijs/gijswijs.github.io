---
title: Building Bitcoin Core On Windows d
date: 2017-11-03
layout: chalk/post.njk
tags: bitcoin, windows 10, bash
---
I've been following Bitcoin and more importantly the Blockchain from the sidelines for a few years now, but I wanted to get my hands dirty. Obviously I could just download the Bitcoin Core executables from bitcoin.org, but I always feel it gives me more insight if I build something myself. Also it's was a nice test case for Bash on Windows.
<!-- more -->
If you haven't done so already, you need to activate this feature for  Windows. It's only available on 64-bit Windows 10.
You can follow the instructions for this on https://github.com/bitcoin/bitcoin/blob/master/doc/build-windows.md
There's a catch, however. At the time of writing the Windows 10 bash feature comes with Ubuntu Xenial 16.04, which is exactly the Ubuntu version on which the build of Bitcoin Core is broken. So first check what version you are on.
```
lsb_release -a
```
Your version appears on the "Description" line. If it is 16.04, which is the current latest LTS-version (Long Term Support) of Ubuntu, you'll have to upgrade to the next version. For this to work you'll need to change the file with the release-upgrade settings using vi.

```
sudo vi /etc/update-manager/release-upgrades
# Find the line that reads:
Prompt=LTS
# Change it to:
Prompt=normal
```
Run
```
sudo do-release-upgrade
```
After I was done, `lsb_release -a` yielded the brand new Ubuntu Zesty 17.04 in the description. On with the instructions on https://github.com/bitcoin/bitcoin/blob/master/doc/build-windows.md.
Take note that you have to install the dependencies for g++-mingw-w64-x86-64  and mingw-w64-x86-64-dev first, before changing the update-alternatives. The instructions are a bit confusing on this point.

```
sudo apt-get install git
cd /usr/local/src
sudo git clone https://github.com/bitcoin/bitcoin.git
PATH=$(echo "$PATH" | sed -e 's/:\/mnt.*//g')
cd bitcoin/depends
sudo make HOST=x86_64-w64-mingw32
cd ..
sudo ./autogen.sh
sudo CONFIG_SITE=$PWD/depends/x86_64-w64-mingw32/share/config.site ./configure --prefix=/
sudo make
```

The first build took roughly 2 hours, so sit back and keep an eye on it from time to time.

Apparently it is useful to copy the compiled executables to a directory on the windows drive in the same directory structure as they appear in the release .zip archive. This can be done in the following way (I already created a folder on the windows drive: c:\workspace\bitcoin although I'm not sure if that's needed):
```
sudo make install DESTDIR=/mnt/c/workspace/bitcoin
```
Again, sit back and wait for the process to finish.

After the process has finished successfuly, you will find the executables here: C:\workspace\bitcoin\bin
Starting bitcoin-qt.exe will start Bitcoin Core, the GUI node for Bitcoin.
