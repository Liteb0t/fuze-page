// This isnt part of fuze engine. it just stores and processes the properties of the player and game
// On multiplayer this file will be modified and on the server-side with some form of anti-cheat
// alpha 2.8.1

// define weapons
weapons = load_data("/fuze-engine/weapons/includes.txt");

// load level data from a file. includes gives a list of filepaths
levels = load_data("/fuze-engine/levels/includes.txt");

// format newlines to be displayed in the game
for (a_level in levels) {
	if (levels[a_level].map == "load") {
		console.log("a_level: " + a_level);
		levels[a_level].map = loadFile(level_path + a_level + ".txt")
	} else {
		levels[a_level].map = replaceAll(levels[a_level].map,"\\n","\n")
	}
	levels[a_level].name = a_level;
	levels_list.push(a_level);
}

sprites = load_data("/fuze-engine/sprites/includes.txt");

/*
// placeholder load sprites for level
for (the_sprite in sprites) {
	create_sprite(JSON.parse(JSON.stringify(sprites[the_sprite])));
}
*/

var player_speed = 3;

// load levels in the level select menu
update_pause_menu();

play_audio("sans_music", "Megalovania.mp3", {loop: true});
play_audio("peter_sounds", "peter_owchie.mp3", {loop: true});
play_audio("background_music", "phrygian.wav", {loop: true, volume: 0.3});

create_timer("minimap_update", update_minimap, 30, 'undefined', true);
create_timer("objectives_update", update_objectives_display, 30, 'undefined', true);

add_objective("kill_sans", is_dead, "Kill sans", "sans");

function on_frame(sprites_list) {
	// insert functions here
	
	if (!(typeof sprites_list["player"] === 'undefined')) {
		if (keystate.KeyA == true) {
			//sprites_list["player"].x_pile -= 1;
			sprites_list["player"].x_speed -= player_speed;
		}
		if (keystate.KeyW == true) {
			//sprites_list["player"].y_pile -= 1;
			sprites_list["player"].y_speed -= player_speed;
		}

		if (keystate.KeyD == true) {
			//sprites_list["player"].x_pile += 1;
			sprites_list["player"].x_speed += player_speed;
		}

		if (keystate.KeyS == true) {
			//sprites_list["player"].y_pile += 1;
			sprites_list["player"].y_speed += player_speed;
		}
		
		if (keystate.KeyE == true) {
			use_weapon("player", 1, "mouse");
		}
		
		if (keystate.KeyR == true) {
			use_weapon("player", 2, "mouse");
		}
		
		if (keystate.KeyF == true) {
			use_weapon("player", 3, "mouse");
		}
		
		if (keystate.KeyM == true) {
			use_weapon("player", 4, "stationary");
		}
		
		if (keystate.KeyP == true) {
			respawn_player();
		}
		
		if (keystate.KeyO == true) {
		 	load_sprite("invader", {x_pos: randint(0,level.width), y_pos: randint(0,level.height)});
		}
		
		// If player is holding click
		if (mouse_down == 1) {
			use_weapon("player", 1, "mouse");
		}
	}
	sounds["sans_music"].volume(sound_decay(calculate_distance("player", "sans")));
	sounds["peter_sounds"].volume(sound_decay(calculate_distance("player", "peter")));
}

function on_click(sprites_list) {
	
	use_weapon("player", "rock", "mouse");
	
}