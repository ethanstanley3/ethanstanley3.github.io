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
        this.$fen = $("#fen");
        this.$pgn = $("#pgn");

        let config = {
            draggable: true,
            position: "start",
            onDragStart: this.onDragStart,
            onDrop: this.onDrop,
            onSnapEnd: this.onSnapEnd,
        };
        this.board = Chessboard("myBoard", config);

        this.updateStatus();
    }

    onDragStart(source, piece, position, orientation) {
        // do not pick up pieces if the game is over
        if (that.game.game_over()) return false;

        // only pick up pieces for the side to move
        if (
            (that.game.turn() === "w" && piece.search(/^b/) !== -1) ||
            (that.game.turn() === "b" && piece.search(/^w/) !== -1)
        ) {
            return false;
        }
    }

    getTurn(){
        return this.game.turn();
    }

    onDrop(source, target) {
        dropping = true;
        makeMove(source + target);
    }

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
            promotion: "q",
        });

        if (legalMove === null) {
            dropping = false;
            return false;
        }

        // that.pie.update(move);
        that.updateStatus();
        if (!dropping) {
            that.board.position(that.game.fen());
        }

        dropping = false;
        return true;
    }

    // update the board position after the piece snap
    // for castling, en passant, pawn promotion
    onSnapEnd() {
        that.board.position(that.game.fen());
    }

    updateStatus() {
        let status = "";

        let moveColor = "White";
        if (that.game.turn() === "b") {
            moveColor = "Black";
        }

        // checkmate?
        if (that.game.in_checkmate()) {
            status = "Game over, " + moveColor + " is in checkmate.";
        }

        // draw?
        else if (that.game.in_draw()) {
            status = "Game over, drawn position";
        }

        // game still on
        else {
            status = moveColor + " to move";

            // check?
            if (that.game.in_check()) {
                status += ", " + moveColor + " is in check";
            }
        }

        that.$status.html(status);
        that.$fen.html(that.game.fen());
        that.$pgn.html(that.game.pgn());
    }

    move(theMove) {
        console.log("board received" + theMove.substring(2, 4));

        let aMove = that.game.move({
            from: theMove.substring(0, 2),
            to: theMove.substring(2, 4),
            promotion: "q",
        });

        that.board.move(
            theMove.substring(0, 2) + "-" + theMove.substring(2, 4)
        );

        that.updateStatus();
    }

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
