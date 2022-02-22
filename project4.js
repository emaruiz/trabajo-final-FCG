// Estructuras globales e inicializaciones
var boxDrawer;          // clase para contener el comportamiento de la caja
var meshDrawer;         // clase para contener el comportamiento de la malla
var numberOfCelestialBodys=9;
var celestialBodysMeshDrawer=[];
var canvas, gl;         // canvas y contexto WebGL
var perspectiveMatrix;	// matriz de perspectiva

var autorot=0; // rotaciones 
var angleIncrement=[];
for (let planetIndex = 1; planetIndex < numberOfCelestialBodys; planetIndex++) 
{
	angleIncrement[planetIndex-1] = 0.01;
}

var celestialBodys=[];
celestialBodys[0] = new CelestialBody(0, 0, 3, 0.4, 0, 0, 0, 1);
var sun = celestialBodys[0];
const distanceBetweenSunAndNearestPlanet = 0.75;
const distanceBetweenPlanets = 0.5;
for (let planetIndex = 1; planetIndex < numberOfCelestialBodys; planetIndex++) 
{
	let distanceBetweenSunAndPlanet = distanceBetweenSunAndNearestPlanet+distanceBetweenPlanets*(planetIndex-1);
	celestialBodys[planetIndex] = new CelestialBody(sun.transX+distanceBetweenSunAndPlanet, 
											 sun.transY, sun.transZ, 0.20, sun.rotX, sun.rotY, 0, distanceBetweenSunAndPlanet);
}

var imgs=[];
for (let i = 0; i < numberOfCelestialBodys; i++) 
{
	imgs[i] = new Image();
}

// Funcion de inicialización, se llama al cargar la página
function InitWebGL()
{
	// Inicializamos el canvas WebGL
	canvas = document.getElementById("canvas");
	canvas.oncontextmenu = function() {return false;};
	gl = canvas.getContext("webgl", {antialias: false, depth: true});	// Initialize the GL context
	if (!gl) 
	{
		alert("Imposible inicializar WebGL. Tu navegador quizás no lo soporte.");
		return;
	}
	
	// Inicializar color clear
	gl.clearColor(0,0,0,0);
	gl.enable(gl.DEPTH_TEST); // habilitar test de profundidad 
	
	// Inicializar los shaders y buffers para renderizar	
	boxDrawer  = new BoxDrawer();
	for (let i = 0; i < numberOfCelestialBodys; i++) 
	{
		celestialBodysMeshDrawer[i] = new MeshDrawer();
	}
	
	// Setear el tamaño del viewport
	UpdateCanvasSize();
}

// Funcion para actualizar el tamaño de la ventana cada vez que se hace resize
function UpdateCanvasSize()
{
	// 1. Calculamos el nuevo tamaño del viewport
	canvas.style.width  = "100%";
	canvas.style.height = "100%";

	const pixelRatio = window.devicePixelRatio || 1;
	canvas.width     = pixelRatio * canvas.clientWidth;
	canvas.height    = pixelRatio * canvas.clientHeight;

	const width  = (canvas.width  / pixelRatio);
	const height = (canvas.height / pixelRatio);

	canvas.style.width  = width  + 'px';
	canvas.style.height = height + 'px';

	// 2. Lo seteamos en el contexto WebGL
	gl.viewport( 0, 0, canvas.width, canvas.height );

	// 3. Cambian las matrices de proyección, hay que actualizarlas
	UpdateProjectionMatrix();
}

// Calcula y cevuelve la matriz de perspectiva (column-major)
function UpdateProjectionMatrix()
{
	// Parámetros para la matriz de perspectiva
	var r = canvas.width / canvas.height;
	var n = (sun.transZ - 5/*1.74*/);

	const min_n = 0.001;
	
	if ( n < min_n ) n = min_n;
	var f = (sun.transZ + 5/*1.74*/);
	var fov = 3.145 * 60 / 180;
	var s = 1 / Math.tan( fov/2 );

	// Matriz de perspectiva
	perspectiveMatrix = [
		s/r, 0, 0, 0,
		0, s, 0, 0,
		0, 0, (n+f)/(f-n), 1,
		0, 0, -2*n*f/(f-n), 0
	];
}

