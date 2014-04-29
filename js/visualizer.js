var Visualizer = function(){
};

Visualizer.prototype.init = function(config){
	this.dataset = config.data.slice(0);
	//console.log("Dataset length: " + this.dataset.length);
	this.containerID = config.containerID;
	this.w = config.w;
	this.h = config.h;
	this.bgColor = config.bgColor;
	this.centerPos = {};
	this.centerPos.x = this.w / 2;
	this.centerPos.y = this.h / 2;
	this.fontFamily = config.fontFamily;
	this.setFontRange();

	this.fill = d3.scale.category20();

    this.fontScale = d3.scale.linear()
        .domain([1, d3.max(this.dataset, function(d) { return d.frequency; })])
	    .range([this.fontRangeMin, this.fontRangeMax]);

	this.placedWords = [];
	this.spiralExpConst = config.spiralExpConst; //a

	this.setupSVG(this.containerID);

	this.visualize(function(){
		//console.log("Finished visalizing.");
	});
};
//This function is a bit messy
Visualizer.prototype.setFontRange = function(){
	var minFreq = d3.min(this.dataset, function(d) { return d.frequency; });
	var maxFreq = d3.max(this.dataset, function(d) { return d.frequency; });
	this.fontRangeMin = Math.ceil(minFreq * (maxFreq/minFreq));
	this.fontRangeMax = Math.ceil(maxFreq * minFreq * minFreq * minFreq);
	if(this.fontRangeMin <= 10) this.fontRangeMin = 10;
	else if(this.fontRangeMin >= 17) this.fontRangeMin = 17;
	if(this.fontRangeMax >= 40) this.fontRangeMax = 40;
	else if(this.fontRangeMax <= 30) this.fontRangeMax = 30;

	if(this.dataset.length > 25){
		this.fontRangeMin -= 3;
		this.fontRangeMax -=5;
	}
};

Visualizer.prototype.genX = function(t){
	return this.spiralExpConst * t * Math.cos(t);
};
Visualizer.prototype.genY = function(t){
	return this.spiralExpConst * t * Math.sin(t);
};

Visualizer.prototype.setupSVG = function(elemID){
	this.svg = d3.select('#' + elemID).insert("svg", ":first-child");
	this.svg.attr("width", this.w)
	    .attr("height", this.h);
	this.svg.append("rect")
	    .attr("width", "100%")
	    .attr("height", "100%")
	    .attr("fill", this.bgColor);
};

Visualizer.prototype.visualize = function(callback){

	var firstTime = true;
	var word, freq, fontSize;
	for(var i = 0; i < this.dataset.length; i++){
		word = this.dataset[i].word; 
		freq = this.dataset[i].frequency;
		fontSize = this.fontScale(freq);
		
		var text = this.svg.append("text")
			.attr("x", this.centerPos.x)
			.attr("y", this.centerPos.y)
			.text(word)
			.attr("font-family", this.fontFamily)
			.attr("font-size", fontSize)
			.attr("fill", this.fill(i));

		for(var t = 0+i*30; t < 1200; t += 1){
			if(firstTime){
				fontSize += 3;
				var textW = text.node().getBBox().width;
				text.attr("x", this.w/2 - textW/2);
				text.attr("font-size", fontSize);
				firstTime = false;
			}
			if(this.checkFit(text.node().getBBox())){
				this.placedWords.push(text);
				//console.log("FIT");
				break;
			}
			else{
				var noiseX = this.getRandomNumber(-this.w/4, this.w/4);
				text.attr("x", Math.floor(this.centerPos.x + this.genX(t) + noiseX))
					.attr("y", Math.floor(this.centerPos.y + this.genY(t)));
			}
		}
	}
	callback();
};

Visualizer.prototype.checkFit = function(testBB){
	var bb,
		fit = true;
	for(var i = 0; i < this.placedWords.length; i++){

		bb = this.placedWords[i].node().getBBox();

		if((testBB.x + testBB.width > this.w - 25) || (testBB.x < 0 + 20) ||
			(testBB.y + testBB.height > this.h - 15) || (testBB.y < 0 + 15) ||
			this.checkIntersection(testBB, bb)){
			fit = false; 
			break;
		}
	}
	return fit;
};

Visualizer.prototype.checkIntersection = function(a, b){
	return (Math.abs(a.x - b.x) * 1.3 < (a.width + b.width)) &&
		   (Math.abs(a.y - b.y) * 2.4 < (a.height + b.height));
};

Visualizer.prototype.getRandomNumber = function(min, max){
    var rand = Math.floor(Math.random() * (max - min + 1) + min);
    return rand;
};