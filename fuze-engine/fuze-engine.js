// Fuze engine a2.8.2

// The HTML class that text will be rendered to
// via document.getElementById(text_display).innerHTML(text_output)

var level_path = "/fuze-engine/textures/maps/"
var textures_path = "/fuze-engine/textures/"
var sounds_path = "/fuze-engine/sounds/"

var text_display = "game-display";
var el = document.getElementById('game-display');
var font_size = parseFloat(window.getComputedStyle(el, null).getPropertyValue('font-size'));
var screen_width = parseInt(el.clientWidth / 8);
var screen_height = parseInt(el.clientHeight / 16);
var current_file;
var level = "null";
var start_xrender_from;
var start_yrender_from;
var text_output = '';
var temp_char = "'";
var is_empty;
var sprites_list = { };
var sprites = {};
var weapons = {};
var loaded_textures = {};
var collided_x = false;
var resistance = 0.25;
var resistance_ramp = 0.0001;
var bounciness = 0.5;
var collision_loss = 0.3;
var sprites_to_delete = [];
var collided_y = false;
var font = {x_size : 7, y_size: 14}
var render = false;
var level_blowup_width = 18;
var level_blowup_height = 12;
var listy_text_output = [];
var levels = [];
var levels_list = [];
var objectives = {};
var minimap_update_interval = 30; // in FRAMES
var damage_update_timer = 10;
var timers = {};
var minimap = { render: "", rows: [] }
var uniconvert = { '#': '\u2588', '\'': ' ', ' ':'\u2591', 'checker' : '\u259a', 'medium': '\u2592', 'heavy': '\u2593', 'skull': '💀', 'monkey' : '🐒', 'checkbox_empty' : '\u2610','checkbox_tick' : '\u2611','checkbox_cross' : '\u2612', };
var double_length_chars = { '💀': 'skull', '🐒': 'monkey' };
var sounds = {}
var viewport = {x_pos : 0, y_pos : 0,following_sprite : true, sprite : "player"}
var uniconvert_keys = Object.keys(uniconvert);
const fps = 30;
const frame_time = (1000 / 60) * (60 / fps) - (1000 / 60) * 0.5;
var filterStrength = 10;
var frameTime = 0, lastLoop = new Date, thisLoop;

var keys = { 'left_arrow' : 37,  'up_arrow' : 38,  'right_arrow' : 39,  'down_arrow' : 40}
var mouse = { x_pos: parseInt(el.clientWidth / 2), y_pos: parseInt(el.clientHeight / 2) }
var mouse_buttons = 0;
var keystate = {};

var mouse_down = 0;

// uhhh needed for click functions
document.body.onmousedown = function() { 
	++mouse_down;
}
document.body.onmouseup = function() {
	--mouse_down;
}

// add or remove a key to a list of held keys
document.addEventListener("keydown", function (event) {
    keystate[event.code] = true;
});
document.addEventListener("keyup", function (event) {
    delete keystate[event.code];
});

document.addEventListener('contextmenu', function (ev) {
    ev.preventDefault();
    return false;
}, false);

// Mouse buttons down
document.addEventListener('mousedown', function (event) {
    mouse_buttons = event.buttons;
    console.log(mouse_buttons);
})
// Mouse buttons up
document.addEventListener('mouseup', function (event) {
    mouse_buttons = event.buttons;
})

// update variables for mouse pos which are used for aiming weapons
document.addEventListener("mousemove", function (event) {
    mouse.x_pos = event.clientX;
    mouse.y_pos = event.clientY;
})

// show or hide a GUI window when a button is clicked
function toggle_div(element_id) {
    let x = document.getElementById(element_id);	
	
    if (x.style.display === "none") {
		x.style.display = "block";
		if (element_id == "pause_menu") {
			pause_game();
		}
    } else {
		x.style.display = "none";
		if (element_id == "pause_menu") {
			unpause_game();
		}
    }

}

function show_div(div_id) {
    let x = document.getElementById(div_id);

    if (x.style.display === "none") {
        x.style.display = "block";
        if (element_id == "pause_menu") {
            pause_game();
        }
    }
}

function hide_div(div_id) {
    let x = document.getElementById(div_id);

    if (x.style.display === "block") {
        x.style.display = "none";
        if (element_id == "pause_menu") {
            unpause_game();
        }
    }
}

function deep_copy(object) {
    return JSON.parse(JSON.stringify(object))
}

// when levels are imported, it updates the gui to list them
function update_pause_menu() {
	// let pause_menu_element = document.getElementById("pause_menu");
    let temp_add_levels = "";
	
	// if (document.getElementById("pause_menu").style.display = "block") {}
	
    document.getElementById("level_list").innerHTML = "";
	for (level_id in levels) {
		temp_add_levels = temp_add_levels + "<div class=\"level_select_box\">Level id: " + level_id + 
		"<br><button type=\"button\" onclick=\"load_level('" + level_id + "')\">Load</button></div>\n";
	}
	document.getElementById("level_list").innerHTML = temp_add_levels;
}

// when weapons are imported, it updates the gui to list them
function update_weapons_chooser() {
    let temp_add_weapons = "";
    let temp_add_weapons2 = "";
    document.getElementById("select_weapon_1").innerHTML = "Loading...";
    for (weapon_id in weapons) {
        temp_add_weapons = temp_add_weapons + "<input type=\"radio\" name=\"weapon_1\" id=\"rb_" + weapon_id + "\" onclick=\"select_weapon(1, '" + weapon_id + "')\" />" +
            "<label for= \"rb_" + weapon_id + "\">" + weapon_id + "</label><br />";
    }
    document.getElementById("select_weapon_1").innerHTML = "Primary weapon:<br />E key / Left click <br />" + temp_add_weapons;

    document.getElementById("select_weapon_2").innerHTML = "Loading...";
    for (weapon_id in weapons) {
        temp_add_weapons2 = temp_add_weapons2 + "<input type=\"radio\" name=\"weapon_2\" id=\"rb_" + weapon_id + "\" onclick=\"select_weapon(2, '" + weapon_id + "')\" />" +
            "<label for= \"rb_" + weapon_id + "\">" + weapon_id + "</label><br />";
    }
    document.getElementById("select_weapon_2").innerHTML = "Secondary weapon:<br />R key / Right click<br />" + temp_add_weapons2;
}

function select_level(level_id) {
	document.getElementById('level_textbox').value = levels[level_id].map;
}

function toggle_pause() {
	if (render == false) {
		render = true
	}
	else {
		render = false
	}
}

function pause_game() {
	render = false
}

function unpause_game() {
	if (level == "null") {
		load_level("fz_empty");
	}
	change_font_size(22);
	render = true
	requestAnimationFrame(update);
}

