class CelestialBody
{
	constructor( transX, transY, transZ, scale, rotX, rotY, angleSwept, orbitRadius )
	{
		this.transX = transX;
		this.transY = transY;
		this.transZ = transZ;
		
		this.scale = scale;
		
		this.rotX = rotX;
		this.rotY = rotY;

		this.angleSwept = angleSwept;
		this.orbitRadius  = orbitRadius;
	}
	
	newPositioninOrbit( angleIncrement, centerX, centerZ )
	{
		this.angleSwept += angleIncrement;
		this.transX = centerX + this.orbitRadius * Math.cos( this.angleSwept );
		this.transZ = centerZ + this.orbitRadius * Math.sin( this.angleSwept );
		if ( this.angleSwept > 2*Math.PI ) this.angleSwept -= 2*Math.PI;
	}
}