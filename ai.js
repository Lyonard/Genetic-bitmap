var GeneticBitmap = function ( goalImgData ) {

    this.goalImgData = goalImgData;

    this.populationSize  = 10;
    this.generation      = 0;
    this.minMutations    = 1;
    this.maxMutations    = 5;
    this.maxErrorAllowed = 0.001;

    this.population = [];
    this.fstBest    = null;
    this.sndBest    = null;

    this.imageWidth  = 64;
    this.imageHeight = 64;
};

GeneticBitmap.prototype.runGeneration = function () {
    this.generation++;
    this.selection();
    this.crossover();
    this.mutation();
    this.replaceWorst();
};

GeneticBitmap.prototype.initPopulation = function () {
    for ( var i = 0; i < this.populationSize; i++ ) {
        this.population.push( new Individual( this.imageWidth, this.imageHeight ) );
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
        return 1
    } );

    this.fstBest = new Individual( this.imageWidth, this.imageHeight, rank[ 0 ].imgData.slice( 0 ) );
    this.sndBest = new Individual( this.imageWidth, this.imageHeight, rank[ 1 ].imgData.slice( 0 ) );
};

GeneticBitmap.prototype.crossover = function () {
    var quarterLength = this.fstBest.imgData.length / 4;

    //choose a random limit point for cross-overing
    var crossoverPoint1 = Math.round( Math.random() / 4 * quarterLength );
    var crossoverPoint2 = Math.round( Math.random() / 4 * quarterLength + quarterLength );
    var crossoverPoint3 = Math.round( Math.random() / 4 * quarterLength + 2 * quarterLength );
    var crossoverPoint4 = Math.round( Math.random() / 4 * quarterLength + 3 * quarterLength );

    for ( var i = crossoverPoint1; i < crossoverPoint2; i++ ) {
        var tmp                   = this.fstBest.imgData[ i ];
        this.fstBest.imgData[ i ] = this.sndBest.imgData[ i ];
        this.sndBest.imgData[ i ] = tmp;
    }

    for ( i = crossoverPoint3; i < crossoverPoint4; i++ ) {
        tmp                       = this.fstBest.imgData[ i ];
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

    var numberOfMutations = this.minMutations + Math.round( Math.random() * this.maxMutations );

    for ( var i = 0; i < numberOfMutations; i++ ) {

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
    var self            = this;
    var maxTotalFitness = self.imageWidth * self.imageHeight; //exactly the number of pixels

    var enoughPrecision = function () {
        var totalFitness = 0;

        for ( var i = 0; i < self.population.length; i++ ) {
            totalFitness += self.population[ i ].getFitness( self.goalImgData );
        }
        var fitnessPercentage = (totalFitness / self.population.length) / maxTotalFitness;

        return (1 - fitnessPercentage) < self.maxErrorAllowed;
    };

    var oneIsPerfect = function () {
        var perfectExists = false;

        for ( var i = 0; i < self.population.length; i++ ) {
            if ( self.population[ i ].getFitness( self.goalImgData ) === maxTotalFitness ) {
                perfectExists = true;
                break;
            }
        }

        return perfectExists;
    };

    var populationConverged = function () {
        var converged         = false;
        var numberOfDifferent = 0;

        var i = 0;
        while ( !converged && i < this.population.length - 1 ) {
            for ( var j = 0; j < this.population[ i ].imgData.length; j++ ) {
                if ( this.population[ i ].imgData[ j ] !== this.population[ i + 1 ].imgData[ j ] ) {
                    if ( numberOfDifferent > 0 ) {
                        converged = true;
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
        return converged;
    };

    //check if we have a prefect individual
    //if not, check if we have reached an acceptable result.
    //if not, check if every individual is the same. (if yes, there's no significant room for improvement)

    return oneIsPerfect() || enoughPrecision() || populationConverged();
};

GeneticBitmap.prototype.getBestFitness = function () {
    var self = this;
    var rank = this.population.slice( 0 );

    rank.sort( function ( a, b ) {
        var aFitness = a.getFitness( self.goalImgData );
        var bFitness = b.getFitness( self.goalImgData );
        if ( aFitness >= bFitness ) {
            return -1;
        }
        return 1
    } );

    var fitness_perc = rank[ 0 ].getFitness() / (this.imageWidth * this.imageHeight);
    return Math.round( fitness_perc * 10000 ) / 100;
};

