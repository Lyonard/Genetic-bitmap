/**
 * Created by Roberto on 11/03/2019.
 */

var Individual = function ( imgData ) {
    this.imageWidth  = 64;
    this.imageHeight = 64;

    if ( typeof imgData === 'undefined' ) {
        imgData = [];
        for ( var i = 0; i < this.imageWidth * this.imageHeight; i++ ) {
            imgData[ i ] = 255 * Math.round( Math.random() );
        }
    }
    this.imgData = imgData;
    this.fitness = 0;

};

Individual.prototype.getFitness = function ( goalImgData ) {
    //evaluate fitness as the number of matching pixels
    //maximum value: 64 * 64
    if ( goalImgData !== null ) {
        var matching = 0;
        for ( var i = 0; i < this.imgData.length; i++ ) {
            if ( this.imgData[ i ] === goalImgData[ i ] ) {
                matching++
            }
        }
        this.fitness = matching;
    }
    return this.fitness;
};

Individual.prototype.getCanvasData = function ( context ) {
    var _imgData = context.createImageData( this.imageWidth, this.imageHeight );
    var i;
    for ( i = 0; i < this.imgData.length; i++ ) {
        _imgData.data[ 4 * i ]     = this.imgData[ i ];
        _imgData.data[ 4 * i + 1 ] = this.imgData[ i ];
        _imgData.data[ 4 * i + 2 ] = this.imgData[ i ];
        _imgData.data[ 4 * i + 3 ] = 255;
    }
    return _imgData;
};