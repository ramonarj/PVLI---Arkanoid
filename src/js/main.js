'use strict';

var PlayScene = require('./play_scene.js');


var BootScene = 
{
  preload: function ()
   {
<<<<<<< HEAD
    // load here assets required for the loading screen
    this.game.load.image('preloader_bar', 'images/preloader_bar.png');
=======
    
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
<<<<<<< HEAD
    //Fondo
    this.game.stage.backgroundColor = '#000000';
    this.loadingBar = this.game.add.sprite(0, 240, 'preloader_bar');
    this.loadingBar.anchor.setTo(0, 0.5);
    this.load.setPreloadSprite(this.loadingBar);
=======
    this.game.load.baseURL = "https://ramonarj.github.io/PVLI---Arkanoid/src/";
    
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
<<<<<<< HEAD
    this.game.load.image('bullet', 'images/bullet pair.png');
=======
    this.game.load.image('ladrillo', 'images/ladrillo.png');
    this.game.load.image('ladrilloBueno', 'images/ladrilloBueno.png');
    this.game.load.image('ladrilloPlata', 'images/ladrilloPlata.png');
    this.game.load.image('ladrilloOro', 'images/ladrilloOro.png');
    this.game.load.image('bullet', 'images/bullet pair.png');
   // this.game.load.image('powerUp0', 'images/powerUpTest.png');

   // Spritesheets: 'key', 'ruta', 'ancho de cada frame (en px)', 'alto de cada frame (en px)'
    this.game.load.spritesheet('powerUp0', 'images/powerUp4.png', 16, 7);
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
