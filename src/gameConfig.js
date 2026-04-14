/**
 * gameConfig.js — Supported game servers for the Claimer.
 *
 * LOGIN_WS_URL : WebSocket endpoint for login + claiming
 * ORIGIN       : HTTP Origin header — must match what the game app sends
 *
 * supportsPothli   : game has pothli/theli gift bag (subID:29 → 145)
 * supportsCashback : game has cashback reward (subID:26→142 check, subID:28 → 144 claim)
 */

export const GAMES = [
  {
    id:               'pandamaster',
    label:            'Panda Master',
    shortLabel:       'PM',
    emoji:            '🐼',
    color:            '#fb923c',
    LOGIN_WS_URL:     'wss://pandamaster.vip:7878/',
    GAME_VERSION:     '2.0.1',
    ORIGIN:           'http://play.pandamaster.vip',
    supportsPothli:   true,
    supportsCashback: true,
  },
  {
    id:               'milkyway',
    label:            'MilkyWay',
    shortLabel:       'MW',
    emoji:            '🌌',
    color:            '#a78bfa',
    LOGIN_WS_URL:     'wss://game.milkywayapp.xyz:7878/',
    GAME_VERSION:     '2.0.1',
    ORIGIN:           'https://play.milkywayapp.xyz',
    supportsPothli:   true,
    supportsCashback: true,
  },
  {
    id:               'firekirin',
    label:            'FireKirin',
    shortLabel:       'FK',
    emoji:            '🔥',
    color:            '#ff6b1a',
    LOGIN_WS_URL:     'ws://54.244.43.127:8600/',
    GAME_VERSION:     '2.0.1',
    ORIGIN:           'http://54.244.43.127',
    supportsPothli:   true,
    supportsCashback: true,
  },
  {
    id:               'orion',
    label:            'OrionStars',
    shortLabel:       'OS',
    emoji:            '⭐',
    color:            '#34d399',
    LOGIN_WS_URL:     'ws://34.213.5.211:8600/',
    GAME_VERSION:     '2.0.1',
    ORIGIN:           'http://34.213.5.211',
    supportsPothli:   true,
    supportsCashback: false,
  },
];

export const DEFAULT_GAME_ID = 'pandamaster';

export function getGame(id) {
  return GAMES.find(g => g.id === id) || GAMES[0];
}
