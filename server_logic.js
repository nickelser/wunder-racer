var sys = require('sys'), config = require('./config'), c = config.get_config(), state = config.get_state(), game_state = config.get_game_state();

function get_rand(min, max) {
   return Math.random()*(max - min) + min;
}

function bin_search(y_pos, list) {
  var low = 0, high = list.length - 1, i, cmp;
  
  while (low <= high) {
    i = Math.floor((low + high) / 2);
    cmp = list[i].y - y_pos;
    if (cmp < 0) { low = i + 1; continue; }
    else if (cmp > 0) { high = i - 1; continue; }
    else break;
  }
  
  return i;
}

function on_data(client, data, str, fn) {
  if (str in data) {
    fn(client, data[str]);
  }
}

this.init = function() {
  add_new_game();
};

this.dispatch_message = function(client, data) {
  //sys.log("got data from client: "+client.sessionId+" data: ", data);
  on_data(client, data, 'log_in', this.log_player_in);
  on_data(client, data, 'req_game_list', this.send_game_list);
  on_data(client, data, 'join_game', this.add_player_to_game);
  on_data(client, data, 'ready_for_players', this.send_player_list);
  on_data(client, data, 'ready', this.on_player_ready);
  on_data(client, data, 'position', this.update_player_position);
};

this.remove_client = function(client) {
  sys.log("would remove client here");
};

var games = {}, game_id_autoinc = 1, players = {};

this.send_game_list = function(client) {
  var game_list = [];
  
  for (x in games) {
    var g = {}, gg = games[x];
    g.num_players = gg.players.length;
    g.max_num_players = c.max_players_per_game;
    g.name = gg.name;
    g.id = gg.id;
    g.state = gg.state.str;
    
    game_list.push(g);
  }
  
  client.send({game_list:game_list});
};

function do_send_player_list(client) {
  var p = is_player(client);
  
  sys.log("asked to send playerlist, p: "+p+" state: "+p.state.str+" p.game: "+p.game);
  if (p && (p.state == state.waiting_for_start || p.state == state.ready) && p.game in games) {
    var player_list = [], g = games[p.game];
    
    for (x in g.players) {
      var plr = {};
      plr.name = g.players[x].name;
      plr.p_id = g.players[x].id;
      plr.starting_pos = g.players[x].starting_pos;
      player_list.push(plr);
    }
    
    client.send({player_list:player_list});
  }
}

this.send_player_list = function(client) {
  do_send_player_list(client);
};

function add_new_game() {
  var g = {};
  g.players = [];
  g.id = game_id_autoinc++;
  g.name = 'Game #'+g.id;
  g.course = generate_course();
  g.state = game_state.waiting_for_ready;
  
  games[g.id] = g;
  
  return g;
};

function is_player(client) {
  if (client.sessionId in players) {
    return players[client.sessionId];
  }
  return null;
}

this.player_connected = function(client) {
  if (!is_player(client)) {
    players[client.sessionId] = {};
    var p = players[client.sessionId];
    p.name = 'player'+client.sessionId;
    p.game = null;
    p.state = state.logging_in;
    p.id = client.sessionId;
    p.client = client;
  }
};

this.log_player_in = function(client, player_info) {
  var p = is_player(client);
  sys.log("log player in: "+client.sessionId+" info: "+player_info.name+ " p: "+p);
  
  if (p) {
    p.state = state.in_lobby;
    p.name = player_info.name;
    client.send({logged_in:true});
    p.state = state.in_lobby;
  }
};

function get_new_starting_position(game_id) {
  var inc = (c.width - (2*c.grass_width + 2*c.wall_width))/(c.max_players_per_game+1);
  
  if (game_id in games) {
    return games[game_id].players.length * inc + inc;
  }
}

function try_to_add_player_to_game(client, game_id) {
  if (game_id in games) {
    var g = games[game_id];
    
    if (g.players.length >= c.max_players_per_game) {
      return {joined:false, reason:'game is full'};
    }
    
    if (g.state != game_state.waiting_for_ready) {
      return {joined:false, reason:'game already started'};
    }
    
    if (!(client.sessionId in players)) {
      return {joined:false, reason:'unknown player'};
    }
    
    var p = players[client.sessionId];
    
    if (p.state != state.in_lobby) {
      return {joined:false, reason:'player not in lobby'};
    }
    
    p.game = game_id;
    p.state = state.waiting_for_start;
    p.last_obstacle = -1;
    p.pos = null;
    
    // physics stuff
    p.starting_pos = get_new_starting_position(game_id);
    
    return {joined:true, reason:'', game:g, player:p, starting_pos:p.starting_pos};
  }
  
  return {joined:false, reason:'bad game id'};
}

