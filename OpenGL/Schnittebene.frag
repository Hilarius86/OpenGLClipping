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



// Gets the Texture Units from the main function
uniform sampler2D diffuse0;
uniform sampler2D specular0;
// Gets the color of the light from the main function
uniform vec4 lightColor;
// Gets the position of the light from the main function
uniform vec3 lightPos;
// Gets the position of the camera from the main function
uniform vec3 camPos;

uniform vec4 plane; // Ebene in der Form (a, b, c, d) für ax + by + cz + d = 0
uniform float mode;

vec4 direcLight()
{
	// ambient lighting
	float ambient = 0.20f;

	// diffuse lighting
	vec3 normal = normalize(Normal);
	vec3 lightDirection = normalize(vec3(1.0f, 1.0f, 0.0f));
	float diffuse = max(dot(normal, lightDirection), 0.0f);

	// specular lighting
	float specularLight = 0.50f;
	vec3 viewDirection = normalize(camPos - crntPos);
	vec3 reflectionDirection = reflect(-lightDirection, normal);
	float specAmount = pow(max(dot(viewDirection, reflectionDirection), 0.0f), 16);
	float specular = specAmount * specularLight;

	return (texture(diffuse0, texCoord) * (diffuse + ambient) + texture(specular0, texCoord).r * specular) * lightColor;
}

void main()
{
    float distance = dot(plane.xyz, crntPos) + plane.w;
		if (mode == 0.0f)
		{
			if (distance < 0.0)
			{
					// Fragment liegt auf der "abgeschnittenen" Seite => verwerfen
					discard;
			}
			else
			{
        FragColor = direcLight();
			}
		}
    else
		{
			if (distance >= 0.0)
			{
					discard;
			}
			FragColor = vec4(1.0f,1.0f,1.0f,1.0f);
		}
}