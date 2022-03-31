---
title: Why does signature half aggregation break adaptor signatures?
date: 2022-01-28
layout: miksa/post.njk
tags: cryptography, lightning network, bitcoin
math: true
publish: draft
---

There is this cool trick you can do with Schnorr signatures. It is called Adaptor Signature (AS). An adaptor signature is an extra signature that, combined with the original signature, allow for revealing a value that was previously hidden. You can use this trick to solve trust problems as they appear in atomic swaps, coin swaps and Discreet Log Contracts [^fn1] (DLCs)

Signature Aggregation (SA) is a way to aggregate multiple signatures into a single signature. The single aggregate signature is smaller (in bytes) than the original signatures combined. It reduces transaction weight, meaning we can have more transactions per block, which is always a good thing. It's like 7zip for transactions. Signature *Half* Aggregation is a variant of SA that only aggregates half of each signature. It results in less compression, but it has the benefit of not requiring any interaction with the signers, whereas full aggregation does require cooperation of all the signers. 

So two cool tricks, but the latter breaks the former. This article explains the math behind it and why SA breaks AS
<!-- more -->

## Schnorr Signatures

Let's start with a normal, vanilla signature, and then work our way up to adaptor signatures. To create a signature we need a public key and a private key. With Schnorr the private key is just an integer value somewhere between \\(0\\) and \\(\sim2^{256}\\). 

https://github.com/ElementsProject/cross-input-aggregation/blob/master/slides/2021-Q2-halfagg-impl.org
https://tlu.tarilabs.com/cryptography/introduction-schnorr-signatures
https://bitcoinops.org/en/topics/adaptor-signatures/
https://medium.com/crypto-garage/adaptor-signature-on-ecdsa-cac148dfa3ad

[^fn1]: Dryja, T. (2017). Discreet Log Contracts. 1–9. <https://dci.mit.edu/s/discrete-log-contracts.pdf>
