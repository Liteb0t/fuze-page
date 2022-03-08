﻿// Fuze engine a2.2

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
var level;
var start_xrender_from;
var start_yrender_from;
var text_output = '';
var temp_char = "'";
var is_empty;
var sprites_list = {  };
var weapons = { };
var collided_x = false;
var resistance = 0.2;
var sprites_to_delete = [];
var collided_y = false;
var render = false;
var level_blowup_width = 18;
var level_blowup_height = 12;
var listy_text_output = [];
var timers = {};
var minimap = { render: "", rows: [], enemies_pos : {} }
var uniconvert = { '#': '\u2588', '\'': '\u2591', ' ':' ', 'checker' : '\u259a', 'medium': '\u2592', 'heavy': '\u2593'};
var sounds = {}
var viewport = {x_pos : 0, y_pos : 0,following_sprite : true, sprite : "player"}
var uniconvert_keys = Object.keys(uniconvert);
const fps = 30;
const frame_time = (1000 / 60) * (60 / fps) - (1000 / 60) * 0.5;
document.getElementById("scr-widthlabel").innerHTML = screen_width;
document.getElementById("scr-heightlabel").innerHTML = screen_height;

var keys = { 'left_arrow' : 37,  'up_arrow' : 38,  'right_arrow' : 39,  'down_arrow' : 40, } 
var keystate = {};

document.addEventListener("keydown", function (event) {
    keystate[event.code] = true;
});
document.addEventListener("keyup", function (event) {
    delete keystate[event.code];
});

// comment vsauce out if you're using another JS file to create the vectors.
// make sure it uses the same names: sprites_list["player"] = [{id, type, xpos, ETC}]
// var vsauce = { id: 'default', type: "basic", xpos: 10, ypos: 10, xsize: 6, ysize: 4, xspeed: 1, yspeed: 1 };
function updateScreen() {
    screen_width = parseInt(document.getElementById("scr-width").value);
    screen_height = parseInt(document.getElementById("scr-height").value);
    document.getElementById("scr-widthlabel").innerHTML = screen_width;
    document.getElementById("scr-heightlabel").innerHTML = screen_height;
    console.log(screen_width);
    console.log(screen_height);
}

function calculate_distance(sprite_1, sprite_2) {
	let total_diff = -1;
	// check if both sprites exist
	if (!(typeof sprite_1 === 'undefined' || typeof sprite_2 === 'undefined')) {
		let diff_x = 0;
		let diff_y = 0;
		
		if (sprite_1.x_pos > sprite_2.x_pos) {
			diff_x = sprite_1.x_pos - sprite_2.x_pos;
		} else {
			diff_x = sprite_2.x_pos - sprite_1.x_pos;
		}
		
		if (sprite_1.y_pos > sprite_2.y_pos) {
			diff_y = sprite_1.y_pos - sprite_2.y_pos;
		} else {
			diff_y = sprite_2.y_pos - sprite_1.y_pos;
		}
		
		total_diff = (diff_x + diff_y) / 1.41
	}
	return total_diff
}

