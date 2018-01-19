'use strict';

//JERARQUÍA DE OBJETOS
var Par = require ('./SoundSource.js').Par;
var SoundSource = require ('./SoundSource.js').SoundSource;
var HUD = require ('./HUD.js').HUD;
var Destroyable = require ('./Destroyable.js');
var Movable = require ('./Movable.js');
var Enemy = require ('./Enemy.js');
var Player = require ('./Player.js');
var Ball = require ('./Ball.js').Ball;
//Todos los Power-ups
var PowerUp = require ('./PowerUp.js').PowerUp;
var GreenPowerUp = require ('./PowerUp.js').GreenPowerUp;
var GreyPowerUp = require ('./PowerUp.js').GreyPowerUp; 
var RedPowerUp = require ('./PowerUp.js').RedPowerUp;
var BluePowerUp = require ('./PowerUp.js').BluePowerUp;
var OrangePowerUp = require ('./PowerUp.js').OrangePowerUp;
var LightBluePowerUp = require ('./PowerUp.js').LightBluePowerUp;
var PinkPowerUp = require ('./PowerUp.js').PinkPowerUp;


//CONSTANTES
var MAX_ENEMIES = 3;
var NUM_LEVELS = 11;


var NUM_POWERUPS = 7;
var POWERUP_CHANCE = 1/3;

var NUM_ROWS = 12;
var NUM_COLS = 11;
var LEFTLIMIT = 147;
var RIGHTLIMIT = 633;
var FIRST_BRICK_Y = 84;


var BRICK_WIDTH = 44;
var BRICK_HEIGHT = 22;
var SILVER_BRICK = 8;
var GOLDEN_BRICK = 9;
var WHITE_BRICK_POINTS = 50;

var EXTRA_BALLS = 2;
var PLAYER_POSY = 526;
var HUD_POSY = 320;
var GATES_POSY = require ('./HUD.js').GATES_POSY;
var GATE1_POSX = 236;
var GATE2_POSX = 477;



//Variables globales necesarias (nivel, vidas y puntuación actual y máxima)... arrggghhhh
var level = 1;
var lives = 3;
var score = 0;
var highscore = require ('./HUD.js').DEFAULT_HIGHSCORE;
var brickArray = null;


