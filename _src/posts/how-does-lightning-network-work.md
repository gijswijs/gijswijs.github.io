---
title: How does Lightning Network work?
date: 2022-03-11
layout: miksa/post.njk
tags: cryptography, lightning network, bitcoin
libraries:
  - /assets/scripts/bundle.js
math: false
---
New post
<!-- more -->
Animation:
<div id="scene1"></div>
<div id="scene1"></div>
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

