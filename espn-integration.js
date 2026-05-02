// ESPN API Integration - Live Scores and Lineups
// This module handles fetching cricket data from ESPN's public API

// ESPN API Configuration
var ESPN_BASE_URL = 'https://sports.core.api.espn.com/v2/sports/cricket';
var ESPN_SITE_URL = 'https://site.api.espn.com/apis/site/v2/sports/cricket';
var ESPN_CDN_URL = 'https://cdn.espn.com/core/cricket';

// Fantasy Point System - T20 Fantasy Cricket
var FANTASY_POINTS = {
  batting: {
    run: 1,           // Points per run
    boundary: 4,      // Points per boundary (four)
    six: 6,           // Points per six
    twentyFive: 4,    // Bonus for 25+ runs
    fifty: 8,         // Bonus for 50+ runs
    seventyFive: 12,   // Bonus for 75+ runs
    century: 16,      // Bonus for 100+ runs
    duck: -2          // Penalty for duck
  },
  bowling: {
    dotBall: 1,       // Points per dot ball
    wicket: 30,       // Points per wicket (excluding run out)
    lbwBowled: 8,     // Bonus for LBW/Bowled
    threeWickets: 4,  // Bonus for 3 wickets
    fourWickets: 8,   // Bonus for 4 wickets
    fiveWickets: 12,  // Bonus for 5 wickets
    maiden: 12        // Points per maiden over
  },
  fielding: {
    catch: 8,         // Points per catch
    threeCatch: 4,    // Bonus for 3 catches
    stumping: 12,     // Points per stumping
    runOutDirect: 12, // Points for direct hit run out
    runOutIndirect: 6 // Points for indirect run out
  },
  other: {
    captain: 2,       // Captain multiplier (2x)
    viceCaptain: 1.5, // Vice-captain multiplier (1.5x)
    announcedLineup: 4, // Bonus for being in announced lineup
    playingSubstitute: 4 // Bonus for concussion/X-factor/impact player
  },
  economy: {
    below5: 6,        // Below 5 runs per over
    fiveTo5_99: 4,    // Between 5-5.99 runs per over
    sixTo7: 2,        // Between 6-7 runs per over
    tenTo11: -2,      // Between 10-11 runs per over
    elevenTo12: -4,    // Between 11.01-12 runs per over
    above12: -6       // Above 12 runs per over
  },
  strikeRate: {
    above170: 6,      // Above 170 runs per 100 balls
    oneFiftyTo170: 4, // Between 150.01-170 runs per 100 balls
    oneThirtyTo150: 2,// Between 130-150 runs per 100 balls
    sixtyTo70: -2,    // Between 60-70 runs per 100 balls
    fiftyTo60: -4,    // Between 50-59.99 runs per 100 balls
    below50: -6       // Below 50 runs per 100 balls
  }
};

// Fetch IPL matches from ESPN
async function fetchLiveMatches() {
  try {
    console.log('Fetching IPL matches from ESPN...');
    console.log('Base URL:', ESPN_BASE_URL);
    
    // Try different ESPN endpoints for cricket
    var endpoints = [
      ESPN_BASE_URL + '/leagues/ipl/events',
      'https://site.api.espn.com/apis/site/v2/sports/cricket/ipl/scoreboard',
      'https://cdn.espn.com/core/cricket/scoreboard?xhr=1&league=ipl'
    ];
    
    for (var i = 0; i < endpoints.length; i++) {
      try {
        console.log('Trying endpoint:', endpoints[i]);
        var response = await fetch(endpoints[i]);
        var data = await response.json();
        
        console.log('Response from endpoint ' + i + ':', data);
        
        if (data && data.events) {
          var iplMatches = data.events.filter(function(match) {
            return match.status === 'in_progress' || match.status === 'scheduled' || match.status === 'pre_game';
          });
          console.log('Found ' + iplMatches.length + ' IPL matches from endpoint ' + i);
          return iplMatches;
        } else if (data && data.scoreboard) {
          var scoreboard = data.scoreboard;
          if (scoreboard && scoreboard.events) {
            var iplMatches = scoreboard.events.filter(function(match) {
              return match.status === 'in_progress' || match.status === 'scheduled' || match.status === 'pre_game';
            });
            console.log('Found ' + iplMatches.length + ' IPL matches from scoreboard endpoint ' + i);
            return iplMatches;
          }
        }
      } catch (error) {
        console.warn('Endpoint ' + i + ' failed:', error);
      }
    }
    
    // If all endpoints fail, return mock data for testing
    console.log('All endpoints failed, returning mock data for testing');
    return [
      {
        id: 'mock1',
        name: 'MI vs CSK',
        displayName: 'Mumbai Indians vs Chennai Super Kings',
        status: 'scheduled',
        competitions: [{
          competitors: [
            { displayName: 'Mumbai Indians', name: 'MI' },
            { displayName: 'Chennai Super Kings', name: 'CSK' }
          ]
        }]
      },
      {
        id: 'mock2', 
        name: 'RCB vs KKR',
        displayName: 'Royal Challengers Bengaluru vs Kolkata Knight Riders',
        status: 'scheduled',
        competitions: [{
          competitors: [
            { displayName: 'Royal Challengers Bengaluru', name: 'RCB' },
            { displayName: 'Kolkata Knight Riders', name: 'KKR' }
          ]
        }]
      }
    ];
  } catch (error) {
    console.error('Error fetching live matches:', error);
    return [];
  }
}