// Funcion que reenderiza la escena. 
function DrawScene()
{
	// 1. Obtenemos las matrices de transformación 
	let celestialsMvp = [];
	for (let i = 0; i < numberOfCelestialBodys; i++) 
	{
		celestialsMvp[i] = GetModelViewProjection( perspectiveMatrix, 
													celestialBodys[i].transX, 
													celestialBodys[i].transY, 
													celestialBodys[i].transZ, 
													celestialBodys[i].scale, 
													celestialBodys[i].rotX, 
													autorot+celestialBodys[i].rotY );
	}

	// 2. Limpiamos la escena
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
		
	// 3. Le pedimos a cada objeto que se dibuje a si mismo
	for (let i = 0; i < numberOfCelestialBodys; i++) 
	{
		celestialBodysMeshDrawer[i].setTexture( imgs[i] );
		celestialBodysMeshDrawer[i].draw( celestialsMvp[i] );
	}
	if ( showBox.checked ) 
	{
		boxDrawer.draw( celestialsMvp[0] );
	}
}

// Función que compila los shaders que se le pasan por parámetro (vertex & fragment shaders)
// Recibe los strings de cada shader y retorna un programa
function InitShaderProgram( vsSource, fsSource )
{
	// Función que compila cada shader individualmente
	const vs = CompileShader( gl.VERTEX_SHADER,   vsSource );
	const fs = CompileShader( gl.FRAGMENT_SHADER, fsSource );

	// Crea y linkea el programa 
	const prog = gl.createProgram();
	gl.attachShader(prog, vs);
	gl.attachShader(prog, fs);
	gl.linkProgram(prog);

	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) 
	{
		alert('No se pudo inicializar el programa: ' + gl.getProgramInfoLog(prog));
		return null;
	}
	return prog;
}

