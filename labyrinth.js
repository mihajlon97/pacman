// Labyrinth object
// Expected parameter, gl instance and object position
function Labyrinth(gl, position = [0, 0, 0], tiny = false) {

	// Shader program
	if (Labyrinth.shaderProgram === undefined) {
		Labyrinth.shaderProgram = initShaderProgram(gl, "vertex-shader", "fragment-shader");
		if (Labyrinth.shaderProgram === null) {
			throw new Error('Creating the shader program failed.');
		}
		Labyrinth.locations = {
			attribute: {
				vertPosition: gl.getAttribLocation(Labyrinth.shaderProgram, "vertPosition"),
				vertColor: gl.getAttribLocation(Labyrinth.shaderProgram, "vertColor"),
				aNormal: gl.getAttribLocation(Labyrinth.shaderProgram, "aNormal"),
			},
			uniform: {
				mMatrix: gl.getUniformLocation(Labyrinth.shaderProgram, "mMatrix"),
				wMatrix: gl.getUniformLocation(Labyrinth.shaderProgram, "wMatrix"),
				vMatrix: gl.getUniformLocation(Labyrinth.shaderProgram, "vMatrix"),
				mMatrixInv: gl.getUniformLocation(Labyrinth.shaderProgram, "mMatrixInv"),
				pMatrix: gl.getUniformLocation(Labyrinth.shaderProgram, "pMatrix"),
				pLight: gl.getUniformLocation(Labyrinth.shaderProgram, "pLight"),
				camera: gl.getUniformLocation(Labyrinth.shaderProgram, "camera"),
				specularEnabled: gl.getUniformLocation(Labyrinth.shaderProgram, "specularEnabled"),
				phong: gl.getUniformLocation(Labyrinth.shaderProgram, "phong")
			}
		};
		gl.enableVertexAttribArray(Labyrinth.locations.attribute.vertPosition);
		gl.enableVertexAttribArray(Labyrinth.locations.attribute.vertColor);
		gl.enableVertexAttribArray(Labyrinth.locations.attribute.aNormal);
	}

	// Buffers
	if (Labyrinth.buffers === undefined) {
		// Create a buffer with the vertex positions
		// 3 coordinates per vertex, 3 vertices per triangle
		// 2 triangles make up the ground plane, 4 triangles make up the sides
		const pBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
		let vertices = [
			-1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
			-1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
			1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
			1.0, 1.0, -1.0,    0.5, 0.5, 0.5,

			// Left
			-1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
			-1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
			-1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
			-1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

			// Right
			1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
			1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
			1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
			1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

			// Front
			1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
			1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
			-1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
			-1.0, 1.0, 1.0,    1.0, 0.0, 0.15,

			// Back
			1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
			1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
			-1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
			-1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

			// Bottom
			-1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
			-1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
			1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
			1.0, -1.0, -1.0,    0.5, 0.5, 1.0,
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

		// Create a buffer with the vertex colors
		const cBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
		let colors = [
			0.5, 0.5, 1.0,
			0.5, 0.5, 1.0,
			0.5, 0.5, 1.0,
			0.5, 0.5, 1.0,

			0.5, 0.5, 1.0,
			0.5, 0.5, 1.0,
			0.5, 0.5, 1.0,
			0.5, 0.5, 1.0,

			0.5, 0.5, 1.0,
			0.5, 0.5, 1.0,
			0.5, 0.5, 1.0,
			0.5, 0.5, 1.0,

			0.5, 0.5, 1.0,
			0.5, 0.5, 1.0,
			0.5, 0.5, 1.0,
			0.5, 0.5, 1.0,

			0.5, 0.5, 1.0,
			0.5, 0.5, 1.0,
			0.5, 0.5, 1.0,
			0.5, 0.5, 1.0,

			1.0, 0.0, 0.15,
			1.0, 0.0, 0.15,
			1.0, 0.0, 0.15,
			1.0, 0.0, 0.15,
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);


		var inBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, inBuffer);
		var cubeIndices = [
			// Top
			0, 1, 2,
			0, 2, 3,

			// Left
			5, 4, 6,
			6, 4, 7,

			// Right
			8, 9, 10,
			8, 10, 11,

			// Front
			13, 12, 14,
			15, 14, 12,

			// Back
			16, 17, 18,
			16, 18, 19,

			// Bottom
			21, 20, 22,
			22, 20, 23
		];
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);
		inBuffer.itemSize = 1;
		inBuffer.numItems = 36;


		//Create a buffer with the normals
		const nBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
		const norm = Math.sqrt(5)/2;
		let normals = [
			// Front
			0.0,  0.0,  1.0,
			0.0,  0.0,  1.0,
			0.0,  0.0,  1.0,
			0.0,  0.0,  1.0,

			// Back
			0.0,  0.0, -1.0,
			0.0,  0.0, -1.0,
			0.0,  0.0, -1.0,
			0.0,  0.0, -1.0,

			// Top
			0.0,  1.0,  0.0,
			0.0,  1.0,  0.0,
			0.0,  1.0,  0.0,
			0.0,  1.0,  0.0,

			// Bottom
			0.0, -1.0,  0.0,
			0.0, -1.0,  0.0,
			0.0, -1.0,  0.0,
			0.0, -1.0,  0.0,

			// Right
			1.0,  0.0,  0.0,
			1.0,  0.0,  0.0,
			1.0,  0.0,  0.0,
			1.0,  0.0,  0.0,

			// Left
			-1.0,  0.0,  0.0,
			-1.0,  0.0,  0.0,
			-1.0,  0.0,  0.0,
			-1.0,  0.0,  0.0];

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

		const lightBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, lightBuffer);
		let light = [-1,-1,-1];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(light), gl.STATIC_DRAW);

		Labyrinth.buffers = {
			pBuffer: pBuffer,
			cBuffer: cBuffer,
			nBuffer: nBuffer,
			inBuffer: inBuffer,
			lightBuffer: lightBuffer,
			pComponents: 3,
			cComponents: 3,
			nComponents: 3,
			lightComponents: 3,
		};
	}

	// Object Variables
	this.lcPosition = position;
	this.scale = [0.5, 0.5, 0.5];
	this.tiny = [0.1, 0.5, 0.5];
	this.mMatrix = mat4.create();
	this.lcMatrix = mat4.create();
	this.mMatrixInv = mat3.create();
	this.selected = false;
	this.global = false;

	// Object draw function
	this.draw = function (gl, pMatrix, vMatrix) {

		gl.useProgram(Labyrinth.shaderProgram);
		gl.uniformMatrix4fv(Labyrinth.locations.uniform.pMatrix, false, pMatrix);
		gl.uniformMatrix4fv(Labyrinth.locations.uniform.mMatrix, false, this.mMatrix);
		gl.uniformMatrix4fv(Labyrinth.locations.uniform.wMatrix, false, wMatrix);
		gl.uniformMatrix4fv(Labyrinth.locations.uniform.vMatrix, false, vMatrix);
		gl.uniformMatrix3fv(Labyrinth.locations.uniform.mMatrixInv, false, this.mMatrixInv);
		gl.uniform3fv(Labyrinth.locations.uniform.pLight, lightPosition);
		gl.uniform3fv(Labyrinth.locations.uniform.camera, [0, -10, 0]);
		gl.uniform1f(Labyrinth.locations.uniform.specularEnabled, specularEnabled);
		gl.uniform1f(Labyrinth.locations.uniform.phong, phong);
		gl.uniform4fv(Labyrinth.locations.uniform.uColor, [1.0, 0.0, 0.0, 1.0]);


		gl.bindBuffer(gl.ARRAY_BUFFER, Labyrinth.buffers.pBuffer);
		gl.vertexAttribPointer(Labyrinth.locations.attribute.vertPosition, Labyrinth.buffers.pComponents, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, Labyrinth.buffers.cBuffer);
		gl.vertexAttribPointer(Labyrinth.locations.attribute.vertColor, Labyrinth.buffers.cComponents, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, Labyrinth.buffers.nBuffer);
		gl.vertexAttribPointer(Labyrinth.locations.attribute.aNormal, Labyrinth.buffers.nComponents, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Labyrinth.buffers.inBuffer);

		gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
	};

	this.start = function () {
		mat4.translate(this.mMatrix, this.mMatrix, this.lcPosition);
		mat4.translate(this.lcMatrix, this.lcMatrix, this.lcPosition);
		mat4.scale(this.mMatrix, this.mMatrix, !tiny ? this.scale : this.tiny);
	};

	this.update = function (x, y, z, position = [0, 0, 0], scale = [1, 1, 1]) {
		// Global transformations
		if (this.global) {
			// Move the Object to the center
			mat4.identity(this.mMatrix);
			// Transform the object
			mat4.scale(this.mMatrix, this.mMatrix, scale);
			mat4.rotateX(this.mMatrix, this.mMatrix, x);
			mat4.rotateY(this.mMatrix, this.mMatrix, y);
			mat4.rotateZ(this.mMatrix, this.mMatrix, z);
			mat4.translate(this.mMatrix, this.mMatrix, position);

			// Multiply with Local Coordinates to get to the right position
			mat4.multiply(this.mMatrix, this.mMatrix, this.lcMatrix);

			// Move Local Coordinates where the object is
			mat4.identity(this.lcMatrix);
			mat4.multiply(this.lcMatrix, this.lcMatrix, this.mMatrix);
		}
		// Local transformations
		else {
			// Transform Object
			mat4.translate(this.mMatrix, this.mMatrix, position);
			mat4.rotateX(this.mMatrix, this.mMatrix, x);
			mat4.rotateZ(this.mMatrix, this.mMatrix, z);
			mat4.rotateY(this.mMatrix, this.mMatrix, y);
			mat4.scale(this.mMatrix, this.mMatrix, scale);

			// Transform Local Coordinates
			mat4.translate(this.lcMatrix, this.lcMatrix, position);
			mat4.rotateX(this.lcMatrix, this.lcMatrix, x);
			mat4.rotateZ(this.lcMatrix, this.lcMatrix, z);
			mat4.rotateY(this.lcMatrix, this.lcMatrix, y);
			mat4.scale(this.lcMatrix, this.lcMatrix, scale);
		}
		mat3.normalFromMat4(this.mMatrixInv, this.mMatrix);
	};
}


