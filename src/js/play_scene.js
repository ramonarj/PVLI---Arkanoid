'use strict';

//Jerarquía de objetos
var SoundSource = require ('./SoundSource.js').SoundSource;
var HUD = require ('./HUD.js');
var Destroyable = require ('./Destroyable.js');
var Movable = require ('./Movable.js');
var Enemy = require ('./Enemy.js').Enemy;
var Player = require ('./Player.js');
var Ball = require ('./Ball.js').Ball;
var PowerUp = require ('./PowerUp.js').PowerUp;
var GreenPowerUp = require ('./PowerUp.js').GreenPowerUp;
var GreyPowerUp = require ('./PowerUp.js').GreyPowerUp; 
var RedPowerUp = require ('./PowerUp.js').RedPowerUp;
var BluePowerUp = require ('./PowerUp.js').BluePowerUp;
var OrangePowerUp = require ('./PowerUp.js').OrangePowerUp;
var LightBluePowerUp = require ('./PowerUp.js').LightBluePowerUp;

//Estructuras auxiliares y constantes
var Par = require ('./SoundSource.js').Par;
var BASE_VELOCITY = require ('./Ball.js').BASE_VELOCITY;
var BASE_ANGLE = require ('./Ball.js').BASE_ANGLE;
var ENEMY_VEL = require ('./Enemy.js').ENEMY_VEL;
var MAX_ENEMIES = 3;

var NUM_POWERUPS = 6;
var POWERUP_CHANCE = 1/1;

var NUM_ROWS = 6;
var NUM_COLS = 11;
var BRICK_WIDTH = 44;
var BRICK_HEIGHT = 22;

var WHITE_BRICK_POINTS = 50;