var PlayScene =
 {
     //Variables locales (de la escena)
     topBrickLimit: null,
     cursors:null,
     playerWeapon:null,
     enemigos: null,
     ball:null,
     ballsGroup:null,
     bricks:null,
     walls:null,
     powerUps:null,
     hud:null,
     activePowerUp:null,
     fallingPowerUp:null,
     player:null,
     levelDoor:null,
     doorOpen:null,
     breakableBricks:null,

     //Audio
     ball_dBrick:null,
     ball_uBrick:null,
     ball_player:null,

     enemyDeath:null,

     playerDeath:null,
     playerShot:null,
     
     extraLife:null,
     getWide:null,


      

   //Función Create
  create: function () 
  {

    // AUDIO
    this.ball_dBrick = this.game.add.audio('ball&dBrick');
    this.ball_uBrick = this.game.add.audio('ball&uBrick');
    this.ball_player = this.game.add.audio('ball&player');

    this.enemyDeath = this.game.add.audio('enemyDeath');

    this.playerDeath = this.game.add.audio('playerDeath');
    this.playerShot = this.game.add.audio('playerShot');

    this.extraLife = this.game.add.audio('extraLife');
    this.getWide = this.game.add.audio('getWide');




    //Sistema de físicas
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    //Añadimos las variables
    //1.Paredes y techo (grupo walls)
    this.walls = this.game.add.physicsGroup();
    var techo = new Phaser.Sprite(this.game, 80, 0, 'techo'); //Creamos

    var pared1 = new Phaser.Sprite(this.game, LEFTLIMIT, GATES_POSY, 'pared');
    pared1.x-=pared1.width;
    var pared2 = new Phaser.Sprite(this.game, RIGHTLIMIT, GATES_POSY, 'pared');

        
    this.walls.add(techo);
    this.walls.add(pared1);
    this.walls.add(pared2);
    this.walls.setAll('body.immovable', true);
    this.walls.setAll('visible', false);

    //2.HUD

    var hudPos = new Par(RIGHTLIMIT + 15, HUD_POSY);
    this.hud = new HUD(this.game, hudPos, 'vidas','e', lives, level);
    this.hud.renderRound(level);
    this.hud.renderScore(score, highscore); //Renders iniciales

    //3.Pelota

    var ballSounds = [this.ball_player, this.ball_dBrick, this.ball_uBrick];
    this.ballsGroup = this.game.add.physicsGroup();
    this.ballsGroup.classType = Ball;


    var playerPos = new Par(this.world.width / 2, PLAYER_POSY);
    this.ball = new Ball(this.game, playerPos, 'ball', ballSounds, 1, this);
    this.ball.y -= this.ball.height;

    this.ballsGroup.add(this.ball);

    this.ball.body.velocity.setTo(this.ball._velocity._x, this.ball._velocity._y); //Físicas de la pelota
    this.ball.body.bounce.setTo(1, 1); //ESTO SIRVE PARA HACER QUE ACELERE
    


    for(var i = 0; i < EXTRA_BALLS; i++) //Pelotas extra
    {
       var extraBall = new Ball(this.game, playerPos, 'ball', ballSounds, 1, this);
        this.ballsGroup.add(extraBall);
        extraBall.kill();
    }
    

    //4.Ladrillos (grupo bricks)

    var actualBrick = 0;
    this.bricks = this.game.add.physicsGroup();
    this.bricks.classType = Destroyable;
    this.breakableBricks = 0;
    
    // Creación del nivel
    var JSONfile = JSON.parse(this.game.cache.getText('levels'));

    var i, j;
    i =  j = 0;
    JSONfile.levels[level].forEach(function(element)
    {
      j = 0;
      element.forEach(function(brickType)
      {

        var brick;
        var pos = new Par(LEFTLIMIT + (j*BRICK_WIDTH), FIRST_BRICK_Y + (i*BRICK_HEIGHT));

        if(brickType != 0)
        {
          //Ladrillos dorados
          if(brickType == GOLDEN_BRICK)
          {
            brick = new SoundSource(this.game, pos, 'ladrillosEsp', 'sound');
            brick.frame = 6;
            brick.animations.add('shine', [6, 7, 8, 9, 10, 11, 6]);
          } 

          else
          {    
            //Ladrillos plateados
            if(brickType == SILVER_BRICK)
            {
              brick = new Destroyable(this.game, pos, 'ladrillosEsp', 'sound', 3, WHITE_BRICK_POINTS * level);
              brick.frame = 0;
              brick.animations.add('shine', [0, 1, 2, 3, 4, 5, 0]);
            }
              

            //Ladrillos de colores
            else
            {
              brick = new Destroyable(this.game, pos, 'ladrillos', 'sound', 1, WHITE_BRICK_POINTS + brickType * 10);
              brick.frame = brickType;
            } 

            //Si lo tenemos que matar, lo matamos. Si no, aumentamos el número de ladrillos rompibles
            if(brickArray != null && brickArray[actualBrick] == false) 
              brick.kill();
            else
              this.breakableBricks++;
          }   
         //Lo añadimos al grupo
          this.bricks.add(brick);
          actualBrick++;
        }

        j++;
        
      }, this)
      i++;
    }, this)
    this.bricks.setAll('body.immovable', true);

    //5.Cursores
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.scapeKey = this.game.input.keyboard.addKey(Phaser.KeyCode.ESC);
    this.scapeKey.onDown.add(this.exitGame, this);

    //6.Balas
    this.playerWeapon = new Movable(this.game, playerPos, 'bullet', 'sound',3, playerVel);
    this.playerWeapon = this.game.add.weapon(8, 'bullet');
    this.playerWeapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    this.playerWeapon.bullets.forEach((b) => {
        b.body.updateBounds();
    }, this);
    this.playerWeapon.bulletAngleOffset = 90; //Ángulo
    this.playerWeapon.bulletSpeed = 600; //Velocidad
    this.playerWeapon.fireRate = 500; //FireRate

    //7.Jugador
    var playerSounds = [this.playerShot, this.getWide, this.extraLife];
    var playerVel = new Par(1,0);
    this.player = new Player(this.game, playerPos, 'player', playerSounds, 1, playerVel, this.cursors, 
                                               this.playerWeapon, LEFTLIMIT, RIGHTLIMIT, this.ballsGroup, this, false);


    this.game.world.addChild(this.player);
    this.game.physics.enable([this.player, this.ballsGroup], Phaser.Physics.ARCADE);
    this.player.body.immovable = true;
    this.ball.attach(this.player); //La pegamos al jugador




    //8.PowerUps
    this.powerUps = this.game.add.physicsGroup();
    this.powerUps.classType = PowerUp;
    this.game.physics.enable([this.powerUps], Phaser.Physics.ARCADE);

    this.fallingPowerUp = null;
    this.activePowerUp = null;
    
    //9.Compuertas

    var gate1 = new Phaser.Sprite(this.game, GATE1_POSX, GATES_POSY, 'compuertas');
    var gate2 = new Phaser.Sprite(this.game, GATE2_POSX, GATES_POSY, 'compuertas');
    this.world.add(gate1);
    this.world.add(gate2);
    gate1.animations.add('open');
    gate2.animations.add('open');


    // 10.Puerta al siguiente nivel

    this.levelDoor = new Phaser.Sprite(this.game, RIGHTLIMIT + 10, PLAYER_POSY + 1, 'door');
    this.levelDoor.anchor.setTo(0.5,0.5);
    this.world.add(this.levelDoor);
    this.levelDoor.animations.add('open',[0,1,2]);
    this.levelDoor.visible = false;
    this.game.physics.enable([this.player, this.levelDoor], Phaser.Physics.ARCADE);
    this.doorOpen = false;


    //11.Enemigos
    this.enemigos = this.game.add.physicsGroup();
    this.enemigos.classType = Enemy;

    var enemyPos = new Par(gate1.x + gate1.width/2, gate1.y);
    var enem1 = new Enemy(this.game, enemyPos, 'enemigos', this.enemyDeath, 1, this.walls, this.bricks, 
                          this.enemigos, gate1, this.player.y, level);

    this.enemigos.add(enem1);
    

    var enemyPos2 = new Par(gate2.x + gate2.width/2, gate2.y); 
    var enem2 = new Enemy(this.game, enemyPos2, 'enemigos', this.enemyDeath, 1, this.walls, this.bricks, this.enemigos, gate2, this.player.y, level);

    this.enemigos.add(enem2);
    this.enemigos.setAll('body.immovable', true);


    this.hack = {
      nextLevel: this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER)
    };

  },

  //FUNCIÓN UPDATE
  update: function()
  {

    if(this.hack.nextLevel.isDown)
    this.nextLevel();

    //Colisiones del jugador
    this.game.physics.arcade.overlap(this.player, this.powerUps, this.takePowerUp, null, this);
    this.game.physics.arcade.overlap(this.player, this.enemigos, this.playerCollisions, null, this);
    this.game.physics.arcade.overlap(this.player, this.levelDoor, this.advanceLevel, null, this);

    //Colisiones de la pelota
    this.game.physics.arcade.overlap( this.walls, this.ballsGroup, this.ballCollisions, null, this);
    this.game.physics.arcade.overlap(this.bricks, this.ballsGroup, this.ballCollisions, null, this);
    this.game.physics.arcade.overlap(this.player, this.ballsGroup, this.ballCollisions, null, this);
    this.game.physics.arcade.overlap(this.enemigos, this.ballsGroup, this.ballCollisions, null, this);

    //Colisiones de la bala
    this.game.physics.arcade.overlap(this.playerWeapon.bullets, this.walls, this.bulletCollisions, null, this);
    this.game.physics.arcade.overlap(this.playerWeapon.bullets, this.bricks, this.bulletCollisions, null, this);
    this.game.physics.arcade.overlap(this.playerWeapon.bullets, this.enemigos, this.bulletCollisions, null, this);

  },

  //COMPROBACIONES DE VICTORIA/DERROTA (las llaman cuando es necesario: takeDamage() de Destroyable
  // y takeDamage() de Ball, respectivamente)
  //Victoria
  checkWin: function ()
  {
    //Ganaste

    if(this.breakableBricks < 1)
      this.nextLevel();
  },

  //Derrota
  checkGameOver : function()
  {
    if(this.ballsGroup.countLiving() == 0)
    {
      lives--;
      this.hud.takeLife();
      this.playerDeath.play();

      //Perdiste del todo
      //Restablecemos todos los valores a su valor inicial y volvemos al menú
      if(lives < 0)
      {
        if(score > highscore)
           highscore = score;

        level = 1;
        lives = 3;
        score = 0;
        brickArray = null;
        this.game.state.start('menu');
      }
       
      //Solo perdiste una vida
      else
      {
        brickArray = [];
        //Guardamos qué ladrillo quedan vivos
        for(var i=0; i< this.bricks.length;i++)
        {
          if(this.bricks.children[i].alive)
              brickArray[i] = true;
          else
              brickArray[i] = false;
        }
        this.game.state.states['carga']._2player = false;
        this.game.state.states['carga']._scene = this;
        this.game.state.start('carga', true, false);
      }      
    }  
  },
  // COLISIONES
  // A) Detecta las colisones con las balas
  bulletCollisions: function(bullet, obj)
  {
    //Si es un destruible, le quita vida
    if(obj.hasOwnProperty('_lives'))
        obj.takeDamage(this);

    bullet.kill(); //Destruimos la bala
  },

  // B) Detecta las colisones con la pelota
  ballCollisions: function(obj, ball)
  {
      //La pelota rebota en ese algo (siempre que no esté parada)
      if(!ball.isAttached())
         ball.bounce(obj, this);
  },

  // C) Detecta las colisones con el jugador
  playerCollisions: function(player, obj)
  {
     /* //Power-ups
      if(obj.hasOwnProperty('_powerUpNum'))
          this.takePowerUp(player, obj); // Ya que ahora no haría falta el _powerUpNum, y cuando colisiona con 'powerUps' llama directamente a 'takePowerUp()'
      //Enemigos    
      if (obj.constructor === Enemy)*/
          obj.takeDamage(this, player);
  },

  
  // POWER-UPS
   // A) Dropea un Power-Up según una probabilidad
   dropPowerUp: function(brick, player)
   {
       if(this.activePowerUp != null && this.activePowerUp.constructor == LightBluePowerUp && this.ballsGroup.countLiving() <= 1)
       this.activePowerUp.disable();

       if(this.fallingPowerUp == null || this.fallingPowerUp.dropEnabled())
       {
     // 1) Obtenemos un número aleatorio del 0 (incluido) al 1 -> [0, 1)
     var num = Math.random();
     var drop = false;
     // 2) Según la constante de probabilidad, comprobamos si se va a soltar o no un Power-Up  
     // Ej: Si es 1/2, habrá drop mientras num < 0'5. Es decir, un 50% de probabilidades como bien se expone. Si es 1/4, mientras num < 0'25. Es decir, 25%
     if(num < POWERUP_CHANCE)
     drop = true;

     // 3) En caso de soltarlo:
     if(drop)
     {// Math.floor(Math.random() * (max - min)) + min -> fórmula para obtener un valor concreto entre el rango [min, max)
     
      // a) Obtenemos un Power-Up de entre los que hay en total (en este caso, nuestro mínimo es "0", y por tanto no lo ponemos en la fórmula)
     num = Math.floor(Math.random() * (NUM_POWERUPS));
   
      // b) Lo creamos en la posición del ladrillo que se destruyó
     this.createPowerUp(brick, num);
     }
    }
   },

      // B) Crea un Power-Up
      createPowerUp: function(brick, nPowerUp)
      {
          // 1) Obtenemos la posición del ladrillo que va a dropear el Power-Up
        var powerUp;
        var brickPosition = new Par(brick.x, brick.y)
          // 2) Creamos el Power-Up según el valor obtenido aleatoriamente 
        switch (nPowerUp)
        {
            case 0:
            powerUp = new RedPowerUp(this.game, brickPosition ,'PowerUps', 'noSound', 1, new Par(0,2), true, false, this.player);
            break;
            case 1:
            powerUp = new GreyPowerUp(this.game, brickPosition ,'PowerUps', 'noSound', 1, new Par(0,2), false, false, this.player);
            break;
            case 2: 
            powerUp = new BluePowerUp(this.game, brickPosition ,'PowerUps', 'noSound', 1, new Par(0,2), true, false, this.player);
            break;
            case 3:
            powerUp = new GreenPowerUp(this.game, brickPosition ,'PowerUps', 'noSound', 1, new Par(0,2), true, false, this.ballsGroup);
            break;
            case 4:
            powerUp = new OrangePowerUp(this.game, brickPosition ,'PowerUps', 'noSound', 1, new Par(0,2), true, false, this.ballsGroup);
            break;
            case 5:
            powerUp = new LightBluePowerUp(this.game, brickPosition ,'PowerUps', 'noSound', 1, new Par(0,2), true, false, this.ballsGroup);
            break;
            case 6:
            powerUp = new PinkPowerUp(this.game, brickPosition ,'PowerUps', 'noSound', 1, new Par(0,2), false, false, this);

            break;

        }
       
        // 3) Lo añadimos al grupo de Power-Ups, activamos las colisiones con el jugador, etc.
         this.powerUps.add(powerUp);
    
         powerUp.body.immovable = true;
         powerUp.body.velocity.setTo(0, 2); //Físicas de la pelota

         this.fallingPowerUp = powerUp;
      },
 
   // C) Recoge un Power-Up y determina su función
   takePowerUp: function(player, powerUp)
   {
       // 1) Comprobamos si el Power-Up recogido tiene un efecto activo. Es decir, que se mantenga o bien desactive otros efectos activos

       /* Ej: El disparo es un Power-Up con efecto activo, decelerar la pelota no tiene efecto activo como tal, pero sí desactiva el resto,
          y ganar vida no hace ninguna de las anteriores */
    if (powerUp.isEffect())
    {
        // a) Desactivamos el efecto activo anterior, si es que lo hubiera (1ª comprobación) y si no es el mismo efecto que ya está activo (2ª comprobación)
        if(this.activePowerUp != null && powerUp.constructor != this.activePowerUp.constructor)
          this.activePowerUp.disable(player);


       // b) Una vez desactivado el anterior, ponemos éste como nuevo efecto activo
       this.activePowerUp = powerUp;
    }
    // 2) Activamos el Power-Up recogido como tal, y destruímos el objeto

       powerUp.enable(player);
       powerUp.takeDamage(this);
   },

   advanceLevel: function(player, door)
   {
     if(this.doorOpen)
       this.nextLevel();
   },

   openDoor: function()
   {
     this.doorOpen = true;
     this.levelDoor.visible = true;

     this.levelDoor.animations.play('open',10,true);
   },

   //Otros métodos
   addScore:function(i)
   {
     score+=i;
     this.hud.renderScore(score, highscore);
   },


   addLife:function()
   {
     lives++;
     this.hud.addLife();
     
   },

   getLevel:function()
   {
     return level;
   },

   getScore:function(i)
   {
    if(i==0)
       return score;
    else
      return highscore;
   },

   nextLevel:function()
   {
     brickArray = null;
     //Pasamos de nivel
     if(level < NUM_LEVELS)
     {
       level++;
       this.game.state.states['carga']._2player = false;
       this.game.state.states['carga']._scene = this;
       this.game.state.start('carga', true, false);
     }
     //Nos hemos pasado el juego
     else
     {
       level = 1;
       lives = 3;
       score = 0;
       this.game.state.start('menu');
     }
   },

   exitGame:function()
   {
    level = 1;
    lives = 3;
    score = 0;
    this.game.state.start('menu');
   }
};

module.exports = PlayScene;

