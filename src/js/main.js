'use strict';

var PlayScene = require('./play_scene.js');
var Menu = require ('./Menu.js');

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
    //this.game.load.baseURL = "https://ramonarj.github.io/Arkanoid-Remake/src/";
    
     this.game.load.crossOrigin = 'anonymous';
    //Fondo
    this.game.stage.backgroundColor = '#000000';

    //Cargamos los assets del juego (sprites y spritesheets)
    //Sprites
    this.game.load.image('player', 'images/Player.png');
    this.game.load.image('background', 'images/Fondo.png');
    this.game.load.image('ball', 'images/Pelota.png');
    this.game.load.image('pared', 'images/pared.png');
    this.game.load.image('techo', 'images/techo.png');
    this.game.load.image('bullet', 'images/bullet pair.png');
    this.game.load.image('vidas', 'images/Vidas.png');
    this.game.load.image('menu', 'images/Menu.png');
    this.game.load.image('cursor', 'images/Cursor.png');
    this.game.load.image('1up', 'images/1up.png');
    this.game.load.image('highscore', 'images/highscore.png');
    this.game.load.image('round', 'images/round.png');
    
    
   // Spritesheets: 'key', 'ruta', 'ancho de cada frame (en px)', 'alto de cada frame (en px)', 'nº de frames' (opcional)
    this.game.load.spritesheet('PowerUps', 'images/PowerUps.png', 40, 18, 42); //42 frames
    this.game.load.spritesheet('ladrillos', 'images/Ladrillos.png', 44, 22); //Ladrillos
    this.game.load.spritesheet('enemigos', 'images/Enemigos.png', 31, 37); //Enemigos
    this.game.load.spritesheet('compuertas', 'images/Compuertas.png', 68, 20); //Compuertas

    // Sonidos
    this.game.load.audio('ball&dBrick', 'assets/sounds/collision - ball&dBrick.ogg');
    this.game.load.audio('ball&uBrick', 'assets/sounds/collision - ball&uBrick.mp3');
    this.game.load.audio('ball&player', 'assets/sounds/collision - ball&player.mp3');

    this.game.load.audio('enemyDeath', 'assets/sounds/enemy - death.wav');

    this.game.load.audio('playerDeath', 'assets/sounds/player - death.wav');
    this.game.load.audio('playerShot', 'assets/sounds/player - shot.wav');

    this.game.load.audio('extraLife', 'assets/sounds/power up - extra life.wav');
    this.game.load.audio('getWide', 'assets/sounds/power up - get wide.wav');

    // Datos del nivel
    this.game.load.text('levels', 'assets/levels/levels.json');
  },

  create: function () 
  {
    this.game.state.start('menu');
  }
};


window.onload = function ()
 {
  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');

  game.state.add('boot', BootScene);
  game.state.add('preloader', PreloaderScene);
  game.state.add('play', PlayScene);
  game.state.add('menu', Menu);

  game.state.start('boot');
};
