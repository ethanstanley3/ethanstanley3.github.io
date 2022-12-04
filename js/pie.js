let self = null;

// the interactive Pie chart
class Pie {
    // creates a new pie
    constructor(tree, table) {
        self = this;
        this.tree = tree;
        this.node = tree;
        this.table = table;

        d3.select("#pie_svg").style("display", "inline");
        d3.select("#noDataAlert").style("display", "none");

        // set up the svg
        let width = document.querySelector('.pie').offsetWidth*0.92;
        let height = width;
        this.radius = width/2 - 20;
        d3.select("#pie_svg")
            .attr("width", width)
            .attr("height", height)
            .style("background-color", "white")
            .select("g")
            .attr(
                "transform",
                "translate(" + width / 2 + "," + height / 2 + ")"
            );

        // draw the pie chart for the starting board
        this.updatePie();
    }

    // gives Pie chart a reference to the chess board
    link(board){
        this.board = board;
    }

    // is the inputted move in the database
    playedMove(move){
        return move in this.node.children;
    }

    // highlight a wedge of the pie chart
    highlight(move){
        let slice = this.groups.filter(d => d.data.move === move);
        slice.selectAll("path").style("stroke-width", "4px");
    }

    // clear all highlighted wedges
    clearHighlight(){
        this.groups.selectAll("path").style("stroke-width", "0px");
    }

    // update the pie if its a valid move
    update(move) {
        if (move in this.node.children) {
            this.node = this.node.children[move];
            this.updatePie();
        }
    }

    // redraws pie based on data in the current node of the game tree
    updatePie() {

        let svg = d3.select("#pie_svg").select("g");
        // clear the old pie
        svg.html("");
        
        let pie = d3.pie();

        // these are the moves played from this position
        let data = Object.values(this.node.children);

        // compute total number of moves (for percentage calculations)
        let total = 0;
        data.forEach(function(item){
            total += item.n;
        });

        // update table
        this.table.redrawTable(data);

        // no moves in the database, notify the user
        if(data.length === 0){
            d3.select("#pie_svg").style("display", "none");
            d3.select("#noDataAlert").style("display", "inline");
            d3.select(".tooltip").style("display", "none");
            return;
        }

        // pie wedge colors
        const colors = [
            "#7fc97f",
            "#beaed4",
            "#fdc086",
            "#ffff99",
            "#386cb0",
            "#f0027f",
            "#bf5b17",
            "#666666",
        ];

        // sizing pie slices based off of move frequency
        pie.value(function (d) {
            return d.n;
        });

        let pieData = pie(data);

        let arc = d3.arc();

        arc.outerRadius(this.radius);
        // donut chart or die
        arc.innerRadius(30);

        // when hovering over a wedge, cursor should indicate that they can be clicked
        let groups = svg.selectAll("g").data(pieData).enter().append("g").attr("cursor", "pointer");

        this.groups = groups;

        // draw the pie
        groups
            .append("path")
            .attr("d", arc)
            .style("fill", (d, i) => colors[i % colors.length])
            .style("stroke", "black")
            .style("stroke-width", "0px");

        // center pie labels in sufficiently large wedges
        groups
            .append("text")
            .text((d) => {return d.endAngle - d.startAngle > 3.14/20 ? d.data.move : ""})
            .attr("transform", (d) => "translate(" + arc.centroid(d) + ")")
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .style("font-size", "15px")
            .style("font-weight", "bold");
        
        // link click to other components
        groups.on("click", function(event, d){
            makeMove(d.data.move);
        })

        // show tooltip and highlighting when hovering
        groups.on("mouseover mousemove", function(event, d){
            highlight(d.data.move);
            let tooltip = d3.select(".tooltip");
            tooltip
                .style("left", Math.floor(event.clientX + 20).toString() + "px")
                .style("top", Math.floor(event.clientY - 32).toString() + "px")
                .style("display", "inline");
            tooltip.select(".move").html("Move: " + d.data.move.substring(0, 2) + " to " + d.data.move.substring(2, 4));
            tooltip.select(".usageRate").html("Usage rate: " + (100*parseFloat(d.data.n)/total).toFixed(2) + "%");
            tooltip.select(".winRate").html("Win rate: " + (100*parseFloat(d.data.wins)/parseFloat(d.data.n)).toFixed(2) + "%");
        })

        // hide tooltip and clear highlighting
        groups.on("mouseout", function(event, data){
            clearHighlight();
            d3.select(".tooltip")
                .style("display", "none");
        })
    }
}
