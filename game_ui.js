/**
 * Created by Roberto on 12/03/2019.
 */
GameUI = function () {
    this.game        = null;
    this.goalImgData = null;

    this.imgWidth  = 64;
    this.imgHeight = 64;

    this.population      = 10;
    this.minMutations    = 1;
    this.maxMutations    = 5;
    this.maxErrorAllowed = 0.001;

    this.step = 100;
};

GameUI.prototype.setGoalImageData = function ( data ) {
    this.goalImgData = data;
};

GameUI.prototype.init = function () {
    this.game                 = new GeneticBitmap();
    this.game.goalImgData     = this.goalImgData;
    this.game.imageWidth      = this.imgWidth;
    this.game.imageHeight     = this.imgHeight;
    this.game.populationSize  = this.population;
    this.game.minMutations    = this.minMutations;
    this.game.maxMutations    = this.maxMutations;
    this.game.maxErrorAllowed = this.maxErrorAllowed;

    this.game.initPopulation();
    this.initCanvas();

    this.printPopulation();
};

GameUI.prototype.initCanvas = function () {
    for ( var i = 0; i < this.population; i++ ) {
        var childCanvas    = document.createElement( 'canvas' );
        childCanvas.id     = "individual_" + i;
        childCanvas.width  = this.imgWidth;
        childCanvas.height = this.imgHeight;

        var css_width     = 100; //Math.floor( (screen.width / this.population) * 0.9 );
        childCanvas.style = "height:" + css_width + "px;width:" + css_width + "px;";

        document.getElementById( 'population' ).appendChild( childCanvas );
    }
};

GameUI.prototype.printPopulation = function () {
    for ( var i = 0; i < this.population; i++ ) {
        var canvas1    = document.getElementById( "individual_" + i );
        var context1   = canvas1.getContext( '2d' );
        var canvasData = this.game.population[ i ].getCanvasData( context1 );
        context1.putImageData(
            canvasData, 0, 0
        );
    }
};

GameUI.prototype.run = function () {
    var self            = this;
    var generation_span = document.getElementById( 'generation_number' );
    var fitness_span    = document.getElementById( 'bestFitness' );

    var interval = setInterval( function () {
        for ( var i = 0; i < self.step; i++ ) {
            self.game.runGeneration();
        }

        generation_span.innerHTML = self.game.generation;
        fitness_span.innerHTML    = self.game.getBestFitness();

        self.printPopulation();

        if ( self.game.goalReached() ) {
            clearInterval( interval );
        }
    }, 100 );
};