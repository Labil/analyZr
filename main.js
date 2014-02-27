$(document).ready(function() {
	var analyzer = new Analyzer();
	var visualizer;

	var btn = $(".btn").on('click', function(e){
		var data = analyzer.analyze("textfield", "norwegian");

		var inputElem = $('#input');
		var w = inputElem.innerWidth();
		var h = inputElem.innerHeight() - 40; //to account for padding. Should be changed
		console.log("elem w: " + w + " , elem h: " + h);
		$('#input').css("display", "none");

		var outputElem = $('#output');
		outputElem.width(w);
		outputElem.height(h);
		outputElem.css('display', "inline");

		visualizer = new Visualizer(data, "output", w, h);
	});

});