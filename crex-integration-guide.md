# CREX Integration Guide

## Step 1: Get API Key
1. Register at CricAPI: https://www.cricapi.com/
2. Get your API key
3. Add to environment variables

## Step 2: API Endpoints
- Live Matches: `/matches`
- Match Details: `/match_info/{matchId}`
- Live Score: `/match_score/{matchId}`
- Lineups: `/match_lineups/{matchId}`
- Player Stats: `/player_stats/{playerId}`

## Step 3: Integration Code
See `crex-integration.js` for implementation

## Step 4: Point System
Add your point system rules to calculate fantasy points

## Step 5: Testing
Test with live matches before production
