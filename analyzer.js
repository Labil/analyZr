var Analyzer = function(){
	this.words = [];	
	this.ignore = [];
	this.wordCount = 0;
	this.frequency = {};
	this.minFrequency = 1;
	this.jsonResult = [];
};

Analyzer.prototype.analyze = function(elemID, language, maxWords){
	this.words = this.getWords(elemID);
	this.ignore = this.initIgnore(language);
	this.words = this.filterIgnore();
	this.wordCount = this.words.length;
	this.getFrequency(); //creates and object this.frequency
	//TODO sort by freqency
	//this.minFrequency = this.scaleMinFrequency(this.wordCount);
	this.makeJSON(); //Makes jsonResult

	this.jsonResult = this.sortWordsByFrequency(this.jsonResult);
	if(this.jsonResult.length > 40)
		this.jsonResult.length = maxWords || 40;
	return this.jsonResult;

}
//Fetches the words the user input in the input textfield
Analyzer.prototype.getWords = function(elemID){
	//trim() removes whitespace from both sides of string 
	//.sort() at the end for sorting in alphabetical order
	var source = $('#' + elemID).val().toLowerCase().trim()
								.replace(/[,;.!"]/g,'').replace(/\d+/g,'')
								.split(/[\s\/]+/g);
	return source.slice(0);
};

Analyzer.prototype.initIgnore = function(language){
	var dictionary = [];
	if(language == "norwegian") dictionary = Dictionary.norwegian;
	else if(language == "english") dictionary = Dictionary.english;

	return dictionary.slice(0);
};

Analyzer.prototype.filterIgnore = function(){
	var filtered = [];
	for(var i = 0; i < this.words.length; i++){
		var found = false;
		for(var j = 0; j < this.ignore.length; j++){
			if(this.ignore[j] == this.words[i]){
				found = true;
			}
		}
		if(!found)
			filtered.push(this.words[i]);	
	}
	
	/*var filtered = this.words.filter(function(val){
		for(var i = 0; i < this.ignore.length; i++){
			if(this.ignore[i] == val) return false;
		}
		return true;
	});*/
	return filtered.slice(0);
};

Analyzer.prototype.getFrequency = function(){
	for(var i = 0; i < this.wordCount; i++){
		var w = this.words[i];
		this.frequency[w] = this.frequency[w] || 0; //If current word hasen't been counted yet
		this.frequency[w]++;
	}
};

//0.005 gives a fairy nice balance, but maybe do some more tests
Analyzer.prototype.scaleMinFrequency = function(numWords){
	console.log("Number of words is: " + numWords);

	var	num = Math.round(numWords * 0.001) + 1;
	console.log("Min freq: " + num);
	return num;
};

Analyzer.prototype.sortWordsByFrequency = function(arr){

	var sortByFrequency = function(a, b){
		var aFreq = a.frequency;
		var bFreq = b.frequency;
		return ((bFreq < aFreq) ? -1 : ((bFreq > aFreq) ? 1 : 0));
	};

	arr.sort(sortByFrequency);
	/*arr = arr.sort(function(a,b){
		return a.frequency.localeCompare(b.frequency);
	});*/
	console.log(arr);
	return arr;
};

Analyzer.prototype.makeJSON = function(){
	for(var key in this.frequency){
		if(!this.frequency.hasOwnProperty(key)) continue;

		if(this.frequency[key] > this.minFrequency){
			this.jsonResult.push( { "word" : key, "frequency" : this.frequency[key] } );
		}
	}
};




///////////////////////Dictionary///////////////////////////////////////////////

var Dictionary = {
	norwegian : ['en', 'jeg', 'litt', 'med', 'og', 'på', 'til', 'var', 'fra', 'å', 
				   'to', 'tre', 'kanskje', 'ganske', 'av', 'de', 'dro', 'fikk',
				   'på', 'så', 'som', 'hadde', 'men', 'om', 'så', 'å', 'på',
				   'veldig', 'rundt', 'masse', 'at', 'bare', 'ble', 'det',
			       'er', 'etter', 'for', 'i', 'gikk', 'ha', 'ham', 'han', 
			       'har', 'ikke', 'kom', 'sa', 'seg', 'meg', 'skulle', 'ville',
			       '-', 'måtte', 'andre'],
	english : ['and', 'the', 'to', 'a', 'of', 'for', 'as', 'i', 'with', 'have', 
		         'you', 'it', 'is', 'on', 'that', 'this', 'can', 'in', 
		         'be', 'has', 'if', 'by', 'poeng', 'dager', 'siden', 
		         'permalenkerapportergive', 'goldsvar', '::', ':', '-', ',', '.']
};