function toggle_dark_theme() {
	var text_disp = document.getElementById("game-display");
	if (text_disp.style.color == "rgb(0, 0, 0)") {
		document.getElementById("game-display").style.color = "rgb(255, 255, 255)";
		document.getElementById("game-display").style.backgroundColor = "rgb(0, 0, 0)";
	}
	else {
		document.getElementById("game-display").style.color = "rgb(0, 0, 0)";
		document.getElementById("game-display").style.backgroundColor = "rgb(255, 255, 255)";
	}
}

function calculate_distance(sprite_1, sprite_2) {
	let total_diff = -1;
	// check if both sprites_list[sprite]s exist
	if (!(typeof sprites_list[sprite_1] === 'undefined' || typeof sprites_list[sprite_2] === 'undefined')) {
		let diff_x = 0;
		let diff_y = 0;
		
		if (sprites_list[sprite_1].x_pos > sprites_list[sprite_2].x_pos) {
			diff_x = sprites_list[sprite_1].x_pos - sprites_list[sprite_2].x_pos;
		} else {
			diff_x = sprites_list[sprite_2].x_pos - sprites_list[sprite_1].x_pos;
		}
		
		if (sprites_list[sprite_1].y_pos > sprites_list[sprite_2].y_pos) {
			diff_y = sprites_list[sprite_1].y_pos - sprites_list[sprite_2].y_pos;
		} else {
			diff_y = sprites_list[sprite_2].y_pos - sprites_list[sprite_1].y_pos;
		}
        // console.log("diff x: " + diff_x + "\ndiff y: " + diff_y)

		total_diff = (diff_x + diff_y) / 1.41
	}
	return total_diff
}

function mouse_lvl_pos() {
	mouse_lvl = {};
	mouse_lvl.x_pos = (mouse.x_pos / font.x_size) + start_xrender_from;
    mouse_lvl.y_pos = (mouse.y_pos / font.y_size) + start_yrender_from;
    console.log(mouse_lvl.x_pos + ", " + mouse_lvl.y_pos + "\nXpos: " + sprites_list["player"].x_pos + "\nYpos: " + sprites_list["player"].y_pos);
	return mouse_lvl;
}

function load_next_level() {
	if (levels_list.indexOf(level.name) < levels_list.length) {
		load_level(levels_list[levels_list.indexOf(level.name) + 1]);
	} else {
		load_level(levels_list[0]);
    }
    if (typeof sprites_list["player"] === 'undefined') {
        respawn_player();
    }
    unpause_game();
    // toggle_div('pause_menu');
}

function calculate_weapon_speed(start_point, weapon, target) {
	let output_speeds = {x_speed: 0, y_speed: 0}
	
	if (!(typeof start_point === 'undefined') ) {
		if (target === undefined) {
			target = "none";
		}
		
		/*
		output_speeds.x_speed = sprites_list[from_sprite].x_speed;
		output_speeds.y_speed = sprites_list[from_sprite].y_speed;
		
		if (direction == 90) {
			output_speeds.x_speed = output_speeds.x_speed + weapon.speed
		}
		else if (direction == 270) {
			output_speeds.x_speed = output_speeds.x_speed - weapon.speed
		} else {}
		*/
		if (target == "stationary") {
			console.log("mine placed?");
		} 
		else {
			if (target == "mouse") {
				target = mouse_lvl_pos();
			}

			if (start_point.x_pos < target.x_pos) {
				diff_x = target.x_pos - start_point.x_pos;
			} else {
				diff_x = 0 - (start_point.x_pos - target.x_pos);
			}
			if (start_point.y_pos < target.y_pos) {
				diff_y = (target.y_pos - start_point.y_pos) * 2;
			} else {
				diff_y = 0 - (start_point.y_pos - target.y_pos) * 2;
			}

            console.log("diff x: " + diff_x + "\ndiff y: " + diff_y)
			// console.log(diff_x);
			
			// let multiplier = (Math.abs(diff_x) + Math.abs(diff_y)) / 2;

            // pythagoras
            let multiplier = (Math.sqrt((Math.abs(diff_x) * Math.abs(diff_x)) + (Math.abs(diff_y) * Math.abs(diff_y)))) / 2;
			
			output_speeds.x_speed = (weapon.speed / multiplier) * diff_x + start_point.x_speed;
			output_speeds.y_speed = (weapon.speed / multiplier) * diff_y + start_point.y_speed;
		}
	}
	return output_speeds
}

function play_audio(sound_name, source, args) {
	if (typeof args.loop === 'undefined') { args.loop = false; }
	if (typeof args.volume === 'undefined') { args.volume = 0; }
	sounds[sound_name] = new Howl({
		src: [sounds_path + source],
		loop: args.loop,
		volume: args.volume
	});
	sounds[sound_name].play();
}

function sound_decay(distance) {
	let volume_to = 0;
	if (!(distance == -1)) {
		volume_to = ( 1 / ( distance / 20  )) - distance / 200
		if (volume_to < 0) {volume_to = 0}
		if (volume_to > 1) {volume_to = 1}
	}
	return volume_to
}

function randint(low_num, high_num) {
	return Math.floor(Math.random() * (high_num - low_num + 1 ) + low_num);
}

function random_weapon(sprite) {
    let output = randint(1, sprites_list[sprite].weapons.length);
    console.log(sprite + " is using weapon number " + output)
    return output;
}

