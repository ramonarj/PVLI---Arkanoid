'use strict'

var Movable = require ('./Movable.js');
var Destroyable = require ('./Destroyable.js');
var Ball = require ('./Ball.js').Ball;
var Par = require ('./SoundSource.js').Par;

var EXTRA_BALLS = 2;
var POWERUP_POINTS = 1000;

//2.2.1.2.CLASE POWER-UP
function PowerUp(game, position, sprite, sound, lives, velocity, effect, drop, powerUpNo)
{
    Movable.apply(this, [game, position, sprite, sound, lives, velocity, POWERUP_POINTS]);

   // Determina si el Power-Up es un efecto activo o no (pasando 'true' o 'false')
    this._effect = effect;

    // Determina si el drop de otros Power-Ups está activo mientras éste está aún cayendo
    this._dropEnabled = drop;

   //Ponemos qué frames queremos para la animación (dependiendo del subtipo que sea)
   var frame = powerUpNo*6;
    this.animations.add('rotate', [frame, frame+1, frame+2, frame+3, frame+4, frame+5]);
    // Comienza la animación: a 6 fps, y 'true' para repetirla en bucle
    this.animations.play('rotate', 10, true);
}

PowerUp.prototype = Object.create(Movable.prototype);
PowerUp.prototype.constructor = PowerUp;

PowerUp.prototype.update = function()
{
    this.y += this.body.velocity.y;
    Movable.prototype.update.call(this);
}

//
PowerUp.prototype.takeDamage = function(playscene)
{
    this._dropEnabled = true;
    Destroyable.prototype.takeDamage.call(this, playscene);
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
    PowerUp.apply(this, [game, position, sprite, sound, lives, velocity, effect, drop, 0]);

    this._player = player;
}

RedPowerUp.prototype = Object.create(PowerUp.prototype);
RedPowerUp.prototype.constructor = RedPowerUp;

RedPowerUp.prototype.enable = function(player)
{
    player.enableShot();
}

RedPowerUp.prototype.disable = function(player)
{
   player.disableEffects();
}

// 2) Power-Up gris -> ganar una vida
function GreyPowerUp(game, position, sprite, sound, lives, velocity, effect, drop,  player)
{
    PowerUp.apply(this, [game, position, sprite, sound, lives, velocity, effect, drop, 1]);

    this._player = player;
}

GreyPowerUp.prototype = Object.create(PowerUp.prototype);
GreyPowerUp.prototype.constructor = GreyPowerUp;

GreyPowerUp.prototype.enable = function(player)
{
    player.addLife();
}

// 3) Power-Up azul -> ensanchar la pala
function BluePowerUp(game, position, sprite, sound, lives, velocity, effect, drop, player)
{
    PowerUp.apply(this, [game, position, sprite, sound, lives, velocity, effect, drop, 2]);

    player = player;
}

BluePowerUp.prototype = Object.create(PowerUp.prototype);
BluePowerUp.prototype.constructor = BluePowerUp;

BluePowerUp.prototype.enable = function(player)
{
    player.getWider();
}

BluePowerUp.prototype.disable = function(player)
{
    player.disableEffects();
}

// 4) Power-Up verde -> atrapar la pelota
function GreenPowerUp(game, position, sprite, sound, lives, velocity, effect, drop,  ballsGroup)
{
    PowerUp.apply(this, [game, position, sprite, sound, lives, velocity, effect, drop, 3]);

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
    PowerUp.apply(this, [game, position, sprite, sound, lives, velocity, effect, drop, 4]);

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
    PowerUp.apply(this, [game, position, sprite, sound, lives, velocity, effect, drop, 5]);

    this._balls = ballsGroup;
    this._mainBall = this._balls.getFirstAlive();
}

LightBluePowerUp.prototype = Object.create(PowerUp.prototype);
LightBluePowerUp.prototype.constructor = LightBluePowerUp;

LightBluePowerUp.prototype.enable = function()
{
    var extraBall;
    var ballVel = this._mainBall.getVel();
    var dir = 1;
  
  //  var ballVel = new Par(BASE_VELOCITY * Math.cos(BASE_ANGLE), -BASE_VELOCITY *  Math.sin(BASE_ANGLE));
this._balls.forEachDead(function(extraBall, mainBall)
{
    extraBall.revive();
    extraBall.setPosX (mainBall.getPosX());
    extraBall.setPosY (mainBall.getPosY());
    var ballAngle = this._mainBall.getAngle() + (Math.floor(Math.random() * (50 - 15))/100);
    ballAngle * dir;
    extraBall.body.velocity.setTo(ballVel*Math.cos(ballAngle), ballVel*Math.sin(ballAngle)); //Físicas de la pelota

    extraBall.body.bounce.setTo(1, 1); //ESTO SIRVE PARA HACER QUE ACELERE

    dir = -dir;
},this, this._mainBall)
}

LightBluePowerUp.prototype.disable = function()
{
     this._dropEnabled = true;
}

LightBluePowerUp.prototype.takeDamage = function(playscene)
{
    // Diferenciamos así cuando se destruye con la Deadzone o cuando se ha recogido por el jugador (y, por tanto, se ha activado)
    if(this._balls.countLiving() <= 1)
       this._dropEnabled = true;
     Destroyable.prototype.takeDamage.call(this, playscene);
     this.destroy();
}

// 7) Power-Up rosa ->abre la puerta al siguiente nivel
function PinkPowerUp(game, position, sprite, sound, lives, velocity, effect, drop,  playScene)
{
    PowerUp.apply(this, [game, position, sprite, sound, lives, velocity, effect, drop, 6]);

    this._playScene = playScene;
}

PinkPowerUp.prototype = Object.create(PowerUp.prototype);
PinkPowerUp.prototype.constructor = PinkPowerUp;

PinkPowerUp.prototype.enable = function()
{
    this._playScene.openDoor();
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
    PinkPowerUp,
    EXTRA_BALLS,
    POWERUP_POINTS
};