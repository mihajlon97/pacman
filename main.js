// Global Variables, first object empty, because selection starts with 1
var pacman = null, labyrinth = [], canvas, gl, program, flag = false;
var wMatrix = mat4.create();
var lightPosition = [3.0, -5.0, 35.0];
var lightSelected = false;
var specularEnabled = 0.0;
var phong = 1.0;
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

	mat4.lookAt(vMatrix, vec3.fromValues(0, 4, -35), vec3.fromValues(-3, -25, 0), vec3.fromValues(0, 1, 0));
	mat4.invert(vMatrix, vMatrix);
	mat4.perspective(pMatrix, glMatrix.toRadian(45), canvas.width / canvas.height, 0.4, 2000.0);


	// Create labyrinth
	try {
		labyrinth.push(new Ground(gl, [0, 0, 0]));

		// Down border
		for (var i = 0; i <= 20; i+=2) {
			// Down border
			labyrinth.push(new Labyrinth(gl, [i, 1, -20]));
			labyrinth.push(new Labyrinth(gl, [-i, 1, -20]));

			// Up border
			labyrinth.push(new Labyrinth(gl, [i, 1, 20]));
			labyrinth.push(new Labyrinth(gl, [-i, 1, 20]));

			// Left border
			labyrinth.push(new Labyrinth(gl, [20, 1, i]));
			labyrinth.push(new Labyrinth(gl, [20, 1, -i]));

			// Right border
			labyrinth.push(new Labyrinth(gl, [-20, 1, i]));
			labyrinth.push(new Labyrinth(gl, [-20, 1, -i]));
		}



	} catch (E) {
		console.log(E);
	}

	// Create pacman
	try {
		pacman = new Pacman(gl, [0, 1, 0]);
	} catch (E) {
		console.log(E);
	}

	// Render all objects
	// Apply Lines if selected
	var flagStarted = false;

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
		requestAnimationFrame(render);
	}

	// Start rendering
	requestAnimationFrame(render);


	// Handle user input events
	document.addEventListener("keydown", function (event) {
		// Handle event.key inputs
		switch (event.key) {
			case "ArrowDown" : {
				pacman.update(0, 0, 0, [0, 0, -0.05]);
				break;
			}
			case "ArrowUp" : {
				pacman.update(0, 0, 0, [0, 0, 0.05]);
				break;
			}
			case "ArrowLeft" : {
				pacman.update(0, 0, 0, [0.05, 0, 0]);
				break;
			}
			case "ArrowRight" : {
				pacman.update(0, 0, 0, [-0.05, 0, 0]);
				break;
			}
		}
	});
};
