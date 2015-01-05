/* D3 Tree */
/* Copyright 2013 Peter Cook (@prcweb); Licensed MIT */

// Tree mode
treemode = "lt";
randommode = true;
biasmode = "none";
leafSize = 5;

var line;

// Keys
keySymbols = "Symbols:";
keyAxiom = "Axiom:";
keyRules = "Rules:";
keyDistance = "Distance:";
keyAngle = "Angle:";
keyGenerations = "Generations:";
keyRandomized = "Randomized:";
keyBiased = "Biased:";
keyLeafSize = "LeafSize:";
var rexSymbols = new RegExp(keySymbols);
var rexAxiom = new RegExp(keyAxiom);
var rexRules = new RegExp(keyRules);
var rexDistance = new RegExp(keyDistance);
var rexAngle = new RegExp(keyAngle);
var rexGenerations = new RegExp(keyGenerations);
var rexRandomized = new RegExp(keyRandomized);
var rexBiased = new RegExp(keyBiased);
var rexLeafSize = new RegExp(keyLeafSize);

// Objects
var objectSymbols;
var objectAxiom = [];
var objectRules = [];
var objectRealRules = [];


// Tree configuration
var branches = [];
var seed = {i: 0, x: 420, y: 660, a: 0, l: 130, d:0}; // a = angle, l = length, d = depth
var da = 0.5; // Angle delta
var dl = 0.8; // Length delta (factor)
var ar = 0.7; // Randomness
var maxLDepth = 20;
var maxBinaryDepth = 10;
var maxGenerations = 8;

var newl=0.8;
var newa=0.5;
var newg=2;

var color = d3.scale.category20();

// L-system tree creation functions
function lbranch(b, lindex, lgen, lineStack, save) {

	if(save){
		branches.push(b);
		//console.log("b="+b);
	}
	
	var end, daR, bias;
	
	if (b.d >= maxLDepth)
		return;
	
	if(lgen >= newg)
		return;
	
	var newlindex = lindex;
	var newlgen = lgen;
	var newlineStack;
	
	if(lineStack==null)
		newlineStack = new Array();
	else
		newlineStack = lineStack;
	
	var tempangle = 0;
	var breakloop = false;
		
	if(randommode)
		daR = ar * Math.random() - ar * 0.5;
	else
		daR = 0;
		
	switch(biasmode){
	default:
		bias = 0;
		break;
	case 'none':
		bias = 0;
		break;
	case 'left':
		bias = (-newa);
		break;
	case 'right':
		bias = newa;
	}	
		
	//console.log("lindex="+newlindex+", lgen="+lgen);
	for(var i=newlindex; i<objectRealRules.length; i++){
	switch(objectRealRules[i]){
	case 'forward':
		//console.log("This is forward, lgen="+lgen);
		end = endPt(b);
		b = {
			i: branches.length,
			x: end.x,
			y: end.y,
			a: b.a + tempangle + daR + bias,
			l: b.l * newl,
			d: b.d + 1,
			parent: b.i
		};
		breakloop = true;
		break;
	case 'left':
		//console.log("This is left, lgen="+lgen);
		switch(biasmode){
		default:
			tempangle -= newa;
		}
		break;
	case 'right':
		//console.log("This is right, lgen="+lgen);
		tempangle += newa;
		break;
	case 'push':
		//console.log("This is push, lgen="+lgen);
		newlineStack.push(b);
		break;
	case 'pop':
		//console.log("This is pop, lgen="+lgen);
		/*var newnewlgen = newlgen + 1;
		lbranch(b, 0, newnewlgen, null);*/
		var newnewlgen = newlgen + 1;
		lbranch(b, 0, newnewlgen, null, false);
		b = newlineStack.pop();
		break;
	default:
		break;
	}
	newlindex = i;
	if(breakloop){
		//console.log("break loop newlindex = "+newlindex+", lgen="+lgen);
		if(newlindex==(objectRealRules.length-1)){
			//console.log("renew, lgen="+lgen);
			var newnewlgen = newlgen + 1;
			lbranch(b, 0, newnewlgen, null, true);
			return;
		}
		break;
	}
	}
	newlindex ++;
	if(newlindex==(objectRealRules.length)){
			/*console.log("renew, lgen="+lgen);
			var newnewlgen = newlgen + 1;
			lbranch(b, 0, newnewlgen, null);*/
			return;
	}
	lbranch(b, newlindex, newlgen, newlineStack, true);
}

