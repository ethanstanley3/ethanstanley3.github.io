let that = null;
let dropping = false;

// the interactive chess board
class Board {
    
    constructor(pie) {
        that = this;
        this.pie = pie;
        this.board = null;
        this.game = new Chess();
        this.$status = $("#status");

        // callbacks for different user inputs
        let config = {
            draggable: true,
            position: "start",
            onDragStart: this.onDragStart,
            onDragMove: this.onDragMove,
            onDrop: this.onDrop,
            onSnapEnd: this.onSnapEnd,
        };

        // use the chessboard.js to draw the board
        this.board = Chessboard("myBoard", config);

    }

    // called when a piece is picked up
    onDragStart(source, piece, position, orientation) {
        // don't do anything if the game is over
        if (that.game.game_over()) return false;

        // only move the right color pieces
        if (
            (that.game.turn() === "w" && piece.search(/^b/) !== -1) ||
            (that.game.turn() === "b" && piece.search(/^w/) !== -1)
        ) {
            return false;
        }
    }

    // update highlighting based on what move is being hovered
    onDragMove(newpos, prevpos, startpos, piece){
        clearHighlight();
        highlight(startpos + newpos);
    }
    
    // make the move
    onDrop(source, target) {
        dropping = true;
        makeMove(source + target);
    }
    
    getTurn(){
        return this.game.turn();
    }

    // tries to make the move. Returns true if successful so other components can update as well.
    moveSucceeded(move) {
        let source = move.substring(0, 2);
        let target = move.substring(2, 4);

        let played = that.pie.playedMove(move);

        if (!played) {
            dropping = false;
            return false;
        }

        let legalMove = that.game.move({
            from: source,
            to: target,
            // promote to queen by default
            promotion: "q",
        });

        if (legalMove === null) {
            dropping = false;
            return false;
        }

        if (!dropping) {
            that.board.position(that.game.fen());
        }

        dropping = false;
        return true;
    }

    // to allow special moves (castling, en passant)
    onSnapEnd() {
        that.board.position(that.game.fen());
    }

    move(theMove) {
        let aMove = that.game.move({
            from: theMove.substring(0, 2),
            to: theMove.substring(2, 4),
            promotion: "q",
        });

        that.board.move(
            theMove.substring(0, 2) + "-" + theMove.substring(2, 4)
        );

    }

    // change class css attributes to highlight specific squares
    highlightMove(move) {
        let source = $("#myBoard .square-" + move.substring(0, 2));
        let target = $("#myBoard .square-" + move.substring(2, 4));

        let whiteSquareGrey = "#a9a9a9";
        let blackSquareGrey = "#696969";

        let background = whiteSquareGrey;
        if (target.hasClass("black-3c85d")) {
            background = blackSquareGrey;
        }
        target.css("background", background);

        background = whiteSquareGrey;
        if (source.hasClass("black-3c85d")) {
            background = blackSquareGrey;
        }
        source.css("background", background);
    }

    clearHighlighting() {
        $("#myBoard .square-55d63").css("background", "");
    }
}
