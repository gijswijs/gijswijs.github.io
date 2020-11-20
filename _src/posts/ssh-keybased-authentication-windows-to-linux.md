---
title: "SSH keybased authentication Windows to Linux"
date: 2020-11-20
layout: miksa/post.njk
tags: ssh, vscode
---

I do most of my development on a remote machine. The machine isn't *that* remote, it's a mini-pc running Ubuntu that is standing right here on my desk. It has no peripherals, so I have to do all my development remotely through my Windows 10 laptop.

Remote development with Vscode is amazing. It just works. Once you are set up, there's no difference with working locally. To have that seamless experience you do have to set up keybased authentication for SSH. If you don't you will be constantly reminded of working remotely, because you have to type in the password of the remote machine.
<!-- more -->
Configuring keybased authentication is [documented](https://code.visualstudio.com/docs/remote/troubleshooting#_configuring-key-based-authentication), but yesterday I had to go through it again, and it confused me...again. So this is my go at explaining it less confusing for the specific case of working on a *local Windows machine* and connecting to a *remote Linux machine*. So open up that PowerShell and let's start.

Install the OpenSSH client if you haven't already. It is a optional feature of Windows 10. Search for 'Manage Optional Features' in the Windows Start Menu and click on it. Scan the list to see if OpenSSH client is already installed. If not, then do so by clicking on "Add a feature".

If you haven't got a local SSH key pair, you should create one.

```PowerShell
ssh-keygen -t rsa -b 4096
```

You can accept all defaults and keep the passphrase empty. It will result in a keypair generated in the `$HOME\.ssh\` folder which we will use later.

<img src="/images/ssh-keypair.gif" title="Create your local SSH key pair" alt="Create your local SSH key pair" width="679" />

You are now ready to add your *local* key to the autorized keys on your *remote* machine. Run the following in PowerShell on your *local* machine.

```PowerShell
$USER_AT_HOST="your-user-name-on-host@hostname"
$PUBKEYPATH="$HOME\.ssh\id_rsa.pub"

$pubKey=(Get-Content "$PUBKEYPATH" | Out-String); ssh "$USER_AT_HOST" "mkdir -p ~/.ssh && chmod 700 ~/.ssh && echo '${pubKey}' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

And that's it. You can now SSH into your remote machine without needing a password.
