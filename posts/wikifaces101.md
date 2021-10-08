---
title: WikiFaces 1.0.1
description: Python Package for WikiPedia Known Images Downloading
date: 2021-10-08
tags:
  - posts
layout: layouts/post.njk
---

Hey all, I made a thing. The WikiFaces Downloader package wikifaces · PyPI. It isn't exactly an image dataset, but it is an image dataset generator.

The downloader takes in a category or page name and finds the corresponding wiki entry. It then uses that wiki entry to download images of *named* people connected to that initial page by climbing through related categories - out to a user-specified distance. For instance, giving it the category "Facebook" would result in it downloading about 300 faces and putting them into a nice folder hierarchy perfect for training your facial recognition algorithms.

If you're interested in using or contributing to the package the links are down below.

wikifaces · PyPI
tford9/Wiki-Faces-Downloader: Wikipedia "people" Images Dataset Downloader (github.com)
