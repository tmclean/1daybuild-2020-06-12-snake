function Block( x, y, color ) {
    this.x = x
    this.y = y
    this.color = color

    this.move = function( grid, move ){
        this.x += move.xOffset
        this.y += move.yOffset
    }

    this.clone = function() {
        return new Block( this.x, this.y, color )
    }

    this.collision = function( otherBlock ) {
        return otherBlock.x === this.x && otherBlock.y === this.y
    }
}