function use_weapon(from_sprite, weapon_number, target) {
    let weapon_chosen = weapon_number - 1;
    if (weapon_chosen == -1) {
        weapon_chosen = sprites_list[from_sprite].weapons[random_weapon(from_sprite)];
    }
    else {
        weapon_chosen = sprites_list[from_sprite].weapons[weapon_number - 1];
    }
    // console.log(from_sprite + "\n" + weapon_number);
    if (!(typeof sprites_list[from_sprite] === 'undefined') && !(typeof weapons[weapon_chosen] === 'undefined')) {
        // console.log("theyre both defined")
        if (sprites_list[from_sprite].cooldowns[weapon_number - 1] == "empty") {
			if (target === undefined) {
				target = { x_pos: sprites_list[from_sprite].x_pos, y_pos: sprites_list[from_sprite].y_pos };
			} 
			else if (target == "mouse") {
				target = mouse_lvl_pos();
            }

            copied_target = deep_copy(target);

            copied_target.x_pos -= Math.floor(deep_copy(sprites[weapon_chosen].x_size) / 2);
            copied_target.y_pos -= Math.floor(deep_copy(sprites[weapon_chosen].y_size) / 2);

            let start_point = {
                x_pos: sprites_list[from_sprite].x_pos + (Math.floor(sprites_list[from_sprite].x_size / 2) - Math.floor(sprites[weapon_chosen].x_size / 2)),
                y_pos: sprites_list[from_sprite].y_pos + (Math.floor(sprites_list[from_sprite].y_size / 2) - Math.floor(sprites[weapon_chosen].y_size / 2)),
                // x_pos_centered: sprites_list[from_sprite].x_pos + (Math.floor(sprites_list[from_sprite].x_size / 2) - Math.floor(sprites[weapon_chosen].x_size / 2)),
                // y_pos_centered: sprites_list[from_sprite].y_pos + (Math.floor(sprites_list[from_sprite].y_size / 2) - Math.floor(sprites[weapon_chosen].y_size / 2)),
                x_size: sprites_list[from_sprite].x_size, y_size: sprites_list[from_sprite].y_size,
                x_speed: sprites_list[from_sprite].x_speed, y_speed: sprites_list[from_sprite].y_speed
            };
            console.log(start_point);
            sprites_list[from_sprite].cooldowns[weapon_number - 1] = weapons[weapon_chosen].name;
			create_timer(from_sprite + weapon_number, delete_cooldown, weapons[weapon_chosen].cooldown, {sprite : from_sprite, weapon: weapon_number - 1}, false);
			
            let temp_bullet_speeds = calculate_weapon_speed(start_point, weapons[weapon_chosen], copied_target);

            new_create_sprite(weapons[weapon_chosen].name, {
                x_speed: temp_bullet_speeds.x_speed,
                y_speed: temp_bullet_speeds.y_speed,
                x_pos: start_point.x_pos,
                y_pos: start_point.y_pos,
                team: sprites_list[from_sprite].team

            })
			// console.log("fired weapon")
		}
		else {
			// console.log(sprites_list[from_sprite].cooldowns[sprites_list[from_sprite].cooldowns.indexOf(weapons[weapon_chosen].name)])
		}
	} else {
		// console.log("from sprite " + sprites_list[from_sprite]);
		// console.log("using weapon " + weapons[weapon_chosen]);
	}
}

function delete_cooldown(args) {
	if (!(typeof sprites_list[args.sprite] === 'undefined')) {
        sprites_list[args.sprite].cooldowns[args.weapon] = "empty";
	}
}

function create_timer(interval_name, the_func, the_interval, temp_func_args, timer_type) {
	// timers[interval_name] = setInterval(func, interval);
	timers[interval_name] = { func: the_func, interval: the_interval, time: 0, func_args: temp_func_args, loop: timer_type}
}

function delete_timer(interval_name) {
	delete(timers[interval_name]);
}

function update_text(id, the_text) {
	document.getElementById(id).innerHTML = the_text;
}

function update_objectives_display() {
	temp_text = "";
	for (obj in level.objectives) {
		temp_row = "";
		if (level.objectives[obj].is_completed == true) {
			temp_row += uniconvert['checkbox_tick'];
		} else {
			temp_row += uniconvert['checkbox_empty'];
		}
		temp_row += " " + level.objectives[obj].type + ": " + level.objectives[obj].target;
		temp_text += temp_row + "<br />";
	}
	update_text("objectives", temp_text);
}

function check_objectives() {
    if (level.is_completed == false) { 
        let temp_level_complete = true;
        for (obj in level.objectives) {
            if (level.objectives[obj].type == "eliminate") {
                if (typeof sprites_list[level.objectives[obj].target] === "undefined") {
                    level.objectives[obj].is_completed = true;
                }
            }
            if (level.objectives[obj].is_completed == false) {
                temp_level_complete = false;
            }
        }
        update_objectives_display();
        if (temp_level_complete == true) {
            level_completed();
        }
    }
}

function level_completed() {
	pause_game();
    toggle_div('level_complete_screen');
    level.is_completed = true;
}

function is_dead(the_sprite) {
	temp_result = true;
	if (!(typeof sprites_list[the_sprite] === 'undefined')) {
		temp_result = false;
	}
	return temp_result
}

function reset_timer(timer) {
	timers[timer].time = 0;
}

function assign_name(init_name) {
	/*
	let iterations = 0;
	let found_blank = false;
	
	while (found_blank == false) {
		iterations = iterations + 1;
		let found_name = false;
		
		for (sprite in sprites_list) {
			if (sprite == init_name + "_" + iterations.toString()) {
				found_name = true;
			}
		}
		if (found_name == false) {
			found_blank = true;
		}
	}
	return  init_name + "_" + iterations.toString()
	*/
	return init_name + '_' + randint(1,32767)
}

function direction_of_sprite(sprite) {
	output_direction = 90
	if (!(typeof sprites_list[sprite] === 'undefined')) {
		if (sprites_list[sprite].x_speed >= 0) {
			output_direction = 90;
		} else {
			output_direction = 270;
		}
	}
}

function update_minimap() {
	
	minimap.rows = [];
	minimap.render = "";
	if (!(typeof level === 'undefined')) {
	for (y = 0; y < level.minimap_height; y++) {
		let temp_row = "";
		let skip_char = false;
		for (x = 0; x < level.minimap_width; x++) {
			if (skip_char == true ) { skip_char = false } else 
			{
				let temp_char = "'";
				for (sprite in sprites_list) {
					if (Math.floor(sprites_list[sprite].x_pos / level_blowup_width)== x && Math.floor(sprites_list[sprite].y_pos / level_blowup_height) == y) {
						temp_char = sprites_list[sprite].minimap_character;
					}
				}
				if (temp_char == "'") {
					temp_char = level.rows[y].charAt(x)
				}
				temp_row += temp_char;
				if (!(typeof double_length_chars[temp_char] === 'undefined')) {
					skip_char = true;
				}
			}
		}
		minimap.rows[y] = temp_row;
	}
	
	// console.log("updating minimap");
	for (row in minimap.rows) {
		minimap.render += minimap.rows[row] + "\n";
	}
	document.getElementById("minimap").innerHTML = minimap.render;
	}
}

function stop_all_sounds() {
	for (sound in sounds) {
		sounds[sound].volume(0);
	}
}

// hitbox sprite collisions
function is_touching(sprite_1, sprite_2) {
	let temp_is_touching = false;
	if (sprites_list[sprite_1].team != sprites_list[sprite_2.team]) {
		if (
		sprites_list[sprite_1].x_pos + sprites_list[sprite_1].x_size > sprites_list[sprite_2].x_pos &&
		sprites_list[sprite_1].x_pos < sprites_list[sprite_2].x_pos + sprites_list[sprite_2].x_size && 
		sprites_list[sprite_1].y_pos + sprites_list[sprite_1].y_size > sprites_list[sprite_2].y_pos &&
		sprites_list[sprite_1].y_pos < sprites_list[sprite_2].y_pos + sprites_list[sprite_2].y_size
		)
		{
			temp_is_touching = true
		}
	}
	
	return temp_is_touching
}