// Fetch match details
async function fetchMatchDetails(matchId) {
  try {
    var response = await fetch(ESPN_BASE_URL + '/leagues/ipl/events/' + matchId);
    var data = await response.json();
    
    return data || null;
  } catch (error) {
    console.error('Error fetching match details:', error);
    return null;
  }
}

// Fetch live score
async function fetchLiveScore(matchId) {
  try {
    // Try CDN first for real-time data
    var response = await fetch(ESPN_CDN_URL + '/game?xhr=1&gameId=' + matchId);
    var data = await response.json();
    
    if (data && data.gamepackageJSON) {
      return data.gamepackageJSON;
    }
    
    // Fallback to core API
    var fallbackResponse = await fetch(ESPN_BASE_URL + '/leagues/ipl/events/' + matchId);
    var fallbackData = await fallbackResponse.json();
    
    return fallbackData || null;
  } catch (error) {
    console.error('Error fetching live score:', error);
    return null;
  }
}

// Fetch match lineups
async function fetchMatchLineups(matchId) {
  try {
    // Get match details to find teams
    var matchDetails = await fetchMatchDetails(matchId);
    if (!matchDetails || !matchDetails.competitions) {
      console.warn('No match details found for lineup');
      return null;
    }
    
    var competition = matchDetails.competitions[0];
    if (!competition || !competition.competitors) {
      console.warn('No competitors found in match');
      return null;
    }
    
    // Get team rosters
    var teamA = competition.competitors[0];
    var teamB = competition.competitors[1];
    
    var teamARoster = await fetchTeamRoster(teamA.id);
    var teamBRoster = await fetchTeamRoster(teamB.id);
    
    return {
      teamA: {
        id: teamA.id,
        name: teamA.displayName || teamA.name,
        players: teamARoster
      },
      teamB: {
        id: teamB.id,
        name: teamB.displayName || teamB.name,
        players: teamBRoster
      }
    };
  } catch (error) {
    console.error('Error fetching lineups:', error);
    return null;
  }
}

