(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

var BASE_VELOCITY = 300;
var BASE_ANGLE = 60 * Math.PI / 180; //Está en radianes
var MAX_VELOCITY = 600;


var Movable = require ('./Movable.js');

//2.2.1.2.CLASE PELOTA
function Ball(game, position, sprite, sound, lives, velocity)
{
    Movable.apply(this, [game, position, sprite, sound, lives, velocity]);
    this._attached = false; 
    this._attachEnabled = false;
}

Ball.prototype = Object.create(Movable.prototype);
Ball.prototype.constructor = Ball;

//Funciones de pelota
Ball.prototype.bounce = function(obj, playscene) //Rebota en un objeto "obj2"
{
    //Rebota
    this.game.physics.arcade.collide(this, obj); 

    //a)Jugador 
    if(Object.getPrototypeOf(obj).hasOwnProperty('readInput'))
    {
        //Rebote en lado contrario al que se mueve la pelota
        if((this.x > obj.x && this.body.velocity.x < 0) || (this.x < obj.x && this.body.velocity.x > 0))
            this.body.velocity.x = -this.body.velocity.x;

           //Actualizamos la velocidad de nuestra jerarquía
        this._velocity._x = this.body.velocity.x;
        this._velocity._y = this.body.velocity.y;
        // Si se puede enganchar a la pala, ésta se quedará pegada
       if(this._attachEnabled)
        this.attach(); 
    }
    

    //b)Ladrillos o paredes
    else if (obj.hasOwnProperty('_sound'))
    {
        //Cogemos su velocidad y ángulo después de rebotar
        var angle = Math.atan(this.body.velocity.y / this.body.velocity.x); 
        var v = this.body.velocity.x / Math.cos(angle);

        //Aceleramos la pelota
        if(Math.max(v, -v) < MAX_VELOCITY)
        {
          if(v < 0)
             v -= 10;
          else
             v += 10;
          this.body.velocity.x = v * Math.cos(angle);
          this.body.velocity.y = v * Math.sin(angle);
        }

        //Para los ladrillos destruibles
        if(obj.hasOwnProperty('_lives'))
            obj.takeDamage(playscene); 
    }
}

// Redefinimos el método para que se haga 'destroy()' y no 'kill()' -> No es necesario mantenerlos cargados
Ball.prototype.takeDamage = function()
{
    this.destroy();
}

// FUNCIONES AUXILIARES 

Ball.prototype.getPosX = function()
{
     return this.body.x;
}
Ball.prototype.getPosY = function()
{
     return this.body.y;
}

Ball.prototype.getVelX = function()
{
     return this._velocity._x;
}
Ball.prototype.getVelY = function()
{
     return this._velocity._y;
}

Ball.prototype.enableAttach = function()
{
     this._attachEnabled = true;
}

Ball.prototype.isAttached = function()
{
    return this._attached;
}

Ball.prototype.throw = function()
{
    this._attached = false;
    this.body.velocity.x = this._velocity._x;
    this.body.velocity.y = this._velocity._y;
}

Ball.prototype.attach = function()
{
    this._attached = true;
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
}

Ball.prototype.slowDown = function()
{
    //Ángulo actual de la pelota (puede ser positivo o negativo)
    var angle = Math.atan(this.body.velocity.y / this.body.velocity.x); 
    var v = this.body.velocity.x / Math.cos(angle);

    //Reducimos la velocidad a la base
    //Eje X 
    if(this.body.velocity.x > 0)
        this.body.velocity.x = BASE_VELOCITY * Math.cos(angle); //El coseno va a ser positivo siempre
    else
        this.body.velocity.x = -BASE_VELOCITY * Math.cos(angle);

    //Eje Y
    if(this.body.velocity.y > 0)
       this.body.velocity.y = BASE_VELOCITY * Math.abs(Math.sin(angle)); //El seno, por el contrario, puede ser > 0 o < 0
    else
       this.body.velocity.y = -BASE_VELOCITY * Math.abs(Math.sin(angle));
}

Ball.prototype.disableEffects = function()
{
    if(this._attachEnabled)
    {
      this._attachEnabled = false;
      if(this._attached)
          this.throw();
    }
}

module.exports = 
{
    Ball,
    BASE_VELOCITY,
    BASE_ANGLE,
};

    
},{"./Movable.js":5}],2:[function(require,module,exports){
'use strict'

var SoundSource = require ('./SoundSource.js').SoundSource;

//2.2.CLASE DESTRUIBLE (Ladrillos) -> tienen número de vidas y método para quitarse vida
function Destroyable(game, position, sprite, sound, lives, numPoints)
{
    SoundSource.apply(this, [game, position, sprite, sound]);
    this._lives = lives;
    this._maxLives = lives;

    if(numPoints == null)
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
    if(this._lives <= 0)
    {
        //Si es un ladrillo de color, puede dropear Power-Ups
        if(this.constructor === Destroyable && this._maxLives == 1)
        {
            playscene.dropPowerUp(this);
        }

            this.kill();

        //Se destruye (y suma puntos)
        playscene.points += this._numPoints;
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

module.exports = Destroyable;
},{"./SoundSource.js":8}],3:[function(require,module,exports){
'use strict'

var Movable = require ('./Movable.js');
var Destroyable = require ('./Destroyable.js');
var Par = require ('./SoundSource.js').Par;

var ENEMY_POINTS = 100;
var ENEMY_VEL = 1;

//2.2.1.1.CLASE ENEMIGO
function Enemy(game, position, sprite, sound, lives, velocity, walls, bricks, enemies)
{
    Movable.apply(this, [game, position, sprite, sound, lives, velocity, ENEMY_POINTS]);
    this._vel = this._velocity._y; //El módulo de la velocidad
    this._dir = 3;//0-Dcha, 1-Izda, 2-Arriba, 3-Abajo
    this._walls = walls;
    this._bricks = bricks;
    this._enemies = enemies;

    this._iniX = position._x;
    this._iniY = position._y;
    this.anchor.setTo(0.5, 0.5);

    //Animación
    this.animations.add('move');
    this.animations.play('move', 8, true);
    this.animations.currentAnim.speed = 6 * ENEMY_VEL;
}

Enemy.prototype = Object.create(Movable.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function() 
{
    this.move();
    Movable.prototype.update.call(this);
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
            this._dir = 2;
            
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
    //Enemigo auxiliar para comprobar la colisión
    var nx = this.x - this.width/2 + dirX;
    var ny = this.y - this.height/2 + dirY;
    var auxEnemy = new Phaser.Sprite(this.game, nx, ny, 'enemigos');
    this.game.physics.enable(auxEnemy);

    //Comprobamos colisiones de ese auxiliar con los 3 grupos que nos importan
    var choque = (this.choqueGrupo(auxEnemy, this._bricks) || this.choqueGrupo(auxEnemy, this._walls) 
    || this.choqueGrupo(auxEnemy, this._enemies));

    return choque;
}

Enemy.prototype.choqueGrupo = function(obj1, grupo)
{
    var numElems = grupo.length;
    var i = 0;
    var choque = false;
    //Choque con todos los elementos de ese grupo
    while(i < numElems && !choque)
    {
        var element = grupo.children[i];
        choque = (this.game.physics.arcade.overlap(obj1, element) && element != this);  
        i++;
    }
    return choque;
}


Enemy.prototype.updateSpeed = function() 
{
    this._velocity._x=0;
    this._velocity._y=0;

    if(this._dir == 0)
        this._velocity._x = this._vel;
    else if (this._dir == 1)
        this._velocity._x = -this._vel;
    else if (this._dir == 2)
        this._velocity._y = -this._vel;
    else
        this._velocity._y = this._vel;
}


Enemy.prototype.takeDamage = function(playscene) 
{
    Destroyable.prototype.takeDamage.call(this, playscene);

    //Se respawnea a si mismo
    this.x = this._iniX;
    this.y = this._iniY;
    this._dir = 3;

    this.revive();
}

module.exports = 
{
    Enemy,
    ENEMY_POINTS,
    ENEMY_VEL
};
},{"./Destroyable.js":2,"./Movable.js":5,"./SoundSource.js":8}],4:[function(require,module,exports){
'use strict'

var SoundSource = require ('./SoundSource.js').SoundSource;

//2.1.CLASE HUD (Hud)
function HUD(game, position, sprite, sound)
{
  SoundSource.apply(this, [game, position, sprite, sound]);
}

HUD.prototype = Object.create(SoundSource.prototype);
HUD.prototype.constructor = HUD;


module.exports = HUD;
},{"./SoundSource.js":8}],5:[function(require,module,exports){
'use strict'

var Destroyable = require ('./Destroyable.js');

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


module.exports = Movable;
},{"./Destroyable.js":2}],6:[function(require,module,exports){
'use strict'

var Movable = require ('./Movable.js');

/////////////////////////////////////////
//2.2.1.2.CLASE JUGADOR 
function Player(game, position, sprite, sound, lives, velocity, cursors, playerWeapon, leftLimit, rightLimit, ballsGroup)
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

    this._balls = ballsGroup;
    this._currentBall;

    // Variables de control
    this._shotEnabled = false;
    this._isWide = false;
}

Player.prototype = Object.create(Movable.prototype);
Player.prototype.constructor = Player;

//Funciones de jugador
Player.prototype.readInput = function() 
{
    this._currentBall = this._balls.getTop();
    var delta = this.x;
    //Comprobación de cursores de Phaser
    if (this._cursors.left.isDown && this.x >  this._leftLimit + this.offsetX)
        this.x -= 6.5;
    
    else if (this._cursors.right.isDown && this.x < this._rightLimit - this.offsetX)
        this.x += 6.5;

    if(this._fireButton.isDown)
    {
        if(this._shotEnabled)
           this._playerWeapon.fire();
        else if(this._currentBall.isAttached())
           this._currentBall.throw();
    }

    //La pelota es hija por programación
    delta -= this.x;
    if(this._currentBall.isAttached())
        this._currentBall.x -= delta;
}

Player.prototype.update = function() //Update
{
   this.readInput();
}

Player.prototype.getAnchor = function (i)
{
    if(i === 0)
       return this.anchor.x;
    else
       return this.anchor.y;   
}

// Desactiva el efecto activo en función de cúal sea éste en el momento
Player.prototype.disableEffects = function () 
{  
    if(this._isWide)
    {
      this._isWide = false;
      this.getNarrow();
    }
      else if(this._shotEnabled)
      this._shotEnabled = false;
}

// FUNCIONES AUXILIARES

// Activa el disparo del jugador
Player.prototype.enableShot = function ()
{   
   this._shotEnabled = true;
}

// Ensancha la pala del jugador (solo si no lo estuviera ya)
Player.prototype.getWider = function ()
{   
    if(!this._isWide)
    {
        this._isWide = true;
      var widerPaddle = this.width *= 1.5;
      this.body.setSize(widerPaddle, this.height);
    }
}

// Estrecha la pala del jugador
Player.prototype.getNarrow = function ()
{   
    var narrowPaddle = this.width /= 1.5;
    this.body.setSize(narrowPaddle, this.height);
}


module.exports = Player;
},{"./Movable.js":5}],7:[function(require,module,exports){
'use strict'

var Movable = require ('./Movable.js');
var Ball = require ('./Ball.js').Ball;
var Par = require ('./SoundSource.js').Par;

var EXTRA_BALLS = 2;
var POWERUP_POINTS = 1000;

//2.2.1.2.CLASE POWER-UP
function PowerUp(game, position, sprite, sound, lives, velocity, effect, drop)
{
    Movable.apply(this, [game, position, sprite, sound, lives, velocity, POWERUP_POINTS]);

   // Determina si el Power-Up es un efecto activo o no (pasando 'true' o 'false')
    this._effect = effect;

    this._dropEnabled = drop;

   // Para elegir un frame en concreto -> this.frame = x;
    this.animations.add('rotate');
    // Comienza la animación: a 6 fps, y 'true' para repetirla en bucle
    this.animations.play('rotate', 6, true);
}

PowerUp.prototype = Object.create(Movable.prototype);
PowerUp.prototype.constructor = PowerUp;

PowerUp.prototype.update = function()
{
    this.y += this.body.velocity.y;
    if(this.y>this.game.height - 20)
    this.takeDamage();
}

//
PowerUp.prototype.takeDamage = function()
{
    this._dropEnabled = true;
    this.destroy();
}

// Devuelve si el Power-Up actual es un efecto activo o no
PowerUp.prototype.isEffect = function()
{
    return this._effect;
}

// 
PowerUp.prototype.dropEnabled = function()
{
    return this._dropEnabled;
}




// POWER-UPS

// 1) Power-Up rojo -> disparo
function RedPowerUp(game, position, sprite, sound, lives, velocity, effect, drop, player)
{
    PowerUp.apply(this, [game, position, sprite, sound, lives, velocity, effect, drop, POWERUP_POINTS]);

    this._player = player;
}

RedPowerUp.prototype = Object.create(PowerUp.prototype);
RedPowerUp.prototype.constructor = RedPowerUp;

RedPowerUp.prototype.enable = function()
{
    this._player.enableShot();
}

RedPowerUp.prototype.disable = function()
{
    this._player.disableEffects();
}

// 2) Power-Up gris -> ganar una vida
function GreyPowerUp(game, position, sprite, sound, lives, velocity, effect, drop,  player)
{
    PowerUp.apply(this, [game, position, sprite, sound, lives, velocity, effect, drop, POWERUP_POINTS]);

    this._player = player;
}

GreyPowerUp.prototype = Object.create(PowerUp.prototype);
GreyPowerUp.prototype.constructor = GreyPowerUp;

GreyPowerUp.prototype.enable = function()
{
    this._player.addLife();
}

// 3) Power-Up azul -> ensanchar la pala
function BluePowerUp(game, position, sprite, sound, lives, velocity, effect, drop, player)
{
    PowerUp.apply(this, [game, position, sprite, sound, lives, velocity, effect, drop,  POWERUP_POINTS]);

    this._player = player;
}

BluePowerUp.prototype = Object.create(PowerUp.prototype);
BluePowerUp.prototype.constructor = BluePowerUp;

BluePowerUp.prototype.enable = function()
{
    this._player.getWider();
}

BluePowerUp.prototype.disable = function()
{
    this._player.disableEffects();
}

// 4) Power-Up verde -> atrapar la pelota
function GreenPowerUp(game, position, sprite, sound, lives, velocity, effect, drop,  ballsGroup)
{
    PowerUp.apply(this, [game, position, sprite, sound, lives, velocity, effect, drop, POWERUP_POINTS]);

    this._balls = ballsGroup;
}

GreenPowerUp.prototype = Object.create(PowerUp.prototype);
GreenPowerUp.prototype.constructor = GreenPowerUp;

GreenPowerUp.prototype.enable = function()
{
    this._balls.callAll('enableAttach');
}

GreenPowerUp.prototype.disable = function()
{
    this._balls.callAll('disableEffects');
}

// 5) Power-Up naranja -> decelerar la pelota
function OrangePowerUp(game, position, sprite, sound, lives, velocity, effect, drop, ballsGroup)
{
    PowerUp.apply(this, [game, position, sprite, sound, lives, velocity, effect, drop, POWERUP_POINTS]);

    this._balls = ballsGroup;
}

OrangePowerUp.prototype = Object.create(PowerUp.prototype);
OrangePowerUp.prototype.constructor = OrangePowerUp;

OrangePowerUp.prototype.enable = function()
{
    this._balls.callAll('slowDown');
}
// *Caso excepcional* -> No desactiva nada como tal, pero sí sobreescribe otros efectos activos (como en el juego original)
OrangePowerUp.prototype.disable = function()
{
}

// 6) Power-Up azul claro -> triplicar la pelota
function LightBluePowerUp(game, position, sprite, sound, lives, velocity, effect, drop, ballsGroup)
{
    PowerUp.apply(this, [game, position, sprite, sound, lives, velocity, effect, drop, POWERUP_POINTS]);

    this._balls = ballsGroup;
    this._mainBall = this._balls.getTop();
}

LightBluePowerUp.prototype = Object.create(PowerUp.prototype);
LightBluePowerUp.prototype.constructor = LightBluePowerUp;

LightBluePowerUp.prototype.enable = function()
{
    var extraBall;
    var ballPos = new Par(this._mainBall.getPosX(), this._mainBall.getPosY());
    var ballVel = new Par(this._mainBall.getVelX() *0.8 , this._mainBall.getVelY() *0.8);
  //  var ballVel = new Par(BASE_VELOCITY * Math.cos(BASE_ANGLE), -BASE_VELOCITY *  Math.sin(BASE_ANGLE));
    for(var i = 0; i < EXTRA_BALLS; i++)
    {
        extraBall = new Ball(this.game, ballPos, 'ball', 'sound', 1, ballVel);
        this._balls.add(extraBall);

        extraBall.body.velocity.setTo(this._mainBall.body.velocity.x*0.8, this._mainBall.body.velocity.y*0.8); //Físicas de la pelota
        extraBall.body.bounce.setTo(1, 1); //ESTO SIRVE PARA HACER QUE ACELERE
    }
}

LightBluePowerUp.prototype.disable = function()
{
     this._dropEnabled = true;
}

LightBluePowerUp.prototype.takeDamage = function()
{
    this.destroy();
    // Diferenciamos así cuando se destruye con la Deadzone o cuando se ha recogido por el jugador (y, por tanto, se ha activado)
    if(this._balls.length <= 1)
     this._dropEnabled = true;
}


module.exports = 
{
    PowerUp,
    GreenPowerUp,
    GreyPowerUp, 
    RedPowerUp,
    BluePowerUp, 
    OrangePowerUp,
    LightBluePowerUp,
    EXTRA_BALLS,
    POWERUP_POINTS
};
},{"./Ball.js":1,"./Movable.js":5,"./SoundSource.js":8}],8:[function(require,module,exports){
'use strict';

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

//Estructura auxiliares : PAR
function Par(x, y)
{
    this._x=x;
    this._y=y;
}


module.exports = 
{
    SoundSource, 
    Par
};
},{}],9:[function(require,module,exports){
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
    //this.game.load.spritesheet('powerUp6', 'images/powerUp6.png', 40, 18);

   
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

},{"./play_scene.js":10}],10:[function(require,module,exports){
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

        for(var j = 0; j < NUM_COLS - 2; j++)
        {
            var brick;
            var pos= new Par(this.leftLimit + BRICK_WIDTH + 2 + (j*BRICK_WIDTH), 125 + (i*BRICK_HEIGHT));

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
    
    //9.Enemigos
    this.enemigos = this.game.add.physicsGroup();
    this.enemigos.classType = Enemy;

    
    var enemyPos = new Par(this.leftLimit + 127, 55);
    var enemyVel = new Par(0, ENEMY_VEL);
    var enem1 = new Enemy(this.game, enemyPos, 'enemigos', 'sound', 1, enemyVel, this.walls, this.bricks, this.enemigos);
    this.enemigos.add(enem1);
    

    var enemyPos2 = new Par(this.rightLimit-120, 55); 
    var enemyVel2 = new Par(0, ENEMY_VEL);
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
         powerUp.body.velocity.y = 2;

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
       powerUp.enable();
       powerUp.takeDamage(this);
   },

   // Usado para hacer debug
  render: function() 
   {
        // Player debug info
        this.game.debug.text('Power-up: '+ this.player._powerUpActual, 5, 35);
        this.game.debug.text('Lives: '+ this.player._lives, this.rightLimit + 50, 300);
        this.game.debug.text('Points: '+ this.points, this.rightLimit + 50, 150);
        this.game.debug.text('Balls: '+ this.ballsGroup.length, this.rightLimit + 50, 450);
    }
};

module.exports = PlayScene;


},{"./Ball.js":1,"./Destroyable.js":2,"./Enemy.js":3,"./HUD.js":4,"./Movable.js":5,"./Player.js":6,"./PowerUp.js":7,"./SoundSource.js":8}]},{},[9]);
