// <============================================ EJERCICIOS ============================================>
// a) Implementar la función:
//
//      GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
//
//    Si la implementación es correcta, podrán hacer rotar la caja correctamente (como en el video). IMPORTANTE: No
//    es recomendable avanzar con los ejercicios b) y c) si este no funciona correctamente. 
//
// b) Implementar los métodos:
//
//      setMesh( vertPos, texCoords )
//      swapYZ( swap )
//      draw( trans )
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado, asi como también intercambiar 
//    sus coordenadas yz. Para reenderizar cada fragmento, en vez de un color fijo, pueden retornar: 
//
//      gl_FragColor = vec4(1,0,gl_FragCoord.z*gl_FragCoord.z,1);
//
//    que pintará cada fragmento con un color proporcional a la distancia entre la cámara y el fragmento (como en el video).
//    IMPORTANTE: No es recomendable avanzar con el ejercicio c) si este no funciona correctamente. 
//
// c) Implementar los métodos:
//
//      setTexture( img )
//      showTexture( show )
//
//    Si la implementación es correcta, podrán visualizar el objeto 3D que hayan cargado y su textura.
//
// Notar que los shaders deberán ser modificados entre el ejercicio b) y el c) para incorporar las texturas.  
// <=====================================================================================================>


/*

TEXTURAS:




*/


// Esta función recibe la matriz de proyección (ya calculada), una traslación y dos ángulos de rotación
// (en radianes). Cada una de las rotaciones se aplican sobre el eje x e y, respectivamente. La función
// debe retornar la combinación de las transformaciones 3D (rotación, traslación y proyección) en una matriz
// de 4x4, representada por un arreglo en formato column-major. El parámetro projectionMatrix también es 
// una matriz de 4x4 alamcenada como un arreglo en orden column-major. En el archivo project4.html ya está
// implementada la función MatrixMult, pueden reutilizarla. 

function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
	// Objetivo: formar la matriz de transformación.

	// Matriz de traslación
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	// Matriz de rotacion en formato Column - Major
	var rotX = [
		1, 0, 0, 0,
		0, Math.cos(rotationX), Math.sin(rotationX), 0,
		0, -Math.sin(rotationX), Math.cos(rotationX), 0,
		0, 0, 0, 1
	];

	// Matriz de rotacion en formato Column - Major
	var rotY = [
		Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
		0, 1, 0, 0,
		Math.sin(rotationY), 0, Math.cos(rotationY), 0,
		0, 0, 0, 1
	]; 

	var rotationMatrix = MatrixMult(rotY, rotX)
	var rotAndTrans = MatrixMult(trans, rotationMatrix)
	var mvp = MatrixMult( projectionMatrix, rotAndTrans );
	
	return mvp;
}

// [COMPLETAR] Completar la implementación de esta clase.
class MeshDrawer
{
	// El constructor es donde nos encargamos de realizar las inicializaciones necesarias. 
	constructor()
	{
		// 1. Compilamos el programa de shaders
		this.prog = InitShaderProgram( meshVS, meshFS )
		
		// 2. Obtenemos los IDs de las variables uniformes en los shaders
		this.mvp = gl.getUniformLocation( this.prog, 'mvp' );

		this.yz_swap = gl.getUniformLocation(this.prog, 'yz_swap'); 
		this.show_texture = gl.getUniformLocation(this.prog, 'show_texture'); 
		
		// 3. Obtenemos los IDs de los atributos de los vértices en los shaders
		this.pos = gl.getAttribLocation( this.prog, 'pos');

		// 4. Obtenemos las coordenadas en textura para cada vertice
		this.vTexCoord = gl.getAttribLocation( this.prog, 'vTexCoord');

		// 5. Creo un buffer para almacenar las posiciones de los vertices
		this.position_buffer = gl.createBuffer();

		// 6. Creo un buffer para alamcenar mapeo de vertice a texture
		this.vTexCoord_buffer = gl.createBuffer();
	}
	
	// Esta función se llama cada vez que el usuario carga un nuevo archivo OBJ.
	// En los argumentos de esta función llegan un areglo con las posiciones 3D de los vértices
	// y un arreglo 2D con las coordenadas de textura. Todos los items en estos arreglos son del tipo float. 
	// Los vértices se componen de a tres elementos consecutivos en el arreglo vertexPos [x0,y0,z0,x1,y1,z1,..,xn,yn,zn]
	// De manera similar, las cooredenadas de textura se componen de a 2 elementos consecutivos y se 
	// asocian a cada vértice en orden.

	// vertPos : [x0,y0,z0,x1,y1,z1,..,xn,yn,zn].
	// texCoords: Es el mapeo Vertice triangulo 3D -> Coordenada Textura 2D. 

	setMesh( vertPos, texCoords )
	{
		this.numVertexes = vertPos.length / 3;

		// Fill vertex buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		// Fill texCoord buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vTexCoord_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);		
	}
	
	// Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Intercambiar Y-Z'
	// El argumento es un boleano que indica si el checkbox está tildado
	swapYZ( swap )
	{
		// Binding del programa y seteo de la variable uniforme que indica el estado del checkbox.
		gl.useProgram( this.prog );
		if( swap == true )  {
			gl.uniform1i(this.yz_swap, 1);
		} else {
			gl.uniform1i(this.yz_swap, 0);
		}
	}
	
	// Esta función se llama para dibujar la malla de triángulos
	// El argumento es la matriz de transformación, la misma matriz que retorna GetModelViewProjection
	draw( trans )
	{
		// Objetivo: dibujar la colección de triángulos en WebGL
		
		// 1. Binding del programa
		gl.useProgram( this.prog )
	
		// 2. Setear matriz de transformacion
		gl.uniformMatrix4fv( this.mvp, false, trans );

		// 3. Binding del buffer para el mapeo de coordenadas de la texture
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vTexCoord_buffer);

		// 4. Habilitamos los atributos
		gl.vertexAttribPointer( this.vTexCoord, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.vTexCoord );
		
	    // 5. Binding del buffer para posiciones
		gl.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer);

		// 6. Habilitamos los atributos
		gl.vertexAttribPointer( this.pos, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( this.pos );

		// Dibujamos
		gl.drawArrays( gl.TRIANGLES, 0, this.numVertexes );
	}
	
	// Esta función se llama para setear una textura sobre la malla
	// El argumento es un componente <img> de html que contiene la textura.

	// Idea: Me falta establecer el atributo uniforme que almacena 
	// la textura misma. Ya pase el mapeo por atributo varying.
	setTexture( img )
	{
		//Creo un buffer para almacenar la textura
		const textura = gl.createTexture();
		
		//Binding del buffer y le seteo una textura
		gl.bindTexture( gl.TEXTURE_2D, textura );
		gl.texImage2D( gl.TEXTURE_2D,
		0,
		gl.RGB,
		gl.RGB,
		gl.UNSIGNED_BYTE,
		img );

		//Genero los mipmaps de la textura del ultimo buffer bindeado
		gl.generateMipmap( gl.TEXTURE_2D );

		//Hago uso de la Texture Unit 0 y le comunico la textura a usar
		gl.activeTexture( gl.TEXTURE0 );
		gl.bindTexture( gl.TEXTURE_2D, textura );
		
		//Obtenemos ubicacion de una variable uniforme y le seteo el contenido de Texture Unit 0
		var sampler = gl.getUniformLocation(this.prog, 'texGPU');
		gl.useProgram(this.prog);
		gl.uniform1i(sampler, 0);
	}
	
	// Esta función se llama cada vez que el usuario cambia el estado del checkbox 'Mostrar textura'
	// El argumento es un boleano que indica si el checkbox está tildado
	showTexture( show )
	{
		// Binding del programa y seteo de la variable uniforme que indica el estado del checkbox.
		gl.useProgram( this.prog );
		if( show == true )  {
			gl.uniform1i(this.show_texture, 1);
		} else {
			gl.uniform1i(this.show_texture, 0);
		}
	}
}

// Vertex Shader
// Si declaras las variables pero no las usas es como que no las declaraste y va a tirar error. Siempre va punto y coma al finalizar la sentencia. 
// Las constantes en punto flotante necesitan ser expresadas como x.y, incluso si son enteros: ejemplo, para 4 escribimos 4.0

// Agrego al vertex shader el mapeo de coordenadas.

var meshVS = `
	attribute vec3 pos;
	uniform mat4 mvp;
	attribute vec2 vTexCoord;
	varying vec2 texCoord;

	uniform int yz_swap;

	void main()
	{ 
		if(yz_swap == 1) {
			gl_Position = mvp * vec4(pos.x, pos.z, pos.y, 1);
		} else {
			gl_Position = mvp * vec4(pos,1);	
		}
		texCoord = vTexCoord;
	}
`;

// Fragment Shader
// sampler2D es lo que llega de la TEXTURE UNIT.

// texCoord son las posiciones de la textura que
// fueron mapeadas a cada fragmento en el rasterizador. (Pixel 2D)

// Cada vertice 3D tenia mapeada una coordenada en la textura
// 2D y luego el rasterizador completo con los demas fragmentos.

// Con texture2D le pedimos a la GPU que haga la interpolacion
// vista en clase junto con la tecnica de mipMap, etc.

var meshFS = `
	precision mediump float;

	uniform sampler2D texGPU;
	varying vec2 texCoord;

	uniform int show_texture;

	void main()
	{		
		if(show_texture == 1) {
			gl_FragColor = texture2D(texGPU, texCoord);
		} else {
			gl_FragColor = vec4(1,0,gl_FragCoord.z*gl_FragCoord.z,1);
		}
		
	}
`;
