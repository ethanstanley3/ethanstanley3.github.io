/*
Driver file for entire visualization.

Creates an instance of each component (chess board, pie chart, table).
Contains code to link the individual components.
Loads different datasets and reloads components.
*/

let table;
let pie;
let board;

// highlight move in all components
function highlight(move){
    board.highlightMove(move);
    table.highlight(move);
    pie.highlight(move);
}

// remove highlighting everywhere
function clearHighlight(){
    board.clearHighlighting();
    table.clearHighlighting();
    pie.clearHighlight();
}

// make move on all components
function makeMove(move){
    clearHighlight();

    if(board.moveSucceeded(move)){
        pie.update(move);
    }

    updateHeader();
}

// change header to reflect whose turn it is
function updateHeader(){
    const turn = board.getTurn();
    if(turn === 'b'){
        d3.select("nav")
            .style("background-color", "black")
            .style("color", "white")
            .style("border-color", "white")
            .select(".turn")
            .html("Black to move!");
        d3.selectAll("a")
            .style("color", "white");
    }
    else if(turn === 'w'){
        d3.select("nav")
            .style("background-color", "white")
            .style("color", "black")
            .style("border-color", "black")
            .select(".turn")
            .html("White to move!");
        d3.selectAll("a")
            .style("color", "black");
    }
}

// load a dataset and reload all components of the visualization
function loadDataset(path){
    fetch("./data/processed/" + path)
    .then((response) => response.json())
    .then(function (tree) {
        table = new Table();
        pie = new Pie(tree, table);
        board = new Board(pie);
        pie.link(board); // give the pie chart access to the board
        updateHeader();
    });
}

// default dataset
loadDataset("500k-nofilter.json");

// bind dropdown menu to loadDataset
document.querySelector("#datasets").oninput = function() {
    loadDataset(document.querySelector("#datasets").value)
}

// reload current dataset if "Reload" button is pressed
let button = document.querySelector("#reloadButton");
button.addEventListener('click', function(){
    loadDataset(document.querySelector("#datasets").value)
});