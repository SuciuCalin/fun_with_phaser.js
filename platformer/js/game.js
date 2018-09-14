let config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 500 },
      debug: false
    }
  },
  scene: {
    key: 'main',
    preload: preload,
    create: create,
    update: update
  }
};

let game = new Phaser.Game(config);

let map;
let player;
let cursors;
let groundLayer, coinLayer;
let text;

function preload() {
  // map made with Tiled in JSON format
  this.load.tilemapTiledJSON('map', 'assets/map.json');
  // tiles in spritesheet
  this.load.spritesheet('tiles', 'assets/tiles.png', {frameWidth: 70, frameHeight: 70});
  // simple coin image
  this.load.image('coin', 'assets/coinGold.png');
  // player animations
  this.load.atlas('player', 'assets/player.png', 'assets/player.json');
}

function create() {
  // load the map
  map = this.make.tilemap({key: 'map'});

  // tiles for the ground layer
  let groundTiles = map.addTilesetImage('tiles');
  // create the ground layer
  groundLayer = map.createDynamicLayer('World', groundTiles, 0, 0);
  // make the player collide with the ground layer
  groundLayer.setCollisionByExclusion([-1]);

  // set the boundaries of the game world
  this.physics.world.bounds.width = groundLayer.width;
  this.physics.world.bounds.height = groundLayer.height;

  // create the player sprite
  player = this.physics.add.sprite(200, 200, 'player');
  player.setBounce(0.2); // the player will bounce from items

  // prevent the player from going out of the map
  player.setCollideWorldBounds(true);
  /**
    Set the player - world bounds collision, so that the player won't fall out
    of the map
  **/
  this.physics.add.collider(groundLayer, player);

  cursors = this.input.keyboard.createCursorKeys();

  // set the bounds so the camera won't go outside of the game world
  this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
  // make the camera follow the player
  this.cameras.main.startFollow(player);

  // set the background color, so that the `sky` is not black
  this.cameras.main.setBackgroundColor('#ccccff');
}

function update(time, delta) {
    if (cursors.left.isDown)
    {
        player.body.setVelocityX(-200); // move left
        player.anims.play('walk', true); // play walk animation
        player.flipX= true; // flip the sprite to the left
    }
    else if (cursors.right.isDown)
    {
        player.body.setVelocityX(200); // move right
        player.anims.play('walk', true); // play walk animatio
        player.flipX = false; // use the original sprite looking to the right
    } else {
        player.body.setVelocityX(0);
        player.anims.play('idle', true);
    }
}
