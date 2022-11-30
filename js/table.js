let total = 0;

class Table {
    constructor() {
        this.cellSvgWidths = 145;
        this.cellSvgHeights = 20;
        this.headerCellHeight = 50;
        // stylize headers
        this.headerData = [
            { text: "Move", sorted: false, ascending: false },
            { text: "Frequency", sorted: false, ascending: false },
            { text: "Win Percentage", sorted: false, ascending: false },
        ];
        let headerRow = d3.select("#header");
        let headerCells = headerRow
            .selectAll("th")
            .data(this.headerData)
            .join("th")
            .html("");
        let headerSvgs = headerCells
            .append("svg")
            .attr("width", this.cellSvgWidths)
            .attr("height", this.headerCellHeight);
        headerSvgs
            .append("rect")
            .attr("width", this.cellSvgWidths)
            .attr("height", this.headerCellHeight)
            .style("fill", "steelblue")
            .style("opacity", 0.25);
        headerSvgs
            .append("text")
            .text((d) => d.text)
            .attr("x", (d) => {
                return this.cellSvgWidths / 2 - (d.text.length * 8) / 2;
            })
            .attr("y", this.headerCellHeight / 2);

        this.percentagesSvgWidth = 145;
        this.percentagesSvgHeight = 20;
        this.barPadding = 15;
        this.percentagesScale = d3.scaleLinear(
            [0, 100],
            [this.barPadding, this.percentagesSvgWidth - this.barPadding]
        );
        const percentageTickValues = [0, 25, 50, 75, 100];
        headerSvgs
            .filter((d) => d.text === "Win Percentage")
            .selectAll("line")
            .data(percentageTickValues)
            .join("line")
            .attr("x1", (d) => this.percentagesScale(d))
            .attr("x2", (d) => this.percentagesScale(d))
            .attr("y1", this.headerCellHeight)
            .attr("y2", this.headerCellHeight - 5)
            .style("stroke", "black");
        headerSvgs
            .filter((d) => d.text === "Win Percentage")
            .selectAll("circle")
            .data(percentageTickValues)
            .join("text")
            .attr("y", this.headerCellHeight - 8)
            .text((d) => Math.abs(d).toString())
            .attr(
                "x",
                (d) =>
                    this.percentagesScale(d) -
                    (Math.abs(d).toString().length * 8) / 2
            )
            .style("font-size", "10");

        this.frequencySvgWidth = 145;
        this.frequencySvgHeight = 20;
        this.frequencyScale = d3.scaleLinear(
            [0, 100],
            [this.barPadding, this.frequencySvgWidth - this.barPadding]
        );
        const frequencyTicks = [0, 25, 50, 75, 100];
        let frequencyHeaderSvg = headerSvgs.filter(
            (d) => d.text === "Frequency"
        );
        frequencyHeaderSvg
            .selectAll("circle")
            .data(frequencyTicks)
            .join("line")
            .attr(
                "x1",
                (d) =>
                    this.frequencyScale(d)
            )
            .attr(
                "x2",
                (d) =>
                    this.frequencyScale(d)
            )
            .attr("y1", this.headerCellHeight)
            .attr("y2", this.headerCellHeight - 5)
            .style("stroke", "black");
        frequencyHeaderSvg
            .selectAll("circle")
            .data(frequencyTicks)
            .join("text")
            .attr("y", this.headerCellHeight - 8)
            .text((d) => d.toString())
            .attr(
                "x",
                (d) =>
                    this.frequencyScale(parseFloat(d)) -
                    (d.toString().length * 8) / 2
            )
            .style("font-size", "10");

        let self = this;
        headerCells.on("click", function (d, i) {
            self.sort(self, d, i);
        });
    }

    highlight(move){
        let row = this.rows.filter((d) => d.move === move);
        row.style("background-color", "lightgray");
    }

    clearHighlighting(){
        this.rows.style("background-color", "");
    }

    sort(self, event, data) {
        if (data.sorted) {
            data.ascending = !data.ascending;
        }
        self.headerData.forEach((d) => (d.sorted = false));
        data.sorted = true;

        self.redrawTable(self.data);
    }

    redrawTable(data) {
        console.log(data);

        total = 0;

        data.forEach(function (move) {
            total += move.n;
        });

        console.log(total);

        this.data = data;
        if (this.headerData[0].sorted) {
            // move
            let compareFn = this.headerData[0].ascending
                ? function (a, b) {
                      return a.move > b.move ? 1 : -1;
                  }
                : function (a, b) {
                      return a.move < b.move ? 1 : -1;
                  };
            this.data.sort(compareFn);
        } else if (this.headerData[1].sorted) {
            // frequency
            let compareFn = this.headerData[1].ascending
                ? function (a, b) {
                      return parseFloat(a.n) - parseFloat(b.n);
                  }
                : function (a, b) {
                      return parseFloat(b.n) - parseFloat(a.n);
                  };
            this.data.sort(compareFn);
        } else if (this.headerData[2].sorted) {
            // win percentage
            let compareFn = this.headerData[2].ascending
                ? function (a, b) {
                      return (
                          parseFloat(a.wins) / parseFloat(a.n) -
                          parseFloat(b.wins) / parseFloat(b.n)
                      );
                  }
                : function (a, b) {
                      return (
                          parseFloat(b.wins) / parseFloat(b.n) -
                          parseFloat(a.wins) / parseFloat(a.n)
                      );
                  };
            this.data.sort(compareFn);
        }

        let tableBody = d3.select("#tableBody");
        let rows = tableBody.selectAll("tr").data(data).join("tr");
        this.rows = rows;

        let cells = rows
            .selectAll("td")
            .data(this.rowToCellDataTransform)
            .join("td");

        let phrases = cells.filter((d) => d.type === "move");
        phrases.text((d) => d.value).style("text-align", "center");

        let frequencyCells = cells.filter((d) => d.type === "frequency");

        frequencyCells.html("");
        frequencyCells
            .append("svg")
            .attr("width", this.frequencySvgWidth)
            .attr("height", this.frequencySvgHeight)
            .append("rect")
            .attr("x", this.frequencyScale(0))
            .style("fill", "steelblue")
            .attr("width", (d) => this.frequencyScale(d.value) - this.frequencyScale(0))
            .attr("height", this.frequencySvgHeight);

        let percentageCells = cells.filter((d) => d.type === "win percentage");

        percentageCells.html("");
        let svgs = percentageCells
            .append("svg")
            .attr("width", this.percentagesSvgWidth)
            .attr("height", this.percentagesSvgHeight)
            .append("rect")
            .attr("x", this.percentagesScale(0))
            .style("fill", "steelblue")
            .attr("width", (d) => this.frequencyScale(d.value) - this.percentagesScale(0))
            .attr("height", this.frequencySvgHeight);


        rows.on("mouseover", function(event, d){
            highlight(d.move);
        });

        rows.on("mouseout", function(event, d){
            clearHighlight();
        });

        rows.on("click", function(event, d){
            makeMove(d.move);
        })
    }

    rowToCellDataTransform(d) {
        let arr = [];
        arr.push({ type: "move", value: d.move });
        arr.push({
            type: "frequency",
            value: (100 * parseFloat(d.n)) / total,
            // category: d.category,
        });
        arr.push({
            type: "win percentage",
            value: (100 * parseFloat(d.wins)) / parseFloat(d.n),
        });

        return arr;
    }
}
