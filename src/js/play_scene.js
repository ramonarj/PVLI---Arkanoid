'use strict';

//Variables
var player;
var fondo;
var cursors;
var ball;
var techo;
var pared1, pared2;
var ladrillo;
var x =false;
var PlayScene =
 {
   //Función Create
  create: function () 
  {
    
    //Añadimos las variables
    //Fondo
    fondo = new Phaser.Image(this.game, 150, 20, 'background');
    this.game.world.addChild(fondo);
    //Jugador
    var playerPos = new Par(350, 520);
    var playerVel = new Par(0,0);
    player = new Player(this.game, playerPos, 'player', 'sound', 3, playerVel);
    this.game.world.addChild(player);
    //Pelota
    var ballVel = new Par(-200,-200);
    ball=new Ball(this.game, playerPos, 'ball', '333', 1, ballVel);
    this.game.world.addChild(ball);
    //Paredes
    techo = new Phaser.Sprite(this.game, 100, 20, 'techo');
    pared1 = new Phaser.Sprite(this.game, 150, 60, 'pared');
    pared2 = new Phaser.Sprite(this.game, 610, 60, 'pared');
    this.game.world.addChild(techo);
    this.game.world.addChild(pared1);
    this.game.world.addChild(pared2);

    //Ladrillos
    var brickPos= new Par(350,100);
    ladrillo=new Destroyable(this.game, brickPos, 'techo', 'ee', 1);
    this.game.world.addChild(ladrillo);

    //Cursores
    cursors = this.game.input.keyboard.createCursorKeys();
   
    //Escalamos
    player.scale.setTo(2.5, 2.5);
    ball.scale.setTo(2,2);
    fondo.scale.setTo(2.5,2.5);
    techo.scale.setTo(0.8,0.2);
    pared1.scale.setTo(0.2,0.8);
    pared2.scale.setTo(0.2,0.8);
    ladrillo.scale.setTo(0.1,0.25);
   

    //Motor físico de Phaser
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    //Colisiones
    this.game.physics.enable([techo,ball], Phaser.Physics.ARCADE);
    this.game.physics.enable([pared1,ball], Phaser.Physics.ARCADE);
    this.game.physics.enable([pared2,ball], Phaser.Physics.ARCADE);
    this.game.physics.enable([player,ball], Phaser.Physics.ARCADE);
    this.game.physics.enable([ladrillo,ball], Phaser.Physics.ARCADE);
    //Objetos que no se mueven
    techo.body.immovable = true;
    pared1.body.immovable = true;
    pared2.body.immovable = true;
    player.body.immovable = true;
    ladrillo.body.immovable = true;
    
    ball.body.velocity.setTo(ball._velocity._x, ball._velocity._y);
    ball.body.bounce.setTo(1, 1);
    ball.body.collideWorldBounds = true;
  },
  
  //Función Update
  update: function()
  {
      //Comprobamos todas las colisiones
    this.game.physics.arcade.overlap(ball, pared1, collisionHandler, null, this);
    this.game.physics.arcade.overlap(ball, pared2, collisionHandler, null, this);
    this.game.physics.arcade.overlap(ball, techo, collisionHandler, null, this);
    this.game.physics.arcade.overlap(ball, player, collisionHandler, null, this);
    this.game.physics.arcade.overlap(ball, ladrillo, collisionHandler, null, this);

    takeInput();
  },
};

module.exports = PlayScene;


//FUNCIONES AUXILIARES
//Reocoge el input de usuario
var takeInput = function()
{
  if (cursors.left.isDown && player.x > 170)
  {
      player.x-=10;
  }
  
  else if (cursors.right.isDown && player.x < 525)
  {
      player.x+=10;
  }
}

var collisionHandler = function(obj1, obj2)
{
    if(obj1==ball || obj2==ball)
    {
        this.game.physics.arcade.collide(techo, ball);
        this.game.physics.arcade.collide(pared1, ball);
        this.game.physics.arcade.collide(pared2, ball);
        this.game.physics.arcade.collide(player, ball);
        this.game.physics.arcade.collide(ladrillo, ball);
        if(obj1==ladrillo || obj2==ladrillo)
             ladrillo.takeDamage();
    }
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

Movable.prototype.update = function() //Para la DeadZone
{
    if(this.y>this.game.height - 20)
        this.destroy();
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
function Player(game, position, sprite, sound, lives, velocity)
{
    Movable.apply(this, [game, position, sprite, sound, lives, velocity]);
    this._powerUpActual=0;
}

Player.prototype = Object.create(Movable.prototype);
Player.prototype.constructor = Player;

//Funciones de jugador
Player.prototype.readInput = function() //Mueve el jugador a la izquierda
{
    //Comprobación de cursores de Phaser
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