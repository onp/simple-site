(function (graphVis, $, undefined) {
    "use strict";

    graphVis.name = "Graph";
    
    var start = function () {
        var link = graphVis.link;
        var label = graphVis.label;
        var node  = graphVis.node;
    
        link = link.data(graph.links(), function(d) { return d.source.id + "-" + d.target.id; });
        link.enter()
            .insert("line", ".node")
            .attr("class", function(d) { return "link " + d.dm; })
            .attr("marker-end","url(#arrow-head)");
        link.exit().remove();

        node = node.data(graph.nodes(), function(d) { return d.id;});
        node.enter()
            .append("circle")
            .attr("class", function(d) { return "node st" + d.id; })
            .attr("r", 10)
            .call(graph.drag)
            .on("mouseover",function(){
                d3.selectAll("circle."+this.classList[1])
                    .style("fill","paleVioletRed");
                d3.select(this)
                    .style("stroke-width","2px")
            })
            .on("mouseout",function(){
                d3.selectAll("circle."+this.classList[1])
                    .style("stroke-width","1.5px")
                    .style("fill","lightBlue");
            });
        node.exit().remove();
        
        label = label.data(graph.nodes(), function(d) { return d.id;});
        label.enter()
            .append("text")
            .attr("class", "label")
            .attr("dy",3)
            .text(function(d){return d.dat.ordered});
        label.exit().remove();
        
        d3.selectAll("div.state")
            .on("mouseover",function(){
                d3.selectAll("circle."+this.classList[1])
                    .style("fill","paleVioletRed");
            })
            .on("mouseout",function(){
                d3.selectAll("circle."+this.classList[1])
                    .style("fill","lightBlue");
            });


        graph.start();
    };

    var tick = function () {
        graphVis.node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })

        graphVis.link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
          
        graphVis.label.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    };
    
    graphVis.loadVis = function(conflict,container,selfCalled){
        graph.size([container.style("width").slice(0, -2), container.style("height").slice(0, -2) - 80]);
        
        graphVis.node = container.selectAll(".node"),
        graphVis.link = container.selectAll(".link"),
        graphVis.label = container.selectAll(".label");
        
        nodes.length=0;
        links.length=0;
        
        $.extend(nodes,conflict.data.nodes);
        
        $.each(conflict.data.nodes, function(i,a){
			Array.prototype.push.apply(links,a.reachable);
		});
        
        start();
        
        if (selfCalled === undefined){
            graphVis.loadVis(conflict, container, true);    //I have no idea why this is necessary.
        }
    };
    
    graphVis.visConfig = function(){
        return $("<div></div>")
    };
    
    var nodes = [],
        links = [];
        
    var graph = d3.layout.force()
        .nodes(nodes)
        .links(links)
        .charge(-1000)
        .linkDistance(80)
        .on("tick",tick)
    

}(window.graphVis = window.graphVis || {}, jQuery));