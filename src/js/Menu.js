'use strict'

var Menu = 
{
    fondoMenu:null,
    cursors:null,
    selector:null,
    enterButton:null,
    eleccion:null,
    music:null,

    create: function()
    {
        this.music = this.game.add.audio('remix');
        this.music.loop = true;
        this.music.play();
        this.music.volume = 1;

        this.eleccion=0;
        this.fondoMenu = new Phaser.Image(this.game, 0, 0, 'menu');
        this.game.world.addChild(this.fondoMenu);
        this.selector = new Phaser.Image(this.game, 275, 320 , 'cursor');
        this.game.world.addChild(this.selector);

        this.enterButton = this.game.input.keyboard.addKey(Phaser.KeyCode.ENTER);
        this.cursors = this.game.input.keyboard.createCursorKeys();
    },

    update:function()
    {
        this.takeInput();
    },

    takeInput:function()
    {
        if(this.cursors.down.isDown && this.eleccion < 2)
        {
            this.selector.y+=50;
            this.eleccion++;
        }
        else if(this.cursors.up.isDown && this.eleccion > 0)
        {
            this.selector.y-=50;
            this.eleccion--;
        }
        else if(this.enterButton.isDown)
        {
            if(this.eleccion == 0)
            {
            this.music.stop();
            this.game.state.start('1player');
            }
            else if(this.eleccion == 2) //Ahora mismo salta un hueco más
            {
            this.music.stop();
            this.game.state.start('2player');
            }
        }    
    }
};

module.exports = Menu;