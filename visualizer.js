var Visualizer = function(data, elemID, w, h){
	//copies data array.
	var dataset = data.slice(0);
	console.log("Dataset length: " + dataset.length);
	//Inserts the svg before the already existing button
	var svg = d3.select('#' + elemID).insert("svg", ".btn");

	svg.attr("width", w)
	    .attr("height", h);
	svg.append("rect")
	    .attr("width", "100%")
	    .attr("height", "100%")
	    .attr("fill", "black");

	var fill = d3.scale.category20();

	var minFreq = d3.min(dataset, function(d) { return d.frequency; });
	var maxFreq = d3.max(dataset, function(d) { return d.frequency; });
	var fontRangeMin = Math.ceil(minFreq * (maxFreq/minFreq));
	var fontRangeMax = Math.ceil(maxFreq * minFreq * minFreq * minFreq);
	//if(fontRangeMin <= 20) fontRangeMin = 20;
	console.log("frangemin: " + fontRangeMin + " , fontRangeMax:" + fontRangeMax);


	var fontScale = d3.scale.linear()
	    .domain([1, d3.max(dataset, function(d) { return d.frequency; })])
	    .range([fontRangeMin, fontRangeMax]);

	var placedWords = [];
	var offsetCenterX = 50;
	var centerPos = {
		x : w/2 - offsetCenterX,
		y : h/2
	};

	var checkFit = function(testBB){
		var bb;
		var fit = true;
		for(var i = 0; i < placedWords.length; i++){

			bb = placedWords[i].node().getBBox();

			if(testBB.x <= 30 || testBB.x >= w - 120 ||
				testBB.y <= 30 || testBB.y >= h - 60 ||
				checkIntersection(testBB, bb)){
				fit = false; 
				break;
			}
		}
		return fit;
	};

	var checkIntersection = function(a, b){
		//padding
		var pX = 10;
		var pY = 10;
		return (Math.abs(a.x - b.x + pX) * 2 < (a.width + b.width - pX)) &&
			   (Math.abs(a.y - b.y +pY) * 2 < (a.height + b.height -pY));
	};

	for(var i = 0; i < dataset.length; i++){
		var word = dataset[i].word;
		var freq = dataset[i].frequency;
		var fontSize = fontScale(freq);

		var text = svg.append("text")
			.attr("x", centerPos.x)
			.attr("y", centerPos.y)
			.text(word)
			.attr("font-family", "Comic Sans MS")
			.attr("font-size", fontSize)
			.attr("fill", fill(i));

		for(var t = 0.1; t <40; t += 0.1){
			if(checkFit(text.node().getBBox())){
				placedWords.push(text);
				console.log("Text fit!");
				break;
			}
			else{
				text.attr("x", Math.floor(centerPos.x + genX(t)))
					.attr("y", Math.floor(centerPos.y + genY(t)));
			}
		}
	}

};

var genX = function(t){
	return 6 * t * Math.cos(t);
};

var genY = function(t){
	return 4 * t * Math.sin(t);
};

var getRandomNumber = function(min, max){
    var rand = Math.floor(Math.random() * (max - min + 1) + min);
    //console.log("random: " + rand);
    return rand;
};