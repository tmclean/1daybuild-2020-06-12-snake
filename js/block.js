define( function() {
    return function Block(x, y, color) {
        return {
            x: x,
            y: y,
            color: color,

            move: function (grid, move) {
                this.x += move.xOffset
                this.y += move.yOffset
            },

            clone: function () {
                return new Block(this.x, this.y, color)
            },

            collision: function (otherBlock) {
                return otherBlock.x === this.x && otherBlock.y === this.y
            }
        }
    }
})