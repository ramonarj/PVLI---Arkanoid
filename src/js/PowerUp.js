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

    this._dropEnabled = drop;

   //Ponemos qué frames queremos para la animación (dependiendo del subtipo que sea)
   var frame = powerUpNo*6;
    this.animations.add('rotate', [frame, frame+1, frame+2, frame+3, frame+4, frame+5]);
    // Comienza la animación: a 6 fps, y 'true' para repetirla en bucle
    this.animations.play('rotate', 6, true);
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
    PowerUp.apply(this, [game, position, sprite, sound, lives, velocity, effect, drop, 1]);

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
    PowerUp.apply(this, [game, position, sprite, sound, lives, velocity, effect, drop, 2]);

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

LightBluePowerUp.prototype.takeDamage = function(playscene)
{
    // Diferenciamos así cuando se destruye con la Deadzone o cuando se ha recogido por el jugador (y, por tanto, se ha activado)
    if(this._balls.length <= 1)
       this._dropEnabled = true;
     Destroyable.prototype.takeDamage.call(this, playscene);
     this.destroy();
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