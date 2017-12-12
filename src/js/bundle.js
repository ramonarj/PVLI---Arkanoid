(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
    this.game.load.spritesheet('powerUp0', 'images/powerUp4.png', 40, 18);
    this.game.load.spritesheet('powerUp1', 'images/powerUp5.png', 40, 18);
    this.game.load.spritesheet('powerUp2', 'images/powerUp3.png', 40, 18);
    this.game.load.spritesheet('powerUp3', 'images/powerUp1.png', 40, 18);
    this.game.load.spritesheet('powerUp4', 'images/powerUp6.png', 40, 18);

   
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

},{"./play_scene.js":2}],2:[function(require,module,exports){
'use strict';

//Constantes
var NUM_POWERUPS = 5;
var POWERUP_CHANCE = 1/3;

var BASE_VELOCITY = 300;
var BASE_ANGLE = 60 * Math.PI / 180; //Está en radianes
var MAX_VELOCITY = 600;
var MAX_ENEMIES = 3;
var ENEMIY_VEL = 1;

var NUM_ROWS = 6;
var NUM_COLS = 11;
var BRICK_WIDTH = 44;
var BRICK_HEIGHT = 22;

var WHITE_BRICK_POINTS = 50;
var ENEMY_POINTS = 100;
var POWERUP_POINTS = 1000;

var PlayScene =
 {
     //Variables locales (de la escena)
     fondo:null,
     leftlimit:null, rightLimit:null,
     cursors:null,
     playerWeapon:null,
     enemigos: null,
     ball:null,
     bricks:null,
     walls:null,
     powerUps:null,
     player:null,
     points:null,
     levelNo:null,

   //Función Create
  create: function () 
  {
    //Sistema de físicas
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    //Para los puntos
    this.points=0;
    this.levelNo=1;

    //Añadimos las variables
    //1.Fondo
    this.fondo = new Phaser.Image(this.game, 125, 20, 'background');
    this.game.world.addChild(this.fondo);

    //2.Pelota
    var playerPos = new Par(350, 525);
    var ballPos = new Par(playerPos._x, playerPos._y - 12);
    var ballVel = new Par(BASE_VELOCITY * Math.cos(BASE_ANGLE), -BASE_VELOCITY *  Math.sin(BASE_ANGLE));
    this.ball=new Ball(this.game, ballPos, 'ball', 'sound', 1, ballVel);
    this.game.world.addChild(this.ball);

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

        for(var j = 0; j < NUM_COLS; j++)
        {
            var brick;
            var pos= new Par(this.leftLimit + 2 + (j*BRICK_WIDTH), 125 + (i*BRICK_HEIGHT));

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
                                               this.playerWeapon, this.leftLimit, this.rightLimit, this.ball);
    this.game.world.addChild(this.player);
    this.game.physics.enable([this.player,this.ball], Phaser.Physics.ARCADE);
    this.player.body.immovable = true;

    //8.PowerUps
    this.powerUps = this.game.add.physicsGroup();
    this.powerUps.classType = PowerUp;
    
    //9.Enemigos
    this.enemigos = this.game.add.physicsGroup();
    this.enemigos.classType = Enemy;

    
    var enemyPos = new Par(this.leftLimit + 50, 50);
    var enemyVel = new Par(0, ENEMIY_VEL);
    var enem1 = new Enemy(this.game, enemyPos, 'enemigos', 'sound', 1, enemyVel, this.walls, this.bricks, this.enemigos);
    this.enemigos.add(enem1);
    

    var enemyPos2 = new Par(this.rightLimit-90, 55); 
    var enemyVel2 = new Par(0, ENEMIY_VEL);
    var enem2 = new Enemy(this.game, enemyPos2, 'enemigos', 'sound', 1, enemyVel2, this.walls, this.bricks, this.enemigos);
    this.enemigos.add(enem2);

    this.enemigos.setAll('body.immovable', true);


    //Cosas de la pelota
    this.ball.body.velocity.setTo(this.ball._velocity._x, this.ball._velocity._y); //Físicas de la pelota
    this.ball.body.bounce.setTo(1, 1); //ESTO SIRVE PARA HACER QUE ACELERE
    this.ball.attach(); //La pegamos al jugador

  },

  //FUNCIÓN UPDATE
  update: function()
  {
    //Colisiones de la pelota
    this.game.physics.arcade.overlap(this.ball, this.walls, this.ballCollisions, null, this);
    this.game.physics.arcade.overlap(this.ball, this.bricks, this.ballCollisions, null, this);
    this.game.physics.arcade.overlap(this.ball, this.player, this.ballCollisions, null, this);
    this.game.physics.arcade.overlap(this.ball, this.enemigos, this.ballCollisions, null, this);

    //Colisiones de la bala
    this.game.physics.arcade.overlap(this.playerWeapon.bullets, this.walls, this.bulletCollisions, null, this);
    this.game.physics.arcade.overlap(this.playerWeapon.bullets, this.bricks, this.bulletCollisions, null, this);
    this.game.physics.arcade.overlap(this.playerWeapon.bullets, this.enemigos, this.bulletCollisions, null, this);

    //Colisiones del jugador
    this.game.physics.arcade.overlap(this.player, this.powerUps, this.playerCollisions, null, this);
    this.game.physics.arcade.overlap(this.player, this.enemigos, this.playerCollisions, null, this);
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
  ballCollisions: function(ball, obj)
  {
      //La pelota rebota en ese algo (siempre que no esté parada)
      if(!ball.isAttached())
         ball.bounce(obj, this);
  },

  // C) Detecta las colisones con el jugador
  playerCollisions: function(player, obj)
  {
      //Power-ups
      if(obj.hasOwnProperty('_powerUpNum'))
          this.takePowerUp(player, obj);
      //Enemigos    
      else if (obj.constructor === Enemy)
          obj.takeDamage(this);
  },

  
  // POWER-UPS

   // A) Crea un Power-Up
   createPowerUp: function(brick, nPowerUp)
   {
     var brickPosition = new Par(brick.x, brick.y)
     var powerUp = new PowerUp(this.game, brickPosition ,'powerUp' + nPowerUp, 'noSound', 1, new Par(0,2), nPowerUp);
 
 
      this.powerUps.add(powerUp);
      this.game.physics.enable([powerUp, this.player], Phaser.Physics.ARCADE);
      powerUp.body.immovable = true;
      powerUp.body.velocity.y = 2;
     
   },
 
   // B) Dropea un Power-Up según una probabilidad
   dropPowerUp: function(brick)
   {
     var num = Math.random();
     var drop = false;
 
     if(num<POWERUP_CHANCE)
     drop = true;
 
     if(drop)
     {
     // this. num = Math.floor(Math.random() * (max - min)) + min;
     // Seleccionamos así una powerUp random de entre los que hay
    num = Math.floor(Math.random() * (NUM_POWERUPS));
   
    this.createPowerUp(brick, num);
     }
   },
 
   // C) Recoge un Power-Up y determina su función
   takePowerUp: function(player, powerUp)
   {
       player.enablePowerUp(powerUp.getPowerUpNum());
       powerUp.takeDamage(this);

   },

   // Usado para hacer debug
  render: function() 
   {
        // Player debug info
        this.game.debug.text('Power-up: '+ this.player._powerUpActual, 5, 35);
        this.game.debug.text('Lives: '+ this.player._lives, this.rightLimit + 50, 300);
        this.game.debug.text('Points: '+ this.points, this.rightLimit + 50, 150);
    }
};

module.exports = PlayScene;

//////////////////////////////////////
//////ARQUITECTURA DE HERENCIA////////
//////////////////////////////////////
//Estructura auxiliares
function Par(x, y)
{
    this._x=x;
    this._y=y;
}

///////////////////////////////////////////////
//1.CLASE EMISOR DE SONIDOS (Ladrillos dorados) -> pueden emitir sonido
function SoundSource(game, position, sprite, sound)
{
    Phaser.Sprite.apply(this, [game ,position._x, position._y, sprite]);
    this._sound = sound;
}

SoundSource.prototype = Object.create(Phaser.Sprite.prototype);
SoundSource.prototype.constructor = SoundSource;

//Funciones de destruible
SoundSource.prototype.playSound = function () 
{
    //Suena el sonido
}

/////////////////////////////////////////////
//2.1.CLASE HUD (Hud)
function HUD(game, position, sprite, sound)
{
  SoundSource.apply(this, [game, position, sprite, sound]);
}

HUD.prototype = Object.create(SoundSource.prototype);
HUD.prototype.constructor = HUD;

///////////////////////////////////////////////
//2.2.CLASE DESTRUIBLE (Ladrillos) -> tienen número de vidas y método para quitarse vida
function Destroyable(game, position, sprite, sound, lives, numPoints)
{
    SoundSource.apply(this, [game, position, sprite, sound]);
    this._lives = lives;
    if(numPoints==null)
       this._numPoints = 0;
    else
       this._numPoints = numPoints;
}

Destroyable.prototype = Object.create(SoundSource.prototype);
Destroyable.prototype.constructor = Destroyable;

//Funciones de destruible
Destroyable.prototype.takeDamage = function (playscene) //Quita una vida
{
    this._lives--;
    if(this._lives <=0)
    {
        //Si es un ladrillo, puede dropear power-ups
        if(this.constructor === Destroyable)
            playscene.dropPowerUp(this);
            
        //Se destruye (y suma puntos)
        playscene.points += this._numPoints;
        this.destroy();
    }
}

Destroyable.prototype.getLives = function()
{
    return this._lives;
}

Destroyable.prototype.addLife = function()
{
    this._lives++;
}

/////////////////////////////////////////
//2.2.1.CLASE MÓVIL (Bala) -> tienen velocidad en x e y
function Movable(game, position, sprite, sound, lives, velocity, points)
{
    Destroyable.apply(this, [game, position, sprite, sound, lives, points]);
    this._velocity = velocity;

}

Movable.prototype = Object.create(Destroyable.prototype);
Movable.prototype.constructor = Movable;


//Funciones de moviles
Movable.prototype.setVelocity = function(velocity) //Cambia la velocidad
{
    this._velocity._x = velocity._x;
    this._velocity._y = velocity._y;
}

Movable.prototype.update = function() //Para la DeadZone
{
    if(this.y>this.game.height - 20)
        this.destroy();
}


////////////////////////////////////////
//2.2.1.1.CLASE ENEMIGO
function Enemy(game, position, sprite, sound, lives, velocity, walls, bricks, enemies)
{
    Movable.apply(this, [game, position, sprite, sound, lives, velocity, ENEMY_POINTS]);
    this._dir = 3; //Derecha, izquierda, arriba, abajo (en ese orden)
    this._vel = this._velocity._y; //El módulo de la velocidad
    this._dir = 3;//0-Dcha, 1-Izda, 2-Arriba, 3-Abajo
    this._walls = walls;
    this._bricks = bricks;
    this._enemies = enemies;
    this.anchor.setTo(0.5, 0.5);

    //Animación
    this.animations.add('move');
    this.animations.play('move', 8, true);
    this.animations.currentAnim.speed = 6 * ENEMIY_VEL;
}

Enemy.prototype = Object.create(Movable.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function() 
{
    Movable.prototype.update.call(this);
    this.move();
}

Enemy.prototype.move = function() 
{
    //1.ACTUALIZAMOS LA DIRECCIÓN ACTUAL
    //Direcciones ordenadas por prioridad
    //1.Va hacia la derecha
    if (this._dir == 0)
    {
        //Intenta ir hacia abajo
        if(!this.choque(0, 1))
            this._dir = 3;

        //Si no, si se choca yendo a la derecha, va a la izquierda 
        else if(this.choque(1, 0))
            this._dir = 1;
        //Y si no, sigue hacia la derecha
    }

    //2.Va hacia la izquierda
    else if (this._dir == 1)
    {
        //Intenta ir hacia abajo
        if(!this.choque(0,1))
            this._dir = 3;
        //Si no, si se choca yendo a la izquierda, va arriba
        else if(this.choque(-1,0))
        {
            this._dir = 2;
            console.log("e");
        }
            
        //Y si no, sigue hacia la izquierda
    }

    //3.Va hacia arriba
    else if (this._dir == 2)
    {
        //Si se choca, va hacia abajo
        if(this.choque(0, -1))
            this._dir = 3;
        //Y si no, sigue hacia arriba
    }

    //4.Va hacia abajo
    else
    {
        //Si se choca, va hacia la derecha
        if(this.choque(0, 1))
            this._dir = 0;   
        //Y si no, sigue hacia abajo
    }

    //2.ACTUALIZAMOS LAS VELOCIDADES
    this.updateSpeed();
    
    //3.MOVEMOS AL ENEMIGO
    this.x+=this._velocity._x;
    this.y+=this._velocity._y;
}
Enemy.prototype.choque = function(dirX, dirY) 
{
    var nx = this.x + (dirX * this.width/2);
    var ny = this.y + (dirY * (2 + this.height/2));
    var numBricks = this._bricks.length;
     
    var i = 0;
    var choque = false;

    //Choque con los ladrillos
    while(i < numBricks && !choque)
    {
        var brick = this._bricks.children[i];
        if((nx > (brick.x - brick.width/2) && nx < brick.x + 3 / 2 * brick.width) && (ny > brick.y && ny < brick.y + brick.height))
            {
                choque=true;
            } 
            
        i++;
    }

    
    if(!choque)
    {
        var j = 0;
        var numWalls = this._walls.length;
        //Choque con las paredes
        while(j < numWalls && !choque)
        {
            var wall = this._walls.children[j];
            if((nx > wall.x && nx < wall.x + wall.width) && (ny > wall.y && ny < wall.y + wall.height))
                {
                    choque=true;
                } 
                
            j++;
        }

        //Choque con los enemigos
        if(!choque)
        {
            var k = 0;
            var numEnemies= this._enemies.length;
            //Choque con las paredes
            while(k < numEnemies && !choque)
            {
                var enemy = this._enemies.children[k];
                if((nx >= enemy.x - enemy.width/2 && nx <= enemy.x + enemy.width/2) && (ny > enemy.y-enemy.height/2 && ny < enemy.y + enemy.height/2)
                 && enemy !=this)
                    {
                        choque=true;
                    } 
                    
                k++;
            }
        }
    }
    return choque;
}

Enemy.prototype.updateSpeed = function() 
{
    this._velocity._x=0;
    this._velocity._y=0;

    if(this._dir==0)
        this._velocity._x = this._vel;
    else if (this._dir==1)
        this._velocity._x = -this._vel;
    else if (this._dir==2)
        this._velocity._y = -this._vel;
    else
        this._velocity._y = this._vel;
}


/////////////////////////////////////////
//2.2.1.2.CLASE JUGADOR 
function Player(game, position, sprite, sound, lives, velocity, cursors, playerWeapon, leftLimit, rightLimit, ball)
{
    Movable.apply(this, [game, position, sprite, sound, lives, velocity]);
    
    // Constantes
    this._originalSize = this.width;

    this.anchor.setTo(0.5, 0); //Ancla del jugador

    this._cursors = cursors;
    this._fireButton = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
    this._playerWeapon = playerWeapon;
    this._playerWeapon.trackSprite(this, 0, 0);
    this._leftLimit = leftLimit;
    this._rightLimit = rightLimit;
    this._ball = ball;
    this._powerUpActual = -1; //-1=No hay power-up
}

Player.prototype = Object.create(Movable.prototype);
Player.prototype.constructor = Player;

//Funciones de jugador
Player.prototype.readInput = function() //Mueve el jugador a la izquierda
{
    var delta = this.x;
    //Comprobación de cursores de Phaser
    if (this._cursors.left.isDown && this.x >  this._leftLimit + this.offsetX)
        this.x -= 6.5;
    
    else if (this._cursors.right.isDown && this.x < this._rightLimit - this.offsetX)
        this.x += 6.5;

    if(this._fireButton.isDown)
    {
        if(this._powerUpActual == 0)
           this._playerWeapon.fire();
        else if(this._ball.isAttached())
           this._ball.throw();
    }

    //La pelota es hija por programación
    delta-=this.x;
    if(this._ball.isAttached())
        this._ball.x-=delta;
}

Player.prototype.update = function() //Update
{
   this.readInput();
}

// Power-Ups
Player.prototype.getAnchor = function (i)
{
    if(i===0)
       return this.anchor.x;
    else
       return this.anchor.y;   
}

Player.prototype.enablePowerUp = function (num)
{   
    //1.Desactivamos el power-up actual
    this.disableEffects(this._powerUpActual);

    //2.Hacemos lo que tengamos que hacer
    //Gris
    if(num == 1)
       this.addLife();
    //Azul
    else if (num==2)
       this.getWider();
    //Naranja 
    else if (num == 4)
        this._ball.slowDown(); 
    
    //3.Actualizamos el power-up actual   
    this._powerUpActual=num;
}

Player.prototype.disableEffects = function (actual) //Quita los efectos visuales sobre todo
{  
    //Azul
    if(actual == 2)
      this.getNarrow();
    //Verde
    else if (actual == 3)
      this._ball.throw();
}

// FUNCIONES AUXILIARES
Player.prototype.getWider = function ()
{   
    var widerPaddle = this.width *= 1.5;
    this.body.setSize(widerPaddle, this.height);
}

Player.prototype.getNarrow = function ()
{   
    var narrowPaddle = this.width /= 1.5;
    this.body.setSize(narrowPaddle, this.height);
}

//////////////////////////////////////
//2.2.1.2.CLASE PELOTA
function Ball(game, position, sprite, sound, lives, velocity)
{
    Movable.apply(this, [game, position, sprite, sound, lives, velocity]);
    this._attached = true; 
    this._angle = BASE_ANGLE;
}

Ball.prototype = Object.create(Movable.prototype);
Ball.prototype.constructor = Ball;

//Funciones de pelota
Ball.prototype.bounce = function(obj, playscene) //Rebota en un objeto "obj2"
{
    //Rebota
    this.game.physics.arcade.collide(this, obj); 

    //a)Jugador 
    var pegada=false;
    if(Object.getPrototypeOf(obj).hasOwnProperty('readInput'))
    {
        //Rebote en lado contrario al que se mueve la pelota
        if((this.x > obj.x && this.body.velocity.x < 0) || (this.x < obj.x && this.body.velocity.x > 0))
            this.body.velocity.x = -this.body.velocity.x;

        //Actualizamos el ángulo    
        this._angle = Math.atan(this.body.velocity.y / this.body.velocity.x);

        //Miramos si el jugador tiene activo el power-up verde
        if(obj._powerUpActual == 3)
           pegada=true;
    }
    

    //b)Ladrillos o paredes
    else if (obj.hasOwnProperty('_sound'))
    {
        //Cogemos su velocidad y ángulo después de rebotar
        this._angle = Math.atan(this.body.velocity.y / this.body.velocity.x); 
        var v = this.body.velocity.x / Math.cos(this._angle);

        //Aceleramos la pelota
        if(Math.max(v, -v) < MAX_VELOCITY)
        {
          if(v<0)
             v-=10;
          else
             v+=10;
          this.body.velocity.x = v * Math.cos(this._angle);
          this.body.velocity.y = v * Math.sin(this._angle);
        }

        //Para los ladrillos destruibles
        if(obj.hasOwnProperty('_lives'))
            obj.takeDamage(playscene); 
    }

    //Actualizamos la velocidad de nuestra jerarquía
    this._velocity._x = this.body.velocity.x;
    this._velocity._y = this.body.velocity.y;
    if(pegada)
       this.attach(); 
}


Ball.prototype.isAttached = function()
{
    return this._attached;
}

Ball.prototype.throw = function()
{
    this._attached=false;
    this.body.velocity.x = this._velocity._x;
    this.body.velocity.y = this._velocity._y;
}

Ball.prototype.attach= function()
{
    this._attached = true;
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
}

Ball.prototype.slowDown= function()
{
    //Tenemos cuidado con los signos
    var v = this.body.velocity.x / Math.cos(this._angle);
    if(v<0)
      v = -BASE_VELOCITY;
    else
      v = BASE_VELOCITY;

    //Reducimos la velocidad a la base 
    this.body.velocity.x = v * Math.cos(this._angle);
    this.body.velocity.y = v * Math.sin(this._angle);
}


/////////////////////////////////////////
//2.2.1.2.CLASE POWER-UP
function PowerUp(game, position, sprite, sound, lives, velocity, powerUpNum)
{
    Movable.apply(this, [game, position, sprite, sound, lives, velocity, POWERUP_POINTS]);
    this._powerUpNum = powerUpNum;

   // Para elegir un frame en concreto -> this.frame = x;
    this.animations.add('rotate');
    // Comienza la animación: a 5 frames, y 'true' para repetirla en bucle
    this.animations.play('rotate', 6, true);
}

PowerUp.prototype = Object.create(Movable.prototype);
PowerUp.prototype.constructor = PowerUp;

PowerUp.prototype.update = function()
{
    this.y += this.body.velocity.y;
}

PowerUp.prototype.getPowerUpNum = function()
{
    return this._powerUpNum;
}
},{}]},{},[1]);