function find_sprite_collisions(init_sprite) {
	let collided_with = [];
	for (sprite_ in sprites_list) {
		if (is_touching(init_sprite, sprite_) && sprites_list[init_sprite].team != sprites_list[sprite_].team) {
			collided_with.push(sprite_);
		}
	}
	// console.log(collided_with.toString())
	return collided_with
}

function create_sprite(args) {
	// Check if object name already exists
	var sprite_name = args.name;
	if (!(Object.keys(sprites_list).indexOf(args.name) === -1 )) {args.name = assign_name(args.name.substring(0,10))}
	if (Object.keys(sprites_list).indexOf(args.name) === -1 ) {
		var sprite_skin = args.skin;
		if (typeof args.x_speed === 'undefined') { args.x_speed = 0; }
		if (typeof args.y_speed === 'undefined') { args.y_speed = 0; }
		if (typeof args.x_pile === 'undefined') { args.x_pile = 0; }
		if (typeof args.y_pile === 'undefined') { args.y_pile = 0; }
		if (typeof args.team === 'undefined') { args.team = sprite_name; }
		if (typeof args.is_bullet === 'undefined') { args.is_bullet = false; }
		if (typeof args.move_towards === 'undefined') { args.move_towards = false; }
		if (typeof args.show_nametag === 'undefined') { args.show_nametag = true; }
		if (typeof args.use_ai === 'undefined') { args.use_ai = false; }
		if (typeof args.ai_phase === 'undefined') { args.ai_phase = "wander"; }
		if (typeof args.health === 'undefined') { args.health = 100; }
		if (typeof args.invincible === 'undefined') { args.invincible = false; }
		if (typeof args.damage === 'undefined') { args.damage = 5; }
		if (typeof args.weapons === 'undefined') { args.weapons = []; }
		if (typeof args.ai === 'undefined') { args.ai = { speed: 1, targets: ["nobody"]}; }
		if (typeof args.lock_direction === 'undefined') { args.lock_direction = false; }
		if (typeof args.minimap_character === 'undefined') { args.minimap_character = "?"; }
        if (typeof args.cooldowns === 'undefined') { args.cooldowns = ["empty", "empty", "empty", "empty"]; }
		if (typeof args.delete_after === 'undefined') { args.delete_after = -1; }
		if (typeof args.starting_direction === 'undefined') { args.starting_direction = 90; args.direction = 90; } else {args.direction = args.starting_direction}
		if (typeof args.has_resistance === 'undefined') { args.has_resistance = false; }
        if (typeof args.nametag === 'undefined') { args.nametag = args.name + " " + args.health; }
        /*
        if (args.skin == 'load') {
            if (typeof loaded_textures[sprite_name] === 'undefined') {
                sprite_skin = load_sprite_skin(sprite_name);
            } else {
                sprite_skin = loaded_textures[sprite_name];
            }
			args.skin = sprite_skin.skin;
			if (typeof args.skin === 'undefined') {
				console.log("failed loading skin for " + sprite_name)
					
				args.skin = [];
				
				
				if (typeof args.x_size === 'undefined') {
					args.x_size = 3
				}
			
				if (typeof args.y_size === 'undefined') {
					args.y_size = 2;
				}
				for (x = 0; x < args.y_size; x++) {
					args.skin.push(uniconvert['heavy'].repeat(args.x_size) );
				}
			} else {
				if (typeof args.x_size === 'undefined') { args.x_size = sprite_skin.x_size; }
				if (typeof args.y_size === 'undefined') { args.y_size = sprite_skin.y_size; }
                loaded_textures[sprite_name] = sprite_skin;
			}
		}
		
        else if (!(typeof args.skin === 'undefined')) {
            if (typeof loaded_textures[args.skin] === "undefined") {
                sprite_skin = load_sprite_skin(args.skin);
            }
            else {
                sprite_skin = loaded_textures[args.skin]
            }
			if (!(typeof sprite_skin === "undefined")) {
				args.skin = sprite_skin.skin;
                loaded_textures[args.skin] = sprite_skin;
			}
			if (typeof args.x_size === 'undefined') { args.x_size = sprite_skin.x_size; }
			if (typeof args.y_size === 'undefined') { args.y_size = sprite_skin.y_size; }
		}
		
		else {
				args.skin = [];
			if (typeof args.x_size === 'undefined') {
				args.x_size = 3
			}
			
			if (typeof args.y_size === 'undefined') {
				args.y_size = 2;
			}
			for (x = 0; x < args.y_size; x++) {
				args.skin.push(uniconvert['heavy'].repeat(args.x_size) );
			}
		}
        */
		sprites_list[args.name] = args;
		let sprite = args.name;
	}
	else {
		console.log("ERROR sprite already exists: ");
		console.log(args.name);
	}
}

// copies a sprite from memory to the game, with custom options
function new_create_sprite(name, args) {
    let temp_original_args = sprites[name];
    let temp_name = name;
    if (!(typeof sprites_list[name] === 'undefined')) {
        temp_name = assign_name(name);
    }
    let sprite_to_deepcopy = {
        ...sprites["default_sprite"],
        ...temp_original_args,
        ...args
    }
    console.log(sprite_to_deepcopy);
    sprites_list[temp_name] = JSON.parse(JSON.stringify(sprite_to_deepcopy));
    sprites_list[temp_name].nametag = name + " " + sprites_list[temp_name].health;
    return sprites_list[temp_name]
}

function delete_all_sprites() {
	
}

// load sprite from memory rather than using the filesystem
function load_sprite(sprite_id, args) {
	let temp_sprite_name = assign_name(sprite_id);
	let temp_sprite_args = JSON.parse(JSON.stringify(sprites[sprite_id]));
	for (parameter in args) {
		console.log("parameter: " + parameter);
		console.log("args.parameter: " + args.parameter);
		console.log("args[parameter]: " + args[parameter]);
		temp_sprite_args[parameter] = args[parameter];
	}
	console.log(temp_sprite_args);
	create_sprite(temp_sprite_args);
}

function load_data(includes_file) {
	let output = {};
	var lines = loadFile(includes_file).split("\n");
	console.log("lines: " + lines);
	for (txt_line in lines) {
		let temp_obj_name = lines[txt_line].substr(lines[txt_line].lastIndexOf("/") + 1,lines[txt_line].length - (lines[txt_line].lastIndexOf("/") + (lines[txt_line].length - lines[txt_line].indexOf(".") + 1)));
		console.log(temp_obj_name);
		output[temp_obj_name] = JSON.parse(loadFile("/fuze-engine" + lines[txt_line]));
	}
	console.log("output: " + output);
	return output
}

