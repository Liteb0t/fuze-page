// customisable part of fuze engine
// alpha 2.9.3

var default_sprite = {
    "name": "default",
    "x_pos": -10,
    "y_pos": -10,
    "x_pile": 0,
    "y_pile": 0,
    "x_speed": 0,
    "y_speed": 0,
    "type": "enemy",
    "team": "enemies",
    "health": 120,
    "damage": 5,
    "is_bullet": false,
    "lock_direction": false,
	"can_damage_walls": false,
    "cooldowns": [],
    "show_nametag": true,
    "minimap_character": "?",
    "move_towards": true,
    "weapons": [],
    "delete_after": -1,
    "use_ai": false,
    "ai": {
        "speed": 10,
        "targets": []
    },
    "nametag": "default",
    "has_resistance": true,
    "skin": {
        "stored": "within_sprite",
        "data": "#####\n#####\n#####\n#####\n"
    }
}

default_level = {
  "map": "'''''''''''''''''''''''''''''''''''''''''''\\n'''''''''''''''''''''''''''''''''''''''''''\\n'''''''''''''''''''''''''''''''''''''''''''\\n'''''''''''''''''''''''''''''''''''''''''''\\n'''''''''''''''''''''''''''''''''''''''''''\\n'''''''''''''''''''''''''''''''''''''''''''\\n'''''''''''''''''''''''''''''''''''''''''''\\n'''''''''''''''''''''''''''''''''''''''''''\\n'''''''''''''''''''''''''''''''''''''''''''\\n'''''''''''''''''''''''''''''''''''''''''''\\n'''''''''''''''''''''''''''''''''''''''''''\\n'''''''''''''''''''''''''''''''''''''''''''\\n'''''''''''''''''''''''''''''''''''''''''''\\n'''''''''''''''''''''''''''''''''''''''''''\\n'''''''''''''''''''''''''''''''''''''''''''\\n'''''''''''''''''''''''''''''''''''''''''''\\n",
  "spawn_location": {
    "x_pos": 200,
    "y_pos": 100
  },
  "npc_list": [],
  "scale": {
    "x_scale": 18,
    "y_scale": 12
  },
  "spawners": [],
  "objectives": []
}

// define weapons
weapons = load_data("weapons/includes.txt");

// load level data from a file. includes gives a list of filepaths
levels = load_data("levels/includes.txt");

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

// load sprites into memory
// these are later deepcopied into sprites_list which are in-game sprites
sprites = load_data("sprites/includes.txt");

// Load the textures into memory as well
for (the_sprite in sprites) {
    let temp_skin_data = {};
    if (sprites[the_sprite].skin.stored == "txt_file") {
        temp_skin_data = load_sprite_skin(sprites[the_sprite].skin.data)
        sprites[the_sprite].skin.data = temp_skin_data.data;
        sprites[the_sprite].x_size = temp_skin_data.x_size;
        sprites[the_sprite].y_size = temp_skin_data.y_size;
        sprites[the_sprite].skin.stored = "within_sprite";
    }
}
for (weapon in weapons) {
    sprites[weapons[weapon].name] = {
        ...default_sprite,
        ...{
            "skin": { "stored": "within_sprite", "data": load_sprite_skin(weapons[weapon].name).data },
            "is_bullet": true,
            "lock_direction": true,
            "move_towards": false,
            "show_nametag": false,
            "delete_after": weapons[weapon].delete_after,
            "x_size": load_sprite_skin(weapons[weapon].name).x_size,
            "y_size": load_sprite_skin(weapons[weapon].name).y_size
        },
		...weapons[weapon].properties
    }
    console.log(sprites[weapons[weapon].name])
}

var player_speed = 3;

// load levels in the level select menu
update_pause_menu();

play_audio("sans_music", "Megalovania.mp3", {loop: true});
play_audio("peter_sounds", "peter_owchie.mp3", {loop: true});
play_audio("background_music", "phrygian.wav", {loop: true, volume: 0.3});


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
            create_sprite("invader", { x_pos: mouse.x_pos, y_pos: mouse.y_pos});
		}
		
        // If player is holding left click
        if (mouse_buttons == 1 || mouse_buttons == 3) {
			if (check_if_cb_checked("cb_directional_shooting") == true) {
				use_weapon("player", 1, "direction");
			}
			else {
				use_weapon("player", 1, "mouse");
			}
        }
        // If player is holding right click
        if (mouse_buttons == 2 || mouse_buttons == 3) {
			if (check_if_cb_checked("cb_directional_shooting") == true) {
				use_weapon("player", 2, "direction");
			}
			else {
				use_weapon("player", 2, "mouse");
			}
        }
	}
	sounds["sans_music"].volume(sound_decay(calculate_distance("player", "sans")));
	sounds["peter_sounds"].volume(sound_decay(calculate_distance("player", "peter")));
}
