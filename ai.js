var GeneticBitmap = function ( goalImgData ) {

    this.goalImgData = goalImgData;

    this.populationSize      = 10;
    this.generation          = 0;
    this.mutationProbability = 0.8;

    this.population = [];
    this.fstBest    = null;
    this.sndBest    = null;

    this.imageWidth  = 64;
    this.imageHeight = 64;
};

GeneticBitmap.prototype.run = function () {
    var self = this;

    var interval = setInterval( function () {

        for ( var i = 0; i < 100; i++ ) {
            self.generation++;
            self.runGeneration();
        }
        console.log( "generation " + self.generation );

        self.printPopulation();

        if ( self.goalReached() ) {
            debugger;
            clearInterval( interval );
        }
    }, 100 );
};

GeneticBitmap.prototype.runGeneration = function () {
    this.selection();
    this.crossover();
    this.mutation();
    this.replaceWorst();
};

GeneticBitmap.prototype.initPopulation = function () {
    for ( var i = 0; i < this.populationSize; i++ ) {
        this.population.push( new Individual() );
    }
};

GeneticBitmap.prototype.selection = function () {
    var self = this;
    var rank = this.population.slice( 0 );

    rank.sort( function ( a, b ) {
        var aFitness = a.getFitness( self.goalImgData );
        var bFitness = b.getFitness( self.goalImgData );
        if ( aFitness >= bFitness ) {
            return -1;
        }
        return 1;
    } );

    this.fstBest = new Individual( rank[ 0 ].imgData.slice( 0 ) );
    this.sndBest = new Individual( rank[ 1 ].imgData.slice( 0 ) );
};

GeneticBitmap.prototype.crossover = function () {
    //choose a random limit point for cross-overing
    var crossoverPoint1 = Math.round( Math.random() / 4 * this.fstBest.imgData.length );
    var crossoverPoint2 = Math.round( Math.random() / 2 * this.sndBest.imgData.length / 2 );
    var crossoverPoint3 = Math.round( Math.random() * this.sndBest.imgData.length );

    for ( var i = 0; i < crossoverPoint1; i++ ) {
        var tmp                   = this.fstBest.imgData[ i ];
        this.fstBest.imgData[ i ] = this.sndBest.imgData[ i ];
        this.sndBest.imgData[ i ] = tmp;
    }

    for ( var i = crossoverPoint2; i < crossoverPoint3; i++ ) {
        var tmp                   = this.fstBest.imgData[ i ];
        this.fstBest.imgData[ i ] = this.sndBest.imgData[ i ];
        this.sndBest.imgData[ i ] = tmp;
    }
};

GeneticBitmap.prototype.getBestFromCrossover = function () {
    if ( this.fstBest.getFitness( this.goalImgData ) >= this.sndBest.getFitness( this.goalImgData ) ) {
        return this.fstBest;
    }

    return this.sndBest;
};

GeneticBitmap.prototype.replaceWorst = function () {
    var worstIndex = -1;

    var worstFitness = Number.MAX_VALUE;
    for ( var i = 0; i < this.population.length; i++ ) {
        var fitness = this.population[ i ].getFitness( this.goalImgData );
        if ( fitness < worstFitness ) {
            worstFitness = fitness;
            worstIndex   = i;
        }
    }

    this.population[ worstIndex ] = this.getBestFromCrossover();
};

GeneticBitmap.prototype.mutation = function () {

    var mutationPointNumber = Math.round( Math.random() * 20 * this.mutationProbability );

    for ( var i = 0; i < mutationPointNumber; i++ ) {

        var mutationPoint = Math.round( Math.random() * this.fstBest.imgData.length );

        if ( this.fstBest.imgData[ mutationPoint ] === 0 ) {
            this.fstBest.imgData[ mutationPoint ] = 255;
        }
        else {
            this.fstBest.imgData[ mutationPoint ] = 0;
        }

        var mutationPoint2 = Math.round( Math.random() * this.sndBest.imgData.length );

        if ( this.sndBest.imgData[ mutationPoint2 ] === 0 ) {
            this.sndBest.imgData[ mutationPoint2 ] = 255;
        }
        else {
            this.sndBest.imgData[ mutationPoint2 ] = 0;
        }
    }
};

GeneticBitmap.prototype.goalReached = function () {

    var everyoneEqual     = true;
    var numberOfDifferent = 0;

    var i = 0;
    while ( everyoneEqual && i < this.population.length - 1 ) {
        for ( var j = 0; j < this.population[ i ].imgData.length; j++ ) {
            if ( this.population[ i ].imgData[ j ] !== this.population[ i + 1 ].imgData[ j ] ) {
                if ( numberOfDifferent > 0 ) {
                    everyoneEqual = false;
                }
                else {
                    //this introduces a 1-individual elasticity
                    numberOfDifferent++;
                }
                break;
            }
        }
        i++;
    }

    return everyoneEqual;
};

GeneticBitmap.prototype.printPopulation = function () {
    for ( var i = 0; i < this.population.length; i++ ) {
        var canvas1 = document.getElementById( "i" + i );
        if ( canvas1 === null ) {
            var cc    = document.createElement( 'canvas' );
            cc.id     = "i" + i;
            cc.width  = this.imageWidth;
            cc.height = this.imageHeight;
            cc.style  = "height:100px;width:100px;";
            document.body.appendChild( cc );
            canvas1 = document.getElementById( "i" + i );
        }

        var context1 = canvas1.getContext( '2d' );

        var canvasData = this.population[ i ].getCanvasData( context1 );
        context1.putImageData(
            canvasData, 0, 0
        );

    }

};
