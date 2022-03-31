---
title: Why does signature half aggregation break adaptor signatures?
date: 2022-01-28
layout: miksa/post.njk
tags: cryptography, lightning network, bitcoin
math: true
publish: draft
---

There is this cool trick you can do with Schnorr signatures. It is called adaptor signatures. Adaptor signatures allow for hiding a value inside the signature

Signature Half Aggregation is a way aggregate multiple signatures into a single signature. The single signature is smaller (in bytes) than the original signatures that 
<!-- more -->

https://github.com/ElementsProject/cross-input-aggregation/blob/master/slides/2021-Q2-halfagg-impl.org
https://tlu.tarilabs.com/cryptography/introduction-schnorr-signatures
https://bitcoinops.org/en/topics/adaptor-signatures/
https://medium.com/crypto-garage/adaptor-signature-on-ecdsa-cac148dfa3ad