// Función para compilar shaders, recibe el tipo (gl.VERTEX_SHADER o gl.FRAGMENT_SHADER)
// y el código en forma de string. Es llamada por InitShaderProgram()
function CompileShader( type, source )
{
	// Creamos el shader
	const shader = gl.createShader(type);

	// Lo compilamos
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	// 	Verificamos si la compilación fue exitosa
	if (!gl.getShaderParameter( shader, gl.COMPILE_STATUS) ) 
	{
		alert('Ocurrió un error durante la compilación del shader:' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

// Multiplica 2 matrices y devuelve A*B.
// Los argumentos y el resultado son arreglos que representan matrices en orden column-major
function MatrixMult( A, B )
{
	var C = [];
	for ( var i=0; i<4; ++i ) 
	{
		for ( var j=0; j<4; ++j ) 
		{
			var v = 0;
			for ( var k=0; k<4; ++k ) 
			{
				v += A[j+4*k] * B[k+4*i];
			}
			C.push(v);
		}
	}
	return C;
}

// ======== Funciones para el control de la interfaz ========

var showBox; // boleano para determinar si se debe o no mostrar la caja

// Al cargar la página
window.onload = function() 
{
	showBox = document.getElementById('show-box');
	InitWebGL();

	// Evento de zoom (ruedita)
	canvas.zoom = function( s ) 
	{
		for (let i = 0; i < numberOfCelestialBodys; i++) 
		{
			celestialBodys[i].transZ *= s/canvas.height + 1;
		}
		UpdateProjectionMatrix();
		DrawScene();
	}
	canvas.onwheel = function() { canvas.zoom(0.3*event.deltaY); }

	// Evento de click 
	canvas.onmousedown = function() 
	{
		var cx = event.clientX;
		var cy = event.clientY;
		if ( event.ctrlKey ) 
		{
			canvas.onmousemove = function() 
			{
				canvas.zoom(5*(event.clientY - cy));
				cy = event.clientY;
			}
		} 
		else 
		{
			// Si se mueve el mouse, actualizo las matrices de rotación
			canvas.onmousemove = function() 
			{
				sun.rotY += (cx - event.clientX)/canvas.width*5;
				sun.rotX += (cy - event.clientY)/canvas.height*5;
				cx = event.clientX;
				cy = event.clientY;
				UpdateProjectionMatrix();
				DrawScene();
			}
		}
	}

	// Evento suntar el mouse
	canvas.onmouseup = canvas.onmouseleave = function() 
	{
		canvas.onmousemove = null;
	}
	
	// Dibujo la escena
	DrawScene();
};

// Evento resize
function WindowResize()
{
	UpdateCanvasSize();
	DrawScene();
}

// Control de la calesita de rotación
var timer;
function AutoRotate( param )
{
	// Si hay que girar...
	if ( param.checked ) 
	{
		// Vamos rotando una cantiad constante cada 30 ms
		timer = setInterval( function() 
			{
				var v    = document.getElementById('rotation-speed').value;
				autorot += 0.0005 * v;
				if ( autorot > 2*Math.PI ) autorot -= 2*Math.PI;

				// Reenderizamos
				DrawScene();

			}, 30
		);
		document.getElementById('rotation-speed').disabled = false;
	} 
	else 
	{
		clearInterval( timer );
		document.getElementById('rotation-speed').disabled = true;
	}
}

// Control de textura visible
function ShowTexture( param )
{
	for (let i = 0; i < numberOfCelestialBodys; i++) 
	{
		celestialBodysMeshDrawer[i].showTexture( param.checked );
	}
	DrawScene();
}

// Control de intercambiar y-z
function SwapYZ( param )
{
	celestialBodysMeshDrawer[0].swapYZ( param.checked );
	DrawScene();
}

// Cargar archivo obj
function LoadObj( param )
{
	if ( param.files && param.files[0] ) 
	{
		var reader = new FileReader();
		reader.onload = function(e) 
		{
			var mesh = new ObjMesh;
			mesh.parse( e.target.result );
			var box = mesh.getBoundingBox();
			var shift = [
				-(box.min[0]+box.max[0])/2,
				-(box.min[1]+box.max[1])/2,
				-(box.min[2]+box.max[2])/2
			];
			var size = [
				(box.max[0]-box.min[0])/2,
				(box.max[1]-box.min[1])/2,
				(box.max[2]-box.min[2])/2
			];
			var maxSize = Math.max( size[0], size[1], size[2] );
			var scale = 1/maxSize;
			mesh.shiftAndScale( shift, scale );
			var buffers = mesh.getVertexBuffers();
			for (let i = 0; i < numberOfCelestialBodys; i++) 
			{
				celestialBodysMeshDrawer[i].setMesh( buffers.positionBuffer, buffers.texCoordBuffer );
			}
			DrawScene();
		}
		reader.readAsText( param.files[0] );
	}
}

// Cargar textura
function LoadTexture( param )//MODIFICAR DESDE ACA
{
	if ( param.files && param.files[0] ) 
	{
		var reader = new FileReader();
		reader.onload = function(e) 
		{
			var celestialBodyIndex = parseInt( param.id.split("-")[1] );
			var img = document.getElementById('texture-img-'+celestialBodyIndex.toString());
			img.onload = function() 
			{
				imgs[celestialBodyIndex] = img;
				DrawScene();
			}
			img.src = e.target.result;
		};
		reader.readAsDataURL( param.files[0] );
	}
}

// Control de tamaño
function SetSize( param )
{
	var celestialBodyIndex = parseInt( param.id.split("-")[2] );
	celestialBodys[celestialBodyIndex].scale = parseFloat( param.value );
	DrawScene();
}

// Control de traslacion de planeta
var timerRevolution=[];
function RevolutionPlanet( param )
{
	var planetIndex = parseInt( param.id.split("-")[2] )-1;
	if ( param.checked ) 
	{
		timerRevolution[planetIndex] = setInterval( function() 
			{
				celestialBodys[planetIndex+1].newPositioninOrbit( angleIncrement[planetIndex], sun.transX, sun.transZ );

				// Reenderizamos
				DrawScene();

			}, 30
		);
		document.getElementById('speed-value-'+(planetIndex+1).toString()).disabled = false;
	}
	else 
	{
		clearInterval( timerRevolution[planetIndex] );
		document.getElementById('speed-value-'+(planetIndex+1).toString()).disabled = true;
	}
}

// Control de velocidad de traslacion
function SetSpeed( param )
{
	var planetIndex = parseInt( param.id.split("-")[2] )-1;
	angleIncrement[planetIndex] = parseFloat( param.value );
}

/*document.onkeydown = function (event)
{
	switch (event.keyCode)
	{
		case 37:
			console.log("Left key is pressed.");
			sun.transX += 0.1;
			for (let planetIndex = 0; planetIndex < numberOfCelestialBodys; planetIndex++) 
			{
				celestialBodys[planetIndex].transX += 0.1;
			}
			DrawScene();
			break;
		case 38:
			console.log("Up key is pressed.");
			break;
		case 39:
			console.log("Right key is pressed.");
			sun.transX -= 0.1;
			for (let planetIndex = 0; planetIndex < numberOfCelestialBodys; planetIndex++) 
			{
				celestialBodys[planetIndex].transX -= 0.1;
			}
			DrawScene();
			break;
		case 40:
			console.log("Down key is pressed.");
			break;
	}
};*/