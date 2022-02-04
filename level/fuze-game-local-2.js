// This isnt part of fuze engine. it just stores and processes the properties of the player and game
// On multiplayer this file will be modified and on the server-side with some form of anti-cheat
// var player = { xpos: 88, ypos: 30, xsize: 3, ysize: 2, xspeed: 0, yspeed: 0, xpile:0, ypile:0 };

// using new sprites system
create_sprite("morio", {x_pos : 50, y_pos : 30 , x_size : 8, y_size: 6,  x_speed: -7, y_speed: -3});
create_sprite("lougi", {x_pos : 40, y_pos : 25, x_size : 6, y_size : 8, x_speed: 15, y_speed: -2});
create_sprite("player", {x_pos : 73 , y_pos : 20 , x_size : 7, y_size : 3, x_speed: 0, y_speed: 0, has_resistance : true});

function on_frame(sprites_list) {
	// insert functions here
	
	if (keystate.KeyA == true) {
		sprites_list["player"].x_speed = sprites_list["player"].x_speed - 1;
	}
	if (keystate.KeyW == true) {
		sprites_list["player"].y_speed = sprites_list["player"].y_speed - 1;
	}

	if (keystate.KeyD == true) {
		sprites_list["player"].x_speed = sprites_list["player"].x_speed + 1;
	}

	if (keystate.KeyS == true) {
		sprites_list["player"].y_speed = sprites_list["player"].y_speed + 1;
	}
	// console.log(keystate);
	// player.xpos = sprites_list["player"].x_pos;
	// player.ypos = sprites_list["player"].y_pos;
}