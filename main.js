$(document).ready(function() {
	var analyzer = new Analyzer();
	var visualizer;

	var btn = $(".btn").on('click', function(e){
		console.log("Button clicked");
		var data = analyzer.analyze("textfield", "english");
		var inputElem = $('#input');
		var w = inputElem.innerWidth();
		var h = inputElem.innerHeight();
		console.log("elem w: " + w + " , elem h: " + h);
		$('#input').css("display", "none");

		var outputElem = $('#output');
		outputElem.width(w);
		outputElem.height(h);
		outputElem.css('display', "inline");

		visualizer = new Visualizer(data, "output", w, h);
	});

});