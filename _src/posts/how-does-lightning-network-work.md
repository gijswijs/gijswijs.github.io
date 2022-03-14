---
title: How do payments in Lightning Network work?
date: 2022-03-11
layout: miksa/post.njk
tags: cryptography, lightning network, bitcoin
libraries:
  - /scripts/ln-animation.js
math: false
---

Lightning Network is a peer-to-peer payment network that runs on top of the Bitcoin Blockchain. Because it runs on top of the Blockchain it is called a *layer-two solution*, which groups it together with other solutions that have this property of being built on top of a Blockchain. *Layer One* is the base layer, where the Blockchain lives. Because of the inherent properties of Layer One, it is impossible to process large amounts of transactions in that layer. The Bitcoin Blockchain can famously process a mere seven transactions per second on average. This constraint was the main impetus for the creation of Layer Two solutions. Lightning Network, being a Layer Two solution, allows for near instant transactions, that can easily scale to millions of transactions per second.
<!-- more -->
Lightning Network uses Bitcoin transactions, just like "vanilla" Bitcoin transactions in Layer One. This means that the underlying trust assumptions of Bitcoin are not forfeited by Lightning Network. The consensus model of Bitcoin isn't impacted either, so in that sense Lightning Network offers plain ol' Bitcoin transactions, but with the goodness of instantaneity and near infinite scalability. 

So what's the trick that Lightning Network uses to make this possible? Well, participants of Lightning Network transact with each other by means of exchanging Bitcoin transactions that *could* be broadcasted to the Blockchain (like a normal Bitcoin transaction) but in practice rarely ever *have* to be broadcasted to the Blockchain. So the vast majority of the transactions in Lightning Network will never hit the Blockchain, and aren't bogged down by waiting times for transactions being broadcasted, or high transaction fees.

## Payment Channels

Lightning Network employs a concept called *Payment Channel* to make this trick possible. A Payment Channel is a channel between two participants in the Lightning Network. A channel is opened by a *funding transaction*. This determines the total amount of money in the channel, aka the channel capacity. The two participants at either end of the channel can now transact with each other. You can think of the channel as an abacus or counting frame with only one row of beads that connects the two participants. Transactions are now done by sliding beads up and down the abacus to either side, representing the transaction amounts.

<div id="scene1"></div>
<div class="controls1">
  <button>Play</button>
</div>

Every time beads are pushed from one side to another, a new Bitcoin transaction is created that represents the new balance of the channel. Each transactions spends the funding transaction and divides the funding amount according to the balance of the payment channel. But those transactions are not broadcasted to the Blockchain if the channel is to remain open. So, a Payment Channel is at its core a set of consecutive Bitcoin transactions. The latest transaction added to the set represents the current state of the channel. So in the case of the animation above, the latest state of the channel would be represented by a Bitcoin transaction that would spend the funding of 5 beads into three beads for Bob and two beads for Alice.

Both participants have their own copy of those Bitcoin transactions. They can broadcast the latest state of the channel to the Blockchain whenever they feel like it. They can do this either in consultation with each other (called a cooperative close) or unilaterally. This broadcast of the latest state is called the closing of the channel. After this the channel is defunct, and no more transactions can take place. 

In principle there is nothing that keeps a node from broadcasting an old state. In the example above Alice might be tempted to broadcast the first state of the channel, in which she would receive five beads (and Bob zero), instead of the latest state in which she would receive two beads and Bob three. To disincentivize broadcasting old states, Lightning Network has a very smart penalty system, that allows Bob to punish Alice when she broadcasts an old state. The punishment is simple and harsh, namely the perp loses all funds, which are then funneled to the maligned party. The ins and outs of that penalty system will be a topic for another blog post.

## Multi-hop Payments

Lightning Network has a second feature that drastically reduces the amount of transactions that need to be broadcasted to the Blockchain: Multi-hop payments. In Lightning Network you don't need to open up a channel with every party that you want to transact with. You can transact with every node as long as there is a payment route from you to that node. So if we extend our network consisting of Alice and Bob, with a third node, Carol and a channel between her and Bob, Alice is able to transact with Carol without the need for opening up a direct channel with Carol. A channel not opened is a funding transaction not having to be broadcasted to the blockchain, so this is the second 

<div id="scene2"></div>
<div class="controls2">
  <button>Play</button>
</div>

