--
layout: page
title: "Creative Editor"
--
# Creative Editor

**By**: MKAh (https://github.com/mkahvi)

**Created**: 2020-06-29

**Updated**: 2020-07-02

Alternate names and related concepts: Text Editor, Book Editor, 

## Purpose

Creative fiction writing (not for book publishing, for fun), writing design documents of systems (game design, especially TTRPG), world building, organizing notes about complex subject as a cohesive whole.

* Creative fiction writing – with links to relevant notes, quick lore refeshers, etc.
* Logs, such as recording an RPG session, including rolls and such.
* Design documents of systems (game design, TTRPGs)
* World building
* Note organizing

## Goals

* Markdown support – halfway mark. Provides basic needed features.
* Multi-file documents.
  * Handle folder trees.
  * Archived folder trees (`.tgz`, `.zip`, `.7z`, `.lzma`, and maybe some others)
* Minimal forced interface.
* Commenting – small blurbs or even discussions linked to particular section, word, or the document tree in general
* Notes – personal comments regarding 
  * Scratchpad – 
  * Clipboard – Multiple pieces of copypasta for easy insertion.
* Tagging
  * Work state tagging
* Linked files ("attachments")
  * Preview of common formats.
    * Inline preview
* Preview of linked notes, e.g. short summary in tooltip.

## Required Traits

* Fast start-up – I want to start typing fucking NOW, not next year.
  * Maybe keep a background thingy live for keeping it in memory in ready state between launches? Optional, of course.
* …

## Features

* Basic markdown formatting
* Internal linking support (anchors)
  * External linking to local (relative path) `.md` files.
  * External linking to any URL.
* Undo.
  * Coalescing undo. Combine multiple related changes into one undo unit.
* Autosaving
  * Backups – Backup at first edit and new backup every time some measure of effort has been put in.
* Smart typing.
  * Smart quotes: insert closing quote, parenthesis, etc. just after the caret.
* Encoding. Default, auto-convert on open/save.
* Line endings. Default, auto-convert on open/save.
* Indentation. Tab-size, use spaces instead of tabs, etc.
  * Indent first line of paragraph.
* Line spacing.
* Comments.
* Import / Export

## Extended Features

* Smart display.
  * Display internal code for currently edited bit.
* Spellchecking
* Theme support
* Multilingual interface
* Keyboard and such configuration
  * Support multiple input methods.
    * RTL support (I don't look forward to this)
* Export filters
  * Such as adding headers for Jekyll publishing
* Inline HTML for Markdown

## Advanced features

* Co-op editing – lmao this is going to be a pain
* LaTeX, KaTeX, MikTeX, etc.
* Pandoc
* Flowcharts – via Mermaid or something
* Scripting – optimally this would be with scripting language that inherently is good with unicode strings.
* Tables
* Syntax highlighting – for code blocks with language identifier primarily.

## References

* https://daringfireball.net/projects/markdown/ – `.md` format definition

## Inspirations

* Typora
* Nimble Writer

## Dependencies

* GUI: ???
* Text editor: ???