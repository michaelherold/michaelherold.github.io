---
layout: post
title: Creating a subset font
tags:
  - fonts
  - web performance
---

Using custom font faces on a web page introduces several potential issues. Most commonly, these issues manifest in one of two types of problem: the dreaded "flash of unstyled text" (FOUT) or "flash of invisible text" (FOIT); or poor initial render time due to font faces specified in blocking calls to outside services. By placing only a subset font in the critical render path, you can reduce the amount of FOUT/FOIT and speed up the initial render performance.

However, the creation of the a subset font is not described anywhere that I found. This post discusses how I went about creating a subset font, the tools I used, and some thoughts on what exactly you should subset in your font.

<!-- more -->

Zach Leatherman ([@zachleat][zach-twitter]) has [talked][zach1] [a lot][zach2] [about font loading strategies][zach3] lately. While I understood the theory of the posts, I ran into a very simple problem when trying to figure out how to implement it: I had no idea how to create a subset font. I wanted to try his idea of a "flash of faux text," but I had no idea how to create a subset font.

I spent a while looking into it and figured out a way to make one. This post goes through the method that I used and some background about what exactly you do when subsetting a font.

### What is a font?

A font is essentially a list of glyphs specified by addresses. If you are familiar with the ASCII table, you might remember that the letter *A* corresponds to the number *45*. That is, *A* is at the *address* *45*. The font creator then encodes this list in one of the font formats:

* Embedded OpenType (EOT)
* OpenType Font (OTF)
* TrueType Font (TTF)
* Web Open Font Face (WOFF)
* Web Open Font Face 2 (WOFF2)

At its heart, each of these formats is just a table of addresses and glyphs. There are some niceties like anti-alias hinting and ligatures that are available in different formats, but the table is what I am interested in.

### What is a subset font?

Fonts with a small alphabet like Noto Sans in Balinese might only have ~47 glyphs, but if you need a font with the full Chinese-Japanese-Korean (CJK) glyph set you might be looking at hundreds or thousands of glyphs.

A subset font tries to avoid this by only including the glyphs that are essential to show the most important content on a page. If you're writing an English language website, you might only include the English alphabet and Arabic numerals: a total of 62 characters.

The resulting file size of the subset font will be substantially smaller than the full-blown font. Currently on this site, I use a subset of the Noto Sans font for my website's initial render. The subset font in the WOFF file format is 7.4KB on disk while the full font is 190KB. That's a savings of 96.1% for the subset font.

### How can I create one?

There are many tools out there (both open- and closed-source) for working with fonts. The one that I used to create my subset font is a Python library called [fonttools](https://github.com/behdad/fonttools). It has a few command-line utilities for manipulating font files. `pyftsubset` is the tool for subsetting and optimizing fonts.

There are myriad options available in this tool. In the interest of brevity, I only cover the options that I use in creating the subset font.

<aside>
I want to take a moment to mention that you should only do this with a font that you have permission to modify. In the case of this article, I modify the Noto Sans font from Google under the <a href="https://github.com/google/fonts/blob/c698ee1cbe301f79e6fe80c8cde18cb084384292/ofl/notosans/OFL.txt">SIL Open Font License</a>. This license allows modification and redistribution, much like the MIT License for open source code.
</aside>

Next, I list the command that I used, then discuss the options.

```shell
$ pyftsubset NotoSans-Regular.ttf \
    --unicodes="U+0020,U+0041-005A,U+0061-007A" \
    --layout-features="" \
    --flavor="woff" \
    --output-file="NotoSansSubset.woff"
```

First, the `NotoSans-Regular.ttf` file is the font file that I started from.

Next, I specify the glyphs to include in the subset font using the `--unicodes` option. I include only the Latin alphabet (i.e. the standard alphabet used when writing in English) and the space character. These correspond to the following Unicode addresses:

* `U+0020` is the standard space
* `U+0041-005A` are the capital letters
* `U+0061-007A` are the lowercase letters

After that, I list the layout features I include in the font using the `--layout-features` option. These are things like ligatures that make the font more readable at the cost of file size. I commit a cardinal sin here and opt for none of them due to how I plan to use the font. Because I intend the page to only show this subset font as a "flash of faux text" I feel that leaving out the niceties is okay.

Because of its relative space efficiency and [wide availability of 88.13% on Can I Use](http://caniuse.com/#feat=woff), I pick WOFF as the file format for the font using the `--flavor` option. The subset tool can only output WOFF or WOFF2, but you can take the resulting file into another tool to get a TrueType or OpenType font if you want.

Lastly, I save the resulting file as `NotoSansSubset.woff` using the `--output-file` option.

### What tradeoffs are there?

Subset fonts give you a smaller file to download to display *most* of the important text on a page before the full fonts download. This means that you have to play a balancing game between font size and features.

In an ideal world, you would serve web fonts that only contain the glyphs that you use on the first page, then rely on the full web font download afterward. However, if you want to serve up a static web page, this becomes tedious because you have to create a subset font for each page on your website. This means that it might be better to include more glyphs than you need on a page to cover a broader set of pages; basically, increasing the glyph count at the cost of a larger file size.

The flip side of this is that you're essentially forcing your visitors to download a glyph set twice: once in the subset font and once in the full web font. This is the crux of the balancing act. You don't want to serve up more glyphs than is necessary because you want to cut the amount of repetitive data over the wire.

I think a practical solution is to create one subset font that roughly follows the [Pareto principle](https://en.wikipedia.org/wiki/Pareto_principle): cover 80% of the content on a first render. Distilling this down to a glyph count, I think that when writing English a good subset font will include only the alphabet (or perhaps the alphabet and numerals).

Including only the alphabet allows the site visitor to start reading at the earliest moment. He or she might notice some missing punctuation or numbers, but your page is still understandable without it. You might disagree, so pick your own subset using a different set of rules!

### Wrap up

Now you know what a subset font is and how to create one. Subset fonts are simple in concept but it's not immediately clear how to create one. By using tools like `fonttools`, you can make it easy to subset your own fonts.

Subset fonts are one small optimization to make in your web performance strategy. By sending a smaller number of glyphs along the critical render path of your website, you can improve the time to first render and avoid the problems of a "flash of invisible text" or "flash of unstyled text" by using the subset font to show a "flash of faux text".

However, subset fonts are only one piece of the puzzle for this technique. Doing this requires some client-side logic to do the font replacement. The next post in this series will discuss a strategy for doing this that I learned from the writings of [Zach Leatherman][zach-twitter].


[zach-twitter]: https://twitter.com/zachleat
[zach1]: http://www.zachleat.com/web/critical-webfonts/
[zach2]: http://www.zachleat.com/web/web-font-data-uris/
[zach3]: http://www.zachleat.com/web/preload/