function loadFile(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status == 200) {
        result = xmlhttp.responseText;
    }
	console.log(result);
    return result;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function load_sprite_skin(file_name) {
	let raw_text = loadFile(textures_path + file_name + ".txt");
	// console.log("raw text is " + raw_text)
	let output_text = [];
	let temp_text = "";
	//generate full-sized terrain from txt file
    for (loop = 0; loop <= raw_text.length; loop++) {
        if (raw_text[loop] === '\n') {
			output_text.push(temp_text);
			temp_text = "";
        } else {
			if (raw_text[loop] === '\r') {} else {
			temp_text = temp_text + raw_text[loop];
			}
		}
    }
	console.log(output_text);
	return { data : output_text, x_size: output_text[0].length, y_size: output_text.length };
}

function anger_ai(from_sprite,target_sprite) {
	if (sprites_list[target_sprite].health > sprites_list[from_sprite].health || randint(0,100) > 73 ) {
		sprites_list[target_sprite].ai_phase = "chase";
	} else {
		sprites_list[target_sprite].ai_phase = "flee";
	}
	return sprites_list[target_sprite].ai_phase
}

function do_ai() {
	for (sprite in sprites_list) {
		if (!(typeof sprites_list[sprite] === 'undefined') && !(typeof sprites_list[sprites_list[sprite].ai.targets] === 'undefined')) {
			if (sprites_list[sprite].use_ai == true) {
				if (sprites_list[sprite].ai.targets.length > 0) {
					target_sprite = sprites_list[sprite].ai.targets[0];
					
					if (sprites_list[sprite].ai_phase == "chase") {
						// chases player at any cost. very spooky
						
						xpos_of_target = sprites_list[target_sprite].x_pos;
						ypos_of_target = sprites_list[target_sprite].y_pos;
						
						xpos_altered = xpos_of_target + randint(-10,10);
						ypos_altered = ypos_of_target + randint(-5,5);
						
						if (randint(0,100) > 90 ) {
							sprites_list[sprite].ai_phase = "wander";
						}
					}
					else if (sprites_list[sprite].ai_phase == "flee") {
						// move AWAY from danger
						
						if (sprites_list[sprite].x_pos < sprites_list[target_sprite].x_pos) {
							xpos_of_target = sprites_list[target_sprite].x_pos + (0 - (sprites_list[target_sprite].x_pos - sprites_list[sprite].x_pos));
						} else {
							xpos_of_target = sprites_list[target_sprite].x_pos + (sprites_list[sprite].x_pos - sprites_list[target_sprite].x_pos);
						}
						if (sprites_list[sprite].y_pos < sprites_list[target_sprite].y_pos) {
							ypos_of_target = sprites_list[target_sprite].y_pos + (0 - (sprites_list[target_sprite].y_pos - sprites_list[sprite].y_pos) * 2);
						} else {
							ypos_of_target = sprites_list[target_sprite].y_pos + (sprites_list[sprite].y_pos - sprites_list[target_sprite].y_pos) * 2;
						}
						
						xpos_altered = xpos_of_target + randint(-10,10);
						ypos_altered = ypos_of_target + randint(-5,5);
						
						if (randint(0,100) > 90 ) {
							sprites_list[sprite].ai_phase = "wander";
						}
					}
					else {
						// wander around
						
						xpos_altered = sprites_list[sprite].x_pos + randint(-100,100);
						ypos_altered = sprites_list[sprite].y_pos + randint(-50,50);
						
						if (randint(0,100) > 90 ) {
							sprites_list[sprite].ai_phase = "chase";
						}
					}
					
					// xpos_altered = xpos_of_target;
					// ypos_altered = ypos_of_target;
						
					if ( sprites_list[sprite].x_pos > xpos_altered) {
						
						sprites_list[sprite].x_speed -= sprites_list[sprite].ai.speed;
					}
					if ( sprites_list[sprite].x_pos < xpos_altered) {
						
						sprites_list[sprite].x_speed += sprites_list[sprite].ai.speed;
					}
					if ( sprites_list[sprite].y_pos > ypos_altered) {
						
						sprites_list[sprite].y_speed -= sprites_list[sprite].ai.speed;
					}
					if ( sprites_list[sprite].y_pos < ypos_altered) {
						
						sprites_list[sprite].y_speed += sprites_list[sprite].ai.speed;
					}
					if (randint(0,100) > 50) {
						use_weapon(sprite, random_weapon(sprite), sprites_list[target_sprite]);
					}
					// for (weapon in sprites_list[sprite].weapons) {
						// console.log(sprites_list[sprite].weapons);
						// console.log("sprite: " + sprite + "weapon: " + sprites_list[sprite].weapons[weapon]);
						
					// }
				}
				
				if (sprites_list[sprite].y_speed > 90) {sprites_list[sprite].y_speed = 90}
				if (sprites_list[sprite].y_speed < -90) {sprites_list[sprite].y_speed = -90}
				if (sprites_list[sprite].x_speed > 90) {sprites_list[sprite].x_speed = 90}
				if (sprites_list[sprite].x_speed < -90) {sprites_list[sprite].x_speed = -90}
				
				// console.log("AI: " + sprite + " x_pos: " + sprites_list[sprite].x_pos + " y_pos: " + sprites_list[sprite].y_pos + "xpos_alt: " + xpos_altered + "ypos_alt: " + ypos_altered);
			}
		}
	}
}

function ui_create_sprite() {
	let temp_xpos = parseInt(document.getElementById("sprite-xpos").value);
	let temp_ypos = parseInt(document.getElementById("sprite-ypos").value);
	let temp_xsize = parseInt(document.getElementById("sprite-xsize").value);
	let temp_ysize = parseInt(document.getElementById("sprite-ysize").value);
	
	create_sprite(document.getElementById("sprite-name").value, {
		x_pos : temp_xpos ,
		y_pos : temp_ypos ,
		x_size : temp_xsize ,
		y_size : temp_ysize });
}

function apply_level(level_source) {
	let level_textbox_text = loadFile(level_path + level_source + '.txt');
	document.getElementById('level_textbox').value = level_textbox_text;
}

function change_font_size(font_size) {
	document.getElementById("game-display").style.fontSize = font_size + "px";
	font = {x_size : Math.ceil(font_size / 2), y_size: font_size};
}

