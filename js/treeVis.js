(function (treeVis, $, undefined) {
    "use strict";

    treeVis.name = "Tree";
    treeVis.defaultDepth = 3;
    var tree = d3.layout.tree();

    var buildTree = function (sourceNode, dm, height) {
        //recursively builds a tree of the requested height from the given source node.
        //dm specifies the decision maker who made the move to this node, and so
        //  cannot move again immediately.
        var thisNode = {};
        thisNode.dat = sourceNode;
        thisNode.height = height;
        thisNode.dm = dm;
        if (height > 0) {
            thisNode.children = $.map(sourceNode.reachable, function (a) {
                if (a.dm !== dm) {
                    return buildTree(a.target, a.dm, height-1);
                }
            });
        } else {
            thisNode.children = [];
        }
        return thisNode;
    };

    var diagonal = d3.svg.diagonal()        //used in making lines in the tree layout.
        .projection(function (d) {return [d.x, d.y+20]; });

    var changeRoot = function (newRoot) {
        var root = buildTree(newRoot, null, treeVis.defaultDepth);

		var nodes = tree.nodes(root),	//insert structure into d3 tree, store in nodes
			links = tree.links(nodes);  //store calculated link data in links

        var node = treeVis.vis.selectAll(".node"),	//establish d3 selection variables
            link = treeVis.vis.selectAll(".link"),
            label = treeVis.vis.selectAll(".label");

		link = link.data(links);	//update data attached to link selection
		link.exit().remove();
		link.enter().insert("path", "circle");
		link.attr("d", diagonal)
			.attr("class", function (d) {return "link " + d.target.dm; });

		node = node.data(nodes);    //update data attached to node selection
		node.exit().remove();
		node.enter().insert("circle", "text")
			.attr("r", 10)
			.on("mouseover", function () {
				d3.selectAll("circle." + this.classList[1])
					.style("fill", "paleVioletRed");
				d3.select(this)
					.style("stroke-width", "2px");
			})
			.on("mouseout", function () {
				d3.selectAll("circle." + this.classList[1])
					.style("stroke-width", "1.5px")
					.style("fill", "lightBlue");
			})
			.on("click", function (d) {
				d3.selectAll("circle." + this.classList[1])
					.style("fill", "lightBlue");
				changeRoot(d.dat);
			});

		node.attr("class", function (d) {return "node st" + d.dat.id; })
			.attr("cx", function (d) {return d.x; })
			.attr("cy", function (d) {return d.y + 20; });

		label = label.data(nodes);    //update data attached to label selection
		label.exit().remove();
		label.enter()
			.append("text")
			.attr("class", "label")
			.attr("dy", 3);
		label.text(function (d) {return d.dat.ordered; })
			.attr("transform", function (d) {
				return "translate(" + (d.x) + "," + (d.y + 20) + ")";
			});

    };

    treeVis.loadVis = function (conflict, container) {
        //Loads the visualization into the container.
        treeVis.vis = container;
        tree.size([container.style("width").slice(0, -2), container.style("height").slice(0, -2) - 80]);
        changeRoot(conflict.data.nodes[0]);
        
        
        
    };


}(window.treeVis = window.treeVis || {}, jQuery));