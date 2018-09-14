/**
Scene life-cycle for this project:
  @method init    - called when the Scene is started. This is where we can setup
                    parameters for the scene or game.
  @method preload - preloading the images and assets into memory before launching
                    the actual game.
  @method create  - after the preloading phase is completed, the create method
                    is executed. This one-time execution gives us a good place
                    to create the main entities for our game.
  @method update  -  while the scene is running (not paused), the update method is
                    executed multiple times / s (the game will aim for 60fps, but
                    it depends on the hardware).
**/

let gameScene = new Phaser.Scene('Game'); // Stores the 'Game' scene

gameScene.init = function() {
    this.playerSpeed = 1.5;
    this.enemyMaxY = 280;
    this.enemyMinY = 80;
}

gameScene.preload = function() {
  // load the background image
  this.load.image('background', 'assets/background.png');
  // load the player sprite
  this.load.image('player', 'assets/player.png');
  // load the dragon sprite
  this.load.image('dragon', 'assets/dragon.png');
  // load the treasure image
  this.load.image('treasure', 'assets/treasure.png');
}

gameScene.create = function() {
  /**
  NOTE: In Phaser 3, sprites have the default origin point in the center of the 'canvas'.
  If we positioned the background sprite on (0, 0), we would have told Phaser to
  place the center of the background sprite at (0, 0).
  // creates the background
  this.add.sprite(320, 180, 'background');
  **/

  let bg = this.add.sprite(0, 0, 'background'); // Background
  bg.setOrigin(0, 0); // Chnage the origin to the top-left of the sprite

  // add the player sprite at x:40 and y:middle of viewport and reduce it's size by 50%
  // this.sys.game.config gives us the configuration we defined when initiated our game
  this.player = this.add.sprite(40, this.sys.game.config.height / 2, 'player');
  this.player.setScale(0.5);

  // adds the treasure image
  this.treasure = this.add.sprite(this.sys.game.config.width - 80, this.sys.game.config.height / 2, 'treasure');
  this.treasure.setScale(0.6);

  /**
  @desc - we are creating 5 sprites with the repeat property. The first one is
  placed at (110, 110). Using stepX we move 80 on x and 20 on y using setY.
  **/
  this.enemies = this.add.group({
    key: 'dragon',
    repeat: 5,
    setXY: {
      x: 110,
      y: 100,
      stepX: 80,
      stepY: 20
    }
  });
  Phaser.Actions.ScaleXY(this.enemies.getChildren(), -0.5, -0.5);

  /**
  @desc - set the speed of the enemies. Random between 1 and 2
  @method Phaser.Actions.Call - allows us to call a method on each array element.
  We are passing `this` as the context, although not using it.
  **/
  Phaser.Actions.Call(this.enemies.getChildren(), function(enemy) {
    enemy.speed = Math.random() * 2 + 1;
  }, this);

  // the player is alive
  this.isPlayerAlive = true;

  // reset camera effects
  this.cameras.main.resetFX();
}

gameScene.update = function() {
  /**
  This code goes at the top of the update function, so that the function is processed
  only if the player is alive
  **/
  if (!this.isPlayerAlive) {
    return;
  }

  // checking for active inputs
  if (this.input.activePointer.isDown) {
    // player walks
    this.player.x += this.playerSpeed;
  }

  /**
  @desc checking for player - treasure collision
  @method getBounds - gives the rectangle coordinates in the right format
  @method Phaser.Geom.Intersects.RectangleToRectangle - returns true if both rectangles overlap
  **/
  if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(),
      this.treasure.getBounds())) {
    this.gameOver();
  }

  // enemy movement and collison with player
  let enemies = this.enemies.getChildren();
  let numEnemies = enemies.length;

  for (let i = 0; i < numEnemies; i++) {
    // move the enemies
    enemies[i].y += enemies[i].speed;

    // reverse the movement when the enemies reach the edges
    if (enemies[i].y >= this.enemyMaxY && enemies[i].speed > 0) {
      enemies[i].speed *= -1;
    } else if (enemies[i].y <= this.enemyMinY && enemies[i].speed < 0) {
      enemies[i].speed *= -1;
    }

    // enemy - player collision
    if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), enemies[i].getBounds())) {
      this.gameOver();
      break;
    }
  }
}

/**
@func gameOver - called when the game is over to restart the scene, so the user can play again
**/
gameScene.gameOver = function() {

  // set the player to dead :)
  this.isPlayerAlive = false;

  // shake the camera for 500 miliseconds
  this.cameras.main.shake(500);

  // fade camera
  this.time.delayedCall(250, function() {
    this.cameras.main.fade(250);
  }, [], this);

  // restart game
  this.time.delayedCall(500, function() {
    this.scene.restart();
  }, [], this);
}

// The game config
let config = {
  type: Phaser.AUTO,
  width: 640,
  height: 360,
  scene: gameScene
};

// Creates the game, and passes in the config
let game = new Phaser.Game(config);
