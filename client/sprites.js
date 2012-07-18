var client = client || {};

client.sprites = (function($) {
  var pub = {};
    
  pub.racer = function (starting_pos) {
    return doodle.Sprite(function() {
      this.vr = 0;
      this.thrust = config.thrust;
      this.vx = 0; this.vy = 0;
      this.color = config.racer_colors[Math.floor(Math.random()*config.racer_colors.length)];
      this.max_speed = config.racer_normal_max_speed;
      this.rotation = config.starting_rotation;
      this.pseudo_y = 0;
      this.name = null;
      
      if (starting_pos != null) {
        this.x = starting_pos;
        this.starting_pos = starting_pos;
      }
        
      //width = 7;
      //height = 7;
      
      this.add_to_layer = function(layer) {
        this.layer = layer;
        this.layer.addChild(this);
      };
      
      this.set_name = function(name) {
        this.name = doodle.Text(name);
        this.layer.addChild(this.name);
      };
    
      this.draw = function () {
        // update name position
        this.name.x = this.x - this.name.width/2;
        this.name.y = this.y + this.height;
        
        // draw the ship
        this.graphics.clear();
        
        // have to set the shadow style manually
        this.layer.context.shadowColor = this.color;
        this.layer.context.shadowOffsetX = 0;
        this.layer.context.shadowOffsetY = 0;
        this.layer.context.shadowBlur = 8;
        this.graphics.lineStyle(1, 0xffffff);
        //this.graphics.beginFill(this.color);
        this.graphics.beginPath();
        this.graphics.moveTo(10, 0);
        this.graphics.lineTo(-10, 10);
        //this.graphics.lineTo(-5, 0);
        this.graphics.lineTo(-10, -10);
        this.graphics.lineTo(10, 0);
        this.graphics.stroke();
        //this.graphics.endFill();
      
        if (this.vr != 0) {
          this.graphics.lineStyle(1, 0xffffff);
          this.layer.context.shadowColor = 0xff8000;
          this.layer.context.shadowOffsetX = 0;
          this.layer.context.shadowOffsetY = 0;
          this.layer.context.shadowBlur = 5;
          //this.graphics.beginFill(0xff8000);
          this.graphics.beginPath();
          this.graphics.moveTo(-7.5, -5);
          this.graphics.lineTo(-15, 0);
          this.graphics.lineTo(-7.5, 5);
          this.graphics.stroke();
          //this.graphics.endFill();
        }
      };
    
      this.tick = function() {
        var angle, ax, ay;
      
        if (this.rotation + this.vr < -180) {
          this.rotation = -180;
        } else if (this.rotation + this.vr > 0) {
          this.rotation = 0;
        } else {
          this.rotation += this.vr;
        }
        
        angle = this.rotation * Math.PI / 180;
        ax = Math.cos(angle) * this.thrust;
        ay = Math.sin(angle) * this.thrust;
        this.vx += ax;
        this.vy += ay;
        
        var v = parseFloat(Math.sqrt(Math.pow(this.vx, 2) + Math.pow(this.vy, 2)));
        
        // not quite right, but will do for now
        if (v > this.max_speed) {
          this.vx /= (v/this.max_speed);
          this.vy /= (v/this.max_speed);
        }
        
        this.pseudo_y += -1*this.vy;
      };
      
      this.respawn = function() {
        this.vx = 0;
        this.vy = 0;
        this.vr = 0;
        this.pseudo_y = 0;
        this.x = this.starting_pos;
        this.y = config.height/2;
      };
      
      this.slow = function() {
        this.max_speed = config.racer_grass_max_speed;
      };
      
      this.normal_speed = function() {
        this.max_speed = config.racer_normal_max_speed;
      };
          
      this.update_vr = function(_vr) {
        if (_vr != null)
          this.vr = _vr;
      };
    });
  };
    
  pub.rect = function(width, height, color, layer) {
    width = width;
    height = height;
    color = color;
    layer = layer;
    
    return doodle.Sprite(function () {
      this.vx = 0;
      this.vy = 0;
      
      layer.context.shadowColor = color;
      layer.context.shadowOffsetX = 0;
      layer.context.shadowOffsetY = 0;
      layer.context.shadowBlur = 8;
      
      this.graphics.lineStyle(1, color);
      //this.graphics.beginPath(color);
      this.graphics.rect(-width/2, -height/2, width, height);
      //this.graphics.endFill();
      
      this.tick = function(vx, vy) {
        this.x += -1*vx;
        
        if (this.is_obstacle) {
          this.y += -1*vy;
        }
      };
    });
  };
  
  return pub;
} (jQuery));
