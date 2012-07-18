var client = client || {};

client.network = (function($) {
  var pub = {};
  
  pub.connect_to_server = function() {
    var cg = client.game, cn = client.network;
    
    this.socket = new io.Socket(null, {port: config.port, rememberTransport: false});
    this.socket.connect();
    
    this.socket.on('connect', function() {
      cg.player_id = cn.socket.transport.sessionid;
      cg.connected();
      cn.socket.on('message', cn.handle_server_updates);
    });
  
   this.socket.on('disconnect', function() {
     console.log("disconnected :-(");
     client.game.disconnected();
   });
  };
  
  pub.log_in = function(player_name) {
    console.log("log in: ", player_name);
    this.socket.send({log_in:{name:player_name}});
  };
  
  pub.disconnect = function() {
    console.log("disconnect");
    this.socket.send({goodbye:true});
  };
  
  pub.join_game = function(game_id) {
    console.log("join game: ", game_id);
    this.socket.send({join_game:game_id});
  };
  
  pub.ready = function() {
    console.log("ready");
    this.socket.send({ready:true});
  };
  
  pub.ready_for_players = function() {
    this.socket.send({ready_for_players:true});
  };
  
  pub.send_update = function(ship_info) {
    this.socket.send({position:ship_info});
  };
  
  pub.request_game_list = function() {
    client.network.socket.send({req_game_list:true});
  };
  
  function on_data(data, str, fn) {
    if (str in data) {
      fn(data[str]);
    }
  }

  pub.handle_server_updates = function(data) {
    var cg = client.game;
    
    if (data == null) {
      console.log("error!");
      return;
    }
    
    //console.log("got data: ", data);
    
    on_data(data, 'game_list', cg.game_list);
    on_data(data, 'player_list', cg.new_players);
    on_data(data, 'game_start', cg.game_start);
    on_data(data, 'positions', cg.update_player_positions);
    on_data(data, 'obstacles', cg.new_obstacles);
    on_data(data, 'message', cg.new_message);
    on_data(data, 'goodbye', cg.remove_player);
    on_data(data, 'unable_to_join', cg.failed_to_join_game);
    on_data(data, 'joined_game', cg.joined_game);
    on_data(data, 'logged_in', cg.logged_in);
    on_data(data, 'course', cg.new_obstacles);
  
    //if ('goodbye' in data) {
     // var player_id = data['goodbye'];
    
      //if (player_id != cr.player_id/* && dgb in cr.other_players*/) {
     //   cg.remove_other_player(data['goodbye']);
        // cr.show_message("goodbye, "+dgb);
        //         cr.other_players[dgb].x = -10000;
        //         cr.other_players[dgb].draw();
        //         cr.ship_layer.removeChild(cr.other_players[dgb]);
        //         delete cr.other_players[dgb];
      //}
    //}
  };
  
  return pub;
} (jQuery));