function calculate_weapon_speed(from_sprite, weapon, direction) {
	let output_speeds = {x_speed: 0, y_speed: 0}
	
	if (!(typeof sprites_list[from_sprite] === 'undefined') ) {
		output_speeds.x_speed = sprites_list[from_sprite].x_speed;
		output_speeds.y_speed = sprites_list[from_sprite].y_speed;
		
		if (direction == 90) {
			output_speeds.x_speed = output_speeds.x_speed + weapon.speed
		}
		else if (direction == 270) {
			output_speeds.x_speed = output_speeds.x_speed - weapon.speed
		} else {}
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

function use_weapon(from_sprite, weapon_chosen) {
	if (!(typeof sprites_list[from_sprite] === 'undefined') &&  !(typeof weapon_chosen === 'undefined')) {
	create_sprite(assign_name("bullet"), {x_pos : sprites_list[from_sprite].x_pos - 5,
		y_pos : sprites_list[from_sprite].y_pos - 5,
		x_size : 3,
		y_size : 2,
		x_speed: calculate_weapon_speed(from_sprite, weapon_chosen, sprites_list[from_sprite].direction).x_speed,
		y_speed: calculate_weapon_speed(from_sprite, weapon_chosen, sprites_list[from_sprite].direction).y_speed,
		is_bullet: true,
		damage: weapon_chosen.damage,
		// ignore_sprites: [from_sprite]
	})
	} else {
		console.log("from sprite " + sprites_list[from_sprite]);
		console.log("usin weapon " + weapon_chosen);
	}
}

function assign_name(init_name) {
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
	
	for (sprite in sprites_list) {
		
		if (sprites_list[sprite].x_pos > 0 && sprites_list[sprite].x_pos - sprites_list[sprite].x_size < level.full[0].length &&
			sprites_list[sprite].y_pos > 0 && sprites_list[sprite].y_pos - sprites_list[sprite].y_size < level.full.length ) {
				
			minimap.enemies_pos[sprite] = {
				x_pos: Math.trunc(sprites_list[sprite].x_pos / level_blowup_width), 
				y_pos: Math.trunc(sprites_list[sprite].y_pos / level_blowup_height),
				character: sprites_list[sprite].minimap_character
				};
		}
	}
	
	for (y = 0; y < level.minimap_height; y++) {
		let temp_row = "";
		for (x = 0; x < level.minimap_width; x++) {
			let temp_char = "'";
			for (sprite in minimap.enemies_pos) {
				if (minimap.enemies_pos[sprite].x_pos == x && minimap.enemies_pos[sprite].y_pos == y) {
					temp_char = minimap.enemies_pos[sprite].character;
				}
			}
			if (temp_char == "'") {
				temp_char = level.rows[y].charAt(x)
			}
			temp_row += temp_char;
		}
		minimap.rows[y] = temp_row;
	}
	
	for (row in minimap.rows) {
		minimap.render += minimap.rows[row] + "\n";
	}
	document.getElementById("minimap").innerHTML = minimap.render;
}

function stop_all_sounds() {
	for (sound in sounds) {
		sounds[sound].volume(0);
	}
}

// hitbox sprite collisions
function is_touching(sprite_1, sprite_2) {
	let temp_is_touching = false;
	if (!(sprites_list[sprite_1].ignore_sprites.indexOf(sprite_2) > -1) && !(sprites_list[sprite_2].ignore_sprites.indexOf(sprite_1) > -1)) {
		
		// if (collision_type == "hitbox") {
			
		if (sprites_list[sprite_1].x_pos > sprites_list[sprite_2].x_pos && sprites_list[sprite_1].x_pos < sprites_list[sprite_2].x_pos + sprites_list[sprite_2].x_size &&
			sprites_list[sprite_1].y_pos > sprites_list[sprite_2].y_pos && sprites_list[sprite_1].y_pos < sprites_list[sprite_2].y_pos + sprites_list[sprite_2].y_size
			||
			sprites_list[sprite_1].x_pos + sprites_list[sprite_1].x_size  + 1> sprites_list[sprite_2].x_pos && sprites_list[sprite_1].x_pos + sprites_list[sprite_1].x_size + 1 < sprites_list[sprite_2].x_pos + sprites_list[sprite_2].x_size &&
			sprites_list[sprite_1].y_pos > sprites_list[sprite_2].y_pos && sprites_list[sprite_1].y_pos < sprites_list[sprite_2].y_pos + sprites_list[sprite_2].y_size
			||
			sprites_list[sprite_1].x_pos > sprites_list[sprite_2].x_pos && sprites_list[sprite_1].x_pos < sprites_list[sprite_2].x_pos + sprites_list[sprite_2].x_size &&
			sprites_list[sprite_1].y_pos + sprites_list[sprite_1].y_size > sprites_list[sprite_2].y_pos && sprites_list[sprite_1].y_pos + sprites_list[sprite_1].y_size < sprites_list[sprite_2].y_pos + sprites_list[sprite_2].y_size
			||
			sprites_list[sprite_1].x_pos + sprites_list[sprite_1].x_size > sprites_list[sprite_2].x_pos && sprites_list[sprite_1].x_pos + sprites_list[sprite_1].x_size < sprites_list[sprite_2].x_pos + sprites_list[sprite_2].x_size &&
			sprites_list[sprite_1].y_pos + sprites_list[sprite_1].y_size > sprites_list[sprite_2].y_pos && sprites_list[sprite_1].y_pos + sprites_list[sprite_1].y_size < sprites_list[sprite_2].y_pos + sprites_list[sprite_2].y_size
			||
			sprites_list[sprite_1].x_pos > sprites_list[sprite_2].x_pos && sprites_list[sprite_1].x_pos < sprites_list[sprite_2].x_pos &&
			sprites_list[sprite_1].y_pos > sprites_list[sprite_2].y_pos && sprites_list[sprite_1].y_pos < sprites_list[sprite_2].y_pos
			||
			sprites_list[sprite_1].x_pos + sprites_list[sprite_1].x_size > sprites_list[sprite_2].x_pos && sprites_list[sprite_1].x_pos + sprites_list[sprite_1].x_size + 1< sprites_list[sprite_2].x_pos &&
			sprites_list[sprite_1].y_pos > sprites_list[sprite_2].y_pos && sprites_list[sprite_1].y_pos < sprites_list[sprite_2].y_pos
			||
			sprites_list[sprite_1].x_pos > sprites_list[sprite_2].x_pos && sprites_list[sprite_1].x_pos < sprites_list[sprite_2].x_pos &&
			sprites_list[sprite_1].y_pos + sprites_list[sprite_1].y_size > sprites_list[sprite_2].y_pos && sprites_list[sprite_1].y_pos + sprites_list[sprite_1].y_size < sprites_list[sprite_2].y_pos
			||
			sprites_list[sprite_1].x_pos + sprites_list[sprite_1].x_size > sprites_list[sprite_2].x_pos && sprites_list[sprite_1].x_pos + sprites_list[sprite_1].x_size < sprites_list[sprite_2].x_pos &&
			sprites_list[sprite_1].y_pos + sprites_list[sprite_1].y_size > sprites_list[sprite_2].y_pos && sprites_list[sprite_1].y_pos + sprites_list[sprite_1].y_size < sprites_list[sprite_2].y_pos
		) {
			temp_is_touching = true;
		}
		// }
		//else {
			
		// }
	}
	
	return temp_is_touching
}


function find_sprite_collisions(init_sprite) {
	let collided_with = [];
	for (sprite in sprites_list) {
		if (is_touching(init_sprite, sprite)) {
			collided_with.push(sprite);
		}
	}
	// console.log(collided_with.toString())
	return collided_with
}

// name = STRING, args = DICTIONARY
function create_sprite(name, args) {
	// Check if object name already exists
	if (Object.keys(sprites_list).indexOf(name) === -1 ) {
		if (typeof args.x_size === 'undefined') { args.x_size = 3; }
		if (typeof args.y_size === 'undefined') { args.y_size = 2; }
		if (typeof args.x_speed === 'undefined') { args.x_speed = 0; }
		if (typeof args.y_speed === 'undefined') { args.y_speed = 0; }
		if (typeof args.x_pile === 'undefined') { args.x_pile = 0; }
		if (typeof args.y_pile === 'undefined') { args.y_pile = 0; }
		if (typeof args.ignore_sprites === 'undefined') { args.ignore_sprites = []; }
		if (typeof args.is_bullet === 'undefined') { args.is_bullet = false; }
		if (typeof args.move_towards === 'undefined') { args.move_towards = false; }
		if (typeof args.minimap_character === 'undefined') { args.minimap_character = "?"; }
		if (typeof args.starting_direction === 'undefined') { args.starting_direction = 90; args.direction = 90; } else {args.direction = args.starting_direction}
		if (typeof args.has_resistance === 'undefined') { args.has_resistance = false; }
		if (typeof args.skin === 'undefined') {
			args.skin = []
			for (x = 0; x < args.y_size; x++)
				args.skin.push(uniconvert['heavy'].repeat(args.x_size) );
			}
		sprites_list[name] = args;
	}
	else {
		console.log("ERROR sprite already exists: ");
		console.log(name);
	}
}

function loadFile(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status == 200) {
        result = xmlhttp.responseText;
    }
    return result;
}

function load_sprite_skin(file_path) {
	let raw_text = loadFile(file_path);
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
	return output_text;
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

// level_name is the name of the level text file. this code assumes that it is in a /levels/ folder.
function load_level() {
    // level = { raw: loadFile('/level/' + level_name + '.txt'), full: [''] };
	level = { raw: document.getElementById('level_textbox').value, full: [''], rows: [''] };
	
	
	minimap.render = level.raw;
	
    // var temp = '';
    console.log(level);
    var current_row = 0;
	let current_row_mini = 0;
	
	//generate full-sized terrain from txt file
    for (loop = 0; loop <= level.raw.length; loop++) {
        if (level.raw[loop] === '\n') {
			
            let row_to_repeat = level.full[current_row];
            // console.log(row_to_repeat)
            for (numb = 1; numb < level_blowup_height; numb++) {
                level.full.push(row_to_repeat);
            }
			level.rows.push('');
            level.full.push('');
            current_row += level_blowup_height;
			current_row_mini += 1;
        } else if (level.raw[loop] === '\r') {
            // console.log('pass');
        } else {
			if ( uniconvert_keys.indexOf(level.raw.charAt(loop)) !== -1 ) {
				level.full[current_row] += uniconvert[level.raw.charAt(loop)].repeat(level_blowup_width);
				
				if (!(typeof uniconvert[level.raw.charAt(loop)] === 'undefined')) {
				level.rows[current_row_mini] += uniconvert[level.raw.charAt(loop)]; }
			} else {
				level.full[current_row] += level.raw.charAt(loop).repeat(level_blowup_width);
				if (!(typeof level.raw.charAt(loop) === 'undefined')) {
				level.rows[current_row_mini] += level.raw.charAt(loop)
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
    // start rendering
    if (render == false) { requestAnimationFrame(update); render = true; }
}

var lastFrameTime = 0;  // the last frame time
function update(time) {
    if (time - lastFrameTime < frame_time) { //skip the frame if the call is too early
        requestAnimationFrame(update);
        return; // return as there is nothing to do
    }
    lastFrameTime = time; // remember the time of the rendered frame
	
	if (document.getElementById("cb_pov").checked == true) {
		if (start_yrender_from < 0) { start_yrender_from = 0; }
		else 
		if (start_yrender_from > level.full.length - screen_height) { start_yrender_from = level.full.length - screen_height }
	
		if (start_xrender_from < 0) { start_xrender_from = 0; } 
		else 
		if (start_xrender_from > level.full[0].length - screen_width) { start_xrender_from = level.full[0].length - screen_width }
    }
	
	sprites_to_delete = [];
	
	if (viewport.following_sprite = true && !(typeof sprites_list[viewport.sprite] === 'undefined')) {
		viewport.x_pos = sprites_list[viewport.sprite].x_pos;
		viewport.y_pos = sprites_list[viewport.sprite].y_pos;
	}
	
	// now, process functions from game file.
	on_frame(sprites_list);
	
	
    let half_height = Math.floor(screen_height / 2);
    let half_width = Math.floor(screen_width / 2);
	
	// start_yrender_from = sprites_list["player"].y_pos - half_height;
    // start_xrender_from = sprites_list["player"].x_pos - half_width;
	
	start_yrender_from = viewport.y_pos - half_height;
    start_xrender_from = viewport.x_pos - half_width;
	
	text_output = '';
	
	listy_text_output = [];
    //console.log(level); 
    for (y = start_yrender_from; y < start_yrender_from + screen_height; y++) {
		
		for (x = start_xrender_from; x < start_xrender_from + screen_width ; x++ ) {
			temp_char = "'";				// let temp_layer = -1;
			is_empty = false;
			for (sprite in sprites_list) {
				// console.log(sprites_list[sprite]["y_pos"]);
				if ( y >= sprites_list[sprite].y_pos && y < sprites_list[sprite].y_pos + sprites_list[sprite].y_size &&
				x >= sprites_list[sprite].x_pos && x < sprites_list[sprite].x_pos + sprites_list[sprite].x_size ) {
					let temp_temp_char = "'";
					// temp_char = uniconvert["heavy"];
					
					if (sprites_list[sprite].direction == 90) {
						temp_temp_char = sprites_list[sprite].skin[y - sprites_list[sprite].y_pos].charAt(x - sprites_list[sprite].x_pos);
					} else {
						temp_temp_char = sprites_list[sprite].skin[y - sprites_list[sprite].y_pos].charAt(sprites_list[sprite].x_size + sprites_list[sprite].x_pos - x - 1);	
					}
					if (temp_temp_char != "'") {
						temp_char = temp_temp_char;
					}
					// console.log(temp_char)
					
				}
			}
			//if ( (y >= sprites_list["morio"]["y_pos"]) && (y < sprites_list["morio"]["y_pos"] + sprites_list["morio"]["y_size"]) && (x >= sprites_list["morio"]["x_pos"]) && (x < sprites_list["morio"]["x_pos"] + sprites_list["morio"]["x_size"]) ) {
					
			//	temp_char = uniconvert["heavy"];
		
			if (temp_char == "'") {
				if ( y >= 0 && y < level.full.length &&  x >= 0 && x < level.full[0].length) {
					
					temp_char = level.full[y].charAt(x);
				} else {
					//
				} 
			}
			text_output += temp_char;
		}
	
		// listy_text_output.push(text_output);
		text_output += '\r\n';
		// now render the sprites on top
	}
	
	// new physics
	for (sprite in sprites_list) {
		
		sprites_list[sprite].x_pile += sprites_list[sprite].x_speed / fps;
		sprites_list[sprite].y_pile += sprites_list[sprite].y_speed / fps;
		
		if (sprites_list[sprite].x_pile >= 1) {
			sprites_list[sprite].x_pos += Math.floor(sprites_list[sprite].x_pile);
			sprites_list[sprite].x_pile -= Math.floor(sprites_list[sprite].x_pile);
		} 
		if (sprites_list[sprite].x_pile <= -1) {
			sprites_list[sprite].x_pos += Math.ceil(sprites_list[sprite].x_pile);
			sprites_list[sprite].x_pile -= Math.ceil(sprites_list[sprite].x_pile);
		}
		if (sprites_list[sprite].y_pile >= 1) {
			sprites_list[sprite].y_pos += Math.floor(sprites_list[sprite].y_pile);
			sprites_list[sprite].y_pile -= Math.floor(sprites_list[sprite].y_pile);
		} 
		if (sprites_list[sprite].y_pile <= -1) {
			sprites_list[sprite].y_pos += Math.ceil(sprites_list[sprite].y_pile);
			sprites_list[sprite].y_pile -= Math.ceil(sprites_list[sprite].y_pile);
		}
		
		if (sprites_list[sprite].move_towards == true) {
			if (sprites_list[sprite].x_speed < 0) {
				sprites_list[sprite].direction = 270;
			} else {
				sprites_list[sprite].direction = 90;
			}
		}
		
		//console.log("sprite:" + sprite);
		//console.log("spritelist[sprite]:" + sprites_list[sprite]);
		
		
		if (sprites_list[sprite].is_bullet == true) {
			let temp_has_collided = false;
			
			// deletes every sprite that is touching the bullet
			let found_sprite_collisions = find_sprite_collisions(sprite);
			if (found_sprite_collisions.length > 0) {
			for (collided_sprite in found_sprite_collisions) {
				temp_has_collided = true;
				sprites_to_delete.push(found_sprite_collisions[collided_sprite]);
				console.log("going to delete" + found_sprite_collisions[collided_sprite]);
			}
			}
			// if the bullet has touched at least one sprite, delete the bullet
			//if (temp_has_collided == true) {
			//	sprites_to_delete.push(sprite);
			//	console.log("going to delete" + sprite);
				// break
			//}
		}
		
		if (sprites_list[sprite].has_resistance == true) {
			if (sprites_list[sprite].x_speed <= 0 - resistance) {sprites_list[sprite].x_speed = sprites_list[sprite].x_speed + resistance}
			if (sprites_list[sprite].x_speed >= resistance)     {sprites_list[sprite].x_speed = sprites_list[sprite].x_speed - resistance}
			if (sprites_list[sprite].y_speed <= 0 - resistance) {sprites_list[sprite].y_speed = sprites_list[sprite].y_speed + resistance}
			if (sprites_list[sprite].y_speed >= resistance)     {sprites_list[sprite].y_speed = sprites_list[sprite].y_speed - resistance}
			
			if ( 0 - resistance <= sprites_list[sprite].x_speed && sprites_list[sprite].x_speed <= resistance ) {sprites_list[sprite].x_speed = 0}
			if ( 0 - resistance <= sprites_list[sprite].y_speed && sprites_list[sprite].y_speed <= resistance ) {sprites_list[sprite].y_speed = 0}
		}
		
		collided_x = false;
		collided_y = false;
		
		
		let x_pos_onscreen = sprites_list[sprite].x_pos - start_xrender_from;
		let y_pos_onscreen = sprites_list[sprite].y_pos - start_yrender_from;
		
	
		// legacy collisions
		if ( start_yrender_from + y_pos_onscreen - 1 > 0 &&  start_yrender_from + y_pos_onscreen + sprites_list[sprite].y_size < level.full.length ) {
			let bounced_left = false;
			let bounced_right = false;
			let bounced_up = false;
			let bounced_down = false;
			
			// y-axis collisions
			// top
			if ((level.full[start_yrender_from + y_pos_onscreen - 1].charAt(start_xrender_from + x_pos_onscreen) == '\u2588') ||
				(level.full[start_yrender_from + y_pos_onscreen - 1].charAt(start_xrender_from + x_pos_onscreen + sprites_list[sprite].x_size - 2) == '\u2588')) {
				if (sprites_list[sprite].y_pile < 0) {
					sprites_list[sprite].y_pile -= sprites_list[sprite].y_pile * 2;
				}
				if (sprites_list[sprite].y_speed < 0) {
					sprites_list[sprite].y_speed -= sprites_list[sprite].y_speed * 2;
				}
				bounced_up = true;
			} 
			
			// left
			if (level.full[start_yrender_from + y_pos_onscreen].charAt(start_xrender_from + x_pos_onscreen - 1) == '\u2588' ||
				level.full[start_yrender_from + y_pos_onscreen + sprites_list[sprite].y_size - 1].charAt(start_xrender_from + x_pos_onscreen - 1) == '\u2588') {
				if (sprites_list[sprite].x_pile < 0) {
					sprites_list[sprite].x_pile = 0 - sprites_list[sprite].x_pile;
				}
				if (sprites_list[sprite].x_speed < 0) {
					sprites_list[sprite].x_speed = 0 - sprites_list[sprite].x_speed;
				}
				bounced_left = true;
				
			} 
			
			// right
			if (level.full[start_yrender_from + y_pos_onscreen].charAt(start_xrender_from + x_pos_onscreen + sprites_list[sprite].x_size) == '\u2588' ||
				level.full[start_yrender_from + y_pos_onscreen + sprites_list[sprite].y_size - 1].charAt(start_xrender_from + x_pos_onscreen + sprites_list[sprite].x_size) == '\u2588') {
				if (sprites_list[sprite].x_pile > 0) {
					sprites_list[sprite].x_pile = 0 - sprites_list[sprite].x_pile;
				}
				if (sprites_list[sprite].x_speed > 0) {
					sprites_list[sprite].x_speed = 0 - sprites_list[sprite].x_speed;
				}
				bounced_right = true;
			}
			
			// bottom
			if (level.full[start_yrender_from + y_pos_onscreen + sprites_list[sprite].y_size].charAt(start_xrender_from + x_pos_onscreen) == '\u2588' ||
				level.full[start_yrender_from + y_pos_onscreen + sprites_list[sprite].y_size].charAt(start_xrender_from + x_pos_onscreen + sprites_list[sprite].x_size - 2) == '\u2588') {
				if (sprites_list[sprite].y_pile > 0) {
					sprites_list[sprite].y_pile = 0 - sprites_list[sprite].y_pile;
				}
				if (sprites_list[sprite].y_speed > 0) {
					sprites_list[sprite].y_speed = 0 - sprites_list[sprite].y_speed;
				}
				bounced_down = true;
			}
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
		//if (sprites_to_delete.indexOf(sprite) > -1) {
			
			//console.log("deleting "+sprites_to_delete[sprite])
			// delete(sprites_list[sprite]);
			//sprites_list[sprite].x_pos = 100000;
		//}
	}
	
	update_minimap();
	
	for (sprite in sprites_to_delete) {
		if (sprites_list[sprites_to_delete[sprite]] == 'undefined') {
			console.log("hey u cant delete undefined :0");
		} else {
		console.log("deleting "+sprites_to_delete[sprite])
		console.log(">>> "+ sprites_list[sprites_to_delete[sprite]])
		delete sprites_list[sprites_to_delete[sprite]];
		// sprites_list[sprites_to_delete[sprite]].x_pos = 100000;
	}}
	
    // console.log(text_output);
    document.getElementById(text_display).innerHTML = text_output;

    // console.log('frames');
    requestAnimationFrame(update);
}