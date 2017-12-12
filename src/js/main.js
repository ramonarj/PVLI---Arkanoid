'use strict';

var PlayScene = require('./play_scene.js');

var BootScene = 
{
  preload: function ()
   {
    
  },

  create: function () 
  {
    this.game.state.start('preloader');
  }
};


var PreloaderScene = 
{
  preload: function () 
  {
    this.game.load.baseURL = "https://ramonarj.github.io/Arkanoid-Remake/src/";
    
     this.game.load.crossOrigin = 'anonymous';
    //Fondo
    this.game.stage.backgroundColor = '#000000';

    // TODO: load here the assets for the game
    //Cargamos los assets del juego
    this.game.load.image('logo', 'images/phaser.png');
    this.game.load.image('player', 'images/Player.png');
    this.game.load.image('background', 'images/Fondo.png');
    this.game.load.image('ball', 'images/Pelota.png');
    this.game.load.image('pared', 'images/pared.png');
    this.game.load.image('techo', 'images/techo.png');
    this.game.load.image('ladrillo', 'images/ladrillo.png');
    this.game.load.image('bullet', 'images/bullet pair.png');


   // Spritesheets: 'key', 'ruta', 'ancho de cada frame (en px)', 'alto de cada frame (en px)'
   //Power-ups
    this.game.load.spritesheet('powerUp0', 'images/powerUp0.png', 40, 18);
    this.game.load.spritesheet('powerUp1', 'images/powerUp1.png', 40, 18);
    this.game.load.spritesheet('powerUp2', 'images/powerUp2.png', 40, 18);
    this.game.load.spritesheet('powerUp3', 'images/powerUp3.png', 40, 18);
    this.game.load.spritesheet('powerUp4', 'images/powerUp4.png', 40, 18);
    this.game.load.spritesheet('powerUp5', 'images/powerUp5.png', 40, 18);
    this.game.load.spritesheet('powerUp6', 'images/powerUp6.png', 40, 18);

   
    this.game.load.spritesheet('ladrillos', 'images/Ladrillos.png', 44, 22); //Ladrillos
    this.game.load.spritesheet('enemigos', 'images/Enemigos.png', 31, 37); //Enemigos

  },

  create: function () 
  {
    this.game.state.start('play');
  }
};


window.onload = function ()
 {
  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');

  game.state.add('boot', BootScene);
  game.state.add('preloader', PreloaderScene);
  game.state.add('play', PlayScene);

  game.state.start('boot');
};
