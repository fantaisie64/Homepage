//first

function lbranch(b, lindex, gen) {
	var end = endPt(b), daR, newB;
	
	branches.push(b);
	if (b.d === newg)
		return;
		
	if(newa<0)
	newa = 0;
	else if(newa>1)
	newa = 1;
	
	daR = ar * Math.random() - ar * 0.5;
	
	//var lineStack = [];
	//var templine;
	
	var lnewi, lnewx, lnewy, lnewa, lnewl, lnewd, lnewparent;
	
	if(lindex<objectRealRules.length){
	console.log(objectRealRules[lindex]);
	switch(objectRealRules[lindex]){
	case 'forward':
		console.log("This is forward");
		lnewi = branches.length,
		lnewx = end.x;
		lnewy = end.y;
		lnewa = b.a;
		lnewl = b.l * newl;
		lnewd = b.d + 1;
		lnewparent: b.i;
		break;
	case 'left':
		console.log("This is left");
		lnewi = branches.length,
		lnewx = end.x;
		lnewy = end.y;
		lnewa = b.a - newa + daR;
		lnewl = b.l * newl;
		lnewd = b.d + 1;
		lnewparent: b.i;
		break;
	case 'right':
		console.log("This is right");
		lnewi = branches.length,
		lnewx = end.x;
		lnewy = end.y;
		lnewa = b.a + newa + daR;
		lnewl = b.l * newl;
		lnewd = b.d + 1;
		lnewparent: b.i;
		break;
	case 'push':
		console.log("This is push");
		lineStack.push(b);
		break;
	case 'pop':
		/*console.log("This is pop");
		templine = lineStack.pop();
		console.log(templine);*/
		break;
	default:
		console.log("This is default");
		lnewi = branches.length,
		lnewx = end.x;
		lnewy = end.y;
		lnewa = b.a;
		lnewl = b.l * newl;
		lnewd = b.d + 1;
		lnewparent: b.i;
		break;
	}
	newB = {
		i: lnewi,
		x: lnewx,
		y: lnewy,
		a: lnewa,
		l: lnewl,
		d: lnewd,
		parent: lnewparent
	};
	}
	
	else{
	newB = {
		i: branches.length,
		x: end.x,
		y: end.y,
		a: b.a + daR,
		l: b.l * newl,
		d: b.d + 1,
		parent: b.i
	};
	}
	lindex++;
	lbranch(newB, newlindex, newgen);
	
}

// second

if(newlindex<objectRealRules.length){
	for(i=newlindex; i<objectRealRules.length; i++){
	switch(objectRealRules[i]){
	case 'forward':
		end = endPt(b);
		console.log("This is forward x="+end.x+"y="+end.y);
		newB = {
			i: branches.length,
			x: end.x,
			y: end.y,
			a: b.a + tempangle,
			l: b.l * newl,
			d: b.d + 1,
			parent: b.i
		};
		breakloop = true;
		i++;
		break;
	case 'left':
		console.log("This is left");
		tempangle -= newa;
		break;
	case 'right':
		console.log("This is right");
		tempangle += newa;
		break;
	case 'push':
		/*console.log("This is push");
		newlineStack.push(b);*/
		break;
	case 'pop':
		/*console.log("This is pop");
		b = newlineStack.pop();*/
		break;
	}
	if(breakloop){
		console.log("break loop");
		newlindex = i;
		/*if(newlindex===objectRealRules.length){
			console.log("renew");
			//newlindex = 0;
			newlgen++;
			newlineStack = new Array();
		}
		else{
			//newlindex = i;
		}*/
		lbranch(newB, newlindex, newlgen, newlineStack);
		break;
	}
	}
	}
	else{
	console.log("it's else newlindex="+newlindex);
	return;
	/*end = endPt(b);
	newB = {
		i: branches.length,
		x: end.x,
		y: end.y,
		a: b.a,
		l: b.l * newl,
		d: b.d + 1,
		parent: b.i
	};
	lbranch(newB, newlindex, newlgen, newlineStack);*/
	}