this.add_player_to_game = function(client, game_id) {
  var ret = try_to_add_player_to_game(client, game_id);
  sys.log("trying to join game");
  if (ret.joined) {
    sys.log("success!");
    client.send({joined_game:ret.starting_pos});
    client.send({course:ret.game.course});
    
    ret.game.players.push(ret.player);
        
    for (p in ret.game.players) {
      do_send_player_list(ret.game.players[p].client);
    }
    
    var has_empty_game = false;
    for (x in games) {
      if (games[x].players.length == 0) {
        has_empty_game = true;
        break;
      }
    }
    
    if (!has_empty_game) {
      add_new_game();
    }
  } else {
    sys.log("failure :-(:"+ret.reason);
    client.send({unable_to_join:ret.reason});
  }
};

function broadcast_to_game(game_id, msg, except) {
  var plrs = games[game_id].players;
  for (var i = 0; i < plrs.length; i++) {
    if (plrs[i].id != except)
      plrs[i].client.send(msg);
  }
}

function update_player_state_in_game(game_id, new_state) {
  for (var i = 0; i < games[game_id].players.length; i++) {
    games[game_id].players[i].state = new_state;
  }
}

this.on_player_ready = function(client) {
  var p = is_player(client);
    
  if (p && (p.state == state.waiting_for_start || p.state == state.ready) && p.game in games) {
    var g = games[p.game], num_ready = 0;
    p.state = state.ready;
    
    for (var i = 0; i < g.players.length; i++) {
      if (g.players[i].state == state.ready) {
        num_ready++;
      }
    }
    sys.log("num ready: "+num_ready);
    
    if (num_ready == g.players.length) {
      broadcast_to_game(p.game, {game_start:{cur_time:(new Date().getTime()), ms_to_start:c.start_delay*1000}});
      update_player_state_in_game(p.game, state.in_game);
      g.state = game_state.in_game;
      
      setTimeout(function(g_id) {
        setInterval(broadcast_player_positions, c.ms_between_updates, g_id);
      }, c.start_delay*1000, g.id);
    }
  }
};

function broadcast_player_positions(game_id) {
  var g = games[game_id];
  
  if (g && (g.state == game_state.in_game)) {
    var positions = [];
    //sys.log("got g: "+game_id+" players: "+g.players.length);
    
    for (var i = 0; i < g.players.length; i++) {
      var p = g.players[i], pos = p.pos;
      if (pos) {
        positions.push(pos);
      }
    }
    
    if (positions.length > 0) {
      //sys.log("broadcasting :"+ positions.length+ " positions!");
      broadcast_to_game(game_id, {positions:positions});
    }
  }
}

this.update_player_position = function(client, position) {
  /*var pos = position;
  pos.push(client.sessionId); 
  client.broadcast({position:pos});*/
  var p = is_player(client);
  //sys.log("got update: "+position);
  
  if (p && (p.state == state.in_game) && p.game in games) {
    p.pos = position;
    p.pos.p = p.id;
    //var pos = position;
    //pos.push(client.sessionId);
    //broadcast_to_game(p.game, {position:pos}, client.sessionId);
  }
};

function generate_course() {
  var left_bound = c.wall_width + c.grass_width, right_bound = c.width - (left_bound), obstacles = [];
  
  for (var i = 0; i < c.obstacles; i++) {
    var r = {};
    //r.height = get_rand(c.min_obstacle_dim, c.max_obstacle_dim);
    //r.width = get_rand(c.min_obstacle_dim, c.max_obstacle_dim);
    r.x = get_rand(left_bound, right_bound);
    r.y = get_rand(0, -1*c.course_length);
    r.id = i;
    obstacles.push(r);
  }
  
  obstacles.sort(function (a, b) { return b.y - a.y; });
  sys.log("generated course, total: "+obstacles.length+" obstacles!");
  
  return obstacles;
};

this.obstacles_for_client = function(client, pos) {
  if (!(client in last_client_obstacle_map))
    hint = null;
  else
    hint = last_client_obstacle_map[client];
  
  var ret = raw_new_obstacles_for_position(pos.pseudo_y, hint);
  last_client_obstacle_map[client] = ret[1];
  
  return ret[0];
};

function raw_new_obstacles_for_position(pos, hint) {
  var d_pos = pos + c.height/2, i, results = [];
  
  if (!hint)
    i = bin_search(d_pos, obstacles);
  else
    i = hint;
  
  while (true) {
    if (i >= obstacles.length)
      break;
      
    if (Math.abs(obstacles[i].y - d_pos) < c.height/2) {
      results.push(obstacles[i++]);
    } else {
      break;
    }
  }
  
  return [results, i];
};