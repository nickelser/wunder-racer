var client_config = require('./client/config');

var config = {
  obstacles: 150,
  max_players_per_game: 4,
  start_delay: 4
};

var game_state = {
  waiting_for_ready: {str: 'waiting for players'},
  in_game: {str: 'in game'},
  game_over: {str: 'game over'}
};

var cc = client_config.get_config();
for (var property in cc)
  config[property] = cc[property];

this.get_config = function() { return config; };
this.get_state = function() { return client_config.get_state(); };
this.get_game_state = function() { return game_state; };