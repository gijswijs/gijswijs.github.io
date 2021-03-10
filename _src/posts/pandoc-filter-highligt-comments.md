---
title: Pandoc-filter for highlighting comments in LaTeX output
date: 2021-02-23
layout: miksa/post.njk
tags: pandoc, lua, boilerplate paper, LaTeX
---

While writing my papers I try not to get bogged down too much. So if a paragraph doens't flow right I just type `TODO: rewrite` on the line below it, and continue writing. When I think of something that I shouldn't forget, like an extra analysis to run I just write it down as a todo in the running text of my paper. I also write thoughts on my paper as a todo. Ideas on structure, whether I should maybe rearrange paragraphs or approach a subject differently, it all ends up as a todo in the running text.

When running the VSCode task for converting my paper to PDF (using Pandoc) it puts all the todos into the running text. That's fine by me, it helps as an extra reminder that stuff still needs to happen. But I wanted the todos to be visually different from the running text, so that it stands apart and doesn't confuse people who are reading my draft. That is where my Pandoc filter comes into play.
<!-- more -->
While working inside VSCode I keep track off all todo's with the [Todo Tree](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree) extension. This extension searches your workspace for comment tags like TODO and FIXME, and displays them in a tree view in the explorer pane.

<img src="/images/todo-tree.jpg" srcset="/images/todo-tree1x.jpg 231w, /images/todo-tree2x.jpg 461w, /images/todo-tree3x.jpg 692w, /images/todo-tree4x.jpg 922w" sizes="(max-width: 40rem) 231px, (max-width: 80rem) 461px, (max-width: 120rem) 692px, 922px" title="Todo Tree in VSCode" alt="Todo Tree in VSCode" />

But to keep track of the todo's when the paper is converted to PDF I created a Pandoc filter that highlights all comments in LaTeX output formats. It is really simple:

```lua
if FORMAT:match 'latex' then
    function Para(el)
        if pandoc.utils.equals(pandoc.Str 'TODO:', el.content[1]) then 
            table.insert(el.content, 1, pandoc.RawInline('latex', '\\hl{'))
            table.insert(el.content, pandoc.RawInline('latex', '}'))
        end
        return el
    end
end
```

The only prerequisite is that you put the `soul` package in the preamble of your LaTeX, because that is the package used for the highlighting. So somewhere in your preamble you should put this:

```latex
\usepackage{soul}
```

Now, if you output the paper, the todos are highlighted.

<img src="/images/todo-in-pdf.jpg" title="Todo in LaTeX PDF output" alt="Todo in LaTeX PDF output" width="650" />