function open_level() {
	if (level == "null") {
		load_level("fz_racecourse");
	}

    // create_sprite(JSON.parse(JSON.stringify(sprites["player"])));

	// unpause_game();
	
	if (!(document.getElementById("pause_menu").style.display == "none")) {
		document.getElementById("pause_menu").style.display = "none";
	}
	if (!(document.getElementById("level_complete_screen").style.display == "none")) {
		document.getElementById("level_complete_screen").style.display = "none";
    }
    document.getElementById("weapon_select").style.display = "block";
    load_weapon_select_loadout()
}

// buttons in weapon select window
function select_weapon(number,weapon) {
    sprites_list["player"].weapons[number - 1] = weapon;
    sprites["player"].weapons[number - 1] = weapon;
    console.log(weapon);
}

function load_weapon_select_loadout() {
    update_weapons_chooser();
}

function load_level(level_id) {
    // level = { raw: loadFile('/level/' + level_name + '.txt'), full: [''] };
	level = levels[level_id];
	
	level.full = [''];
	level.rows = [''];
	
	minimap.render = level.map;
	
    // var temp = '';
    console.log(level);
    var current_row = 0;
	let current_row_mini = 0;
	
	//generate full-sized terrain from txt file
    for (loop = 0; loop <= level.map.length; loop++) {
        if (level.map[loop] === '\n') {
			
            let row_to_repeat = level.full[current_row];
            // console.log(row_to_repeat)
            for (numb = 1; numb < level_blowup_height; numb++) {
                level.full.push(row_to_repeat);
            }
			level.rows.push('');
            level.full.push('');
            current_row += level_blowup_height;
			current_row_mini += 1;
        } else if (level.map[loop] === '\r') {
            // console.log('pass');
        } else {
			if ( uniconvert_keys.indexOf(level.map.charAt(loop)) !== -1 ) {
				level.full[current_row] += uniconvert[level.map.charAt(loop)].repeat(level_blowup_width);
				
				if (!(typeof uniconvert[level.map.charAt(loop)] === 'undefined')) {
				level.rows[current_row_mini] += uniconvert[level.map.charAt(loop)]; }
			} else {
				level.full[current_row] += level.map.charAt(loop).repeat(level_blowup_width);
				if (!(typeof level.map.charAt(loop) === 'undefined')) {
				level.rows[current_row_mini] += level.map.charAt(loop)
				}
			}
        }
    }
	level.full.pop();
	level.rows.pop();
	level.minimap_width = level.rows[0].length
	level.minimap_height = level.rows.length
	level.width = level.full[0].length;
    level.height = level.full.length;

    // make level skippable if there are no objectives
    if (level.objectives.length == 0) {
        level.is_completed = true;
    }
    else {
        level.is_completed = false;
    }
	
	viewport.x_pos = Math.floor(level.width / 2);
	viewport.y_pos = Math.floor(level.height / 2);

    sprites_list = {};
    for (the_npc in level.npc_list) {
        create_sprite(JSON.parse(JSON.stringify(sprites[level.npc_list[the_npc]])));
    }
    create_sprite(JSON.parse(JSON.stringify(sprites["player"])));

    update_objectives_display();

	change_font_size(4);
	document.getElementById(text_display).innerHTML = render_screen( {screen_width: parseInt(el.clientWidth / font.x_size), screen_height: parseInt(el.clientHeight / font.y_size)} )
	
	// requestAnimationFrame(update);
    // start rendering
    // if (render == false) { requestAnimationFrame(update); render = true; }
}

function render_screen( args ) {
	if (typeof args.screen_width === 'undefined') { var screen_width = 60 } else { var screen_width = args.screen_width }
	if (typeof args.screen_height === 'undefined') { var screen_height = 40 } else { var screen_height = args.screen_height }
	
	if (typeof args.sprites === 'undefined') { var sprites= {} } else { var sprites = args.sprites }
	
	
	var half_height = Math.floor(screen_height / 2);
    var half_width = Math.floor(screen_width / 2);
	
	var text_output = '';
	
	// start_yrender_from = sprites_list["player"].y_pos - half_height;
    // start_xrender_from = sprites_list["player"].x_pos - half_width;
	
    start_xrender_from = viewport.x_pos - half_width;
	start_yrender_from = viewport.y_pos - half_height;
	
	
	if (document.getElementById('cb_pov').checked) {
		if (start_xrender_from < 0) {start_xrender_from = 0}
		if (start_yrender_from < 0) {start_yrender_from = 0}
		if (start_xrender_from + screen_width > level.width) { start_xrender_from =  level.width - screen_width}
		if (start_yrender_from + screen_height > level.height) { start_yrender_from =  level.height - screen_height}
	} 
	
    for (y = start_yrender_from; y < start_yrender_from + screen_height; y++) {
		
		for (x = start_xrender_from; x < start_xrender_from + screen_width ; x++ ) {
			temp_char = "'";				// let temp_layer = -1;
			// is_empty = false;
			for (sprite in sprites_list) {
				// console.log(sprites_list[sprite]["y_pos"]);
				if ( y >= sprites_list[sprite].y_pos && y < sprites_list[sprite].y_pos + sprites_list[sprite].y_size &&
				x >= sprites_list[sprite].x_pos && x < sprites_list[sprite].x_pos + sprites_list[sprite].x_size ) {
					let temp_temp_char = "'";
					// temp_char = uniconvert["heavy"];
					
                    if (sprites_list[sprite].direction == 270) {
                        temp_temp_char = sprites_list[sprite].skin.data[y - sprites_list[sprite].y_pos].charAt(sprites_list[sprite].x_size + sprites_list[sprite].x_pos - x - 1);
                    }
                    else {
                        temp_temp_char = sprites_list[sprite].skin.data[y - sprites_list[sprite].y_pos].charAt(x - sprites_list[sprite].x_pos);
					}
					if (temp_temp_char != "'") {
						temp_char = temp_temp_char;
						break;
					}
					// console.log(temp_char)
					
				} else if (sprites_list[sprite].show_nametag == true &&
					y == sprites_list[sprite].y_pos + sprites_list[sprite].y_size + 1 &&
					x >= sprites_list[sprite].x_pos + Math.trunc((sprites_list[sprite].x_size / 2) - (sprites_list[sprite].nametag.length / 2)) && x < sprites_list[sprite].x_pos + sprites_list[sprite].nametag.length + Math.trunc((sprites_list[sprite].x_size / 2) - (sprites_list[sprite].nametag.length / 2))) {
					// console.log(x + sprites_list[sprite].x_pos - start_xrender_from);
					temp_char = sprites_list[sprite].nametag.charAt(x - (sprites_list[sprite].x_pos + Math.trunc((sprites_list[sprite].x_size / 2) - (sprites_list[sprite].nametag.length / 2))));
					break;
				}
			}
			//if ( (y >= sprites_list["morio"]["y_pos"]) && (y < sprites_list["morio"]["y_pos"] + sprites_list["morio"]["y_size"]) && (x >= sprites_list["morio"]["x_pos"]) && (x < sprites_list["morio"]["x_pos"] + sprites_list["morio"]["x_size"]) ) {
					
			//	temp_char = uniconvert["heavy"];
		
			if (temp_char == "'") {
				if ( y >= 0 && y < level.full.length &&  x >= 0 && x < level.full[0].length) {
					
					temp_char = level.full[y].charAt(x);
				} else {
					temp_char = uniconvert[" "];
				} 
			}
			text_output += temp_char;
		}
	
		// listy_text_output.push(text_output);
		text_output += '\r\n';
		// now render the sprites on top
	}
	
	return text_output
}

