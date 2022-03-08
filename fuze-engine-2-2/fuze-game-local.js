// This isnt part of fuze engine. it just stores and processes the properties of the player and game
// On multiplayer this file will be modified and on the server-side with some form of anti-cheat
// var player = { xpos: 88, ypos: 30, xsize: 3, ysize: 2, xspeed: 0, yspeed: 0, xpile:0, ypile:0 };
// alpha 2.3

// using new sprites system
create_sprite("morio", {x_pos : 100, y_pos : 100 , x_size : 10, y_size: 5,  x_speed: -8, y_speed: -3,type: "enemy", skin: load_sprite_skin(textures_path + "mario.txt")});
create_sprite("peter", {x_pos : 40, y_pos : 35, x_size : 38, y_size : 19, x_speed: 1, y_speed: -2,type: "enemy", starting_direction: 270, skin: load_sprite_skin(textures_path + "peter.txt")});
create_sprite("sans", {x_pos : 400, y_pos : 15, x_size : 23, y_size : 14, x_speed: 30, y_speed: 15,type: "enemy", skin: load_sprite_skin(textures_path + "sans.txt") });
create_sprite("monkey", {x_pos : 100, y_pos : 125, x_size : 21, y_size : 14, x_speed: -420, y_speed: -69,type: "enemy", skin: load_sprite_skin(textures_path + "monkey.txt") });
create_sprite("player", {x_pos : 73 , y_pos : 20 , x_size : 12, y_size : 5, x_speed: 0, y_speed: 0,type: "player", minimap_character: "P", move_towards: true, skin: load_sprite_skin(textures_path + "snail.txt"),has_resistance : true});

// define weapons
weapons.rock = { damage: 10, speed: 10 }

play_audio("sans_music", "Megalovania.mp3", {loop: true});
play_audio("peter_sounds", "peter_owchie.mp3", {loop: true});
play_audio("background_music", "phrygian.wav", {loop: true, volume: 0.4});

function on_frame(sprites_list) {
	// insert functions here
	
	if (!(typeof sprites_list["player"] === 'undefined')) {
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
		
		if (keystate.KeyE == true) {
			use_weapon("player", weapons.rock);
		}
	if (!(find_sprite_collisions("player").length == 0)) {
		stop_all_sounds();
		play_audio("glitch", "Glitch Sound Effect (Speaker).mp3", {volume: 0.9});
		delete(sprites_list["player"]);
		
		// crash the game
		console.log(sprites_list["player"].lol_u_crashed);
	}
	}
	
	sounds["sans_music"].volume(sound_decay(calculate_distance(sprites_list["player"], sprites_list["sans"])));
	sounds["peter_sounds"].volume(sound_decay(calculate_distance(sprites_list["player"], sprites_list["peter"])));
	

}