var PlayScene =
 {
     //Variables locales (de la escena)
     fondo:null,
     leftlimit:null, rightLimit:null,
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
     points:null,
     levelNo:null,

   //Función Create
  create: function () 
  {
    //Sistema de físicas
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    //Para los puntos
    this.points = 0;
    this.levelNo = 1;

    //Añadimos las variables
    //1.Fondo
    this.fondo = new Phaser.Image(this.game, 125, 20, 'background');
    this.game.world.addChild(this.fondo);

    //2.Pelota
    this.ballsGroup = this.game.add.physicsGroup();
    this.ballsGroup.classType = Ball;

    var playerPos = new Par(350, 525);
    var ballPos = new Par(playerPos._x, playerPos._y - 12);
    var ballVel = new Par(BASE_VELOCITY * Math.cos(BASE_ANGLE), -BASE_VELOCITY *  Math.sin(BASE_ANGLE));
    this.ball = new Ball(this.game, ballPos, 'ball', 'sound', 1, ballVel);
    this.game.world.addChild(this.ball);

    this.ballsGroup.add(this.ball);

    //3.Paredes y techo (grupo walls)
    this.walls = this.game.add.physicsGroup();

    var techo = new Phaser.Sprite(this.game, 80, 0, 'techo'); //Creamos
    var pared1 = new Phaser.Sprite(this.game, 108, 35, 'pared');
    var pared2 = new Phaser.Sprite(this.game, 633, 35, 'pared');
    this.walls.add(techo);
    this.walls.add(pared1);
    this.walls.add(pared2);
    this.walls.setAll('body.immovable', true);
    this.walls.setAll('visible', false);


    var pas = new Phaser.Sprite(this.game, 633, 35, 'PowerUps');
    this.world.add(pas);
    //4.Límites de la pantalla
    this.leftLimit = pared1.x + pared1.width; 
    this.rightLimit = pared2.x - 2;

    //5.Ladrillos (grupo bricks)
    this.bricks = this.game.add.physicsGroup();
    this.bricks.classType = Destroyable;
    
    for(var i = 0; i < NUM_ROWS; i++)
    {
        //Tipo de ladrillo de la fila (esto es solo para el nivel 1)
        var brickType;
        if(i==0)
          brickType=8;
        else if(i==1)
          brickType=4;
        else if(i==2)
          brickType=5;
        else if(i==3)
          brickType=7;
        else if(i==4)
          brickType=6;
        else if(i==5)
          brickType=3;

        for(var j = 0; j < NUM_COLS - 5; j++)
        {
            var brick;
            var pos= new Par(this.leftLimit + 100 + (j*BRICK_WIDTH), 125 + (i*BRICK_HEIGHT));

            if(brickType==8)
               brick = new Destroyable(this.game, pos, 'ladrillos', 'sound', 3, WHITE_BRICK_POINTS * this.levelNo);
            else
               brick = new Destroyable(this.game, pos, 'ladrillos', 'sound', 1, WHITE_BRICK_POINTS + brickType * 10);

            //Color del ladrillo
            brick.frame=brickType;
            
            //Lo añadimos al grupo
            this.bricks.add(brick);
        }
    }
    this.bricks.setAll('body.immovable', true);

    //6.Cursores
    this.cursors = this.game.input.keyboard.createCursorKeys();

    //7.Balas
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
    var playerVel = new Par(0,0);
    this.player = new Player(this.game, playerPos, 'player', 'sound', 3, playerVel, this.cursors, 
                                               this.playerWeapon, this.leftLimit, this.rightLimit, this.ballsGroup);
    this.game.world.addChild(this.player);
    this.game.physics.enable([this.player, this.ballsGroup], Phaser.Physics.ARCADE);
    this.player.body.immovable = true;

    //8.PowerUps
    this.powerUps = this.game.add.physicsGroup();
    this.powerUps.classType = PowerUp;
    this.game.physics.enable([this.powerUps], Phaser.Physics.ARCADE);
    
    //9.Compuertas
    var gate1 = new Phaser.Sprite(this.game, 236, 20, 'compuertas');
    var gate2 = new Phaser.Sprite(this.game, 477, 20, 'compuertas');
    this.world.add(gate1);
    this.world.add(gate2);
    gate1.animations.add('open');
    gate2.animations.add('open');


    //9.Enemigos
    this.enemigos = this.game.add.physicsGroup();
    this.enemigos.classType = Enemy;

    
    var enemyPos = new Par(gate1.x + gate1.width/2, gate1.y);
    var enemyVel = new Par(0, ENEMY_VEL);
    var enem1 = new Enemy(this.game, enemyPos, 'enemigos', 'sound', 1, enemyVel, this.walls, this.bricks, this.enemigos, gate1, this.player.y);
    this.enemigos.add(enem1);
    

    var enemyPos2 = new Par(gate2.x + gate2.width/2, gate2.y); 
    var enemyVel2 = new Par(0, ENEMY_VEL);
    var enem2 = new Enemy(this.game, enemyPos2, 'enemigos', 'sound', 1, enemyVel2, this.walls, this.bricks, this.enemigos, gate2, this.player.y);
    this.enemigos.add(enem2);
    this.enemigos.setAll('body.immovable', true);

    //10.HUD
    var hudPos = new Par(this.rightLimit + 15, 320);
    this.hud = new HUD(this, hudPos, 'vidas','e');

    //Cosas de la pelota
    this.ball.body.velocity.setTo(this.ball._velocity._x, this.ball._velocity._y); //Físicas de la pelota
    this.ball.body.bounce.setTo(1, 1); //ESTO SIRVE PARA HACER QUE ACELERE
    this.ball.attach(); //La pegamos al jugador

  },

  //FUNCIÓN UPDATE
  update: function()
  {
    //Colisiones de la pelota
    this.game.physics.arcade.overlap( this.walls, this.ballsGroup, this.ballCollisions, null, this);
    this.game.physics.arcade.overlap(this.bricks, this.ballsGroup, this.ballCollisions, null, this);
    this.game.physics.arcade.overlap(this.player, this.ballsGroup, this.ballCollisions, null, this);
    this.game.physics.arcade.overlap(this.enemigos, this.ballsGroup, this.ballCollisions, null, this);

    //Colisiones de la bala
    this.game.physics.arcade.overlap(this.playerWeapon.bullets, this.walls, this.bulletCollisions, null, this);
    this.game.physics.arcade.overlap(this.playerWeapon.bullets, this.bricks, this.bulletCollisions, null, this);
    this.game.physics.arcade.overlap(this.playerWeapon.bullets, this.enemigos, this.bulletCollisions, null, this);

    //Colisiones del jugador
    this.game.physics.arcade.overlap(this.player, this.powerUps, this.takePowerUp, null, this);
    this.game.physics.arcade.overlap(this.player, this.enemigos, this.playerCollisions, null, this);

    //Perdiste
    if(this.ballsGroup.getFirstAlive() == null)
       this.game.state.restart();
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
      {
         ball.bounce(obj, this);
      }
  },

  // C) Detecta las colisones con el jugador
  playerCollisions: function(player, obj)
  {
     /* //Power-ups
      if(obj.hasOwnProperty('_powerUpNum'))
          this.takePowerUp(player, obj); // Ya que ahora no haría falta el _powerUpNum, y cuando colisiona con 'powerUps' llama directamente a 'takePowerUp()'
      //Enemigos    
      if (obj.constructor === Enemy)*/
          obj.takeDamage(this);
  },

  
  // POWER-UPS
   // A) Dropea un Power-Up según una probabilidad
   dropPowerUp: function(brick)
   {
       if(this.activePowerUp != null && this.activePowerUp.constructor == LightBluePowerUp && this.ballsGroup.length <= 1)
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
            powerUp = new RedPowerUp(this.game, brickPosition ,'powerUp' + nPowerUp, 'noSound', 1, new Par(0,2), true, false, this.player);
            break;
            case 1:
            powerUp = new GreyPowerUp(this.game, brickPosition ,'powerUp' + nPowerUp, 'noSound', 1, new Par(0,2), false, false, this.player);
            break;
            case 2: 
            powerUp = new BluePowerUp(this.game, brickPosition ,'powerUp' + nPowerUp, 'noSound', 1, new Par(0,2), true, false, this.player);
            break;
            case 3:
            powerUp = new GreenPowerUp(this.game, brickPosition ,'powerUp' + nPowerUp, 'noSound', 1, new Par(0,2), true, false, this.ballsGroup);
            break;
            case 4:
            powerUp = new OrangePowerUp(this.game, brickPosition ,'powerUp' + nPowerUp, 'noSound', 1, new Par(0,2), true, false, this.ballsGroup);
            break;
            case 5:
            powerUp = new LightBluePowerUp(this.game, brickPosition ,'powerUp' + nPowerUp, 'noSound', 1, new Par(0,2), true, false, this.ballsGroup);
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
          this.activePowerUp.disable();

       // b) Una vez desactivado el anterior, ponemos éste como nuevo efecto activo
       this.activePowerUp = powerUp;
    }
    // 2) Activamos el Power-Up recogido como tal, y destruímos el objeto
    var lives = this.player._lives;
       powerUp.enable();
       powerUp.takeDamage(this);
     if(this.player._lives > lives)
        this.hud.addLife();
   },

   // Usado para hacer debug
  render: function() 
   {
        // Player debug info
        this.game.debug.text(this.points, this.rightLimit + 50, 130);
        this.game.debug.text(this.points, this.rightLimit + 50, 210);
        this.game.debug.text(this.levelNo, this.rightLimit + 50, 550);
    }
};

module.exports = PlayScene;

