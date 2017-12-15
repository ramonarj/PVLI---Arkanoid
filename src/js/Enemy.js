'use strict'

var Movable = require ('./Movable.js');

var ENEMY_POINTS = 100;
var ENEMY_VEL = 1;

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
    this.animations.currentAnim.speed = 6 * ENEMY_VEL;
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
    var nx = this.x + (dirX * this.width / 2);
    var ny = this.y + (dirY * (2 + this.height / 2));
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

    if(this._dir == 0)
        this._velocity._x = this._vel;
    else if (this._dir == 1)
        this._velocity._x = -this._vel;
    else if (this._dir == 2)
        this._velocity._y = -this._vel;
    else
        this._velocity._y = this._vel;
}

module.exports = 
{
    Enemy,
    ENEMY_POINTS,
    ENEMY_VEL
};