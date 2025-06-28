//------- Ignore this ----------
#include<filesystem>
namespace fs = std::filesystem;
//------------------------------

#include"Model.h"


const unsigned int width = 800;
const unsigned int height = 800;


int main()
{
	// Initialize GLFW
	glfwInit();

	// Tell GLFW what version of OpenGL we are using 
	// In this case we are using OpenGL 3.3
	glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
	// Tell GLFW we are using the CORE profile
	// So that means we only have the modern functions
	glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);


	glfwWindowHint(GLFW_SAMPLES, 0); // Deaktiviert MSAA
	// Create a GLFWwindow object of 800 by 800 pixels, naming it "YoutubeOpenGL"
	GLFWwindow* window = glfwCreateWindow(width, height, "YoutubeOpenGL", NULL, NULL);
	// Error check if the window fails to create
	if (window == NULL)
	{
		std::cout << "Failed to create GLFW window" << std::endl;
		glfwTerminate();
		return -1;
	}
	// Introduce the window into the current context
	glfwMakeContextCurrent(window);

	//Load GLAD so it configures OpenGL
	gladLoadGL();
	// Specify the viewport of OpenGL in the Window
	// In this case the viewport goes from x = 0, y = 0, to x = 800, y = 800
	glViewport(0, 0, width, height);





	// Generates Shader object using shaders default.vert and default.frag
	Shader shaderProgram("default.vert", "default.frag");
	// Shader for the outlining model
	Shader outliningProgram("outlining.vert", "outlining.frag");

	Shader PlaneCut("Schnittebene.vert", "Schnittebene.frag");

	// Take care of all the light related things
	glm::vec4 lightColor = glm::vec4(1.0f, 1.0f, 1.0f, 1.0f);
	glm::vec3 lightPos = glm::vec3(0.5f, 0.5f, 0.5f);
	glm::mat4 lightModel = glm::mat4(1.0f);
	lightModel = glm::translate(lightModel, lightPos);

	shaderProgram.Activate();
	glUniform4f(glGetUniformLocation(shaderProgram.ID, "lightColor"), lightColor.x, lightColor.y, lightColor.z, lightColor.w);
	glUniform3f(glGetUniformLocation(shaderProgram.ID, "lightPos"), lightPos.x, lightPos.y, lightPos.z);



	

	// Creates camera object
	Camera camera(width, height, glm::vec3(-10.0f, 40.0f, 50.0f));


	/*
	* I'm doing this relative path thing in order to centralize all the resources into one folder and not
	* duplicate them between tutorial folders. You can just copy paste the resources from the 'Resources'
	* folder and then give a relative path from this folder to whatever resource you want to get to.
	* Also note that this requires C++17, so go to Project Properties, C/C++, Language, and select C++17
	*/
	std::string parentDir = (fs::current_path().fs::path::parent_path()).string();
	std::string modelPath = "/Resources/YoutubeOpenGL 15 - Stencil Buffer/models/crow/scene.gltf";
	//std::string outlinePath = "/Resources/YoutubeOpenGL 15 - Stencil Buffer/models/crow-outline/scene.gltf";
	
	// Load in models
	Model model((parentDir + modelPath).c_str());
	//Model outline((parentDir + outlinePath).c_str());	

	// Main while loop
	while (!glfwWindowShouldClose(window))
	{
		// Specify the color of the background
		glClearColor(0.07f, 0.13f, 0.17f, 1.0f);
		// Clean the back buffer and depth buffer
		glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT | GL_STENCIL_BUFFER_BIT);

		// Handles camera inputs
		camera.Inputs(window);
		// Updates and exports the camera matrix to the Vertex Shader
		camera.updateMatrix(45.0f, 0.1f, 100.0f);

		// Animiere die Ebene
		float time = glfwGetTime();
		float offset = sin(time) * 2.0f - 2; // animiert zwischen -2 und +2
		
		// Bereite das Zeichnen vor
		glEnable(GL_DEPTH_TEST);
		
		glDepthMask(GL_TRUE);
		glColorMask(GL_TRUE, GL_TRUE, GL_TRUE, GL_TRUE);

		// Ganzes Objekt bis zur Ebene
		PlaneCut.Activate();
		float a = 1.0f;
		float b = 0.0f;
		float c = 0.0f;
		float d = -offset;
		//float d = 0.0f;
		glUniform4f(glGetUniformLocation(PlaneCut.ID, "lightColor"), lightColor.x, lightColor.y, lightColor.z, lightColor.w);
		glUniform4f(glGetUniformLocation(PlaneCut.ID, "plane"), a, b, c, d);
		glUniform1f(glGetUniformLocation(PlaneCut.ID, "mode"), 0.0f); // Mode 0    --   >0 ==> discard
		model.Draw(PlaneCut, camera);

		// Zeichne die andere Seite für den Stencil
		glEnable(GL_STENCIL_TEST);
		glStencilFunc(GL_ALWAYS, 1, 0xFF);
		glStencilOp(GL_KEEP, GL_KEEP, GL_REPLACE);

		// Ohne Farbe und Depth, damit später die Ebene gezeichnet werden kann
		glDepthMask(GL_FALSE);
		glColorMask(GL_FALSE, GL_FALSE, GL_FALSE, GL_FALSE);

		PlaneCut.Activate();
		glUniform4f(glGetUniformLocation(PlaneCut.ID, "lightColor"), lightColor.x, lightColor.y, lightColor.z, lightColor.w);
		glUniform4f(glGetUniformLocation(PlaneCut.ID, "plane"), a, b, c, d);
		glUniform1f(glGetUniformLocation(PlaneCut.ID, "mode"), 1.0f); // Mode 1    --   >0 ==> stencil
		model.Draw(PlaneCut, camera);



		// Generate Schnittebene
		std::vector <Vertex> points;
		points.emplace_back(glm::vec3(offset,  0.0f, -10.0f), glm::vec3(1.0f, 0.0f, 0.0f), glm::vec3(0.3f, 0.3f, 0.9f), glm::vec2(0.0f));
		points.emplace_back(glm::vec3(offset, 30.0f,  10.0f), glm::vec3(1.0f, 0.0f, 0.0f), glm::vec3(0.3f, 0.3f, 0.9f), glm::vec2(0.0f));
		points.emplace_back(glm::vec3(offset, 30.0f, -10.0f), glm::vec3(1.0f, 0.0f, 0.0f), glm::vec3(0.3f, 0.3f, 0.9f), glm::vec2(0.0f));
		points.emplace_back(glm::vec3(offset,  0.0f,  10.0f), glm::vec3(1.0f, 0.0f, 0.0f), glm::vec3(0.3f, 0.3f, 0.9f), glm::vec2(0.0f));

		/*points.emplace_back(glm::vec3(offset,    0.0f, -10.0f), glm::vec3(1.0f, 0.0f, 0.0f), glm::vec3(0.3f, 0.3f, 0.9f), glm::vec2(0.0f));
		points.emplace_back(glm::vec3(offset,   30.0f, -10.0f), glm::vec3(1.0f, 0.0f, 0.0f), glm::vec3(0.3f, 0.3f, 0.9f), glm::vec2(0.0f));
		points.emplace_back(glm::vec3(offset,   30.0f,   0.0f), glm::vec3(1.0f, 0.0f, 0.0f), glm::vec3(0.3f, 0.3f, 0.9f), glm::vec2(0.0f));
		points.emplace_back(glm::vec3(offset,    0.0f,   0.0f), glm::vec3(1.0f, 0.0f, 0.0f), glm::vec3(0.3f, 0.3f, 0.9f), glm::vec2(0.0f));
		points.emplace_back(glm::vec3(offset+5, 30.0f,  10.0f), glm::vec3(1.0f, 0.0f, 0.0f), glm::vec3(0.3f, 0.3f, 0.9f), glm::vec2(0.0f));
		points.emplace_back(glm::vec3(offset+5,  0.0f,  10.0f), glm::vec3(1.0f, 0.0f, 0.0f), glm::vec3(0.3f, 0.3f, 0.9f), glm::vec2(0.0f));*/

		std::vector <unsigned int> indices(6);
		indices[0] = 0;
		indices[1] = 1;
		indices[2] = 2;
		indices[3] = 3;
		indices[4] = 1;
		indices[5] = 0;

		/*std::vector <unsigned int> indices(12);
		indices[0]  = 0;
		indices[1]  = 2;
		indices[2]  = 1;
		indices[3]  = 3;
		indices[4]  = 2;
		indices[5]  = 0;
		indices[6]  = 2;
		indices[7]  = 3;
		indices[8]  = 5;
		indices[9]  = 5;
		indices[10] = 4;
		indices[11] = 2;*/

		std::vector<Texture> textures;
		Mesh CutPlane(points, indices, textures);
		glColorMask(GL_TRUE, GL_TRUE, GL_TRUE, GL_TRUE);
		glDepthMask(GL_TRUE);
		glStencilFunc(GL_EQUAL, 1, 0xFF); // Nur wo Stencil == 1
		glStencilOp(GL_KEEP, GL_KEEP, GL_KEEP); // Nichts mehr verändern


		// Ebene ohne Rückseiten
		glEnable(GL_CULL_FACE);
		glCullFace(GL_BACK);
		glFrontFace(GL_CCW);
		CutPlane.Draw(shaderProgram, camera);



		// Hinterher wieder ausschalten
		glDisable(GL_STENCIL_TEST);
		glDisable(GL_CULL_FACE);

		// Swap the back buffer with the front buffer
		glfwSwapBuffers(window);
		// Take care of all GLFW events
		glfwPollEvents();
	}

	// Delete all the objects we've created
	shaderProgram.Delete();
	outliningProgram.Delete();
	PlaneCut.Delete();
	// Delete window before ending the program
	glfwDestroyWindow(window);
	// Terminate GLFW before ending the program
	glfwTerminate();
	return 0;
}