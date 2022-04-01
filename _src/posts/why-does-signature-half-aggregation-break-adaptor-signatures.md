---
title: Why does signature half aggregation break adaptor signatures?
date: 2022-01-28
layout: miksa/post.njk
tags: cryptography, lightning network, bitcoin
math: true
publish: draft
---

There is this cool trick you can do with Schnorr signatures. It is called Adaptor Signature (AS). An adaptor signature is an extra signature that, combined with the original signature, allow for revealing a value that was previously hidden. You can use this trick to solve trust problems as they appear in atomic swaps, coin swaps and Discreet Log Contracts (DLCs).

Signature Aggregation (SA) is a way to aggregate multiple signatures into a single signature. The single aggregate signature is smaller (in bytes) than the original signatures combined. It reduces transaction weight, meaning we can have more transactions per block, which is always a good thing. It's like 7zip for transactions. Signature *Half* Aggregation is a variant of SA that only aggregates half of each signature. It offers less compression, but it has the benefit of not requiring any interaction with the signers, whereas full aggregation does require cooperation of all the signers. 

So two cool tricks, but the latter breaks the former. This article explains the math behind it and why SA breaks AS
<!-- more -->

## Schnorr Signatures

Let's start with a normal, vanilla signature, and then work our way up to adaptor signatures. To create a signature we need a public key and a private key. With Schnorr the private key is just an integer value somewhere between \\(0\\) and \\(\sim2^{256}\\). Let's call this private key *x*. The public key *P* belonging to *x* is then a special point on our elliptic curve added to itself *x* times. This point is called the *base point* or *generator*. We assign it the letter *G*. Adding a point *n* times to itself is the definition of multiplication, so we can capture our key-pair in this simple formula:

\\[P=xG\\]

You might be tempted to think that it might be easy to calculate the private key *x* if you know the public key *P* and the base point *G*, because \\(x=\frac{P}{G}\\). But while addition (and multiplication) over an elliptic curve is easy, division (undoing multiplication) is hard. In fact it is so hard, that it is completely infeasible to calculate the private key, given the public key. This is at the foundation of all elliptic curve cryptography.

Now let's sign a message with this private key, and validate the signature with the public key. To sign a message we need a *challenge* and a *nonce*. A nonce is a random number that we use only one time for signing a single message. We use the letter \\(r\\) to indicate our nonce. We calculate the public key \\(R\\) that pairs with \\(r\\). The challenge is a hash-value that depends on the message we are signing. It all fits together like this:

\\[R=rG\\]
\\[e=H(P||R||m)\\]

The hashing function is indicated by \\(H()\\) and it is chosen in such a way that it returns a value that of the same scale as our private keys. That is why SHA256 is a great choice for the hashing function. It's important to understand that a hash is *just* a number. We can us it as such and do some elliptic curve calculations with it to come up with our signature:

\\[s=r + ex\\]

The signature is published by the Signer as \\((s, R)\\). 

A Verifier can now verify whether the Signer knows the private key \\(x\\). It only needs to know \\(s\\) and \\(R\\) (the signature) and the public key \\(P\\) of the signer, which is public by definition. The base point \\(G\\) is a published property of the elliptic curve. The challenge can be constructed by the verifier as well, since it only uses public information. To verify you have to calculate whether:

\\[sG = R + Pe\\]

It is easy to see why this is proof of the Signer knowing \\(x\\) and having used it to sign \\(m\\):

\\[sG = R + Pe\\]
\\[sG = rG + xGe\\]
\\[sG = (r + ex)G\\]

## Adaptor Signatures



https://github.com/ElementsProject/cross-input-aggregation/blob/master/slides/2021-Q2-halfagg-impl.org
https://tlu.tarilabs.com/cryptography/introduction-schnorr-signatures
https://bitcoinops.org/en/topics/adaptor-signatures/
https://medium.com/crypto-garage/adaptor-signature-on-ecdsa-cac148dfa3ad

