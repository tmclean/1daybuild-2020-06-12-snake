define( ['block', 'moves'], function( Block, Moves ) {
    return function Snake( x, y, color, direction, grid ){
        return {

            grid: grid,
            direction: direction,
            alive: true,
            segments: [new Block(x, y, color)],

            changeDirection: function (newDirection) {
                if (newDirection !== this.direction.opposite) {
                    this.direction = newDirection
                }
            },

            // Move the snake 1 block in the current direction. If grow
            // is true, make the make 1 block longer in the process
            move: function (grow) {
                this.alive = !this.bitSelf()

                if (this.alive) {
                    if (this.direction !== Moves.STILL) {
                        // Make a new head 1 block in the current direction
                        // This makes the snake 1 block longer
                        let nextHead = this.getNextHead()
                        this.segments.push(nextHead)

                        //if( false ){
                        if (!grow) {
                            // If we are not growing, remove the tail block
                            let oldSeg = this.segments.shift()
                            this.grid.clearBlock(oldSeg)
                        }

                    }
                }
                for (let i = 0; i < this.segments.length; i++) {
                    this.grid.drawBlock(this.segments[i], this.alive ? this.segments[i].color : "gray")
                }
            },

            bitSelf: function () {
                if (this.segments.length == 1) {
                    return false
                }

                // Check the head against all other body segments, if it overlaps
                // any of them, we bit ourself
                let head = this.getHead()
                for (let i = 0; i < this.segments.length; i++) {
                    let seg = this.segments[i]
                    if (seg !== head && this.collision(seg)) {
                        return true
                    }
                }
                return false
            },

            // Generates a new block 1 block in the direction of the current head
            getNextHead: function () {
                let head = this.getHead().clone()
                head.move(this.grid, this.direction)
                return head
            },

            // Get a reference to the current head
            getHead: function () {
                return this.segments[this.segments.length - 1]
            },

            // Check if the head overlaps a given block
            collision: function (block) {
                let head = this.getHead()
                return head.collision(block)
            }
        }
    }
})