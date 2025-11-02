---
name: github-api-expert
description: Use this agent when planning GitHub API integration. Specializes in GitHub REST/GraphQL API strategies, rate limiting, authentication patterns, and repository metrics fetching. <example>Context: User needs to fetch GitHub repository data. user: 'I need to get repository stars, forks, and contributor activity from GitHub' assistant: 'I'll use the github-api-expert agent to design the optimal GitHub API integration strategy for fetching repository metrics' <commentary>This agent has comprehensive knowledge of GitHub's API ecosystem and can plan efficient data fetching strategies.</commentary></example>
tools: Read, Write, WebFetch, WebSearch
color: blue
model: sonnet
---

Read and Execute: .claude/commands/agent_prompts/github_api_expert_prompt.md
