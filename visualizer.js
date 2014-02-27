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
	if(fontRangeMin <= 10) fontRangeMin = 10;
	else if(fontRangeMin >= 17) fontRangeMin = 17;
	if(fontRangeMax >= 40) fontRangeMax = 40;
	else if(fontRangeMax <= 30) fontRangeMax = 30;
	if(dataset.length < 20){
		fontRangeMin = 20;
		fontRangeMax = 60;
	}
	console.log("frangemin: " + fontRangeMin + " , fontRangeMax:" + fontRangeMax);


	var fontScale = d3.scale.linear()
	    .domain([1, d3.max(dataset, function(d) { return d.frequency; })])
	    .range([fontRangeMin, fontRangeMax]);

	var placedWords = [];
	var centerPos = {
		x : w/2,
		y : h/2
	};

	var a = 0.2;
	var genX = function(t){
		return a * t * Math.cos(t);
	};

	var genY = function(t){
		return a * t * Math.sin(t);
	};

	var checkFit = function(testBB){
		var bb;
		var fit = true;
		for(var i = 0; i < placedWords.length; i++){

			bb = placedWords[i].node().getBBox();

			if((testBB.x + testBB.width > w - 25) || (testBB.x < 0 + 20) ||
				(testBB.y + testBB.height > h - 20) || (testBB.y < 0 + 20) ||
				checkIntersection(testBB, bb)){
				fit = false; 
				break;
			}
		}
		return fit;
	};

	var checkIntersection = function(a, b){
		return (Math.abs(a.x - b.x) * 1.2 < (a.width + b.width)) &&
			   (Math.abs(a.y - b.y) * 2.4 < (a.height + b.height));

	};
	var firstTime = true;
	for(var i = 0; i < dataset.length; i++){
		var word = dataset[i].word;
		var freq = dataset[i].frequency;
		var fontSize = fontScale(freq);

		if(firstTime){
			centerPos.x -= 50;
			firstTime = false;
			fontSize += 10;
		}
		else centerPos.x = w/2;
		
		var text = svg.append("text")
			.attr("x", centerPos.x)
			.attr("y", centerPos.y)
			.text(word)
			.attr("font-family", "Comic Sans MS")
			.attr("font-size", fontSize)
			.attr("fill", fill(i));

		for(var t = 0; t < 1200; t += 0.5){
			if(checkFit(text.node().getBBox())){
				placedWords.push(text);
				console.log("FIT");
				break;
			}
			else{
				text.attr("x", Math.floor(centerPos.x + genX(t) + getRandomNumber(-60,60)))
					.attr("y", Math.floor(centerPos.y + genY(t)) + getRandomNumber(-20, 20));
			}
		}
	}

};
var getRandomNumber = function(min, max){
    var rand = Math.floor(Math.random() * (max - min + 1) + min);
    //console.log("random: " + rand);
    return rand;
};