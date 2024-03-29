---
title: All types of multi-part payments in Lightning Network explained
date: 2023-09-15
layout: miksa/post.njk
tags: PSS, lightning network, bitcoin, MPP, AMP
math: true
---

Lightning Network uses source-based routing. What that means is that the sender is responsible for finding a route to the payee. But because the sender doesn't know the balances of all channels along a possible route, the proposed route can fail for lack of liquidity. So the sender is forced to try routes until it stumbles upon one that has enough liquidity to relay the payment; it's a process of trial and error. To increase the likelihood of success the idea of splitting up a payments into smaller parts was floated early on in the development of Lightning Network. The idea was that multiple smaller payments were more likely to succeed than one big payment. But you still want all separate parts of such a payment to act as one single atomic payment, that either succeeds completely or doesn't succeed at all.
<!-- more -->

This post assumes you have knowledge about how payments work in Lightning Network, especially HTLCs and pre-images. If you want to know more about how payments actually work in Lightning Network, you can check my other post on [Lightning Network payments][ln-post]. In this post I will dive into the specific types of multi-part payments, as they are called, and explain a new type of multi-part payment that I developed. Also, if you look at what has been written on multi-part payments, you will see that multi-part and multi-path are used interchangeably. I think multi-part better describes what is happening, so I'll try to stick to that.

## Base MPP

Probably the simplest form of multi-part payments (MPP) is Base MPP. That's why it's sometimes also referred to as [Simplified Multipath Payments][optech] (SMP). It is the only type of MPP that is part of the official [Lightning Network specifications][boltmpp], aka Basis of Lightning Technology (BOLT). The basic idea is that the sender uses multiple payments that combined are enough to buy the thing it wants. All those payments use the same payment hash, and a group of HTLCs which uses the same payment hash are called an HTLC set.

A sender can only use Base MPP if the receiver has shown support for it. The receiver does this by offering the `basic_mpp` feature in the invoice. The sender can now use multiple payments to pay the invoice. It should try to use diverse paths to the receiver, to increase the chances of success. The receiver, upon receiving the first HTLC out of the set, waits for at least 60 seconds for the other HTLCs from that set. If it receives them all, it reveals the pre-image to collect all of them. If it doesn't receive all HTLCs in time, it fails all HTLCs it *did* receive.

There is no cryptographic trickery that makes it impossible for the receiver to reveal the pre-image prematurely, but the receiver does have an economic incentive not to do so.

## Link MPP