So long as Alice is able to find a route to Carol, and the balances along that route are sufficient for the amount of the payment (in this case the balance at Alice's side in the channel between her and Bob, and the balance at Bob's side in the channel between him and Carol) the payment can go through. But how can we trust Bob that he will forward our payment to Carol? Why wouldn't he be tempted to collect the payment from Alice to him and just keep the money? We set out stating that the underlying trust assumptions of Bitcoin are not affected by Lightning Network, so we can't just introduce trust in a system that is supposed to be trustless. We can't trust Bob on his blue eyes, or whatever color they might be. This is where HTLC's come in, the final piece of Bitcoin trickery that makes payments in Lightning Network possible.

## HTLC's

HTLC's is what makes payments in Lightning Network trustless. HTLC stands for *Hashed TimeLock Contracts*. To understand how an HTLC works we maybe need to take a step back and look at how a basic Bitcoin transaction works. In the above examples we could think of the transactions as being *Pay-to-PubKey-Hash* (P2PKH). This is the most common form of payment on the Bitcoin network. It is a payment to a Bitcoin address that can only be spent by the person that controls the corresponding private key. But using P2PKH wouldn't allow us to make trustless multi-hop payments. To achieve this we need *Pay-to-Script-Hash* (P2SH), which is way to create *custom* redeem scripts. A custom redeem script makes it possible to unlock a payment on the basis of something more complex than just controlling the private key belonging to a Bitcoin address. 

The redeem script for an HTLC knows two execution paths. One path encodes the time lock and the other encodes the hash lock. The hash lock path pays out to the *receiver*. It ensures that the receiver can spend the output of the HTLC under the condition that he can provide the secret value (also called *pre-image*) used to create the hash. The time lock ensures that the *sender* of the payment can spend the output of the HTLC after a fixed amount of time. The payer, in our case Alice, chooses the timeout, say 48 hours, but she also needs to create the hash lock. Alice needs to be sure that Carol is the *only* one that can open the hash lock. To do so she asks Carol to provide her with a hash of a pre-image (the secret value) that only Carol knows. This is the hash that Alice will use for the hash lock. With all the ingredients in place, Alice can now set up a payment to Carol.

<div id="scene3"></div>
<div class="controls3">
  <button>Play</button>
</div>

Alice, having received the hash from Carol, finds a route to Carol. In our network there is only one route to Carol, namely via Bob. Alice now sets up an HTLC with Bob with a timeout of 48 hours for the time lock, and the hash provided by Carol for the hash lock. Bob receives the HTLC *and* the route of the payment. Reading the route, he knows that he needs to set up a payment with Carol. Now it is time for Bob to set up an HTLC with Carol. He uses *the exact same* hash for the hash lock, but a timeout that is a few hours shorter than the one Alice granted him. The shorter timeout leaves Bob with enough time to claim his money once he learns the pre-image. Upon receiving the HTLC from Bob, Carol sees from the route that she is the receiver of the payment and she recognizes the hash. Moreover, she knows the secret pre-image belonging to that hash. By unlocking the hash lock, she reveals the pre-image to Bob. Bob, in his turn, can now unlock the HTLC he received from Alice. If for whatever reason Carol fails to reveal the pre-image, the timeouts make sure all the beads would return to their original position, as if no payment ever happened. 

<svg
  id="sprites"
  xmlns="http://www.w3.org/2000/svg"
  x="0"
  y="0"
  width="0"
  height="0"
