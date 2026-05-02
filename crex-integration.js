// CREX Integration - Live Scores and Lineups
// This module handles fetching live cricket data and calculating fantasy points

// Configuration
var CREX_API_KEY = 'a33bd5bb-24ec-4ef2-a62d-a3948af86d64'; // User's CricAPI key
var CREX_BASE_URL = 'https://api.cricapi.com/v1';

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

// Fetch live matches from CREX - IPL only
async function fetchLiveMatches() {
  try {
    var response = await fetch(CREX_BASE_URL + '/matches?apikey=' + CREX_API_KEY);
    var data = await response.json();
    
    if (data.status === 'success') {
      return data.data.filter(function(match) {
        // Filter for IPL matches only
        var isIPL = match.name && (match.name.toLowerCase().includes('ipl') || 
                                   match.name.toLowerCase().includes('indian premier league') ||
                                   match.series && match.series.toLowerCase().includes('ipl'));
        return isIPL && (match.status === 'live' || match.status === 'scheduled');
      });
    }
    return [];
  } catch (error) {
    console.error('Error fetching live matches:', error);
    return [];
  }
}

// Fetch match details with player info
async function fetchMatchDetails(matchId) {
  try {
    var response = await fetch(CREX_BASE_URL + '/match_info/' + matchId + '?apikey=' + CREX_API_KEY);
    var data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    }
    console.warn('Match details API returned:', data);
    return null;
  } catch (error) {
    console.error('Error fetching match details:', error);
    return null;
  }
}

// Fetch live score with detailed player stats
async function fetchLiveScore(matchId) {
  try {
    var response = await fetch(CREX_BASE_URL + '/match_score/' + matchId + '?apikey=' + CREX_API_KEY);
    var data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    }
    console.warn('Live score API returned:', data);
    return null;
  } catch (error) {
    console.error('Error fetching live score:', error);
    return null;
  }
}

// Fetch match lineups with player photos
async function fetchMatchLineups(matchId) {
  try {
    var response = await fetch(CREX_BASE_URL + '/match_lineups/' + matchId + '?apikey=' + CREX_API_KEY);
    var data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    }
    console.warn('Lineups API returned:', data);
    return null;
  } catch (error) {
    console.error('Error fetching lineups:', error);
    return null;
  }
}

// Fetch player info with photo
async function fetchPlayerInfo(playerId) {
  try {
    var response = await fetch(CREX_BASE_URL + '/player_info/' + playerId + '?apikey=' + CREX_API_KEY);
    var data = await response.json();
    
    if (data.status === 'success') {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching player info:', error);
    return null;
  }
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
