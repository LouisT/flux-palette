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
  * Has support for user selection via select dropdown or can be disabled within the config
- Password encrypted posts
- Pre-compile JavaScript via [swc](https://swc.rs/)
- Approx. read time (default 238 wpm)
- RSS feed generator
- URL shortener/post hash generator
- Projects listings
- Social links/icons
- Local search
- Archived post listing

## Install

1. In the `root` directory:
   * Optionally, install `@swc/core` for use with pre-compilation.

```bash
$ git clone --depth=1 https://github.com/LouisT/flux-palette.git themes/flux-palette ; rm -rf !$/.git
$ npm install @swc/core --save
```

OR updating:

```bash
$ cp themes/flux-palette/_config.yml theme-config.yml ; rm -rf themes/flux-palette
$ git clone --depth=1 https://github.com/LouisT/flux-palette.git themes/flux-palette ; rm -rf !$/.git
$ mv theme-config.yml themes/flux-palette/_config.yml
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

### Social listings
You can display social links/icons in the sidenav by adding a `social` config to either the root `_config.yml` or the theme config.
```yml
social:
  - name: GitHub
    url: https://github.com/LouisT/flux-palette
    icon: mdi:github
  - name: Website
    url: https://flux-palette.pages.dev/
    icon: material-symbols:link
```

### Projects listings

You can add a list of active projects using a `source/_projects` folder similar to how posts work.

##### Example `source/_projects/flux-palette.md`

```yml
---
title: Flux Palette
date: 2025-12-1
project_url: https://github.com/LouisT/flux-palette
project_summary: "The Flux Palette source."
project_tags:
  - javascript
  - hexo
---
This is a post about my project...
```

### Embeds
You can embed content from various platforms like YouTube, Spotify, and Vimeo within your posts using a powerful `embed` tag.

The plugin can automatically detect the platform from a URL.

```yml
---
title: My Awesome Post
date: 2025-12-1
---
{% embed https://www.youtube.com/watch?v=dQw4w9WgXcQ %}
{% embed https://open.spotify.com/track/3cLqK3LPVrTIzfENVmYLoU %}
{% embed https://vimeo.com/59859181 %}
```

If you are using an ID instead of a URL, you must provide a hint for the platform as the second argument.

```yml
{% embed dQw4w9WgXcQ youtube %}
{% embed 59859181 vimeo %}
{% embed 1LcfcxzGNcselP4PIGeQ6V spotify playlist %}
```

You may also use provider tags such as:
```yml
{% youtube dQw4w9WgXcQ %}
{% spotify 1LcfcxzGNcselP4PIGeQ6V playlist %}
{% vimeo 59859181 %}
```

### _config.yml

Below is the default config for Flux Palette found within [_config.yml](/_config.yml).

```yml
menu: # site menu
  Home: /
  Projects: /projects/
  Archives: /archives/
  Search : /search/
  Feed: /rss.xml

home: # home page configuration
  mode: blog # "blog" or "projects"

search: # search
  enabled: true # set to false to turn off search
  title: "Search" # page title

sidebar:
  recent_projects:
    enabled: true # set false to hide the section
    limit: 5 # how many recent projects to show
  social_buttons: # social buttons
    enabled: true # set to false to turn off social buttons
    inject_iconify: true # set to false to turn off Iconify
    size: 2.5em # icon size
  palette_selector: # palette selector
    enabled: true # set to false to turn off palette selector
    default: abyssal-blue # default palette selection
    palette_folder: css/palettes # folder for palette css files

rss: # RSS feed options
  path: rss.xml # output file (relative to root)
  limit: 20 # number of posts
  include_drafts: false
  include_future: false
  mark_encrypted_in_title: true # prefix [Encrypted] to titles
  add_encrypted_element: true # add <encrypted>true</encrypted>

short_url: # short URL options
  enabled: true # set to false to turn off all short URLs
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
```

