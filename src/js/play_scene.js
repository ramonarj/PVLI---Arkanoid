'use strict';

//Variables
var player;
var leftWeapon;
var rightWeapon;
var fondo;
var cursors;
var ball;
var techo;
var pared1, pared2;
var bricks;
var ladrillo;
var ladrillo2;
var x =false;
var PlayScene =
 {
   //Función Create
  create: function () 
  {
    
    //Añadimos las variables

     //Cursores
     cursors = this.game.input.keyboard.createCursorKeys();
    //Fondo
    fondo = new Phaser.Image(this.game, 150, 20, 'background');
    this.game.world.addChild(fondo);
   
    //Armas del jugador
     
    leftWeapon = this.game.add.weapon(30, 'bullet');
     //  The bullet will be automatically killed when it leaves the world bounds
     leftWeapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
     
         //  Because our bullet is drawn facing up, we need to offset its rotation:
         leftWeapon.bulletAngleOffset = 90;
     
         //  The speed at which the bullet is fired
         leftWeapon.bulletSpeed = 400;
     
         //  Speed-up the rate of fire, allowing them to shoot 1 bullet every 60ms
         leftWeapon.fireRate = 500;

           


   
    rightWeapon = this.game.add.weapon(30, 'bullet');
     //  The bullet will be automatically killed when it leaves the world bounds
     rightWeapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
     
         //  Because our bullet is drawn facing up, we need to offset its rotation:
         rightWeapon.bulletAngleOffset = 90;
     
         //  The speed at which the bullet is fired
         rightWeapon.bulletSpeed = 400;
     
         //  Speed-up the rate of fire, allowing them to shoot 1 bullet every 60ms
         rightWeapon.fireRate = 500;

      

    //Jugador
    var playerPos = new Par(350, 520);
    var playerVel = new Par(0,0);
    player = new Player(this.game, playerPos, 'player', 'sound', 3, playerVel, cursors, leftWeapon, rightWeapon);
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
    var brickPos = new Par(350,100);

    bricks = this.game.add.group();
    bricks.classType = Destroyable;

   bricks.createMultiple(1);
 
    ladrillo = new Destroyable(this.game, brickPos, 'techo', 'ee', 1);
    ladrillo2 = new Destroyable(this.game, new Par(390,100), 'techo', 'ee', 1);

    bricks.enableBody = true;
    bricks.physicsBodyType = Phaser.Physics.ARCADE;

    bricks.add(ladrillo); // Added to the group
    bricks.add(ladrillo2);

    //var ladrilloCreado = bricks.create(400,100,'techo');

    //this.game.world.addChild(ladrillo);
  //  this.game.world.addChild(ladrillo2);

   
   
    //Escalamos
    player.scale.setTo(2.5, 2.5);
    ball.scale.setTo(2,2);
    fondo.scale.setTo(2.5,2.5);
    techo.scale.setTo(0.8,0.2);
    pared1.scale.setTo(0.2,0.8);
    pared2.scale.setTo(0.2,0.8);
    ladrillo.scale.setTo(0.1,0.25);
    ladrillo2.scale.setTo(0.1,0.25);
   

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
    
  //  ball.body.velocity.setTo(ball._velocity._x, ball._velocity._y);
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

    this.game.physics.arcade.overlap(rightWeapon.bullets, bricks, bulletCollision, null, this);
    this.game.physics.arcade.overlap(leftWeapon.bullets, bricks, bulletCollision, null, this);

    

  }
};

module.exports = PlayScene;


//FUNCIONES AUXILIARES


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

var bulletCollision = function(bullet, brick)
{
    brick.takeDamage();
    bullet.kill();
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
function Player(game, position, sprite, sound, lives, velocity, cursors, leftWeapon, rightWeapon)
{
    Movable.apply(this, [game, position, sprite, sound, lives, velocity]);
    this._powerUpActual=0;

    this.anchor.setTo(0.5, 0); // Sets the anchor in the upper half of the player 

   var fireButton;
   this.fireButton = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);

    //  Tell the Weapon to track the 'player'  offset by 14px horizontally, 0 vertically
    leftWeapon.trackSprite(this, -this.width, 0);
         //  Tell the Weapon to track the 'player' offset by 14px horizontally, 0 vertically
     rightWeapon.trackSprite(this, this.width, 0);
}

Player.prototype = Object.create(Movable.prototype);
Player.prototype.constructor = Player;

//Funciones de jugador
Player.prototype.readInput = function() //Mueve el jugador a la izquierda
{
    //Comprobación de cursores de Phaser
    if (cursors.left.isDown && this.x > 170)
    {
        this.x-=5;
    }
    
    else if (cursors.right.isDown && this.x < 525)
    {
        this.x+=5;
    }

    if(this.fireButton.isDown)
    {
        leftWeapon.fire();
        rightWeapon.fire();
    }
}

Player.prototype.shoot = function() //Dispara una bala
{

}

Player.prototype.update = function() //Dispara una bala
{
  this.readInput();
  this.shoot();
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