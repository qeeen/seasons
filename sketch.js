var grid;
var grid_dim;
var origin_x;
var origin_y;

var time;
var prev_time;
var skip_rate;
var skip_slider;
var season;

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
	let canv = createCanvas(768, 768, WEBGL);

	perspective(PI/3, 1, 1, 100);

	time = 1;
	prev_time = time;
	skip_rate = 1;
	season = 0;

	skip_slider = createSlider(1, 5000, 1);
	skip_slider.style('width', '200px');
	skip_slider.position(canv.position().x+100, canv.position().y);
	
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
			if(grid[i][k]){
				grid[i][k] = random(0.3, 1.2);
			}
		}
	}
}

function draw(){
	//calculates all time based stuff
	handle_time();

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
			if(grid[i][k] > 0){
				push();

				//ranges from 0.3 to 1.2
				grid[i][k] += 0.0000001*skip_rate;
				if(grid[i][k] > 1.2)
					grid[i][k] = 1.2;
				let scle = grid[i][k];

				translate(origin_x + i*cube_dim, origin_y + k*cube_dim, 0)
				rotateX(radians(90));
				scale(scle);

				push();
				translate(0, -4.5/scle + (12.5 - 12.5*scle)/scle, 0);
				texture(bark);
				cylinder(cube_dim/4, 25);
				pop();

				texture(leaf_tex);
				push();
				translate(0, -25*scle, 0);
				sphere(cube_dim/2);
				pop();

				push();
				translate(5*scle, -18*scle, 5*scle);
				sphere(cube_dim/2);
				pop();
				push();
				translate(-5*scle, -18*scle, 5*scle);
				sphere(cube_dim/2);
				pop();
				push();
				translate(-5*scle, -18*scle, -5*scle);
				sphere(cube_dim/2);
				pop();
				push();
				translate(5*scle, -18*scle, -5*scle);
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
			if(grid[gridposx][gridposy] == 0){
				grid[gridposx][gridposy] = 0.3;
				break;
			}
		}
	}
}

function handle_time(){
	skip_rate = skip_slider.value();
	
	//assuming 40fps
	time += skip_rate;

	let day_length = 15;
	let season_length = 21;

	//check if the season has changed
	if(time%(40*60*day_length*season_length) < prev_time%(40*60*day_length*season_length)){
		season++;
		season %= 4;
	}

	//get the current sky color and set it to the bg
	let sky_color = p5.Vector.lerp(day_color, night_color, (-cos(map(time%(40*60*day_length), 0, 40*60*day_length, 0, 2*PI))+1)/2);
	background(sky_color.x, sky_color.y, sky_color.z);

	//set the foliage color for the current season
	let cur_color;
	let next_color;
	switch(season){
		case 0:
			cur_color = spring_color;
			next_color = summer_color;
			break;
		case 1:
			cur_color = summer_color;
			next_color = fall_color;
			break;
		case 2:
			cur_color = fall_color;
			next_color = winter_color;
			break;
		case 3:
			cur_color = winter_color;
			next_color = spring_color;
			break;
	}
	foliage_color = p5.Vector.lerp(cur_color, next_color, map(time%(40*60*day_length*season_length), 0, 40*60*day_length*season_length, 0, 1));

	//used to keep track of when a modulus rollover happens (ie knowing when the season changes)
	prev_time = time;
}










