var c = document.createElement('canvas');

c.width = window.innerWidth;
c.height = window.innerHeight;

document.body.style.margin = 0;

c.width = window.innerWidth * window.devicePixelRatio;
c.height = window.innerHeight * window.devicePixelRatio;
c.style.width = window.innerWidth + 'px';
c.style.height = window.innerHeight + 'px';

document.body.appendChild(c);

var ctx = c.getContext('2d');
var things = new Map();

c.addEventListener('mousedown', function mousedown(ev) {
	things.set('line', {
		startX: ev.offsetX * 2,
		startY: ev.offsetY * 2,
		x: ev.offsetX * 2,
		y: ev.offsetY * 2,
		draw: function() {
			ctx.beginPath();
			ctx.strokeStyle = 'white';
			ctx.moveTo(this.startX, this.startY);
			ctx.lineTo(this.x, this.y);
			ctx.stroke();
		}
	});
});

c.addEventListener('mousemove', function mousemove(ev) {
	if(things.has('line')) {
		var line = things.get('line');
		line.x = ev.offsetX * 2;
		line.y = ev.offsetY * 2;
	}
});

function zph(n) {
	var s = n.toString(16);
	return s.length < 2 ? '0'+s : s; 
}

function rb() {
	return Math.floor(128 * Math.random()) + 128;
}

var _732 = Math.pow(7, 3/2);
var i = 0;
var blobs = [];
c.addEventListener('mouseup', function mouseup(ev) {
	var line = things.get('line');
	things.delete('line');
	var id = 'blob' + i++;
	var blob = {
		x: line.startX,
		y: line.startY,
		dx: (ev.offsetX * 2 - line.startX) / 50,
		dy: (ev.offsetY * 2 - line.startY) / 50,
		colour: [rb(), rb(), rb()],
		draw: function() {
			var v = Math.sqrt(Math.pow(this.dy, 2) + Math.pow(this.dx, 2));
			var t = Math.atan2(this.dy, this.dx);
			var h = Math.max(Math.pow((v - 5)/10, 3) + 7, 7);
			var w = _732 / Math.sqrt(h);
			ctx.beginPath();
			ctx.fillStyle = '#' + this.colour.map(zph).join('');
			ctx.ellipse(this.x, this.y, h, w, t, 0, 2*Math.PI);
			ctx.fill();
		}
	};
	things.set(id, blob);
	blobs.push(blob);
});

function r(x1, y1, x2, y2) {
	return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
}

var G = 20;
function gf(t1, t2) {
	return G / r(t1.x, t1.y, t2.x, t2.y);
}

function g(t1, t2) {
	var f = gf(t1, t2);
	var dx = t1.x - t2.x;
	var dy = t1.y - t2.y;
	t1.ddy += -dy * f;
	t1.ddx += -dx * f;
	t2.ddy += dy * f;
	t2.ddx += dx * f;
}

function physics() {
	blobs.forEach(function(blob, i) {
		blob.ddx = blob.ddy = 0;
		blobs.slice(i + 1).forEach(function(blob2) {
			g(blob, blob2);
		});
	});

	things.forEach(function(thing) {
		if(thing.ddx) thing.dx += thing.ddx;
		if(thing.ddy) thing.dy += thing.ddy;
		if(thing.dx)  thing.x  += thing.dx;
		if(thing.dy)  thing.y  += thing.dy;

		if(thing.x < 0 || thing.x > c.width)  thing.dx *= -1;
		if(thing.y < 0 || thing.y > c.height) thing.dy *= -1;

		thing.dx *= 0.999;
		thing.dy *= 0.999;
	});
}
setInterval(physics, 16);

function tick() {
	things.forEach(function(thing) {thing.draw();});
	requestAnimationFrame(tick);
}
tick();

things.set('clear', {draw: function() {
	ctx.fillStyle = 'black';
	ctx.fillRect(0,0,c.width,c.height);
}});

