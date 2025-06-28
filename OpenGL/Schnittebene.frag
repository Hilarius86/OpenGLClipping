#version 330 core

// Outputs colors in RGBA
out vec4 FragColor;

// Imports the current position from the Vertex Shader
in vec3 crntPos;
// Imports the normal from the Vertex Shader
in vec3 Normal;
// Imports the color from the Vertex Shader
in vec3 color;
// Imports the texture coordinates from the Vertex Shader
in vec2 texCoord;

in vec3 untransformPos;

//precision mediump float;
//layout(early_fragment_tests) in;

// Gets the Texture Units from the main function
uniform sampler2D diffuse0;
uniform sampler2D specular0;
// Gets the color of the light from the main function
uniform vec4 lightColor;
// Gets the position of the light from the main function
uniform vec3 lightPos;
// Gets the position of the camera from the main function
uniform vec3 camPos;

uniform int mode;
uniform float zMin;
uniform float zMax;

uniform samplerBuffer lineSegments;
uniform int segmentCount; 

vec4 direcLight()
{
	// ambient lighting
	float ambient = 0.20f;

	// diffuse lighting
	vec3 normal = normalize(Normal);
	vec3 lightDirection = normalize(vec3(1.0f, 1.0f, 0.0f));
	float diffuse = max(dot(normal, lightDirection), 0.0f);

	return (texture(diffuse0, texCoord) * (diffuse + ambient)) * lightColor;
}

vec3 isLeftOf(vec2 A, vec2 B, vec2 P)
{
	vec2 AB = B - A;
	vec2 AP = P - A;
	return cross(vec3(AB, 0.0), vec3(AP, 0.0));
}

void main()
{
	//FragColor = direcLight();
	
	
	//float Diff = zMax - zMin;
	//float segment = (untransformPos.z - zMin ) / Diff;
	//segment = untransformPos.z;
	
	float segment = 0.0f;
	if (untransformPos.z < 0.0)
	{
	  segment = 0.0f;
	}
	else
	{
	  segment = 1.0f;
	}
			
	vec2 value1 = texelFetch(lineSegments, int(segment)).rg;
	vec2 value2 = texelFetch(lineSegments, int(segment)+1).rg;

	//FragColor = vec4(0.0f, segment/2.0f, segment/2.0f, 1.0f);
    //FragColor = vec4(0.0f, value1.r/2.0f, value1.r/2.0f, 1.0f);
	//FragColor = vec4(0.0f, value2.r/2.0f, value2.r/2.0f, 1.0f);
	//float nullBisEins = mod(segment,1.0f);
    //FragColor = vec4(nullBisEins,nullBisEins,nullBisEins,1.0f);
	
	
	//FragColor = vec4(1.0, 1.0, 1.0, 1.0);
	vec2 A = value1;
	vec2 B = value2;
	vec2 P = (untransformPos.xz);
	vec2 AB = B - A;
	vec2 AP = P - A;
	vec3 LeftOf = cross(vec3(AB, 0.0), vec3(AP, 0.0));


	//vec3 LeftOf = isLeftOf(value1, value2, vec2(untransformPos.xz));		
	//vec4 erg = vec4(1.0f, 1.0f, 1.0f, 1.0f);

	//vec4 col = texture(diffuse0, texCoord);
	//vec4 col = texture(diffuse0, vec2(0.5f));
	//FragColor = (LeftOf.z < 0.001) ? col : col;
	//vec4 texColor = texture(diffuse0, texCoord);
	//bool inside = (LeftOf.z <= 0.001);
	//FragColor = inside ? texColor : vec4(0.0, 0.0, 0.0, 0.0);

	//vec4 color1 = texture(diffuse0, texCoord);
	//vec4 color2 = texture(diffuse0, texCoord);
	//bool cond = (true);
	//FragColor = cond ? color1 * vec4(1.0, 0.0, 0.0, 1.0) : color2 * vec4(0.0, 0.0, 1.0, 1.0);
	//FragColor = vec4(LeftOf.z * 0.1 + 0.5, 0.0, 0.0, 1.0);

	//vec4 texColor = texture(diffuse0, texCoord);
	////float mask = (LeftOf.z <= 0.001) ? 1.0 : 0.0;
	//float z = clamp(LeftOf.z, -100.0, 100.0);
	//float mask = z <= 0.001 ? 1.0 : 0.0;
	//FragColor = texColor * mask;

	//float fade = smoothstep(0.0001, 0.0, LeftOf.z);
	//FragColor = texture(diffuse0, texCoord) * vec4(fade, fade, fade, 1.0);

	//FragColor = vec4(normalize(vec3(AB, 0.0)) * 0.5 + 0.5, 1.0);
	//float mask = step(LeftOf.z, 0.001);
	//FragColor = vec4(mask, mask, mask, 1.0); // Sollte weiß oder schwarz zeigen
	

	//vec4 texColor = texture(diffuse0, texCoord);
	//float mask = step(LeftOf.z, 0.001); // 1 = Bedingung erfüllt
	//vec3 fallbackColor = vec3(1.0, 0.0, 1.0); // Magenta für "nicht erfüllt"
	//vec3 result = mix(fallbackColor, texColor.rgb, mask);
	//FragColor = vec4(result, 1.0);
	//FragColor = texColor;

	vec2 wrappedUV = fract(texCoord);
	vec4 texColor = texture(diffuse0, wrappedUV);
	if (texCoord.s > 0.5)
	{
		FragColor = texColor;
	}
	else
	{
		FragColor = vec4(1.0, 0.0, 0.0, 1.0); // rechts (rot)	
	}

	//float mask = float(LeftOf.z <= 0.001); // ergibt 1.0 oder 0.0
	//vec4 texColor = texture(diffuse0, fract(texCoord));
	//vec4 fallback = vec4(1.0, 0.0, 1.0, 1.0); // Magenta
	//FragColor = fallback + (texColor - fallback) * mask;
	

	

	//if 
	//{		
	//	//float ambient = 0.20f;
	//	//vec3 normal = normalize(Normal);
	//	//vec3 lightDirection = normalize(vec3(1.0f, 1.0f, 0.0f));
	//	//float diffuse = max(dot(normal, lightDirection), 0.0f);
	//	//FragColor = (texture(diffuse0, texCoord) * (diffuse + ambient)) * lightColor;		
	//    //FragColor = vec4(1.0, 0.0, 0.0, 1.0); // rechts (rot)		
	//}
	//else
	//{
	//	//FragColor = texture(diffuse0, texCoord);
	//	
	//	//discard;
	//	//FragColor = vec4(0.0, 1.0, 0.0, 1.0); // links (grün)
	//}	
}