function createLabyrinth () {
	// Create labyrinth
	try {
		labyrinth.push(new Ground(gl, [0, 0, 0]));

		// Down border
		for (var i = 0; i <= 10; i++) {
			// Down border
			labyrinth.push(new Labyrinth(gl, [i, 0.6, -10]));
			labyrinth.push(new Labyrinth(gl, [-i, 0.6, -10]));

			// Up border
			labyrinth.push(new Labyrinth(gl, [i, 0.6, 10]));
			labyrinth.push(new Labyrinth(gl, [-i, 0.6, 10]));

			// Left border
			labyrinth.push(new Labyrinth(gl, [10, 0.6, i]));
			labyrinth.push(new Labyrinth(gl, [10, 0.6, -i]));

			// Right border
			labyrinth.push(new Labyrinth(gl, [-10, 0.6, i]));
			labyrinth.push(new Labyrinth(gl, [-10, 0.6, -i]));

			// Inside walls
			if (i % 5 > 2) {
					labyrinth.push(new Labyrinth(gl, [0, 0.6, i]));
				  labyrinth.push(new Labyrinth(gl, [4, 0.6, -i]));
			 	  labyrinth.push(new Labyrinth(gl, [-4, 0.6, -i]));
			} else if(i > 2 && i+2 <= 10) {
				labyrinth.push(new Labyrinth(gl, [i-1, 0.6, 0]));
				labyrinth.push(new Labyrinth(gl, [i, 0.6, 0]));
				labyrinth.push(new Labyrinth(gl, [-i, 0.6, 0]));
				labyrinth.push(new Labyrinth(gl, [-i+1, 0.6, 0]));



				labyrinth.push(new Labyrinth(gl, [3, 0.6, i-2]));
				labyrinth.push(new Labyrinth(gl, [3, 0.6, i-1]));
				labyrinth.push(new Labyrinth(gl, [4, 0.6, i-2]));
				labyrinth.push(new Labyrinth(gl, [4, 0.6, i-1]));
				labyrinth.push(new Labyrinth(gl, [4, 0.6, i]));
				labyrinth.push(new Labyrinth(gl, [3, 0.6, i]));
				labyrinth.push(new Labyrinth(gl, [-3, 0.6, i]));
				labyrinth.push(new Labyrinth(gl, [-4, 0.6, i]));
				labyrinth.push(new Labyrinth(gl, [-3, 0.6, i-2]));
				labyrinth.push(new Labyrinth(gl, [-3, 0.6, i-1]));
				labyrinth.push(new Labyrinth(gl, [-4, 0.6, i-2]));
				labyrinth.push(new Labyrinth(gl, [-4, 0.6, i-1]));

				labyrinth.push(new Labyrinth(gl, [7, 0.6, i-1]));
				labyrinth.push(new Labyrinth(gl, [7, 0.6, i-2]));
				labyrinth.push(new Labyrinth(gl, [7, 0.6, i-3]));
				labyrinth.push(new Labyrinth(gl, [7, 0.6, i-4]));
				labyrinth.push(new Labyrinth(gl, [7, 0.6, i]));

				labyrinth.push(new Labyrinth(gl, [7, 0.6, i-10]));
				labyrinth.push(new Labyrinth(gl, [7, 0.6, i-11]));
				labyrinth.push(new Labyrinth(gl, [7, 0.6, i-12]));


				labyrinth.push(new Labyrinth(gl, [-7, 0.6, i]));
				labyrinth.push(new Labyrinth(gl, [-7, 0.6, i-1]));
				labyrinth.push(new Labyrinth(gl, [-7, 0.6, i-2]));
				labyrinth.push(new Labyrinth(gl, [-7, 0.6, i-3]));
				labyrinth.push(new Labyrinth(gl, [-7, 0.6, i-4]));


				labyrinth.push(new Labyrinth(gl, [-7, 0.6, i-10]));
				labyrinth.push(new Labyrinth(gl, [-7, 0.6, i-11]));
				labyrinth.push(new Labyrinth(gl, [-7, 0.6, i-12]));


				labyrinth.push(new Labyrinth(gl, [-1, 0.6, -i]));
				labyrinth.push(new Labyrinth(gl, [-1, 0.6, -i+1]));
				labyrinth.push(new Labyrinth(gl, [-1, 0.6, -i+2]));
				labyrinth.push(new Labyrinth(gl, [-1, 0.6, -i+3]));

				labyrinth.push(new Labyrinth(gl, [0, 0.6, -i]));
				labyrinth.push(new Labyrinth(gl, [0, 0.6, -i+1]));
				labyrinth.push(new Labyrinth(gl, [0, 0.6, -i+2]));
				labyrinth.push(new Labyrinth(gl, [0, 0.6, -i+3]));

				labyrinth.push(new Labyrinth(gl, [0, 0.6, -i+8]));

				labyrinth.push(new Labyrinth(gl, [1, 0.6, -i]));
				labyrinth.push(new Labyrinth(gl, [1, 0.6, -i+1]));
				labyrinth.push(new Labyrinth(gl, [1, 0.6, -i+2]));
				labyrinth.push(new Labyrinth(gl, [1, 0.6, -i+3]));
			} else {
				labyrinth.push(new Labyrinth(gl, [4, 0.6, -i]));
				labyrinth.push(new Labyrinth(gl, [-4, 0.6, -i]));
			}
		}

	} catch (e) {
		console.log("Create labyrinth exception", e);
	}

}