function update_sprites(sprites_list) {
	// damage_update_timer += 1;
	
	var half_height = Math.floor(screen_height / 2);
    var half_width = Math.floor(screen_width / 2);
	
	
	
	
	// new physics
	for (sprite in sprites_list) {
		
		if (sprites_list[sprite].delete_after != -1) {
			sprites_list[sprite].delete_after -= 1;
			if (sprites_list[sprite].delete_after < 1) {
				delete_sprite(sprite);
			}
		}
		
		sprites_list[sprite].x_pile += sprites_list[sprite].x_speed / fps;
		sprites_list[sprite].y_pile += (sprites_list[sprite].y_speed / 2)/ fps;
		
		if (sprites_list[sprite].x_pile >= 1) {
			sprites_list[sprite].x_pos += Math.floor(sprites_list[sprite].x_pile);
			sprites_list[sprite].x_pile -= Math.floor(sprites_list[sprite].x_pile);
		} 
		if (sprites_list[sprite].x_pile <= -1) {
			sprites_list[sprite].x_pos += Math.ceil(sprites_list[sprite].x_pile);
			sprites_list[sprite].x_pile -= Math.ceil(sprites_list[sprite].x_pile);
		}
		if (sprites_list[sprite].y_pile >= 1) {
			sprites_list[sprite].y_pos += Math.floor(sprites_list[sprite].y_pile / 2);
			sprites_list[sprite].y_pile -= Math.floor(sprites_list[sprite].y_pile / 2);
		} 
		if (sprites_list[sprite].y_pile <= -1) {
			sprites_list[sprite].y_pos += Math.ceil(sprites_list[sprite].y_pile / 2);
			sprites_list[sprite].y_pile -= Math.ceil(sprites_list[sprite].y_pile / 2);
		}
		
		if (sprites_list[sprite].move_towards == true && sprites_list[sprite].lock_direction == false) {
			if (sprites_list[sprite].x_speed < 0) {
				sprites_list[sprite].direction = 270;
			} else if (sprites_list[sprite].x_speed > 0) {
				sprites_list[sprite].direction = 90;
			}
		}
	
		
		//if (damage_update_timer > 10) {
		//	damage_update_timer = 0;
			sprite_collisions = find_sprite_collisions(sprite);
			if (sprite_collisions.length > 0) {
				for (collided_sprite in sprite_collisions) {
					sprites_list[sprite].health -= sprites_list[sprite_collisions[collided_sprite]].damage;
					console.log(anger_ai(sprite,sprite_collisions[collided_sprite]));
					// sprites_list[sprite_collisions[collided_sprite]].health -= sprites_list[sprite].damage;
					// console.log(sprite + " damaged by " + sprite_collisions[collided_sprite].nametag)
				}
				sprites_list[sprite].nametag = sprite + " " + sprites_list[sprite].health;
				if (sprites_list[sprite].health < 0) {
					delete_sprite(sprite);
					check_objectives();
				}
				// 
			}
		//}
		
		if (sprites_list[sprite].has_resistance == true) {
			if (sprites_list[sprite].x_speed <= 0 - resistance) {sprites_list[sprite].x_speed = sprites_list[sprite].x_speed + (resistance + (sprites_list[sprite].x_speed * sprites_list[sprite].x_speed * resistance_ramp))}
			if (sprites_list[sprite].x_speed >= resistance)     {sprites_list[sprite].x_speed = sprites_list[sprite].x_speed - (resistance + (sprites_list[sprite].x_speed * sprites_list[sprite].x_speed * resistance_ramp))}
			if (sprites_list[sprite].y_speed <= 0 - resistance) {sprites_list[sprite].y_speed = sprites_list[sprite].y_speed + (resistance + (sprites_list[sprite].y_speed * sprites_list[sprite].y_speed * resistance_ramp))}
			if (sprites_list[sprite].y_speed >= resistance)     {sprites_list[sprite].y_speed = sprites_list[sprite].y_speed - (resistance + (sprites_list[sprite].y_speed * sprites_list[sprite].y_speed * resistance_ramp))}
			
			if ( 0 - resistance <= sprites_list[sprite].x_speed && sprites_list[sprite].x_speed <= resistance ) {sprites_list[sprite].x_speed = 0}
			if ( 0 - resistance <= sprites_list[sprite].y_speed && sprites_list[sprite].y_speed <= resistance ) {sprites_list[sprite].y_speed = 0}
		}
		
		collided_x = false;
		collided_y = false;
		
		
		let x_pos_onscreen = sprites_list[sprite].x_pos - start_xrender_from;
		let y_pos_onscreen = sprites_list[sprite].y_pos - start_yrender_from;
		
	
		// legacy collisions
		if ( sprites_list[sprite].y_pos - 1 >= 0 && sprites_list[sprite].y_pos + sprites_list[sprite].y_size < level.full.length ) {
			let bounced_left = false;
			let bounced_right = false;
			let bounced_up = false;
			let bounced_down = false;
			
			// y-axis collisions
			// top
			if ((level.full[sprites_list[sprite].y_pos - 1].charAt(sprites_list[sprite].x_pos) == '\u2588') ||
				(level.full[sprites_list[sprite].y_pos - 1].charAt(sprites_list[sprite].x_pos + sprites_list[sprite].x_size - 2) == '\u2588')) {
				
				bounced_up = true;
			} 
			
			// left
			if (level.full[sprites_list[sprite].y_pos].charAt(sprites_list[sprite].x_pos - 1) == '\u2588' ||
				level.full[sprites_list[sprite].y_pos + sprites_list[sprite].y_size - 1].charAt(sprites_list[sprite].x_pos - 1) == '\u2588') {
				
				bounced_left = true;
				
			} 
			
			// right
			if (level.full[sprites_list[sprite].y_pos].charAt(sprites_list[sprite].x_pos + sprites_list[sprite].x_size) == '\u2588' ||
				level.full[sprites_list[sprite].y_pos + sprites_list[sprite].y_size - 1].charAt(sprites_list[sprite].x_pos + sprites_list[sprite].x_size) == '\u2588') {
				
				bounced_right = true;
			}
			
			// bottom
			if (level.full[sprites_list[sprite].y_pos + sprites_list[sprite].y_size].charAt(sprites_list[sprite].x_pos) == '\u2588' ||
				level.full[sprites_list[sprite].y_pos + sprites_list[sprite].y_size].charAt(sprites_list[sprite].x_pos + sprites_list[sprite].x_size - 2) == '\u2588') {
				
				bounced_down = true;
            }
            if (bounced_left && bounced_right && bounced_up && bounced_down) {
                // pass
            } else {
				if (bounced_left) {
					if (sprites_list[sprite].x_pile < 0) {
						sprites_list[sprite].x_pile = 0 - sprites_list[sprite].x_pile * collision_loss;
					}
					if (sprites_list[sprite].x_speed < 0) {
						sprites_list[sprite].x_speed = 0 - sprites_list[sprite].x_speed * collision_loss;
					}
				}
				if (bounced_right) {
					if (sprites_list[sprite].x_pile > 0) {
						sprites_list[sprite].x_pile = 0 - sprites_list[sprite].x_pile * collision_loss;
					}
					if (sprites_list[sprite].x_speed > 0) {
						sprites_list[sprite].x_speed = 0 - sprites_list[sprite].x_speed * collision_loss;
					}
				}
				if (bounced_up) {
					if (sprites_list[sprite].y_pile < 0) {
						sprites_list[sprite].y_pile = 0 - sprites_list[sprite].y_pile * collision_loss;
					}
					if (sprites_list[sprite].y_speed < 0) {
						sprites_list[sprite].y_speed = 0 - sprites_list[sprite].y_speed * collision_loss;
					}
				}
				if (bounced_down) {
					if (sprites_list[sprite].y_pile > 0) {
						sprites_list[sprite].y_pile = 0 - sprites_list[sprite].y_pile * collision_loss;
					}
					if (sprites_list[sprite].y_speed > 0) {
						sprites_list[sprite].y_speed = 0 - sprites_list[sprite].y_speed * collision_loss;
					}
				}
            }
		
			

            if (sprites_list[sprite].lock_direction == false) {

				if (bounced_left == true) {
					if (sprites_list[sprite].starting_direction == "right") {
						sprites_list[sprite].direction = 90;
					}
					else {
						sprites_list[sprite].direction = 270;
					}
				}
				if (bounced_right == true) {
					if (sprites_list[sprite].starting_direction == "right") {
						sprites_list[sprite].direction = 270;
					}
					else {
						sprites_list[sprite].direction = 90;
					}
				}
			}
		}
	}
}

