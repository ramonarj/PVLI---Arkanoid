'use strict'

var Menu = 
{
    fondoMenu:null,
    enterButton:null,
    create: function()
    {
        this.fondoMenu = new Phaser.Image(this.game, 0, 0, 'menu');
        this.game.world.addChild(this.fondoMenu);
        this.enterButton = this.game.input.keyboard.addKey(Phaser.KeyCode.ENTER);
    },

    update:function()
    {
        this.takeInput();
    },

    takeInput:function()
    {
        if(this.enterButton.isDown)
            this.game.state.start('play');
    }
};

module.exports = Menu;