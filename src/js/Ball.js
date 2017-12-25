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

    