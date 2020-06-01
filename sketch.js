var grid;
var grid_dim;
var origin_x;
var origin_y;

var time;

var cube_dim;

var user_x;
var user_y;
var user_z;
var user_dir;
var lookat_x;
var lookat_y;
var fov;
var view_range;

var speed;
var turn_speed;

var day_color;
var night_color;
var spring_color;
var summer_color;
var fall_color;
var winter_color;

var foliage_color;

var leaves;
var bark;

function preload(){
	leaves = loadImage('trees.png');
	bark = loadImage('treesBARK.png');
}
function setup(){
	createCanvas(768, 768, WEBGL);

	perspective(PI/3, 1, 1, 100);
	
	grid = [];
	grid_dim = 64*4;
	cube_dim = 16;

	origin_x = -512*4;
	origin_y = -512*4;

	view_range = 256;
	fov = 50;
	user_x = 0;
	user_y = 0;
	user_z = 0;
	user_dir = 180;
	lookat_x = user_x + cos(radians(user_dir))*fov;
	lookat_y = user_y + sin(radians(user_dir))*fov;

	speed = 1;
	turn_speed = 5;

	day_color = new p5.Vector(135, 150, 235);
	night_color = new p5.Vector(5, 10, 62);
	spring_color = new p5.Vector(120, 255, 86);
	summer_color = new p5.Vector(0, 122, 66);
	fall_color = new p5.Vector(241, 79, 18);
	winter_color = new p5.Vector(255, 255, 255);

	foliage_color = spring_color;
	
	for(let i = 0; i < grid_dim; ++i){
		grid[i] = [];
	}
	
	for(let i = 0; i < grid_dim; ++i){
		for(let k = 0; k < grid_dim; ++k){
			grid[i][k] = Math.floor(random(10))==0;
		}
	}
}

function draw(){
	//get the current sky color and set it to the bg
	let sky_color = p5.Vector.lerp(day_color, night_color, (sin(frameCount/100)+1)/2);
	background(sky_color.x, sky_color.y, sky_color.z);

	//get all user input
	handle_input();

	//calculate where the camera needs to point
	lookat_x = user_x + cos(radians(user_dir))*fov;
	lookat_y = user_y + sin(radians(user_dir))*fov;
	camera(user_x, user_y, user_z, lookat_x, lookat_y, user_z, 0, 0, 1)

	//create an image out of the current foliage color
	let foliage_image = createImage(1, 1);
	foliage_image.loadPixels();
	foliage_image.pixels[0] = foliage_color.x;
	foliage_image.pixels[1] = foliage_color.y;
	foliage_image.pixels[2] = foliage_color.z;
	foliage_image.pixels[3] = 255;
	foliage_image.updatePixels();

	//create a copy of the leaf texture and merge that with the foliage color image
	let leaf_tex = createImage(leaves.width, leaves.height);
	leaf_tex.copy(leaves, 0, 0, leaves.width, leaves.height, 0, 0, leaves.width, leaves.height);
	leaf_tex.blend(foliage_image, 0, 0, 1, 1, 0, 0, leaves.width, leaves.height, MULTIPLY);

	//draw the trees
	noStroke();
	for(let i = 0; i < grid_dim; ++i){
		for(let k = 0; k < grid_dim; ++k){
			if(Math.abs(i*cube_dim - (user_x-origin_x)) > view_range || Math.abs(k*cube_dim - (user_y-origin_y)) > view_range){
				continue;
			}
			if(grid[i][k]){
				push();

				translate(origin_x + i*cube_dim, origin_y + k*cube_dim, 0)
				rotateX(radians(90));

				push();
				translate(0, -4.5, 0);
				texture(bark);
				cylinder(cube_dim/4, 25);
				pop();

				texture(leaf_tex);
				push();
				translate(0, -25, 0);
				sphere(cube_dim/2);
				pop();

				push();
				translate(5, -18, 5);
				sphere(cube_dim/2);
				pop();
				push();
				translate(-5, -18, 5);
				sphere(cube_dim/2);
				pop();
				push();
				translate(-5, -18, -5);
				sphere(cube_dim/2);
				pop();
				push();
				translate(5, -18, -5);
				sphere(cube_dim/2);
				pop();

				pop();
			}
		}
	}

	//draw the grass
	push();
	fill(foliage_color.x, foliage_color.y, foliage_color.z);
	translate(0, 0, cube_dim/2);
	plane(grid_dim*cube_dim, grid_dim*cube_dim);
	pop();
}

function handle_input(){
	if(keyIsDown(87)){//W
		user_x += cos(radians(user_dir))*speed;
		user_y += sin(radians(user_dir))*speed;
	}	
	if(keyIsDown(65)){//A
		user_x += cos(radians(user_dir+90))*speed;
		user_y += sin(radians(user_dir+90))*speed;
	}	
	if(keyIsDown(83)){//S
		user_x += cos(radians(user_dir-180))*speed;
		user_y += sin(radians(user_dir-180))*speed;
	}	
	if(keyIsDown(68)){//D
		user_x += cos(radians(user_dir-90))*speed;
		user_y += sin(radians(user_dir-90))*speed;
	}	
	if(keyIsDown(81) || keyIsDown(LEFT_ARROW)){//Q
		user_dir += turn_speed;
	}
	if(keyIsDown(69) || keyIsDown(RIGHT_ARROW)){//E
		user_dir -= turn_speed;
	}
	if(keyIsDown(32)){//SPACE
		for(let i = 0; i < 400; ++i){
			let gridposx = Math.floor((user_x+cos(radians(user_dir))*i-origin_x)/cube_dim);
			let gridposy = Math.floor((user_y+sin(radians(user_dir))*i-origin_y)/cube_dim);
			if(gridposx == null || gridposy == null)
				break;	
			if(gridposx > grid_dim || gridposx < 0 || gridposy > grid_dim || gridposy < 0)
				break;
			if(grid[gridposx][gridposy] == 1)
				grid[gridposx][gridposy] = 0;
		}
	}
}
