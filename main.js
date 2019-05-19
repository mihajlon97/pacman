// Global Variables, first object empty, because selection starts with 1
var pacman = null, labyrinth = [], points = [], pointsCollected = 60, canvas, gl, program, flag = false;
var wMatrix = mat4.create();
var lightPosition = [5.0, -20.0, 40.0];
var lightSelected = false;
var specularEnabled = 0.0;
var phong = 1.0;
var animatePacman = 2;
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
			pacman.update(increment, 0, 0);
			pacman.global = true;
			if (value === ceiling) {
				up = false;
			}
		} else {
			up = false;
			value -= increment;
			pacman.global = false;
			pacman.update(-increment, 0, 0, [0, 0, 0]);
			pacman.global = true;
			if (value === 1.55) {
				up = true;
			}
		}
		animatePacman = value;

	}
	setInterval(mountAnimateUpAndDown, 30);



	// Handle user input events
	document.addEventListener("keydown", function (event) {
		// Handle event.key inputs
		switch (event.key) {
			case "m" : {
				console.log("animatePacman: " + animatePacman);
				animatePacman = animatePacman === 1.6 ? 1.65 : 1.6;
				pacman = new Pacman(gl, [0, 1, 0], animatePacman);
				pacman.start();
				pacman.update(animatePacman === 1.6 ? -0.3 : 0.3, 0, 0, [0, 0, 0]);

				break;
			}
			case "ArrowDown" : {
				pacman.global = true;
				if (pacman.update(0, 0, 0, [0, 0, -0.25]))
					mat4.translate(vMatrix, vMatrix, [0, 0, 0.25]);
				pacman.rotate("down", 0);
				break;
			}
			case "ArrowUp" : {
				pacman.global = true;
				if (pacman.update(0, 0, 0, [0, 0, 0.25]))
					mat4.translate(vMatrix, vMatrix, [0, 0, -0.25]);
				pacman.rotate("up", -2.5);
				break;
			}
			case "ArrowLeft" : {
				if(pacman.update(0, 0, 0, [0.25, 0, 0]))
					mat4.translate(vMatrix, vMatrix, [-0.25, 0, 0]);
				pacman.rotate("left", -1.5);
				break;
			}
			case "ArrowRight" : {
				if(pacman.update(0, 0, 0, [-0.25, 0, 0]))
					mat4.translate(vMatrix, vMatrix, [0.25, 0, 0]);
				pacman.rotate("right", 1.5);
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