// Fetch team roster
async function fetchTeamRoster(teamId) {
  try {
    var response = await fetch(ESPN_BASE_URL + '/leagues/ipl/teams/' + teamId + '/roster');
    var data = await response.json();
    
    if (data && data.athletes) {
      return data.athletes.map(function(athlete) {
        return {
          playerId: athlete.id,
          name: athlete.displayName || athlete.fullName,
          role: getRoleFromPosition(athlete.position),
          photo: athlete.headshot || null,
          team: teamId,
          country: athlete.nationality || null
        };
      });
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching team roster:', error);
    return [];
  }
}

// Convert ESPN position to fantasy role
function getRoleFromPosition(position) {
  if (!position) return 'batter';
  
  var pos = position.toLowerCase();
  if (pos.includes('bowler') || pos.includes('fast') || pos.includes('spin')) {
    return 'bowler';
  } else if (pos.includes('wicket keeper') || pos.includes('keeper')) {
    return 'wicket-keeper';
  } else if (pos.includes('all-rounder') || pos.includes('all rounder')) {
    return 'all-rounder';
  }
  
  return 'batter';
}

// Calculate fantasy points for a player
function calculateFantasyPoints(playerStats, role, isCaptain, isViceCaptain, inLineup) {
  var totalPoints = 0;
  
  // Batting points
  if (playerStats.batting) {
    var batting = playerStats.batting;
    var runs = batting.runs || 0;
    var balls = batting.balls || 0;
    
    // Run points
    totalPoints += runs * FANTASY_POINTS.batting.run;
    
    // Boundary points (fours and sixes)
    totalPoints += (batting.fours || 0) * FANTASY_POINTS.batting.boundary;
    totalPoints += (batting.sixes || 0) * FANTASY_POINTS.batting.six;
    
    // Milestone bonuses
    if (runs >= 100) totalPoints += FANTASY_POINTS.batting.century;
    else if (runs >= 75) totalPoints += FANTASY_POINTS.batting.seventyFive;
    else if (runs >= 50) totalPoints += FANTASY_POINTS.batting.fifty;
    else if (runs >= 25) totalPoints += FANTASY_POINTS.batting.twentyFive;
    
    // Duck penalty (only for batter, wicket-keeper, all-rounder)
    if (runs === 0 && role !== 'bowler') {
      totalPoints += FANTASY_POINTS.batting.duck;
    }
    
    // Strike rate points (min 10 balls, except bowler)
    if (balls >= 10 && role !== 'bowler') {
      var strikeRate = (runs / balls) * 100;
      if (strikeRate > 170) totalPoints += FANTASY_POINTS.strikeRate.above170;
      else if (strikeRate > 150) totalPoints += FANTASY_POINTS.strikeRate.oneFiftyTo170;
      else if (strikeRate >= 130) totalPoints += FANTASY_POINTS.strikeRate.oneThirtyTo150;
      else if (strikeRate >= 60 && strikeRate < 70) totalPoints += FANTASY_POINTS.strikeRate.sixtyTo70;
      else if (strikeRate >= 50 && strikeRate < 60) totalPoints += FANTASY_POINTS.strikeRate.fiftyTo60;
      else if (strikeRate < 50) totalPoints += FANTASY_POINTS.strikeRate.below50;
    }
  }
  
  // Bowling points
  if (playerStats.bowling) {
    var bowling = playerStats.bowling;
    var overs = bowling.overs || 0;
    var runsConceded = bowling.runs || 0;
    
    // Wicket points
    totalPoints += (bowling.wickets || 0) * FANTASY_POINTS.bowling.wicket;
    
    // Dot ball points
    totalPoints += (bowling.dotBalls || 0) * FANTASY_POINTS.bowling.dotBall;
    
    // Maiden over points
    totalPoints += (bowling.maidens || 0) * FANTASY_POINTS.bowling.maiden;
    
    // Wicket milestone bonuses
    if (bowling.wickets >= 5) totalPoints += FANTASY_POINTS.bowling.fiveWickets;
    else if (bowling.wickets >= 4) totalPoints += FANTASY_POINTS.bowling.fourWickets;
    else if (bowling.wickets >= 3) totalPoints += FANTASY_POINTS.bowling.threeWickets;
    
    // Economy rate points (min 2 overs)
    if (overs >= 2) {
      var economy = runsConceded / overs;
      if (economy < 5) totalPoints += FANTASY_POINTS.economy.below5;
      else if (economy < 6) totalPoints += FANTASY_POINTS.economy.fiveTo5_99;
      else if (economy <= 7) totalPoints += FANTASY_POINTS.economy.sixTo7;
      else if (economy >= 10 && economy < 11) totalPoints += FANTASY_POINTS.economy.tenTo11;
      else if (economy >= 11 && economy <= 12) totalPoints += FANTASY_POINTS.economy.elevenTo12;
      else if (economy > 12) totalPoints += FANTASY_POINTS.economy.above12;
    }
  }
  
  // Fielding points
  if (playerStats.fielding) {
    var fielding = playerStats.fielding;
    var catches = fielding.catches || 0;
    
    totalPoints += catches * FANTASY_POINTS.fielding.catch;
    totalPoints += (fielding.stumpings || 0) * FANTASY_POINTS.fielding.stumping;
    totalPoints += (fielding.runOutsDirect || 0) * FANTASY_POINTS.fielding.runOutDirect;
    totalPoints += (fielding.runOutsIndirect || 0) * FANTASY_POINTS.fielding.runOutIndirect;
    
    // 3 catch bonus
    if (catches >= 3) totalPoints += FANTASY_POINTS.fielding.threeCatch;
  }
  
  // Other points
  if (inLineup) {
    totalPoints += FANTASY_POINTS.other.announcedLineup;
  }
  
  // Captain and Vice-captain multipliers
  if (isCaptain) {
    totalPoints *= FANTASY_POINTS.other.captain;
  } else if (isViceCaptain) {
    totalPoints *= FANTASY_POINTS.other.viceCaptain;
  }
  
  return totalPoints;
}

// Update fantasy points for all players in a match
async function updateMatchFantasyPoints(matchId, fantasyTeam) {
  var liveScore = await fetchLiveScore(matchId);
  if (!liveScore) return;
  
  var fantasyData = {};
  
  // Calculate points for each player in fantasy team
  if (fantasyTeam && fantasyTeam.players) {
    fantasyTeam.players.forEach(function(player) {
      var playerStats = findPlayerStats(liveScore, player.playerId);
      if (playerStats) {
        var points = calculateFantasyPoints(
          playerStats,
          player.role,
          player.isCaptain,
          player.isViceCaptain,
          player.inLineup
        );
        fantasyData[player.playerId] = {
          name: player.name,
          points: points,
          stats: playerStats,
          role: player.role,
          isCaptain: player.isCaptain,
          isViceCaptain: player.isViceCaptain
        };
      }
    });
  }
  
  return fantasyData;
}

// Find player stats in live score data
function findPlayerStats(liveScore, playerId) {
  // Search in both teams
  if (liveScore.teamA && liveScore.teamA.players) {
    var found = liveScore.teamA.players.find(function(p) { return p.playerId === playerId; });
    if (found) return found;
  }
  
  if (liveScore.teamB && liveScore.teamB.players) {
    var found = liveScore.teamB.players.find(function(p) { return p.playerId === playerId; });
    if (found) return found;
  }
  
  return null;
}

// Auto-refresh live scores (every 30 seconds)
function startLiveScoreUpdates(matchId, fantasyTeam, callback) {
  var interval = setInterval(function() {
    updateMatchFantasyPoints(matchId, fantasyTeam).then(function(fantasyData) {
      if (callback) callback(fantasyData);
    });
  }, 30000); // 30 seconds
  
  return interval;
}

// Stop live score updates
function stopLiveScoreUpdates(interval) {
  clearInterval(interval);
}
