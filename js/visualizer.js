'use strict';

var conflicts = [
	{"name":"Prisoners","url":"json/PrisonersVis.json"},
	{"name":"Garrison","url":"json/GarrisonVis.json"},
	{"name":"SyriaIraq","url":"json/SyriaIraqVis.json"}
];

var visualizations = [treeVis,graphVis];

var visualization = visualizations[0];
var conflict = conflicts[0];

var loadConflict = function () {
    if (conflict.data === undefined) {
        $.getJSON(conflict.url, function (data) {
            //this conflict unpacker is still quite incomplete.  Currently only deals with reachability.
            for(var i = 0; i < data.nodes.length; i++){
                var node = data.nodes[i];
                node.reachable = $.map(node.reachable,
                        function (link) {
                            link.source = node;
                            link.target = data.nodes[link.target];
                            return(link)
                        }
                )
            };
            conflict.data = data;
            visualization.loadVis(conflict,d3.select("svg#visualization-container"));
            changeLegend();
        });
        return false;
    }else{
        visualization.loadVis(conflict,d3.select("svg#visualization-container"));
        return true;
    }
};

var changeLegend = function () {
    $("div#menu-right table").html("");
    
    var th1 = "<th></th><th></th>";
    
    for (var i = 0; i <conflict.data.decisionMakers.length; i++){
        var dm = conflict.data.decisionMakers[i]
        th1 += "<th colspan='"+ dm.options.length +"'>" + dm.name + "</th>"
    }
    th1 = "<tr>" + th1 + "</tr>";
    $(th1).appendTo("div#menu-right table");
    
    var th2 = "<th><div>Ordered</div></th><th><div>Decimal</div></th>";
    for (var i=0; i < conflict.data.options.length; i++){
        th2 += "<th class='option opt" + i + "'><div>" + conflict.data.options[i].name + "</div></th>";
    };
    th2 = "<tr>" + th2 + "</tr>";
    $(th2).appendTo("div#menu-right table");
    
    var headerHeight = 0;
    $("div#menu-right table th div").each(function () {
        $(this).css("display","inline");
        if ($(this).outerWidth() > headerHeight){
            headerHeight = $(this).outerWidth();
        };
        $(this).css("display","block");
    });
    $("div#menu-right table th div").parent().height(headerHeight);
    
    for (var i =0; i < conflict.data.nodes.length; i++){
        var node = conflict.data.nodes[i]
        var ynElem = "";
        for (var j =0; j<node.state.length; j++){
            ynElem += "<td class='option opt" + j + "'>" + node.state[j] + "</td>";
        }
        var tr = "<tr class='state st"+ node.id + "'><td>" + node.ordered + "</td><td>" + node.decimal + "</td>" + ynElem + "</tr>";
        $(tr).appendTo("div#menu-right table");
    }
    
    var tableWidth = $("div#menu-right table").width();
    $("div#menu-right").width(tableWidth+40)
    var styleSheet = document.styleSheets[1];  //this is easily breakable.
    for (var i = 0; i<styleSheet.cssRules.length; i++){
        var rule = styleSheet.cssRules[i];
        if (rule.selectorText == "div#menu-right"){
            rule.style.right = String(-20-tableWidth) + "px";
        }
    }
    
    $(".option").mouseover(function () {
        $("."+this.classList[1]).css("background-color","paleVioletRed");
    }).mouseout(function (){
        $("."+this.classList[1]).css("background-color","transparent");
    })
    
    $(".state").mouseover(function () {
        $("."+this.classList[1]).css("background-color","paleVioletRed")
        d3.selectAll("." + this.classList[1])
            .style("fill", "paleVioletRed");
    }).mouseout(function (){
        $("."+this.classList[1]).css("background-color","transparent")
        d3.selectAll("." + this.classList[1])
            .style("fill", "lightBlue");
    }).click(function(){
    
    })
    
    
}


$(function () {
    
    $.each(conflicts,function (i, conf) {
        $("<li>" + conf.name + "</li>")
            .click(function () {
                conflict = conf;
                if (loadConflict()){
                    changeLegend();
                };
                $(this).siblings().removeClass('selected');
                $(this).addClass('selected');
            }).appendTo("ul#conflict-list")
    });
    
    $.each(visualizations, function (i, vis) {
        $("<li>" + vis.name + "</li>")
            .click(function () {
                visualization = vis;
                loadConflict(conflict);
                $(this).siblings().removeClass('selected');
                $(this).addClass('selected');
            }).appendTo("ul#visualization-list")
    });
    
    $( window ).resize(function() {
        loadConflict();
    });
    
    $("ul#conflict-list li").first().click();
    $("ul#visualization-list li").first().click();
})