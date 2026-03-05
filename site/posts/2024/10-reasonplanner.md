---
title: "ReasonPlanner: Enhancing Autonomous Planning with Temporal Knowledge Graphs and LLMs"
date: 2024-10-12 12:00:00 +0
tags: [publication, research, agentic-ai]
---

We released our preprint **ReasonPlanner: Enhancing Autonomous Planning in Dynamic Environments with Temporal Knowledge Graphs and LLMs** on arXiv.

ReasonPlanner is a novel generalist agent designed for reflective thinking, planning, and interactive reasoning. It leverages LLMs to plan hypothetical trajectories by building a World Model based on a Temporal Knowledge Graph. The agent interacts with the environment using a natural language actor-critic module, where the actor translates the imagined trajectory into a sequence of actionable steps, and the critic determines if replanning is necessary.

ReasonPlanner significantly outperforms previous state-of-the-art prompting-based methods on the ScienceWorld benchmark by more than 1.8x, while being more sample-efficient and interpretable. It relies solely on frozen weights, requiring no gradient updates, and can be deployed without specialized knowledge of machine learning.

Co-authors: Minh Pham Dinh, Munira Syed, Michael G. Yankoski

[arXiv](https://arxiv.org/abs/2410.09252)
