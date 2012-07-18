var client = client || {};

client.renderer = (function($) {
  var pub = {};
  
  pub.init = function() {
    this.display = doodle.Display("#game");
    this.display.frameRate = config.framerate;
    this.display.height = config.height;
    this.display.width = config.width;
    this.display.backgroundColor = 0x000000;
    this.base_layer = this.display.addLayer();
    this.obstacle_layer = this.display.addLayer();
    this.ship_layer = this.display.addLayer();
    this.text_layer = this.display.addLayer();
    
    /*
    this.top_label = doodle.Text('');
    this.top_label.x = config.width/2;
    this.top_label.y = this.top_label.height/2 + 10;
    
    this.middle_label = doodle.Text('');
    this.middle_label.x = config.width/2;
    this.middle_label.y = config.height/2 - 40;
    this.middle_label.fontSize = 35;
    this.middle_label.color = '#FF0000';
    
    this.text_layer.addChild(this.top_label);
    this.text_layer.addChild(this.middle_label); */
  };
  
  function add_objects_to_layer(layer, objects) {
    for (var i = 0; i < objects.length; i++) {
      layer.addChild(objects[i]);
    }
  }
  
  pub.add_base_objects = function(objects) {
    add_objects_to_layer(this.base_layer, objects);
  };
  
  pub.add_ship = function(ship) {
    ship.add_to_layer(this.ship_layer);
  };
  
  pub.remove_ship = function(ship) {
    this.ship_layer.removeChild(ship);
  };
  
  pub.add_obstacle = function(obstacle) {
    add_objects_to_layer(this.obstacle_layer, [obstacle]);
  };
  
  pub.remove_obstacle = function(obstacle) {
    this.obstacle_layer.removeChild(obstacle);
  };
  
  pub.show_message = function(msg) {
    $('#messages_container').append('<p>'+msg+'</p>').scrollTop(1000000);
  };
  
  pub.show_big_message = function(msg) {
    this.middle_label.text = msg;
    cr.middle_label.x -= cr.middle_label.width/2;
  };
  
  return pub;
} (jQuery));