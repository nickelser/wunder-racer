var config = {
  framerate: 40,
  ms_between_updates: 80,
  width: 850,
  height: 500,
  course_length: 3500,
  racer_colors: [0xff0000, 0xfff000, 0x0fff00, 0x00fff0, 0x000fff],
  wall_color: 0xff0000,
  obstacle_color: 0x0000ff,
  grass_color: 0x00ff00,
  wall_width: 10,
  grass_width: 75,
  box_width: 35,
  box_height: 25,
  starting_rotation: -90,
  obstacle_cache_size: 200,
  racer_normal_max_speed: 6.5,
  racer_grass_max_speed: 3,
  thrust: 5.5,
  poll_for_game_list_outside_game: 5,
  poll_for_game_list_in_game: 30,
  port: 8888
};

var state = {
  connecting: {str: 'connecting'},
  logging_in: {str: 'logging in'},

  in_lobby: {str: 'in lobby'},
  joining_game: {str: 'joining game'},
  waiting_for_start: {str: 'waiting for start'},
  ready: {str: 'ready'},
  in_game: {str: 'in game'},
  game_over: {tr: 'game over'},
  
  disconnected: {str: 'disconnected'}
};

this.get_config = function() { return config; };
this.get_state = function() { return state; };