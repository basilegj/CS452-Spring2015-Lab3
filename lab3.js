/* Greg Basile */

var canvas;
var gl;

var numVertices  = 36;

var pointsArray = [];
var normalsArray = [];
var colorArray = [];
var rand_i; 

var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5, -0.5, -0.5, 1.0 )
    ];

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var ctm;
var ambientColor, diffuseColor, specularColor;
var modelView, projection;
var viewerPos;
var program;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta =[0, 0, 0];

var thetaLoc;

var    colors = [
        vec4(0, 0, 0, 1), // black
        vec4(1.0, 0, 0, 1), // red
        vec4(1.0, 1.0, 0, 1), // yelow
        vec4(0, 1.0, 0, 1), // green
        vec4(0, 0, 1.0, 1), // blue
        vec4(1.0, 0, 1.0, 1), // magenta
        vec4(0, 1.0, 1.0, 1),   // cyan  /**/
		vec4(1.0, 1.0, 1.0, 1.0) // white    
];


function quad(a, b, c, d) {

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);
     var normal = vec3(normal);

	rand_i = Math.floor((100-0)*Math.random()) % 8;
    pointsArray.push(vertices[rand_i]); 
    normalsArray.push(normal); 
	colorArray.push(colors[rand_i]); 

	rand_i = Math.floor((100-0)*Math.random()) % 8;
     pointsArray.push(vertices[rand_i]); 
     normalsArray.push(normal); 
	 colorArray.push(colors[rand_i]); 

	rand_i = Math.floor((100-0)*Math.random()) % 8;
     pointsArray.push(vertices[rand_i]); 
     normalsArray.push(normal);   
	 colorArray.push(colors[rand_i]); 

	rand_i = Math.floor((100-0)*Math.random()) % 8;
     pointsArray.push(vertices[rand_i]);  
     normalsArray.push(normal); 
	 colorArray.push(colors[rand_i]); 

	rand_i = Math.floor((100-0)*Math.random()) % 8;
     pointsArray.push(vertices[rand_i]); 
     normalsArray.push(normal); 
  	 colorArray.push(colors[rand_i]); 

	rand_i = Math.floor((100-0)*Math.random()) % 8;
     pointsArray.push(vertices[rand_i]); 
     normalsArray.push(normal);    
	 colorArray.push(colors[rand_i]); 
}


function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    colorCube();
	
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorArray), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
	
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    thetaLoc = gl.getUniformLocation(program, "theta"); 
    
    viewerPos = vec3(0.0, 0.0, -20.0 );

    projection = ortho(-1, 1, -1, 1, -100, 100);
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
       flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
       flatten(lightPosition) );
       
    gl.uniform1f(gl.getUniformLocation(program, 
       "shininess"),materialShininess);
    
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),
       false, flatten(projection));
    modelView = mat4();
    console.log(colorArray);
    console.log(pointsArray);
    console.log(normalsArray);
	
	render();
}

var render = function(){
            
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
    modelCube();
              
    gl.uniformMatrix4fv( gl.getUniformLocation(program,
            "modelViewMatrix"), false, flatten(modelView) );

    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
            
            
    requestAnimFrame(render);
}

window.addEventListener( "keydown", function(event){
	var key = String.fromCharCode(event.keyCode);
	//console.log(key);

	switch ( key ) {
			case '%':
				console.log("left....");
				theta[1] -= 2.0;
				break;
			case "'": 
				theta[1] += 2.0;
				console.log("right....");			
				break;
			case '&':
				theta[0] += 2.0;
				console.log("up....");
				break;	
			case '(':
				theta[0] -= 2.0;
				
				console.log("down....");
				break;
				
			default:
	}

} );

function modelCube(){
	modelView = mat4();
    	modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0] ));
    	modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0] ));
    	modelView = mult(modelView, rotate(theta[zAxis], [0, 0, 1] ));
}
