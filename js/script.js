let table;
let pie;
let board;

function highlight(move){
    board.highlightMove(move);
    table.highlight(move);
    pie.highlight(move);
}

function clearHighlight(){
    board.clearHighlighting();
    table.clearHighlighting();
    pie.clearHighlight();
}

function makeMove(move){
    clearHighlight();

    if(board.moveSucceeded(move)){
        pie.update(move);
    }

    updateHeader();
}

function updateHeader(){
    const turn = board.getTurn();
    if(turn === 'b'){
        d3.select("nav")
            .style("background-color", "black")
            .style("color", "white")
            .style("border-color", "white")
            .select(".turn")
            .html("Black to move!");
    }
    else if(turn === 'w'){
        d3.select("nav")
            .style("background-color", "white")
            .style("color", "black")
            .style("border-color", "black")
            .select(".turn")
            .html("White to move!");
    }
}

function loadDataset(path){
    fetch("./data/processed/" + path)
    .then((response) => response.json())
    .then(function (tree) {
        table = new Table();
        pie = new Pie(tree, table);
        board = new Board(pie);
        pie.link(board); // give the pie chart access to the board
    });
}

loadDataset("500k-nofilter.json");

document.querySelector("#datasets").oninput = function() {
    loadDataset(document.querySelector("#datasets").value)
}

let button = document.querySelector("#reloadButton");
button.addEventListener('click', function(){
    loadDataset(document.querySelector("#datasets").value)
});