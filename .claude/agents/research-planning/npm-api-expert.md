---
name: npm-api-expert
description: Use this agent when planning npm Registry API integration. Specializes in npm package data fetching, download statistics, rate limiting strategies, and package health metrics. <example>Context: User needs to fetch npm package data. user: 'I need to get package download trends and version information from npm' assistant: 'I'll use the npm-api-expert agent to design the optimal npm API integration strategy for fetching package metrics' <commentary>This agent has comprehensive knowledge of npm's API ecosystem and can plan efficient data fetching strategies.</commentary></example>
tools: Read, Write, WebFetch, WebSearch
color: red
model: sonnet
---

Read and Execute: .claude/commands/agent_prompts/npm_api_expert_prompt.md
