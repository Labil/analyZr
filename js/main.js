var Main = function(){

};

Main.prototype.init = function(config){
	this.analyzer = new Analyzer();
	this.visualizer = new Visualizer();
	this.setupWindowResize();
	this.setupIgnoreWords();
	this.setupCheckboxes();
	this.setupStartAnalyzeEvent();
	this.setupResetButton();
};

Main.prototype.setupStartAnalyzeEvent = function(){
	var self = this;

	$("#cloudify").on('click', function(e){
		var limit = $('#maxWords').val();
		//console.log(limit);

		var data = self.analyzer.analyze("textfield", limit);

		var inputElem = $('#input');
		var w = inputElem.innerWidth();
		var h = inputElem.innerHeight() - 40; //to account for padding. Should be changed
		$('#input').css("display", "none");

		var outputElem = $('#output');
		outputElem.width(w);
		outputElem.height(h);
		outputElem.css('display', "inline-block");

		self.visualizer.init({
			data: data,
			w: w,
			h: h,
			containerID: "output",
			bgColor : "black",
			fontFamily: "monospace",
			spiralExpConst: 0.2
		});
	});
};

Main.prototype.setupCheckboxes = function(){
	var self = this;
	$('.checkbox').on('click', function(){
	    if($(this).is(':checked')){
	        $('input:checkbox').removeAttr('checked'); //clears all checkboxes
	        this.checked = true; //Adds check to this
	        //console.log($(this).val());
	        self.setDictionary($(this).val());
	    }
	});
};

Main.prototype.setupIgnoreWords = function(){
	var self = this;
	$('#ignoreBtn').on('click', function(e){
		e.preventDefault();
		var word = $('#ignore').val();
		if(word != ''){
			self.updateDictionary(word);
		}
		else console.log("No word specified");
	});
};

Main.prototype.updateDictionary = function(word){
	this.analyzer.currentDictionary.push(word);
	//console.log(this.analyzer.currentDictionary);
};

Main.prototype.setDictionary = function(language){
	if(language == "norwegian") this.analyzer.currentDictionary = this.analyzer.dictionary.norwegian;
	else if(language == "english") this.analyzer.currentDictionary = this.analyzer.dictionary.english;
};

Main.prototype.setupResetButton = function(){
	$('#reset').on('click', function(e){
		e.preventDefault();
		//quick and dirty
		$('#output').find('svg').remove();
		$('#output').css('display', "none");
		$('#input').css("display", "inline-block");

	});
};

Main.prototype.setupWindowResize = function(){
	$(window).on('resize', function(){
	      var win = $(this); //this = window
	      var info = $('#info');

	      if(win.width() <= 1200){
	      	info.hide();
	      }
	      else if(win.width() > 1200){
	      	info.show();
	      }
	});
	//Makes sure the trigger fires once right away in case the page is loaded/reloaded into a halved browser window
	$(window).trigger('resize');
};