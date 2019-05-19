// Global Variables, first object empty, because selection starts with 1
var pacman = null, labyrinth = [], points = [], pointsCollected = 0, canvas, gl, program, flag = false;
var wMatrix = mat4.create();
var lightPosition = [5.0, -20.0, 40.0];
var lightSelected = false;
var specularEnabled = 0.0;
var phong = 1.0;
var animatePacman = 2;
var winSound = new sound("sounds/win.mp3");
// Init function called onload body event
var Init = function () {
	canvas = document.getElementById('webgl-canvas');
	gl = canvas.getContext('webgl');
	gl.viewportWidth = canvas.width;
	gl.viewportHeight = canvas.height;

	if (!gl) {
		alert('Please use new browser!');
		return;
	}

	// Create view matrix
	let vMatrix = mat4.create();

	// Create projection matrix
	let pMatrix = mat4.create();

	// Set a background color
	gl.clearColor(0.5, 0.5, 0.5, 1.0);
	gl.enable(gl.DEPTH_TEST);

	mat4.lookAt(vMatrix, vec3.fromValues(0.5, 0, -20), vec3.fromValues(-5, -15, 0), vec3.fromValues(0, 10, 0));
	mat4.invert(vMatrix, vMatrix);
	mat4.perspective(pMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.4, 2000.0);


	// Create Labyrinth
	createLabyrinth();

	// Create points
	createPoints();

	// Create pacman
	try {
		pacman = new Pacman(gl, [0, 0.6, 0]);
	} catch (E) {
		console.log(E);
	}

	// Render all objects
	// Apply Lines if selected
	var flagStarted = false, flagPoints = false;

	function render() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		// Draw pacman
		pacman.draw(gl, pMatrix, vMatrix);

		// Draw labyrinth
		labyrinth.forEach((e, i) => {
			e.draw(gl, pMatrix, vMatrix);
			if (!flagStarted) {
				e.start();
				if (i === labyrinth.length - 1) {
					flagStarted = true;
					pacman.start();
				}
			}
		});

		// Draw points
		points.forEach((e, i) => {
			e.draw(gl, pMatrix, vMatrix);
			if (!flagPoints) {
				e.start();
				if (i === points.length - 1) {
					flagPoints = true;
				}
			}
		});
		requestAnimationFrame(render);
	}
	// Start rendering
	requestAnimationFrame(render);

	var up = true;
	var value = 1.55;
	var increment = 0.03;
	var ceiling = 1.80;

	function mountAnimateUpAndDown() {
		pacman.initialize();
		if (up === true && value <= ceiling) {
			value += increment;
			pacman.global = false;
			pacman.update(increment);
			pacman.global = true;
			if (value === ceiling) {
				up = false;
			}
		} else {
			up = false;
			value -= increment;
			pacman.global = false;
			pacman.update(-increment);
			pacman.global = true;
			if (value === 1.55) {
				up = true;
			}
		}
		animatePacman = value;



		if (pacman.movingDirection) {
			pacman.global = true;
			let position = [0, 0, 0];
			let degree = 0;
			switch (pacman.movingDirection) {
				case "right" : {
					position = [-0.25, 0, 0];
					degree = 1.5;
					break;
				}
				case "left" : {
					position = [0.25, 0, 0];
					degree = -1.5;
					break;
				}
				case "up" : {
					position = [0, 0, 0.25];
					degree = -2.5;
					break;
				}
				case "down" : {
					position = [0, 0, -0.25];
					degree = 0;
					break;
				}
			}

			if (pacman.update(0, 0, 0, position)) {
				position[0] = -1 * position[0];
				position[2] = -1 * position[2];
				mat4.translate(vMatrix, vMatrix, position);
			}
			pacman.rotate(pacman.movingDirection, degree);
		}
	}
	setInterval(mountAnimateUpAndDown, 30);

	// Handle user input events
	document.addEventListener("keydown", function (event) {
		// Handle event.key inputs
		switch (event.key) {
			case "ArrowDown" : {
				pacman.movingDirection = "down";
				break;
			}
			case "ArrowUp" : {
				pacman.movingDirection = "up";
				break;
			}
			case "ArrowLeft" : {
				pacman.movingDirection = "left";
				break;
			}
			case "ArrowRight" : {
				pacman.movingDirection = "right";
				break;
			}
			case "w" : {
				pacman.update(0.03, 0, 0, [0, 0, 0]);
				break;
			}
			case "s" : {
				pacman.update(-0.03, 0, 0, [0, 0, 0]);
				break;
			}
			case "e" : {
				pacman.update(0, 0.03, 0, [0, 0, 0]);
				break;
			}
			case "q" : {
				pacman.update(0, -0.03, 0, [0, 0, 0]);
				break;
			}
			case "a" : {
				pacman.update(0, 0, -0.03, [0, 0, 0]);
				break;
			}
			case "d" : {
				pacman.update(0, 0, 0.03, [0, 0, 0]);
				break;
			}
		}
	});
};


function sound(src) {
	this.sound = document.createElement("audio");
	this.sound.src = src;
	this.sound.setAttribute("preload", "auto");
	this.sound.setAttribute("controls", "none");
	this.sound.style.display = "none";
	document.body.appendChild(this.sound);
	this.play = function(){
		this.sound.play();
	}
	this.stop = function(){
		this.sound.pause();
	}
}