function respawn_player() {
    delete sprites_list["player"];

    new_create_sprite("player", {
        x_pos: level.spawn_location.x_pos,
        y_pos: level.spawn_location.y_pos
    });

	document.getElementById("pause_menu").style.display = "none";
	unpause_game();
}

function delete_sprite(sprite) {
	if (!(typeof sprites_list[sprite] === 'undefined')) {
		sprites_to_delete.push(sprite);
	}
}

function manage_timers(timers) {
	for (timer in timers) {
		if (!(typeof timers[timer] === 'undefined')) {
		
			timers[timer].time += 1;
			
			if (timers[timer].time >= timers[timer].interval) {
				
				if (!(typeof timers[timer].func_args === 'undefined')) {
					
					timers[timer].func(timers[timer].func_args);
				} else {
					timers[timer].func();
				}
				
				if (!(typeof timers[timer] === 'undefined')) {
		
				// console.log("timer " + timer + " called.");
				if (timers[timer].loop == true) {
					timers[timer].time -= timers[timer].interval;
				} else {
					delete(timers[timer]);
					break;
				} }
			} 
		
		} else {
			delete(timers[timer]);
		}
	}
}

function check_if_cb_checked(ch_box) {
	return document.getElementById(ch_box).checked
}

function clear_deleted_sprites() {
	for (sprite in sprites_to_delete) {
		if (typeof sprites_list[sprites_to_delete[sprite]] === 'undefined') {
			console.log("hey u cant delete undefined :0");
		} else {
		// console.log("deleting "+sprites_to_delete[sprite])
		// console.log(">>> "+ sprites_list[sprites_to_delete[sprite]])
		delete sprites_list[sprites_to_delete[sprite]];
	}}
}

var lastFrameTime = 0;  // the last frame time
function update(time) {
    if (time - lastFrameTime < frame_time) { //skip the frame if the call is too early
        requestAnimationFrame(update);
        return; // return as there is nothing to do
    }
    lastFrameTime = time; // remember the time of the rendered frame
	
	/*
	if (check_if_cb_checked("cb_pov") == true) {
		if (start_yrender_from < 0) { start_yrender_from = 0; }
		else 
		if (start_yrender_from > level.full.length - screen_height) { start_yrender_from = level.full.length - screen_height }
	
		if (start_xrender_from < 0) { start_xrender_from = 0; } 
		else 
		if (start_xrender_from > level.full[0].length - screen_width) { start_xrender_from = level.full[0].length - screen_width }
    }
	*/
	
	sprites_to_delete = [];
	
	if (viewport.following_sprite = true && !(typeof sprites_list[viewport.sprite] === 'undefined')) {
		viewport.x_pos = sprites_list[viewport.sprite].x_pos;
		viewport.y_pos = sprites_list[viewport.sprite].y_pos;
	}
	
	manage_timers(timers);

    check_objectives();
	
	// now, process functions from game file.
	on_frame(sprites_list);
	
	screen_width = parseInt(el.clientWidth / font.x_size);
	screen_height = parseInt(el.clientHeight / font.y_size);
	
	text_output = render_screen( {screen_width: screen_width, screen_height: screen_height} )
	
	update_sprites(sprites_list);
	
	// update_minimap();
	
	clear_deleted_sprites();
	
    // console.log(text_output);
    document.getElementById(text_display).innerHTML = text_output;

    // console.log('frames');
	if (render == true) {
		requestAnimationFrame(update);
	}
	
	var thisFrameTime = (thisLoop=new Date) - lastLoop;
	frameTime+= (thisFrameTime - frameTime) / filterStrength;
	lastLoop = thisLoop;
}

create_timer("do_ai", do_ai, 30, 'undefined', true);
create_timer("check_objectives", check_objectives,30,'undefined',true)

// Report the fps only every second, so no lagg
var fpsOut = document.getElementById('fps');
setInterval(function(){
  fpsOut.innerHTML = (1000/frameTime).toFixed(1) + " fps";
},1000);
// end
