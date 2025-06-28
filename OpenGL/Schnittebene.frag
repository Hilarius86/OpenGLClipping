#version 420 core
out vec4 FragColor;

in vec3 crntPos;
in vec3 Normal;
in vec3 color;
in vec2 texCoord;

in vec3 untransformPos;

layout(binding = 0) uniform sampler2D diffuse0;
uniform vec4 lightColor;
uniform vec3 lightPos;
uniform vec3 camPos;

uniform int mode;
uniform float zMin;
uniform float zMax;

layout(binding = 1) uniform samplerBuffer lineSegments;
uniform int segmentCount; 

vec3 isLeftOf(vec2 A, vec2 B, vec2 P)
{
	vec2 AB = B - A;
	vec2 AP = P - A;
	return cross(vec3(AB, 0.0), vec3(AP, 0.0));
}

void main()
{
	float segment = 0.0f;
	// z -9.90188 .. 6.37344
	if (untransformPos.z > 0.0) {
	  segment = 0.0f;
	}
	else {
	  segment = 1.0f;
	}
	// x 0..5
	// z -20..20
	vec2 value1 = texelFetch(lineSegments, int(segment)).rg;
	vec2 value2 = texelFetch(lineSegments, int(segment)+1).rg;

	// Irgendwas ist hier schief mit den Koordinaten
	vec2 P = vec2(-untransformPos.y, -untransformPos.z);
	vec3 LeftOf = isLeftOf(value1, value2, P);

	if (mode == 0)
	{
		if (LeftOf.z < 0.0f)
		{
			FragColor = texture(diffuse0, texCoord);
		}
		else
		{
			discard;
		}
	}
	else
	{
		if (LeftOf.z > 0.0f)
		{
			FragColor = vec4(1.0f, 1.0f, 1.0f, 1.0f);
		}
		else
		{
			discard;
		}
	}
}
