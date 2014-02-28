$(document).ready(function() {
	var analyzer = new Analyzer();
	var visualizer = new Visualizer();

	var btn = $(".btn").on('click', function(e){
		var limit = $('#maxWords').val();
		console.log(limit);

		var data = analyzer.analyze("textfield", "english", limit);

		var inputElem = $('#input');
		var w = inputElem.innerWidth();
		var h = inputElem.innerHeight() - 40; //to account for padding. Should be changed
		$('#input').css("display", "none");

		var outputElem = $('#output');
		outputElem.width(w);
		outputElem.height(h);
		outputElem.css('display', "inline");

		

		visualizer.init({
			data: data,
			w: w,
			h: h,
			containerID: "output",
			bgColor : "black",
			fontFamily: "monospace",
			spiralExpConst: 0.2
		});
	});

});