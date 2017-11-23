'use strict';

var player;
var fondo;
var cursors;
var ball;
var pared1, pared2, techo;
var ladrillo;
var PlayScene =
 {
   //Función Create
  create: function () 
  {
    //Variables

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
    techo = new Phaser.Sprite(this.game, 80, 0, 'techo');
    pared1 = new Phaser.Sprite(this.game, 131, 55, 'pared');
    pared2 = new Phaser.Sprite(this.game, 612, 55, 'pared');
    this.game.world.addChild(techo);
    this.game.world.addChild(pared1);
    this.game.world.addChild(pared2);

    //Ladrillos
    var brickPos= new Par(350,100);
    ladrillo=new Destroyable(this.game, brickPos, 'ladrillo', 'ee', 1);
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
    ladrillo.scale.setTo(0.15,0.2);
    pared1.visible=pared2.visible=techo.visible=false;

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
    
    //Físicas de la pelota
    ball.body.velocity.setTo(ball._velocity._x, ball._velocity._y);
    ball.body.bounce.setTo(1, 1); //ESTO SIRVE PARA HACER QUE ACELERE
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

    player.takeInput();
  },
};

module.exports = PlayScene;


//FUNCIONES AUXILIARES
//Se encarga de las colisiones
var collisionHandler = function(obj1, obj2)
{
     this.game.physics.arcade.collide(obj1, obj2);
     //La pelota rebota en algo
     if(Object.getPrototypeOf(obj1).hasOwnProperty('bounce'))
        obj1.bounce(obj2);
     else if (Object.getPrototypeOf(obj2).hasOwnProperty('bounce'))
        obj2.bounce(obj1);
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
        this.takeDamage();
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
Player.prototype.takeInput = function() //Mueve el jugador a la izquierda
{
    if (cursors.left.isDown && this.x > 170)
    {
        this.x-=10;
    }
    
    else if (cursors.right.isDown && this.x < 525)
    {
        this.x+=10;
    }
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
Ball.prototype.bounce = function(obj) //Rebota en un objeto "obj2"
{
    //Ladrillos
    if(obj.constructor === Destroyable)
       obj.takeDamage();
    //Jugador
    else if(Object.getPrototypeOf(obj).hasOwnProperty('shoot'))
    {
        //Cambio ligero de dirección
        var angulo = this.game.rnd.integerInRange(-20, 20);
        if(this.body.velocity.y + angulo > 0)
        this.body.velocity.y += angulo;
        if(this.body.velocity.x < 0)
           this.body.velocity.x -= angulo;
        else
          this.body.velocity.x += angulo;

        //Rebote en lado contrario al que se mueve la pelota
        if(this.x > (obj.x + obj.width/2) && this.body.velocity.x < 0 || this.x < (obj.x +obj.width/2) && this.body.velocity.x > 0)
            this.body.velocity.x = -this.body.velocity.x;
        
    }
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