var client = client || {};

client.game = (function($) {
  var pub = {};

  pub.init = function() {
    var c = config, cs = client.sprites, cr = client.renderer, cn = client.network;
    this.state = state.disconnected;
    
    cr.init();
    cn.connect_to_server();
    this.update_state(state.connecting);
    
    this.other_players = {};
    this.obstacles = [];
    
    // state for ready
    this.loaded_obstacles = false;
    this.loaded_player_list = false;
    this.loaded_init_game = false;
    
    // other game state
    this.respawning = false;
    this.game_list_interval_id = null;
    this.last_network_update = -1;
  
    // make the grass
    this.grass = [cs.rect(c.grass_width, c.height, c.grass_color, cr.obstacle_layer), cs.rect(c.grass_width, c.height, c.grass_color, cr.obstacle_layer)];
    this.reset_grass();
  
    cr.add_base_objects([this.grass[0], this.grass[1]]);
    
    // make the two walls
    this.walls = [cs.rect(c.wall_width, c.height, c.wall_color, cr.obstacle_layer), cs.rect(c.wall_width, c.height, c.wall_color, cr.obstacle_layer)];
    this.reset_walls();

    cr.add_base_objects([this.walls[0], this.walls[1]]);
  
    this.ship = cs.racer();
  
    cr.add_ship(this.ship);
    
    this.ship.x = c.width/2;
    this.ship.y = c.height/2;
    
    // need a hint for obstacles to avoid checking them all
    this.obstacle_hint = 0;
    
    $('#log_in').click(function() {
      //$(this).disable();
      client.game.log_in();
    });
    
    $('#ready_button').attr('disabled', true);
    
    $('.game_list_item').live('click', function(e) {
      e.stopPropagation();
      client.game.join_game($(this).attr('id'));
    });
  
    if (0) {
      window.ondeviceorientation = function(event) {
        if (client.renderer.using_keyboard)
          return;
        var clamped = event.gamma/60*20;
        client.game.ship.update_vr(clamped);
      };
    }
  };
  
  pub.reset_walls = function() {
    client.game.walls[0].x = config.wall_width/2; client.game.walls[1].x = config.width - config.wall_width/2;
    client.game.walls[0].y = config.height/2; client.game.walls[1].y = config.height/2;
  };
  
  pub.reset_grass = function() {
    client.game.grass[0].x = config.grass_width/2 + config.wall_width; client.game.grass[1].x = config.width - config.grass_width/2 - config.wall_width;
    client.game.grass[0].y = config.height/2; client.game.grass[1].y = config.height/2;
  };
  
  pub.ready = function() {
    if (client.game.state == state.waiting_for_start) {
      client.network.ready();
      client.renderer.show_message('ready, waiting for all players');
    }
  };
  
  pub.log_in = function() {
    var n = $('#name').val();
    client.network.log_in(n);
    client.game.ship.set_name(n);
    client.game.update_state(state.logging_in);
  };
  
  pub.poll_for_game_list = function(interval) {
    if (client.game.game_list_interval_id != null)
      clearInterval(client.game.game_list_interval_id);
    client.game.game_list_interval_id = setInterval(client.network.request_game_list, interval*1000);
  };
  
  pub.logged_in = function() {
    client.game.update_state(state.in_lobby);
    client.network.request_game_list();
    //client.game.poll_for_game_list(config.poll_for_game_list_outside_game);
  };
  
  pub.join_game = function(game_id) {
    if (client.game.state == state.in_lobby || client.game.state == state.game_over) {
      client.network.join_game(game_id);
      client.game.update_state(state.joining_game);
    }
  };
  
  pub.disconnected = function() {
    client.game.update_state(state.disconnected);
  };
  
  pub.connected = function() {
    client.renderer.show_message('connected, waiting on user name');
  };
  
  pub.failed_to_join_game = function(r) {
    client.renderer.show_message('unable to join game: '+r);
    client.game.update_state(state.in_lobby);
  };
  
  pub.game_list = function(lst) {
    $('#game_list').empty();
    console.log("got list: ", lst);
    for (var i = 0; i < lst.length; i++) {
      $('#game_list').append('<a href="#" class="game_list_item" id="'+lst[i].id+'">'+lst[i].name+'</a> ('+lst[i].num_players+'/'+lst[i].max_num_players+')<br />');
    }
  };
  
  pub.update_state = function(state) {
    var old_state = client.game.state;
    client.game.state = state;
    client.renderer.show_message("moving from "+old_state.str+" to "+state.str);
  };
  
  pub.on_enter_frame = function(event) {
    var cg = client.game, cr = client.renderer;
    
    if (cg.state == state.in_game && !cg.respawning) {
    
      // do the hit testing
      cg.check_collisions();
    
      // now update the player ship position
      cg.ship.tick();
      cg.ship.draw();
      
      // send update to the server
      var now = cg.update_server();
                               
      // cull old obstacles
      cg.update_obstacles();
    
      // adjust the position of the sprites
      var all_sprites = cg.walls.concat(cg.grass.concat(cg.obstacles));
      for (x in all_sprites) {
        all_sprites[x].tick(cg.ship.vx, cg.ship.vy);
      }
      
      for (x in cg.other_players) {
        cg.update_other_player(cg.other_players[x], now);
        cg.other_players[x].draw();
      }
    }
  };
  
  pub.update_server = function() {
    var cg = client.game, now = (new Date()).getTime();
    
    if (now - cg.last_network_update > config.ms_between_updates) {
      client.network.send_update({x:cg.walls[0].x, 
                                  r:cg.ship.rotation,
                                  y:cg.ship.pseudo_y});
      cg.last_network_update = now;
    }
    
    return now;
  };
  
  pub.update_other_player = function(plr, now) {
    if (!plr.last_update_time) {
      plr.x = plr.new_x;
      plr.y = plr.new_y;
      plr.rotation = plr.new_r;
      plr.last_update_time = now;
      console.log("FIRST UPDATE");
    }
    
    var lerp_amt = (now - plr.last_update_time)/(config.ms_between_updates*1.6);
    plr.x = lerp(plr.x, plr.new_x, lerp_amt);
    plr.y = lerp(plr.y, plr.new_y, lerp_amt);
    plr.rotation = lerp(plr.rotation, plr.new_r, lerp_amt);
    plr.last_update_time = now;
    console.log("lerping by ", lerp_amt, " now", now, " last update: ", plr.last_update_time, " diff: ", config.ms_between_updates);
  };
  
  function on_actual_start() {
    console.log("actually starting!");
    var cr = client.renderer, cg = client.game;
    cr.display.addEventListener(doodle.events.Event.ENTER_FRAME, cg.on_enter_frame);
    cr.display.addEventListener(doodle.events.KeyboardEvent.KEY_DOWN, cg.on_key_down);
    cr.display.addEventListener(doodle.events.KeyboardEvent.KEY_UP, cg.on_key_up);
    cg.update_state(state.in_game);
    cr.show_message('go!');
  };
  
  pub.joined_game = function(starting_pos) {
    console.log("joined game!");
    if (client.game.state != state.joining_game) {
      console.log("error, bad state");
    }

    client.network.ready_for_players();
    client.game.poll_for_game_list(config.poll_for_game_list_in_game);
    client.game.ship.x = starting_pos;
    client.game.ship.starting_pos = starting_pos;
    client.game.loaded_init_game = true;
    client.renderer.show_message('got inital player info');
    client.game.check_if_ready_for_ready();
  };
  
  pub.check_if_ready_for_ready = function() {
    if (client.game.loaded_obstacles && client.game.loaded_init_game && client.game.loaded_player_list) {
      client.game.update_state(state.waiting_for_start);
      client.renderer.show_message('game loaded, hit ready when yer ready');
      $('#ready_button').attr('disabled', false);

      $('#ready_button').click(function() {
        $(this).attr('disabled', true);
        client.game.ready();
      });
    }
  };
  
  pub.game_start = function(d) {
    console.log("starting game! ", d);
    if (client.game.state != state.waiting_for_start) {
      console.log("error, bad state");
      return;
    }
    var time = d.cur_time, to_start = d.ms_to_start, countdown_time = (d.cur_time - new Date().getTime()) + to_start;
    setTimeout(on_actual_start, countdown_time);
    client.renderer.show_message('starting in '+Math.floor(countdown_time/1000)+'s');
  };
  
  pub.add_player = function(player) {
    if (player.p_id == client.game.player_id || player.p_id in client.game.other_players) {
      return;
    }
    console.log("adding other player: ", player);
    client.game.other_players[player.p_id] = client.sprites.racer(player.starting_pos);
    client.renderer.add_ship(client.game.other_players[player.p_id]);
    client.game.other_players[player.p_id].set_name(player.name);
    client.renderer.add_ship(this.other_players[player.p_id]);
    client.renderer.show_message('added player '+player.name);
  };
  
  pub.new_players = function(players) {
    if (!(client.game.state == state.joining_game || client.game.state == state.waiting_for_start)) {
      console.log("error, bad state");
      return;
    }
    
    for (p in players) {
      client.game.add_player(players[p]);
    }
    
    client.game.loaded_player_list = true;
    client.game.check_if_ready_for_ready();
  };
  
  // herp de derp lerp
  MAX_LERP_AMT = 25;
  function lerp(v1, v2, amt) {
    if (amt <= 0 ) return v1;
    else if (amt >= 1) return v2;
    //else if (Math.abs(v1-v2) > MAX_LERP_AMT) return v2;
    
    return v1 + (v2 - v1) * amt;
  }
  
  pub.update_player_positions = function(positions) {
    for (var i = 0; i < positions.length; i++) {
      client.game.update_player_position(positions[i]);
    }
  };
  
  pub.update_player_position = function(pos) {
    var cg = client.game;
    
    if (cg.state != state.in_game) {
      console.log("bad state");
      return;
    }
    
    if (!pos.x || !pos.p) {
      console.log("bad position: ", pos);
      return;
    }
    
    var wall_x = pos.x, rotation = pos.r, pseudo_y = pos.y, p_id = pos.p;
    
    if (p_id == cg.player_id || !(p_id in cg.other_players)) {
      console.log("invalid position val: ", p_id, " mine is: ", cg.player_id);
      return;
    }
    
    var p = cg.other_players[p_id];
    p.new_x = (cg.walls[0].x - wall_x) + p.starting_pos;
    p.new_y = cg.ship.y + (pseudo_y - cg.ship.pseudo_y);
    p.new_r = rotation;
    
    /*var p = cg.other_players[p_id], new_x = (cg.walls[0].x - wall_x) + p.starting_pos, x_diff = new_x - p.x,
        new_y = cg.ship.y + (pseudo_y - cg.ship.pseudo_y), y_diff = new_y - p.y, r_diff = rotation - p.rotation;*/
    
    //console.log("x_diff: ", x_diff, " y_diff: ", y_diff);
    
    // do some goddamn awesome interpolation
    
    /*
    if (Math.abs(x_diff) > 4*config.racer_normal_max_speed)
      p.x = new_x;
    else {
      console.log("smoothing x!");
      p.x += x_diff * 0.1; // exponentially smoothed moving average
    }
    
    if (Math.abs(y_diff) > 4*config.racer_normal_max_speed)
      p.y = new_y;
    else {
      console.log("smoothing y!");
      p.y += y_diff * 0.1;
    }
    
    if (Math.abs(r_diff) > 60)
      p.rotation = rotation;
    else
      p.rotation += r_diff * 0.1; */
      
    //p.vr = pos.vr;
    //console.log("calculated vals, x:", p.x, p.y, p.rotation);
  };
  
  pub.respawn_ship = function() {
    this.respawning = true;
    client.renderer.show_message('you hit something, respawning at start');
    this.ship.respawn();
    this.obstacle_hint = 0;
    
    for (var i = 0; i < this.obstacles.length; i++) {
      //client.renderer.remove_obstacle(this.obstacles[i]);
      this.obstacles[i].y = this.cached_obstacles[i].y;
      this.obstacles[i].x = this.cached_obstacles[i].x;
    }
    
    //this.obstacles = [];
    //load_new_obstacles(this.cached_obstacles);
    this.reset_walls();
    this.reset_grass();
    this.respawning = false;
    client.renderer.show_message('respawned ship');
  };
  
  function load_new_obstacles(obstacles) {
    for (x in obstacles) {
      var t = obstacles[x];
      var rect = client.sprites.rect(config.box_width, config.box_height, config.obstacle_color, client.renderer.obstacle_layer);
      rect.x = t.x;// - cr.walls[0].x;
      rect.y = t.y;// - this.ship.pseudo_y;
      rect.is_obstacle = true;
      client.game.obstacles.push(rect);
      client.renderer.add_obstacle(rect);
    }
  }
  
  pub.new_obstacles = function(obstacles) {
    if (client.game.state != state.joining_game) {
      console.log("error, bad state");
      return;
    }
    load_new_obstacles(obstacles);
    client.game.cached_obstacles = obstacles;
    console.log("got obstacles: ", obstacles, " num: ", obstacles.length);
    client.renderer.show_message('got course info');
    client.game.loaded_obstacles = true;
    client.game.check_if_ready_for_ready();
  };
  
  pub.update_obstacles = function() {
    var c = config, removed = 0;
    
    for (var x = this.obstacles.length - 1; x > 0; x--) {
      var o = this.obstacles[x];
      if (o.y > config.height) {
        o.x = -100000;
        //this.obstacles.splice(x, 1);
        //client.renderer.remove_obstacle(o);
      }
    }
  };
  
  pub.check_collisions = function() {
    // since obstacles is sorted (old values are dropped)
    // we can just iterate through the beginning
    for (var x = this.obstacle_hint; x < this.obstacles.length; x++) {
      var o = this.obstacles[x];
      
      if (o.hitTestObject(this.ship)) {
        this.respawn_ship();
        return;
      }
      
      if ((o.y - config.box_height) > this.ship.y) {
        this.obstacle_hint = x;
      }
      
      if ((o.y + config.box_height) < this.ship.y) {
        // break early if we have gone too far
        break;
      }
    }
        
    // check against the walls obstacles
    for (i in this.walls) {
      if (this.walls[i].hitTestObject(this.ship)) {
        this.respawn_ship();
        return;
      }
    }
    
    // check against the various slowing obstacles
    var slowed = false;
    for (g in this.grass) {
      if (this.grass[g].hitTestObject(this.ship)) {
        this.ship.slow();
        slowed = true;
        break;
      }
    }
    
    if (!slowed)
      this.ship.normal_speed();
  };
  
  pub.on_key_down = function(event) {
    var cg = client.game;
    cg.using_keyboard = true;
    
    switch (event.keyCode) {
      case doodle.Keyboard.LEFT:
        cg.ship.update_vr(-10);
        break;
      case doodle.Keyboard.RIGHT:
        cg.ship.update_vr(10);
        break;
      default:
        break;
    }
  };

  pub.on_key_up = function(event) {
    var cg = client.game;
    
    switch (event.keyCode) {
      case doodle.Keyboard.LEFT:
      case doodle.Keyboard.RIGHT:
        cg.ship.update_vr(0);
        break;
      default:
        break;
    }
  };
  
  return pub;
} (jQuery));


$(function() {
  client.game.init();
});