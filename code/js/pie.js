let self = null;

// the interactive Pie chart
class Pie {
    constructor(tree, table) {
        self = this;
        this.tree = tree;
        this.node = tree;
        this.table = table;

        d3.select("#pie_svg").style("display", "inline");
        d3.select("#noDataAlert").style("display", "none");

        // draw the pie chart for the starting board
        this.updatePie();
    }

    // gives Pie chart a reference to the chess board
    link(board){
        this.board = board;
    }

    playedMove(move){
        if(move in this.node.children){
            console.log(move + " is legal");
            return true;
        }
        return false;
    }

    highlight(move){
        // console.log(this.groups);
        let slice = this.groups.filter(d => d.data.move === move);
        // console.log(slice.selectAll("*"));
        slice.selectAll("path").style("stroke-width", "3px");
    }

    clearHighlight(){
        this.groups.selectAll("path").style("stroke-width", "0px");
    }

    update(move) {
        if (move in this.node.children) {
            this.node = this.node.children[move];
            this.updatePie();
        }
    }

    // redraws pie based on data in node
    updatePie() {
        let width = document.querySelector('.pie').offsetWidth*0.95;
        let height = width;
        let radius = width/2 - 20;
        let svg = d3
            .select("#pie_svg")
            .attr("width", width)
            .attr("height", height)
            .attr("margin", "auto")
            .style("background-color", "white")
            .append("g")
            .attr(
                "transform",
                "translate(" + width / 2 + "," + height / 2 + ")"
            );

        let pie = d3.pie();

        let data = Object.values(this.node.children);

        let total = 0;
        data.forEach(function(item){
            total += item.n;
        });


        this.table.redrawTable(data);

        if(data.length === 0){
            // d3.select("#pie_svg").style("background-color", "red");
            d3.select("#pie_svg").style("display", "none");
            d3.select("#noDataAlert").style("display", "inline");
            return;
        }

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

        // Here we tell the pie generator which attribute
        // of the object to use for the layout
        pie.value(function (d) {
            return d.n;
        });

        let pieData = pie(data);

        let arc = d3.arc();

        // Let's tell it how large we want it
        arc.outerRadius(radius);
        // We also need to give it an inner radius...
        arc.innerRadius(0);

        let groups = svg.selectAll("g").data(pieData).enter().append("g");

        this.groups = groups;

        // Add the path, and use the arc generator to convert the pie data to
        // an SVG shape
        groups
            .append("path")
            .attr("d", arc)
            .style("fill", (d, i) => colors[i % colors.length])
            .style("stroke", "black")
            .style("stroke-width", "0px");

        groups
            .append("text")
            .text((d) => {return d.endAngle - d.startAngle > 3.14/20 ? d.data.move : ""})
            // We need to move the label to the middle of the slice. Our arc generator
            // is smart enough to know how to do this. Notice that arc.centroid gives us the center of the visible wedge.
            .attr("transform", (d) => "translate(" + arc.centroid(d) + ")")
            // Finally some extra text styling to make it look nice:
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .style("font-size", "15px")
            .style("font-weight", "bold");
        
        groups.on("click", function(event, d){
            console.log(event);
            console.log(d);
            makeMove(d.data.move);
        })

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

        groups.on("mouseout", function(event, data){
            clearHighlight();
            d3.select(".tooltip")
                .style("display", "none");
        })
    }
}