// Binary tree creation functions
function binarybranch(b) {
	var end = endPt(b), daR, newB;

	branches.push(b);

	if (b.d === maxBinaryDepth)
		return;
	
	// added
	if(newa<0)
		newa = 0;
	else if(newa>1)
		newa = 1;
	
	// Left branch
	if(randommode)
		daR = ar * Math.random() - ar * 0.5;
	else
		daR = 0;
		
	switch(biasmode){
	default:
		bias = 0;
		break;
	case 'none':
		bias = 0;
		break;
	case 'left':
		bias = (-newa);
		break;
	case 'right':
		bias = newa;
	}	
		
	newB = {
		i: branches.length,
		x: end.x,
		y: end.y,
		a: b.a - newa + daR + bias,
		l: b.l * newl,
		d: b.d + 1,
		parent: b.i
	};
	binarybranch(newB);

	// Right branch
	if(randommode)
		daR = ar * Math.random() - ar * 0.5;
	else
		daR = 0;
		
	newB = {
		i: branches.length,
		x: end.x, 
		y: end.y, 
		a: b.a + newa + daR + bias, 
		l: b.l * newl, 
		d: b.d + 1,
		parent: b.i
	};
	binarybranch(newB);
}

function init(){
	parse();
	create();
}

function regenerate() {
	branches = [];
	if(treemode == "lt")
		lbranch(seed, 0, 0, null, true);
	else if (treemode == "bt")
		binarybranch(seed);
		create();
	update();
	
}

function parse(){
	input = document.getElementById('mytextarea').value;
	length = input.length;
	actOnEachLine(input);
	newl = parseFloat(document.getElementById('mydistance').value);
	newa = parseFloat(document.getElementById('myangle').value);
	var newnewg = parseInt(document.getElementById('mygenerations').value);
	if (newnewg >=maxGenerations)
		newg = maxGenerations;
	else
		newg = newnewg;
	regenerate();
}

function parsecolumn(){
	newl = parseFloat(document.getElementById('mydistance').value);
	newa = parseFloat(document.getElementById('myangle').value);
	var newnewg = parseInt(document.getElementById('mygenerations').value);
	if (newnewg >=maxGenerations)
		newg = maxGenerations;
	else
		newg = newnewg;
	regenerate();
}

function parsescroll(){
	document.getElementById('mydistance').value
	= (parseFloat(document.getElementById('mydistancescroll').value)/100).toString();
	document.getElementById('myangle').value
	= (parseFloat(document.getElementById('myanglescroll').value)/100).toString();
	document.getElementById('mygenerations').value
	= document.getElementById('mygenerationsscroll').value;
	newl = parseFloat(document.getElementById('mydistance').value);
	newa = parseFloat(document.getElementById('myangle').value);
	var newnewg = parseInt(document.getElementById('mygenerations').value);
	if (newnewg >=maxGenerations)
		newg = maxGenerations;
	else
		newg = newnewg;
	regenerate();
}

function actOnEachLine(textarea) {
    var lines = textarea.replace(/\r\n/g, "\n").split(/\s*\n\s*/);
    //var newLines, newValue, i;
    for(var i=0; i<lines.length; i++){
    
    	if(rexSymbols.exec(lines[i])){
    		objectSymbols = new Array();
    		for(var j=i+1; j<lines.length; j++){
    			//console.log("lines is"+lines[j]);
    			var items = lines[j].split(/\s+/);
    			//console.log(items);
    			if(items[0]==keyAxiom || items[0]==keyRules || items[0]==keyDistance ||
    			items[0]==keyAngle || items[0]==keyGenerations || items[0]==keyRandomized)
    				break;
    			objectSymbols[items[0]] = items[1];
    		}
    		continue;
    	}
    	
    	if(rexAxiom.exec(lines[i])){
    		var items = lines[i].split(/\s+/);
    		objectAxiom = new Array();
    		for(var j=1; j<items.length; j++){
    			objectAxiom.push(items[j]);
    		}
    	}
    	
    	if(rexRules.exec(lines[i])){
    		var items = lines[i].split(/\s+/);
    		objectRules = new Array();
    		objectRealRules = new Array();
    		for(var j=1; j<items.length; j++){
    			objectRules.push(items[j]);
    			objectRealRules.push(objectSymbols[items[j]]);
    		}
    		console.log(objectRealRules);
    	}
    	
    	if(rexDistance.exec(lines[i])){
    		var items = lines[i].split(/\s+/);
    		var newdistance = parseFloat(items[1]);
    		document.getElementById('mydistance').value = newdistance.toString();
    		document.getElementById('mydistancescroll').value = (newdistance*100).toString();
    		continue;
    	}
    
    	if(rexAngle.exec(lines[i])){
    		var items = lines[i].split(/\s+/)
    		var newangle = parseFloat(items[1]);
    		document.getElementById('myangle').value = newangle.toString();
    		document.getElementById('myanglescroll').value = (newangle*100).toString();
    		continue;
    	}
    
    	if(rexGenerations.exec(lines[i])){
    		var items = lines[i].split(/\s+/)
    		if(items[1]!=null){
    		var newgenerations = parseInt(items[1]);
    		if (newgenerations >=maxGenerations){
				document.getElementById('mygenerations').value = maxGenerations.toString();
				document.getElementById('mygenerationsscroll').value = maxGenerations.toString();
			}
			else{
    			document.getElementById('mygenerations').value = newgenerations.toString();
    			document.getElementById('mygenerationsscroll').value = newgenerations.toString();
    		}
    		}
    		continue;
    	}
    	
    	if(rexRandomized.exec(lines[i])){
    		var items = lines[i].split(/\s+/)
    		if(items[1]=='true'){
    			document.getElementById("cb").checked = true;
    			randommode = true;
    		}else if(items[1]=='false'){
    			document.getElementById("cb").checked = false;
    			randommode = false;
    		}
    		continue;
    	}
    	
    	if(rexBiased.exec(lines[i])){
    		var items = lines[i].split(/\s+/)
    		if(objectSymbols[items[1]]== 'left' || objectSymbols[items[1]]== 'right')
    			biasmode = objectSymbols[items[1]];
    		else
    			biasmode = items[1];
    		continue;
    	}
    	
    	if(rexLeafSize.exec(lines[i])){
    		var items = lines[i].split(/\s+/)
    		leafSize = parseInt(items[1]);
    		continue;
    	}
    }
	
	//newdistance = 0.8;
	//newangle = 0.5;
	//newgenerations = 5;
	//document.getElementById('mydistance').value = newdistance.toString();
	//document.getElementById('myangle').value = newangle.toString();
	//document.getElementById('mygenerations').value = newgenerations.toString();
	
    // Use the map() method of Array where available 
    /*if (typeof lines.map != "undefined") {
        newLines = lines.map(func);
    } else {
        newLines = [];
        i = lines.length;
        while (i--) {
            newLines[i] = func(lines[i]);
        }
    }
    textarea.value = newLines.join("\r\n");*/
}