Base MPPs lesser known sibling is [Link MPP][bitcoinse1]. Link MPP works in a situation where two nodes have two parallel channels between them. At some point one of the nodes gets asked to relay a payment to the other node, but none of the balances in either channel is sufficient. Instead of failing the payment, the nodes agree to use both channels to relay the payment in two parts using the same payment hash. The channel partner should wait until both HTLCs are received, before forwarding the payment further. Link MPP is different from Base MPP in a variety of ways. Base MPP uses different paths, while Link MPP is something that happens inside a hop (with parallel channels) that is part of a bigger path. More importantly, Base MPP is something that is initiated by the sender: it's the sender who breaks up the payment in different parts. Link MPP is initiated by the two channel partners and the sender doesn't need to (and won't) know about it, nor does the receiver. Also, Link MPP isn't part of the official [Lightning Network specifications][boltmpp] and I don't know of any client that supports it. But Link MPP can be (and maybe has been) implemented without it being part of the LN protocol. Two nodes can have their own Link MPP protocol that nobody needs to know about.

## Atomic Multi-Path Payments, the OG MPP

Before Base MPP was a thing, Conner Fromknecht and Olaoluwa Osuntokun [proposed AMP][ln-dev]. Because of this timeline, AMP is often referred to as Original AMP/MPP or OG AMP/MPP. AMP doesn't break the rule of re-using payment hashes. It also doesn't rely on an economic incentive for the receiver to ensure that the receiver gets paid in full.

It [works][bitcoinse2] by the sender making \\(i\\) number of payments parts. Each part is a payments with its own payment hash based on a pre-image created by the *sender*, but along with the payments hash, the sender also sends a secret \\(s_i\\) and the sequence number \\(i\\). The payments hash isn't the hash of a pre-image the receiver created, so the receiver is unable to collect a single part. But once the receiver has received *all* parts it can do a neat trick. It can take the XOR of all secrets and create the Base Secret (BS) \\( BS = s_1 \oplus s_2 \oplus \cdots \oplus s_n \\). It can then concatenate the BS with the sequence number \\( SHA256(BP || i) \\) to create each payments pre-image (which was how the sender created the pre-images to begin with). The big advantage of AMP is that the receiver is unable to collect any payment until it has received them all. The economic incentive argument can go out the window. It also doesn't re-use payment hashes.

AMP has one big downside. It is the sender who creates the secrets that XOR into a BS, and it also creates all the pre-images so that it can create the payment hashes for each payment. This means that the sender has knowledge of the pre-image *before* receiving the payment. This nullifies the concept of the pre-image being a cryptographic proof of payment.

## High AMP, AMP with PTLCs

PTLCs deserve their own write-up, which I will get to in time, but here is a crash course. Let's start with claiming that PTLCs are HTLCs that replace the payment hash with a payment point. A payment point is a point on an elliptic curve (the secp256k1 curve to be exact). A point on an elliptic curve is the multiplication of some secret number *x* between \\(0\\) and \\(\sim2^{256}\\) and a base point *G* that is specific to the curve you are using. The payment point P now becomes \\(P=xG\\). So *P* is the public key of the private key *x*. You can read more about elliptic curve cryptography in my post on [signature aggregation][sa-post], but remember this one thing: It is easy to create the payment point *P* if you know *x*, but it is impossible to create the value *x* if you know *P*. Another thing you need to know is that elliptic curve points has this nice addition preserving property: \\(xG + yG = (x+y)G\\).

With PTLC the pre-image is *z*, and its public key \\(Z=zG\\) is shared through the invoice. Now if a sender wants to pay said invoice, it finds a route and for each hop in that route it creates a random nonce (\\(x_1, x_2, \cdots , x_i\\)). For the first hop the sender uses \\(x_1G + Z = (x_1 + z)G\\) as payment point, and it shares \\(x_2\\) with the first routing node. The first routing node now adds \\(x_{2}G\\) to the payment point of the PTLC it received and uses that as the payment point for the following hop, so that payment point becomes \\((x_{1} + x_{2} + z)G\\). The next routing node receives \\(x_3\\) from the sender, and adds \\(x_{3}G\\) to the payment point. This continues until the receiver is reached with the payment point \\((x_1 + x_2 + \cdots + x_i + z)G\\). The sender shares \\((x_1 + x_2 + \cdots + x_i)\\) with the receiver. Note that this is different from what the routing nodes receive. They all received a single nonce, but the receiver gets the aggregate of all nonces. 

Because the receiver knows *z*, we can now start the reveal phase. The receiver adds *z* to the aggregate of nonces it received from the sender. This is the secret it can use to collect the payment from the last routing node. The last routing node now learns \\((x_1 + x_2 + \cdots + x_i + z)\\) and already knows \\(x_i\\) (because the sender shared it) so it can subtract its nonce from the secret and that's the secret the last routing node can use to collect its payment. This continues untill the sender learns the secret to the first payment point: \\((x_1 + z)\\). The sender knows all nonces, so it definitely knows \\(x_1\\) and uses it to learn *z*. What's cool about the reveal of *z* in payments using PTLC, is that only the sender learns *z*, but none of the routing nodes do. So it's an even better proof of payment than the pre-image to a payment hash, because with HTLCs all the routing nodes learn the pre-image as well.

With payments points and PTLCs out of the way, let's explain how we can use this to create High AMP, which is OG AMP without its downsides. In a way, High AMP is just the combination of OG AMP with PTLCs:

The sender creates the Base Secret just like before. Using the BS it creates a pre-image for each payment part, also just like before (\\( r_i = SHA256(BP || i) \\)). Now the sender uses those pre-images to create points on the elliptic curve: \\(r_{i}G\\). For payment part *i* it adds \\(r_{i}G\\) to the payment point for the first hop. Routing of the payment continues as normal. So the receiver receives a payment with payment point \\((r_i + x_{i_1} + x_{i_2} + \cdots + x_{i_j} + z)G\\) for each of the payment parts. It can't collect any of them, because the receiver doesn't know \\(r_i\\). But just like with OG AMP, with each payment the payer also shares a secret \\(s_i\\) and the sequence number *i*. When the receiver has received all payment parts, it can construct the Base Secret *BS*, and can create all pre-images, and use them together with the knowledge of *z* to collect each payment part. Once the first payment part is revealed to the sender, the sender learns *z*, but not any time before. So *z* retains it power as a proof of payment! High AMP is the best of both worlds, it doesn't resort to an economic incentive to make payments atomic, but it retains the power of a cryptographic proof of payment.

But this is all still theoretical. PTLCs require adaptor signatures, and although it was already possible to do so, this was made a lot easier with the advent of Schnorr signatures in Bitcoin. Schnorr signatures were activated in Bitcoin in November 2021. Since then the LN community has focussed on other stuff first, but recently PTLCs were [put top-of-mind again][ln-dev2]. But for now they are still "just around the corner".

## Payment Splitting & Switching (PSS)

In November 2018, ZmnSCPxj proposed a combination of [Link-level payment splitting and via intermediary rendezvous nodes][ln-dev3]. The idea was that it would allow for "payment splitting over multiple hops" instead of payment splitting over parallel channels in the same hop. I liked the idea of it, but thought of it more as a combination of [Just In Time Routing][jit] and Link MPP. Both ZmnSCPxj and Christian Decker were willing to [discuss the idea][ln-dev4], and it sounded feasible at the time, so I went on and created a `core lightning` [plugin][pss-plugin] as a proof of concept.

To understand what the PSS plugin does, and how it's different from Link MPP, you have to first remember that the type of source based routing that LN uses, makes it impossible for any node along the route to know anything more than the previous and the next node in the route. So an intermediary node can never change the payment path to use an alternative route to the destination, because it has no idea what the destination is. But it *does* know what the next node is, and quite often there is an alternative non-direct route to the next node, e.g. a route with a single intermediary node.

PSS is similar to Link MPP in that two channel partners along a route agree to forward a payment in parts between them. One partner breaks up the payment in parts, the other reassembles them and forwards them as a single HTLC, as if nothing happened. Where PSS and Link MPP differ is that Link MPP only works with parallel channels, PSS also works with multi-hop routes.

My plugin is just a proof of concept and should definitely not be used with an actual `core lightning` node, but it did allow me to use it for my research on Balance Discovery Attacks and it had some real interesting implications. More on that in my [next post][next-post].

You can see the plugin at work in the screencast below:

<script async id="asciicast-520416" src="https://asciinema.org/a/520416.js"></script>

## Summary

So that's MPP for you. Only Base MPP is widely supported and OG AMP is supported by LND since [v0.13.0][lnd]. Maybe Link MPP is supported and I just don't know about it, because covertness is in the nature of Link MPP. High AMP might come to fruition once PTLCs become a thing. Meanwhile PSS is like Link MPP on steroids and it has a completely *not* battle tested plugin that shows it could work.

Update: In an earlier version of this post I stated that OG AMP is not supported, but that is not true. [LND][lnd] does support it. The text now reflects that fact. h/t [David A. Harding][dtrt]

[ln-post]: /post/how-do-payments-in-lightning-network-work/ "How do payments in Lightning Network work?"
[optech]: https://bitcoinops.org/en/topics/multipath-payments/ "Bitcoin Optech: Multipath payments"
[boltmpp]: https://github.com/lightning/bolts/blob/master/04-onion-routing.md#basic-multi-part-payments "BOLT #4: Basic Multi-Part Payments"
[bitcoinse1]: https://bitcoin.stackexchange.com/questions/98697/what-is-link-level-multiplexing "What is Link-Level Multiplexing?"
[bitcoinse2]: https://bitcoin.stackexchange.com/questions/89475/what-are-atomic-multi-path-payments-amps-and-why-how-is-it-being-implemented-i "What are atomic multi path payments (AMPs) and why/how is it being implemented in Lightning Network?"
[ln-dev]: https://lists.linuxfoundation.org/pipermail/lightning-dev/2018-February/000993.html "AMP: Atomic Multi-Path Payments over Lightning"
[sa-post]: /post/why-does-signature-half-aggregation-break-adaptor-signatures/ "Why does signature half aggregation break adaptor signatures?"
[ln-dev2]: https://lists.linuxfoundation.org/pipermail/lightning-dev/2023-September/004088.html "Practical PTLCs, a little more concretely"
[ln-dev3]: https://lists.linuxfoundation.org/pipermail/lightning-dev/2018-November/001573.html "Link-level payment splitting via intermediary rendezvous nodes"
[jit]: https://lists.linuxfoundation.org/pipermail/lightning-dev/2019-March/001891.html "Just in Time Routing (JIT-Routing) and a channel rebalancing heuristic as an add on for improved routing success in BOLT 1.0"
[ln-dev4]: https://lists.linuxfoundation.org/pipermail/lightning-dev/2021-August/003144.html "Revisiting Link-level payment splitting via intermediary rendezvous nodes"
[pss-plugin]: https://github.com/gijswijs/plugins/tree/master/pss "Payment Splitting & Switching plugin"
[dtrt]: https://dtrt.org/ "David A. Harding"
[next-post]: /post/the-effect-of-multi-part-payments-on-the-balance-disovery-attack/ "The effect of multi-part payments on the Balance Disovery Attack"
[lnd]: https://github.com/lightningnetwork/lnd/releases/tag/v0.13.0-beta.rc5 "Release lnd v0.13.0-beta.rc5"