'use strict';

//Variables
var player;
var fondo;
var cursors;
var ball;
var pared1, pared2, pared3;

var PlayScene =
 {
   //Función Create
  create: function () 
  {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    //Añadimos las variables

    //Cursores
    cursors = this.game.input.keyboard.createCursorKeys();

    //Fondo
    fondo = new Phaser.Image(this.game, 150, 20, 'background');
    this.game.world.addChild(fondo);

    //Jugador
    var playerPos = new Par(350, 520);
    var playerVel = new Par(0,0);
    player = new Player(this.game, playerPos, 'player', 'sound', 3, playerVel, cursors);
    this.game.world.addChild(player);

    //Pelota
    var ballVel = new Par(-2,-2);
    ball=new Ball(this.game, playerPos, 'ball', '333', 1, ballVel);
    this.game.world.addChild(ball);

    // Bala 
    var bulletVel = new Par(0,-4);

    //Paredes
    pared1 = new Phaser.Sprite(this.game, 150, 20, 'pared');
    pared2 = new Phaser.Sprite(this.game, 170, 65, 'pared');
    pared3 = new Phaser.Sprite(this.game, 650, 65, 'pared');
    this.game.world.addChild(pared1);
    this.game.world.addChild(pared2);
    this.game.world.addChild(pared3);
    pared2.angle=pared3.angle=90;

    
   
    //Escalamos
    player.scale.setTo(2.5, 2.5);
    ball.scale.setTo(2,2);
    fondo.scale.setTo(2.5,2.5);
    pared1.scale.setTo(0.6,0.2);
    pared2.scale.setTo(0.8,0.2);
    pared3.scale.setTo(0.8,0.2);

    //Colisiones
    //ball.body.bounce.setTo(1, 1);
    //game.physics.enable([pared1,ball], Phaser.Physics.ARCADE);
    //game.physics.enable([pared2,ball], Phaser.Physics.ARCADE);
    //game.physics.enable([pared3,ball], Phaser.Physics.ARCADE);
  },
  
  //Función Update
  update: function()
  {
    takeInput();
  }
};

module.exports = PlayScene;


//FUNCIONES AUXILIARES
//Reocoge el input de usuario
var takeInput = function()
{


  /*if(this.game.input.keyboard.isDown(Phaser.KeyCode.SPACEBAR))
  var bullet = new Movable(this.game, player.position, 'bullet','sound', 1, bulletVel);*/
}


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
function Destroyable(game, position, sprite, sound, lives)
{
    SoundSource.apply(this, [game, position, sprite, sound]);
    this._lives = lives;
}

Destroyable.prototype = Object.create(SoundSource.prototype);
Destroyable.prototype.constructor = Destroyable;

//Funciones de destruible
Destroyable.prototype.takeDamage = function () //Quita una vida
{
    this._lives--;
    if(this._lives <=0)
    {
        this.destroy();
    }
}

/////////////////////////////////////////
//2.2.1.CLASE MÓVIL (Bala) -> tienen velocidad en x e y
function Movable(game, position, sprite, sound, lives, velocity)
{
    Destroyable.apply(this, [game, position, sprite, sound, lives]);
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

Movable.prototype.update = function() //Cambia la velocidad
{
    this.x+=this._velocity._x;
    this.y+=this._velocity._y;
}

////////////////////////////////////////
//2.2.1.1.CLASE ENEMIGO
function Enemy(game, position, sprite, sound, lives, velocity)
{
    Movable.apply(this, [game, position, sprite, sound, lives, velocity]);
}

Enemy.prototype = Object.create(Movable.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.pathfinding = function() //Se mueve con "pathfinding"
{

}

/////////////////////////////////////////
//2.2.1.2.CLASE JUGADOR 
function Player(game, position, sprite, sound, lives, velocity, cursors)
{
    Movable.apply(this, [game, position, sprite, sound, lives, velocity]);
    this._powerUpActual=0;

  //  this.cursors = cursors;
}

Player.prototype = Object.create(Movable.prototype);
Player.prototype.constructor = Player;


Player.prototype.readInput = function()
{
        //Comprobación de cursores de Phaser
        if (cursors.left.isDown && this.x > 170)
        {
            this.x-=10;
        }
        
        else if (cursors.right.isDown && this.x < 525)
        {
            this.x+=10;
        }
}
//Funciones de jugador
Player.prototype.update = function() //Mueve el jugador a la izquierda
{
this.readInput();
}

Player.prototype.shoot = function() //Dispara una bala
{
  
}


//////////////////////////////////////
//2.2.1.2.CLASE PELOTA
function Ball(game, position, sprite, sound, lives, velocity)
{
    Movable.apply(this, [game, position, sprite, sound, lives, velocity]);
}

Ball.prototype = Object.create(Movable.prototype);
Ball.prototype.constructor = Ball;

//Funciones de pelota
Ball.prototype.bounce = function() //Rebota 
{
  
}

/////////////////////////////////////////
//2.2.1.2.CLASE POWER-UP
function PowerUp(game, position, sprite, sound, lives, velocity, powerUpNo)
{
    Movable.apply(this, [game, position, sprite, sound, lives, velocity]);
    this._powerUpNo = powerUpNo;
}

PowerUp.prototype = Object.create(Movable.prototype);
PowerUp.prototype.constructor = PowerUp;