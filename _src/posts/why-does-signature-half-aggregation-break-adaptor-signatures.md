---
title: Why does signature half aggregation break adaptor signatures?
date: 2022-04-04
layout: miksa/post.njk
tags: cryptography, lightning network, bitcoin
math: true
syndication:
  - destination: twitter
    url: https://twitter.com/gijswijs/status/1510918789403398144
  - destination: twitter
    url: https://twitter.com/gijswijs/status/1510918791940947969
  - destination: twitter
    url: https://twitter.com/gijswijs/status/1510918794453319681
  - destination: twitter
    url: https://twitter.com/gijswijs/status/1510918800178561035
  - destination: twitter
    url: https://twitter.com/gijswijs/status/1510918802615451652
  - destination: twitter
    url: https://twitter.com/gijswijs/status/1510918807032066052
  - destination: twitter
    url: https://twitter.com/gijswijs/status/1510918811977129987
  - destination: twitter
    url: https://twitter.com/gijswijs/status/1510918816905437188
  - destination: twitter
    url: https://twitter.com/gijswijs/status/1510918821825048582
  - destination: twitter
    url: https://twitter.com/gijswijs/status/1510918827449626629
  - destination: twitter
    url: https://twitter.com/gijswijs/status/1510918832319504385
  - destination: twitter
    url: https://twitter.com/gijswijs/status/1510918837453324293
  - destination: twitter
    url: https://twitter.com/gijswijs/status/1510918843275018244
  - destination: twitter
    url: https://twitter.com/gijswijs/status/1510918848580841473
  - destination: twitter
    url: https://twitter.com/gijswijs/status/1510918851021910018
  - destination: twitter
    url: https://twitter.com/gijswijs/status/1510918855564328969
  - destination: twitter
    url: https://twitter.com/gijswijs/status/1510918861646090246
  - destination: twitter
    url: https://twitter.com/gijswijs/status/1510918864326230016
  - destination: twitter
    url: https://twitter.com/gijswijs/status/1510918866771529729
---

There is this cool trick you can do with Schnorr signatures. It is called Adaptor Signature (AS). An adaptor signature is an extra signature that, combined with the original signature, allow for revealing a value that was previously hidden. You can use this trick to solve trust problems as they appear in atomic swaps, coin swaps and Discreet Log Contracts (DLCs).

Signature Aggregation (SA) is a way to aggregate multiple signatures into a single signature. The single aggregate signature is smaller (in bytes) than the original signatures combined. It reduces transaction weight, meaning we can have more transactions per block, which is always a good thing. It's like 7zip for transactions. Signature *Half* Aggregation is a variant of SA that only aggregates half of each signature. It offers less compression, but it has the benefit of not requiring any interaction with the signers, whereas full aggregation does require cooperation of all the signers. 

So two cool tricks, but the latter breaks the former when it is used for blockwide signature aggregation. This article explains the math behind it and why SA breaks AS
<!-- more -->

## Schnorr Signatures

Let's start with a normal, vanilla signature, and then work our way up to adaptor signatures. To create a signature we need a public key and a private key. With Schnorr the private key is just an integer value somewhere between \\(0\\) and \\(\sim2^{256}\\). Let's call this private key *x*. The public key *P* belonging to *x* is then a special point on our elliptic curve added to itself *x* times. This point is called the *base point* or *generator*. We assign it the letter *G*. Adding a point *n* times to itself is the definition of multiplication, so we can capture our key-pair in this simple formula:

\\[P=xG\\]

You might be tempted to think that it might be easy to calculate the private key *x* if you know the public key *P* and the base point *G*, because \\(x=\frac{P}{G}\\). But while addition (and multiplication) over an elliptic curve is easy, division (undoing multiplication) is hard. In fact it is so hard, that it is completely infeasible to calculate the private key, given the public key. This is at the foundation of all elliptic curve cryptography.

Now let's sign a message with this private key, and validate the signature with the public key. To sign a message we need a *challenge* and a *nonce*. A nonce is a random number that we use only one time for signing a single message. We use the letter \\(r\\) to indicate our nonce. We calculate the public key \\(R\\) that pairs with \\(r\\). The challenge is a hash-value that depends on the message we are signing. It all fits together like this:

\\[
\begin{align}
R&=rG \\\\
e&=H(P||R||m)
\end{align}
\\]

The hashing function is indicated by \\(H()\\) and it is chosen in such a way that it returns a value that is of the same scale as our private keys. That is why SHA256 is a great choice for the hashing function. It's important to understand that a hash is *just* a number. We can us it as such and do some elliptic curve calculations with it to come up with our signature:

\\[s=r + ex\\]

The signature is published by the Signer as \\((s, R)\\). 

A Verifier can now verify whether the Signer knows the private key \\(x\\). It only needs to know \\(s\\) and \\(R\\) (the signature) and the public key \\(P\\) of the signer, which is public by definition. The base point \\(G\\) is a published property of the elliptic curve. The challenge can be constructed by the verifier as well, since it only uses public information. To verify you have to calculate whether:

\\[sG = R + Pe\\]

The verification should fail if that equality doesn't hold.

It is easy to see why this is proof of the Signer knowing \\(x\\) and having used it to sign \\(m\\):

\\[
\begin{align}
sG &= R + Pe \\\\
&= rG + xGe \\\\
&= (r + ex)G
\end{align}
\\]

## Adaptor Signatures

Now let's crank things up a bit and create an adaptor signature. An adaptor signature is a normal Schnorr signature with an added secret tweak. This tweak is the secret we want to hide and only reveal upon revealing the signature. The tweak is indicated by the letter \\(t\\). Again, we calculate the public key belonging to \\(t\\) with \\(T=tG\\). The challenge and the signature are now slightly different because of the tweak:

\\[
\begin{align} \\\\
e&=H(P||R+T||m) \\\\
s&=r+t+ex
\end{align}
\\]

The adaptor signature \\(s'\\) is the signature minus the secret tweak, so \\(s'=s-t\\). instead of releasing the signature as we did with the vanilla Schnorr signature, we now published the adaptor signature as \\((s',R,T)\\).

The Verifier can still be sure that the Signer owns the secret key \\(x\\). Remember \\(s'=s-t\\), so:

\\[
\begin{align}
s'&=s-t \\\\
&=r+t+ex-t \\\\
&=r+ex
\end{align}
\\]

Which means that verification didn't really change for the Verifier. The Verifier only needs to add \\(R\\) and \\(T\\) because of the challenge, but apart from that verification remains the same:

\\[s'G = R + Pe\\]

And the proof of the correctness is similar as well: 

\\[
\begin{align}
s'G &= R + Pe \\\\
&= rG + xGe \\\\
&= (r + ex)G
\end{align}
\\]

When the Verifier receives the untweaked signature \\(s\\) it can calculate the secret tweak: \\(t=s-s'\\). Likewise, when the Signer releases the secret tweak, the Verifier can calculate the untweaked signature \\(s=s'+t\\).

This construction is the building block of things like [private Coinswap](https://reyify.com/blog/flipping-the-scriptless-script-on-schnorr), and Cross-chain Swaps.

## Signature Half Aggregation

Now, let's try to understand Signature Half Aggregation. The basic concept of Signature Half Aggregation is to take the \\(i\\) signatures \\((s_{i}, R_{i})\\) that we want to aggregate, and then concatenate all the \\(R\\)-values and sum all the \\(s\\)-values. But as it turned out, that construction [wasn't safe](https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2017-May/014306.html). But with a small adjustment we can make a construction that *is* safe. Instead of summing all the \\(s\\)-values, we sum up all the \\(s\\)-values *after* multiplying them with unpredictable values.

Assume we have \\(n\\) Schnorr signatures we want to aggregate. For each signature, we create an unpredictable value \\(z_{i}\\). So, for \\(i = 1 .. n\\) we calculate the following value:

\\[z_{i}=H(P_{1}||R_{1}||m_{1}||...||P_{n}||R_{n}||m_{n}||i)\\]

Our aggregate signature now becomes:

\\[s_{agg}=\sum_{i=1}^{n}z_{i}s_{i}\\]

The signature is published as \\((s_{agg}, R_{1}...R_{n})\\). It doesn't have to be one (or all) of the Signers of the original signatures that has to do the aggregation. It can be any third party because this construction is non-interactive. It doesn't require the cooperation of the Signers after they have published their own signature.

Verification now becomes slightly different, but it is still easy to prove its correctness:

\\[
\begin{align}
s_{agg}G &= \sum_{i=1}^{n} z_{i}(R_{i}+P_{i}e_{i}) \\\\
&= \sum_{i=1}^{n} z_{i}(r_{i}G+x_{i}Ge_{i}) \\\\
&= \sum_{i=1}^{n} z_{i}(r_{i}+x_{i}e_{i})G \\\\
&= \sum_{i=1}^{n} z_{i}s_{i}G
\end{align}
\\]

## Signature Half Aggregation Breaks Adaptor Signatures

So why does Signature Half Agrregation when used for blockwide signature aggregation in Bitcoin break Adaptor Signatures? Well, we need that untweaked signature \\(s'\\) to calculate the secret tweak \\(t=s-s'\\). But the untweaked signature \\(s'\\) is lost inside the aggregate signature \\(s_{agg}\\). The only thing we have is the tweaked signature \\(s\\), with \\(R\\) and \\(T\\), since those were given to us, but the untweaked signature \\(s'\\) should have been revealed when published on-chain. Instead we are given the \\(s_{agg}\\) which allows us to verify that all inputs inside the block have been signed, but it doesn't allow us to know the exact value of \\(s'\\).

And that's why Signature Half Aggregation breaks Adaptor Signatures.