function endPt(b) {
	// Return endpoint of branch
	var x = b.x + b.l * Math.sin( b.a );
	var y = b.y - b.l * Math.cos( b.a );
	return {x: x, y: y};
}


// D3 functions
function x1(d) {return d.x;}
function y1(d) {return d.y;}
function x2(d) {return endPt(d).x;}
function y2(d) {return endPt(d).y;}
function highlightParents(d) {
	var colour = d3.event.type === 'mouseover' ? 'green' : '#777';
	var depth = d.d;
	for(var i = 0; i <= depth; i++) {
		d3.select('#id-'+parseInt(d.i)).style('stroke', colour);
		d = branches[d.parent];
	}	
}

function create() {
	line = d3.select('svg')
		.selectAll('line')
		.data(branches);
	
	line.enter()
		.append('line')
		.attr('x1', x1)
		.attr('y1', y1)
		.attr('x2', x2)
		.attr('y2', y2)
		.style('stroke-width', function(d) {
		/*if(treemode == "lt")
		return parseInt((maxLDepth + 1 - d.d)*0.5) + 'px';
		else if (treemode == "bt")*/
		return '6px';}) //parseInt(maxBinaryDepth + 1 - d.d) + 'px';})
		.attr('id', function(d) {return 'id-'+d.i;})
		.on('mouseover', highlightParents)
		.on('mouseout', highlightParents);
	
	line.exit().remove();
	
	var circles= d3.select('svg')
		.selectAll('circle')
		.data(branches);
		
	circles.enter()
		.append('circle')
		.style("fill", function() { return color(19); })
		//.style('stroke', 'black')
		.attr("r", leafSize)
		.attr('cx', x2)
		.attr('cy', y2);
		
	circles.exit().remove();
	
	/*var texts = d3.select('svg')
		.selectAll('text')
		.data(branches);
		
	texts.enter()
		.append('text')
		.style("fill", "black")
		.attr("text-anchor", "middle")
		.attr("font-size", "12")
		.attr("font-weight", "bold")
		.attr('x', x2)
		.attr('y', y2)
		.text(function(d) { return d.d.toString(); });
		
	texts.exit().remove();*/
	
}

function update() {
	d3.select('svg')
		.selectAll('line')
		.data(branches)
		.transition()
		.attr('x1', x1)
		.attr('y1', y1)
		.attr('x2', x2)
		.attr('y2', y2);
		
	d3.select('svg')
		.selectAll('circle')
		.data(branches)
		.transition()
		.attr("r", leafSize)
		.attr('cx', x2)
		.attr('cy', y2);
}

d3.selectAll('.regenerate')
	.on('click', regenerate);
	
d3.selectAll('#mytextarea').on('input', parse);
d3.selectAll('#mydistance').on('input', parsecolumn);
d3.selectAll('#myangle').on('input', parsecolumn);
d3.selectAll('#mygenerations').on('input', parsecolumn);
d3.selectAll('#mydistancescroll').on('input', parsescroll);
d3.selectAll('#myanglescroll').on('input', parsescroll);
d3.selectAll('#mygenerationsscroll').on('input', parsescroll);

d3.selectAll("#ra").on("change", function () {
	treemode = this.value;
	regenerate();
});

d3.selectAll("#cb").on("change", function () {
	randommode = this.checked;
	regenerate();
});

init();