# Flux Palette

A responsive blog/journal [Hexo](https://hexo.io/) theme designed around the idea of multiple color palettes.

[DEMO](https://flux-palette.pages.dev/)

- [Features](#features)
- [Install](#install)
- [Configuration](#configuration)
  * Default [_config.yml](#_config.yml)

## Features

- Mobile friendly
- Multiple [color palettes](/source/css/palettes/)
  * Has support for user selection via select dropdown or can be disabled within the config.
- Password encrypted posts
- Pre-compile JavaScript via [swc](https://swc.rs/)
  * Intended for compiling post decryption JavaScript; will compile anything sent to the UI.
- Approx. read time (default 238 wpm)
- RSS feed generator
- URL shortener/post hash generator
- Archived post listing

## Install

1. In the `root` directory:
   * Optionally, install `@swc/core` for use with pre-compilation.

```git
$ git clone https://github.com/LouisT/flux-palette.git themes/flux-palette
$ npm install @swc/core --save
```

OR, if pushing your root to git, use as a git sub module:

```
$ git submodule add git@github.com:LouisT/flux-palette.git themes/flux-palette
$ npm install @swc/core --save
```

2. Change the `theme` property in the `config.yml` file.

```yml
theme: flux-palette
```

3. Run: `hexo clean ; hexo g ; hexo s`

## Configuration

### Password protected posts

This is done in the front matter. Any post with `password` will be encrypted by that password.

```yml
---
title: Example Post
date: 2025-12-10 00:00:00
password: password-goes-here
---
```

### Read Time

The front matter if your posts will be updated with the estimated read time information.
Can be disabled; see [_config.yml](#_config.yml) below.

```yml
---
title: Example Post
date: 2025-12-10 00:00:00
read_time_minutes: 4
read_time_words: 764
---
```

### _config.yml

Below is the default config for Flux Palette found within [_config.yml](/_config.yml).

```yml
menu: # site menu
  Home: /
  Archives: /archives/
  Feed: /rss.xml

rss: # RSS feed options
  path: rss.xml # output file (relative to root)
  limit: 20 # number of posts
  include_drafts: false
  include_future: false
  mark_encrypted_in_title: true # prefix [Encrypted] to titles
  add_encrypted_element: true # add <encrypted>true</encrypted>

short_url: # short URL options
  enabled: true # set to false to turn off all short URLs
  prefix: s # /s/<hash>
  length: 6 # characters in hash

swc:
  enabled: true # set to false to turn off SWC
  target: es2020 # target environment
  minify: true # set to false to disable minification
  include: # folders to include
    - js/
  exclude: [] # folders to exclude

read_time: # read time options
  enabled: true # set to false to turn off read time
  write_front_matter: true # write read time to front matter

palette_selector: # palette selector
  enabled: true # set to false to turn off palette selector
  default: abyssal-blue # default palette selection
  palette_folder: css/palettes # folder for palette css files
```