>
  <defs>
    <g id="bubble" opacity="0">
      <rect
        fill="white"
        height="60"
        rx="5"
        ry="5"
        stroke="black"
        stroke-width="0.75"
        width="200"
        x=".75"
        y="13"
      />
      <polygon
        id="pointblack"
        points="5.75,0 15.75,0 10.75,5"
        fill="black"
      />
      <polygon
        id="pointwhite"
        points="6.5,0 15,0 10.75,4.25"
        fill="white"
      />
      <text
        font-size="8"
        font-family="sans-serif"
        font-weight="bold"
        dominant-baseline="middle"
        fill="black"
      >
        <tspan x="101.5" id="line1" dy="18.75" text-anchor="middle">
          Line 2
        </tspan>
        <tspan x="101.5" id="line2" dy="11.5" text-anchor="middle">
          Line 2
        </tspan>
      </text>
    </g>
    <svg
      id="lnNode"
      viewBox="0 0 116 74"
      width="116"
      height="74"
      x="0"
      y="0"
    >
      <rect
        x="3"
        y="3"
        rx="10"
        ry="10"
        width="110"
        height="68"
        style="fill: none; stroke: black; stroke-width: 3"
      />
      <text
        font-size="30"
        font-family="serif"
        fill="black"
        x="50%"
        y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
      >
        NAME
      </text>
    </svg>
    <svg
      id="lock"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-12 -12 24 24"
      width="100"
      height="100"
      x="110"
      opacity="0"
    >
      <path
        id="shackle"
        d="M 3.5 3 L 3.5 -3 A 3.5 3.5 0 0 0 -3.5 -3 L -3.5 0"
        stroke="black"
        fill="none"
        stroke-width="1.2"
      />
      <rect
        x="-5"
        y="0"
        width="10"
        height="10"
        fill="white"
        stroke="black"
        stroke-width="1"
      />
    </svg>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-12 -12 24 24"
      x="0"
      y="0"
      width="38"
      height="38"
      id="hourglass"
    >
      <g transform="rotate(180)">
        <g id="hourglass">
          <defs>
            <clipPath id="myClip">
              <rect x="-12" y="-10" width="24" height="18" />
            </clipPath>
          </defs>
          <circle
            id="sandTop"
            cx="0"
            cy="-10"
            r="7"
            stroke="none"
            clip-path="url(#myClip)"
            fill="black"
          />
          <path
            id="clip"
            d="M -12 -12 L -2 0 L 2 0 L 12 -12 L 12 12 L -12 12 Z"
            fill="white"
            stroke="none"
          />
          <path
            d="M15.566 11.021A7.016 7.016 0 0 0 19 5V4h1V2H4v2h1v1a7.016 7.016 0 0 0 3.434 6.021c.354.208.566.545.566.9v.158c0 .354-.212.69-.566.9A7.016 7.016 0 0 0 5 19v1H4v2h16v-2h-1v-1a7.014 7.014 0 0 0-3.433-6.02c-.355-.21-.567-.547-.567-.901v-.158c0-.355.212-.692.566-.9zm-1.015 3.681A5.008 5.008 0 0 1 17 19v1H7v-1a5.01 5.01 0 0 1 2.45-4.299c.971-.573 1.55-1.554 1.55-2.622v-.158c0-1.069-.58-2.051-1.551-2.623A5.008 5.008 0 0 1 7 5V4h10v1c0 1.76-.938 3.406-2.449 4.298C13.58 9.87 13 10.852 13 11.921v.158c0 1.068.579 2.049 1.551 2.623z"
            transform="translate(-12,-12)"
            fill="black"
          />
          <circle
            id="sandBottom"
            cx="0"
            cy="15.5"
            r="7"
            stroke="none"
            fill="black"
          />
          <line
            id="sandStream"
            x1="0"
            y1="-9"
            x2="0"
            y2="-4"
            stroke="black"
            stroke-width="2"
          />
          <rect
            x="-12"
            y="10"
            width="24"
            height="14"
            stroke="none"
            fill="white"
          />
        </g>
      </g>
    </svg>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-12 -12 24 24"
      x="0"
      y="0"
      width="38"
      height="38"
      id="numpad"
    >
      <rect
        id="numpad1"
        x="-12"
        y="-12"
        width="6"
        height="6"
        fill="black"
        stroke="none"
      />
      <rect
        id="numpad2"
        x="-3"
        y="-12"
        width="6"
        height="6"
        fill="black"
        stroke="none"
      />
      <rect
        id="numpad3"
        x="6"
        y="-12"
        width="6"
        height="6"
        fill="black"
        stroke="none"
      />
      <rect
        id="numpad4"
        x="-12"
        y="-3"
        width="6"
        height="6"
        fill="black"
        stroke="none"
      />
      <rect
        id="numpad5"
        x="-3"
        y="-3"
        width="6"
        height="6"
        fill="black"
        stroke="none"
      />
      <rect
        id="numpad6"
        x="6"
        y="-3"
        width="6"
        height="6"
        fill="black"
        stroke="none"
      />
      <rect
        id="numpad7"
        x="-12"
        y="6"
        width="6"
        height="6"
        fill="black"
        stroke="none"
      />
      <rect
        id="numpad8"
        x="-3"
        y="6"
        width="6"
        height="6"
        fill="black"
        stroke="none"
      />
      <rect
        id="numpad9"
        x="6"
        y="6"
        width="6"
        height="6"
        fill="black"
        stroke="none"
      />
    </svg>
  </defs>
</svg>
<div class="line controls">
  <button class="play">Play</button>
</div>

