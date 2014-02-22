$(document).ready(function() {
	var analyzer = new Analyzer();

	var btn = $(".btn").on('click', function(e){
		console.log("Button clicked");
		analyzer.analyze("textfield", "english");
	});

});