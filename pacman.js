// Pacman object
// Expected parameter, gl instance and object position
function Pacman(gl, position = [0, 0, 0]) {

	// Shader program
	if (Pacman.shaderProgram === undefined) {
		Pacman.shaderProgram = initShaderProgram(gl, "vertex-shader", "fragment-shader");
		if (Pacman.shaderProgram === null) {
			throw new Error('Creating the shader program failed.');
		}
		Pacman.locations = {
			attribute: {
				vertPosition: gl.getAttribLocation(Pacman.shaderProgram, "vertPosition"),
				vertColor: gl.getAttribLocation(Pacman.shaderProgram, "vertColor"),
				aNormal: gl.getAttribLocation(Pacman.shaderProgram, "aNormal"),
			},
			uniform: {
				mMatrix: gl.getUniformLocation(Pacman.shaderProgram, "mMatrix"),
				wMatrix: gl.getUniformLocation(Pacman.shaderProgram, "wMatrix"),
				vMatrix: gl.getUniformLocation(Pacman.shaderProgram, "vMatrix"),
				mMatrixInv: gl.getUniformLocation(Pacman.shaderProgram, "mMatrixInv"),
				pMatrix: gl.getUniformLocation(Pacman.shaderProgram, "pMatrix"),
				pLight: gl.getUniformLocation(Pacman.shaderProgram, "pLight"),
				camera: gl.getUniformLocation(Pacman.shaderProgram, "camera"),
				specularEnabled: gl.getUniformLocation(Pacman.shaderProgram, "specularEnabled"),
				phong: gl.getUniformLocation(Pacman.shaderProgram, "phong")
			}
		};
		gl.enableVertexAttribArray(Pacman.locations.attribute.vertPosition);
		gl.enableVertexAttribArray(Pacman.locations.attribute.vertColor);
		gl.enableVertexAttribArray(Pacman.locations.attribute.aNormal);
	}

	this.initialize = function () {
		// Buffers
		if (Pacman.buffers === undefined || animatePacman !== this.animate) {
			// Create a buffer with the vertex positions
			// 3 coordinates per vertex, 3 vertices per triangle
			// 2 triangles make up the ground plane, 4 triangles make up the sides
			const pBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);


			// Position vertices
			let limit = 33;
			let i, hi, si, ci;
			let j, hj, sj, cj;
			let p1, p2;

			let vertices = [];
			let normals = [];
			for (let j = 0; j <= limit; j++) {
				hj = j * animatePacman * Math.PI / limit;
				sj = Math.sin(hj);
				cj = Math.cos(hj);
				for (let i = 0; i <= limit; i++) {
					hi = i * Math.PI / limit;
					si = Math.sin(hi);
					ci = Math.cos(hi);

					// 0.77 to minimize the sphere
					vertices.push(ci * sj * 0.77);  // X
					vertices.push(cj * 0.77);       // Y
					vertices.push(si * sj * 0.77);  // Z

					normals.push(ci*sj);
					normals.push(cj);
					normals.push(si*sj);
				}
			}

			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
			pBuffer.itemSize = 3;
			pBuffer.numItems = vertices.length;


			// Indices
			let indices = [];
			let iBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
			for (j = 0; j < limit; j++) {
				for (i = 0; i < limit; i++) {
					p1 = j * (limit + 1) + i;
					p2 = p1 + (limit + 1);

					indices.push(p1);
					indices.push(p2);
					indices.push(p1 + 1);

					indices.push(p1 + 1);
					indices.push(p2);
					indices.push(p2 + 1);
				}
			}

			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
			iBuffer.itemSize = 3;
			iBuffer.numItems = indices.length;


			// Color
			let cBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
			let colors = [];

			for (let i = 0; i <= limit; i++) {
				for (let j = 0; j <= limit; j++) {

					if ((i >= 3 && i <= 4 && j >= 3 && j <= 5) || (i >= 3 && i <= 4 && j >= 27 && j <= 29)) {
						colors.push(0);
						colors.push(0);
						colors.push(0);
					} else {
						colors.push(0.99);
						colors.push(0.99);
						colors.push(0);
					}

				}
			}
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
			cBuffer.itemSize = 3;
			cBuffer.numitems = colors.length;


			//Create a buffer with the normals
			const nBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);


			Pacman.buffers = {
				pBuffer: pBuffer,
				cBuffer: cBuffer,
				nBuffer: nBuffer,
				iBuffer: iBuffer,
				pComponents: 3,
				cComponents: 3,
				nComponents: 3,
			};
		}
	};

	this.initialize();

	// Object Variables
	this.lookDirection = "down";
	this.animate = animatePacman;
	this.lcPosition = position;
	this.scale = [0.70, 0.70, 0.70];

	this.mMatrix = mat4.create();
	this.lcMatrix = mat4.create();
	this.mMatrixInv = mat3.create();
	this.selected = false;
	this.global = false;

	// Object draw function
	this.draw = function (gl, pMatrix, vMatrix) {
		gl.useProgram(Pacman.shaderProgram);
		gl.uniformMatrix4fv(Pacman.locations.uniform.pMatrix, false, pMatrix);
		gl.uniformMatrix4fv(Pacman.locations.uniform.mMatrix, false, this.mMatrix);
		gl.uniformMatrix4fv(Pacman.locations.uniform.wMatrix, false, wMatrix);
		gl.uniformMatrix4fv(Pacman.locations.uniform.vMatrix, false, vMatrix);
		gl.uniformMatrix3fv(Pacman.locations.uniform.mMatrixInv, false, this.mMatrixInv);
		gl.uniform3fv(Pacman.locations.uniform.pLight, lightPosition);
		gl.uniform3fv(Pacman.locations.uniform.camera, [0, -10, 0]);
		gl.uniform1f(Pacman.locations.uniform.specularEnabled, specularEnabled);
		gl.uniform1f(Pacman.locations.uniform.phong, phong);
		gl.uniform4fv(Pacman.locations.uniform.uColor, [1.0, 0.0, 0.0, 1.0]);

		gl.bindBuffer(gl.ARRAY_BUFFER, Pacman.buffers.pBuffer);
		gl.vertexAttribPointer(Pacman.locations.attribute.vertPosition, Pacman.buffers.pComponents, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, Pacman.buffers.cBuffer);
		gl.vertexAttribPointer(Pacman.locations.attribute.vertColor, Pacman.buffers.cComponents, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, Pacman.buffers.nBuffer);
		gl.vertexAttribPointer(Pacman.locations.attribute.aNormal, Pacman.buffers.nComponents, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, Pacman.buffers.iBuffer);
		gl.drawElements(gl.TRIANGLES, Pacman.buffers.iBuffer.numItems, gl.UNSIGNED_SHORT, 0);

		gl.drawArrays(gl.TRIANGLES, 0, 18);
	};


	this.start = function () {
		mat4.translate(this.mMatrix, this.mMatrix, this.lcPosition);
		mat4.rotateX(this.mMatrix, this.mMatrix, -1.5);
		mat4.scale(this.mMatrix, this.mMatrix, this.scale);
		mat4.multiply(this.lcMatrix, this.lcMatrix, this.mMatrix);
	};

	this.rotate = function (lookDirection, degree) {
		if (this.lookDirection !== lookDirection) {
			mat4.identity(this.mMatrix);
			mat4.translate(this.mMatrix, this.mMatrix, this.lcPosition);
			mat4.rotateX(this.mMatrix, this.mMatrix, -1.5);
			mat4.rotateZ(this.mMatrix, this.mMatrix, degree);
			mat4.scale(this.mMatrix, this.mMatrix, this.scale);
			mat4.identity(this.lcMatrix);
			mat4.multiply(this.lcMatrix, this.lcMatrix, this.mMatrix);
			this.lookDirection = lookDirection;
		}
	};

	this.rotateToRight = function () {
		if (this.lookDirection !== "right") {
			mat4.identity(this.mMatrix);
			mat4.translate(this.mMatrix, this.mMatrix, this.lcPosition);
			mat4.rotateX(this.mMatrix, this.mMatrix, -1.5);
			mat4.rotateZ(this.mMatrix, this.mMatrix, 1.5);
			mat4.scale(this.mMatrix, this.mMatrix, this.scale);
			mat4.identity(this.lcMatrix);
			mat4.multiply(this.lcMatrix, this.lcMatrix, this.mMatrix);
			this.lookDirection = "right"
		}
	};

	this.rotateToUp = function () {
		if (this.lookDirection !== "up") {
			mat4.identity(this.mMatrix);
			mat4.translate(this.mMatrix, this.mMatrix, this.lcPosition);
			mat4.rotateX(this.mMatrix, this.mMatrix, -1.5);
			mat4.rotateZ(this.mMatrix, this.mMatrix, -2.5);
			mat4.scale(this.mMatrix, this.mMatrix, this.scale);
			mat4.identity(this.lcMatrix);
			mat4.multiply(this.lcMatrix, this.lcMatrix, this.mMatrix);
			this.lookDirection = "up"
		}
	};

	this.rotateToDown = function () {
		if (this.lookDirection !== "down") {
			mat4.identity(this.mMatrix);
			mat4.translate(this.mMatrix, this.mMatrix, this.lcPosition);
			mat4.rotateX(this.mMatrix, this.mMatrix, -1.5);
			mat4.scale(this.mMatrix, this.mMatrix, this.scale);
			mat4.identity(this.lcMatrix);
			mat4.multiply(this.lcMatrix, this.lcMatrix, this.mMatrix);
			this.lookDirection = "down"
		}
	};

	this.update = function (x, y, z, position = [0, 0, 0], scale = [1, 1, 1]) {

		let canMove = true;
		if (!arraysEqual(position, [0, 0, 0])) {
			// Sum postion vector with existing position if different
			this.lcPosition = this.lcPosition.map(function (num, idx) {
				return num + position[idx];
			});

			console.log("Labyrinth size: " + labyrinth.length);
			console.log("Pacman position: " + this.lcPosition);
			labyrinth.forEach((e, i) => {
				if (e.lcPosition[0] === 0) {
					console.log(e.lcPosition);
				}
					if (canMove && arraysEqual(e.lcPosition, this.lcPosition)) {
						console.log("CANNOT MOVE!", e.lcPosition);
						canMove = false;
					}
			});
		}

		if (canMove) {
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
		} else {
			this.lcPosition = this.lcPosition.map(function (num, idx) {
				return num - position[idx];
			});
			return false;
		}
		return true;
	}
}
