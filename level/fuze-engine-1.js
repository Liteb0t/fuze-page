// Fuze engine a1.3.1

// The HTML class that text will be rendered to
// via document.getElementById(text_display).innerHTML(text_output)
var text_display = "game-display";
var el = document.getElementById('game-display');
var font_size = parseFloat(window.getComputedStyle(el, null).getPropertyValue('font-size'));
var screen_width = parseInt(el.clientWidth / 12);
var screen_height = parseInt(el.clientHeight / 18);
var current_file;
var level;
var temp_char = "'";
var sprites_list = { };
var collided_x = false;
var collided_y = false;
var render = false;
var uniconvert = { '#': '\u2588', '\'': '\u2591', ' ':' ', 'checker' : '\u259a', 'medium': '\u2592', 'heavy': '\u2593'};
var uniconvert_keys = Object.keys(uniconvert);
const fps = 30;
const frame_time = (1000 / 60) * (60 / fps) - (1000 / 60) * 0.5;
document.getElementById("scr-widthlabel").innerHTML = screen_width;
document.getElementById("scr-heightlabel").innerHTML = screen_height;

document.addEventListener('keydown', (event) => {
    if (event.key == 'a') {
        player.xspeed -= 1;
    }
    if (event.key == 'w') {
        player.yspeed -= 1;
    }
    if (event.key == 's') {
        player.yspeed += 1;
    }
    if (event.key == 'd') {
        player.xspeed += 1;
    }
});


var leftKey = 37, upKey = 38, rightKey = 39, downKey = 40;
var keystate;
document.addEventListener("keydown", function (e) {
    keystate[e.keyCode] = true;
});
document.addEventListener("keyup", function (e) {
    delete keystate[e.keyCode];
});

if (keystate[leftKey]) {
//code to be executed when left arrow key is pushed.
}
if (keystate[upKey]) {
//code to be executed when up arrow key is pushed.
}
if (keystate[rightKey]) {
//code to be executed when right arrow key is pushed.
}
if (keystate[downKey]) {
//code to be executed when down arrow key is pushed.
}


// comment vsauce out if you're using another JS file to create the vectors.
// make sure it uses the same names: player = [{id, type, xpos, ETC}]
// var vsauce = { id: 'default', type: "basic", xpos: 10, ypos: 10, xsize: 6, ysize: 4, xspeed: 1, yspeed: 1 };
function updateScreen() {
    screen_width = parseInt(document.getElementById("scr-width").value);
    screen_height = parseInt(document.getElementById("scr-height").value);
    document.getElementById("scr-widthlabel").innerHTML = screen_width;
    document.getElementById("scr-heightlabel").innerHTML = screen_height;
    console.log(screen_width);
    console.log(screen_height);
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
		
	/*
	create_sprite("hahaha", {
		x_pos : player.xpos,
		y_pos : player.ypos ,
		x_size : 8, y_size: 6,
		x_speed: -7,
		y_speed: -3}); */

	//create_sprite(document.getElementById("sprite-name").value, { x_pos : temp_xpos , y_pos : temp_ypos , x_size : temp_xsize , y_size : temp_ysize });
}

function apply_level(level_source) {
	let level_textbox_text = loadFile('/level/' + level_source + '.txt');
	document.getElementById('level_textbox').value = level_textbox_text;
}

// level_name is the name of the level text file. this code assumes that it is in a /levels/ folder.
function load_level() {
    // level = { raw: loadFile('/level/' + level_name + '.txt'), full: [''] };
	level = { raw: document.getElementById('level_textbox').value, full: [''] };
	
	
    // var temp = '';
    console.log(level);
    var current_row = 0;
	
	//generate full-sized terrain from txt file
    for (loop = 0; loop <= level.raw.length; loop++) {
        if (level.raw[loop] === '\n') {
            let row_to_repeat = level.full[current_row];
            // console.log(row_to_repeat)
            for (numb = 1; numb < 12; numb++) {
                level.full.push(row_to_repeat);
            }
            level.full.push('');
            current_row+=12;
        } else if (level.raw[loop] === '\r') {
            // console.log('pass');
        } else {
			if ( uniconvert_keys.indexOf(level.raw.charAt(loop)) !== -1 ) {
				level.full[current_row] += uniconvert[level.raw.charAt(loop)].repeat(18);
			} else {
				level.full[current_row] += level.raw.charAt(loop).repeat(18);
			}
        }
    }
	level.full.pop();
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
    // render the frame
    if (player.xspeed > 30) { player.xspeed = 30; } if (player.yspeed > 30) { player.yspeed = 30; }
    if (player.xspeed < -30) { player.xspeed = -30; } if (player.yspeed < -30) { player.yspeed = -30; }
    
	player.xpile += player.xspeed / 30;
    player.ypile += player.yspeed / 30;
    
	if (player.xpile >= 1) { player.xpos += 1; player.xpile -= 1; } else if (player.xpile <= -1) { player.xpos -= 1; player.xpile += 1; }
    if (player.ypile >= 1) { player.ypos += 1; player.ypile -= 1; } else if (player.ypile <= -1) { player.ypos -= 1; player.ypile += 1; }
    
	let half_height = Math.floor(screen_height / 2);
    let half_width = Math.floor(screen_width / 2);
    
	let start_yrender_from = player.ypos - half_height;
    let start_xrender_from = player.xpos - half_width;
    
	if (document.getElementById("cb_pov").checked == true) {
		if (start_yrender_from < 0) { start_yrender_from = 0; } else if (start_yrender_from > level.full.length - screen_height) { start_yrender_from = level.full.length - screen_height }
		if (start_xrender_from < 0) { start_xrender_from = 0; } else if (start_xrender_from > level.full[0].length - screen_width) { start_xrender_from = level.full[0].length - screen_width }
    }
	
	let xpos_onscreen = player.xpos - start_xrender_from;
    let ypos_onscreen = player.ypos - start_yrender_from;
    
	
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
		
		collided_x = false;
		collided_y = false;
		
		// XSPEED COLLISIONS
		
		// top-left
		if (level.full[sprites_list[sprite].y_pos].substring(
		sprites_list[sprite].x_pos - 1,sprites_list[sprite].x_pos
		) == "\u2588" 
		// && sprites_list[sprite].x_speed < 0
		) { 
		if (sprites_list[sprite].x_speed < 0) {sprites_list[sprite].x_speed = 0 - sprites_list[sprite].x_speed}
		}
		
		// top-right
		if (level.full[sprites_list[sprite].y_pos].substring(
		sprites_list[sprite].x_pos + sprites_list[sprite].x_size,
		sprites_list[sprite].x_pos + sprites_list[sprite].x_size + 1) == "\u2588" 
		// && sprites_list[sprite].x_speed < 0
		) { 
		if (sprites_list[sprite].x_speed > 0) {sprites_list[sprite].x_speed = 0 - sprites_list[sprite].x_speed}
		}
		
		// down-left
		if (level.full[sprites_list[sprite].y_pos + sprites_list[sprite].y_size - 1].substring(
		sprites_list[sprite].x_pos,sprites_list[sprite].x_pos + 1) == "\u2588" 
		// && sprites_list[sprite].x_speed < 0
		) { 
		if (sprites_list[sprite].x_speed < 0) {sprites_list[sprite].x_speed = 0 - sprites_list[sprite].x_speed}
		} 
		
		// down-right
		if (level.full[sprites_list[sprite].y_pos + sprites_list[sprite].y_size - 1].substring(
		sprites_list[sprite].x_pos + sprites_list[sprite].x_size,
		sprites_list[sprite].x_pos + sprites_list[sprite].x_size + 1) == "\u2588" 
		// && sprites_list[sprite].x_speed < 0
		) { 
		if (sprites_list[sprite].x_speed > 0) {sprites_list[sprite].x_speed = 0 - sprites_list[sprite].x_speed}
		}
		
		// if (collided_x = true) {sprites_list[sprite].x_speed = 0 - sprites_list[sprite].x_speed}
		
		//YSPEED COLLISIONS
		
		// top-left
		if (level.full[sprites_list[sprite].y_pos - 1].substring(
		sprites_list[sprite].x_pos,
		sprites_list[sprite].x_pos + 1) == "\u2588" 
		// && sprites_list[sprite].x_speed < 0
		) { 
		if (sprites_list[sprite].y_speed < 0) {sprites_list[sprite].y_speed = 0 - sprites_list[sprite].y_speed}
		}
		
		// top-right
		if (level.full[sprites_list[sprite].y_pos - 1].substring(
		sprites_list[sprite].x_pos + sprites_list[sprite].x_size - 1,
		sprites_list[sprite].x_pos + sprites_list[sprite].x_size) == "\u2588" 
		// && sprites_list[sprite].x_speed < 0
		) { 
		if (sprites_list[sprite].y_speed < 0) {sprites_list[sprite].y_speed = 0 - sprites_list[sprite].y_speed}
		}
		
		// down-left
		if (level.full[sprites_list[sprite].y_pos + sprites_list[sprite].y_size].substring(
		sprites_list[sprite].x_pos,
		sprites_list[sprite].x_pos + 1) == "\u2588" 
		// && sprites_list[sprite].x_speed < 0
		) { 
		if (sprites_list[sprite].y_speed > 0) {sprites_list[sprite].y_speed = 0 - sprites_list[sprite].y_speed}
		} 
		
		// down-right
		if (level.full[sprites_list[sprite].y_pos + sprites_list[sprite].y_size].substring(
		sprites_list[sprite].x_pos + sprites_list[sprite].x_size - 1,
		sprites_list[sprite].x_pos + sprites_list[sprite].x_size) == "\u2588" 
		// && sprites_list[sprite].x_speed < 0
		) { 
		if (sprites_list[sprite].y_speed > 0) {sprites_list[sprite].y_speed = 0 - sprites_list[sprite].y_speed}
		}
		
		// if (collided_y = true) {sprites_list[sprite].y_speed = 0 - sprites_list[sprite].y_speed}
		
	}
	
	
	// legacy collisions
	if (((start_yrender_from + ypos_onscreen) - (player.ysize + 1) > 0) &&  start_yrender_from + ypos_onscreen + player.ysize < level.full.length) {
		let bounced_left = false;
		let bounced_right = false;
		let bounced_up = false;
		let bounced_down = false;
		// right
		if (level.full[start_yrender_from + ypos_onscreen - player.ysize].charAt(start_xrender_from + xpos_onscreen + player.xsize) == '\u2588' ||
			level.full[start_yrender_from + ypos_onscreen + player.ysize - 1].charAt(start_xrender_from + xpos_onscreen + player.xsize) == '\u2588') {
			if (player.xpile > 0) {
				player.xpile = 0 - player.xpile;
			}
			if (player.xspeed > 0) {
				player.xspeed = 0 - player.xspeed;
			}
			bounced_right = true;
		}
		// left
		if (level.full[start_yrender_from + ypos_onscreen - player.ysize].charAt((start_xrender_from + xpos_onscreen) - (player.xsize + 1)) == '\u2588' ||
			level.full[start_yrender_from + ypos_onscreen + player.ysize - 1].charAt((start_xrender_from + xpos_onscreen) - (player.xsize + 1)) == '\u2588') {
			if (player.xpile < 0) {
				player.xpile = 0 - player.xpile;
			}
			if (player.xspeed < 0) {
				player.xspeed = 0 - player.xspeed;
			}
			bounced_left = true;
		} 

		// y-axis collisions
		// top
		if ((level.full[(start_yrender_from + ypos_onscreen) - (player.ysize + 1)].charAt(start_xrender_from + xpos_onscreen - player.xsize) == '\u2588') ||
			(level.full[(start_yrender_from + ypos_onscreen) - (player.ysize + 1)].charAt(start_xrender_from + xpos_onscreen + player.xsize - 2) == '\u2588')) {
			if (player.ypile < 0) {
				player.ypile -= player.ypile * 2;
			}
			if (player.yspeed < 0) {
				player.yspeed -= player.yspeed * 2;
			}
			bounced_up = true;
		} 
		// bottom
		if (level.full[start_yrender_from + ypos_onscreen + player.ysize].charAt(start_xrender_from + xpos_onscreen - player.xsize) == '\u2588' ||
			level.full[start_yrender_from + ypos_onscreen + player.ysize].charAt(start_xrender_from + xpos_onscreen + player.xsize - 2) == '\u2588') {
			if (player.ypile > 0) {
				player.ypile = 0 - player.ypile;
			}
			if (player.yspeed > 0) {
				player.yspeed = 0 - player.yspeed;
			}
			bounced_down = true;
		}

		

	}
    let text_output = '';
    //console.log(level); 
    for (y = start_yrender_from; y < start_yrender_from + screen_height; y++) {
		
		for (x = start_xrender_from; x < start_xrender_from + screen_width ; x++ ) {
			temp_char = "'";				// let temp_layer = -1;
			let is_empty = false;
			for (sprite in sprites_list) {
				// console.log(sprites_list[sprite]["y_pos"]);
				if ( y >= sprites_list[sprite].y_pos && y < sprites_list[sprite].y_pos + sprites_list[sprite].y_size &&
				x >= sprites_list[sprite].x_pos && x < sprites_list[sprite].x_pos + sprites_list[sprite].x_size ) {
					
					temp_char = uniconvert["heavy"];
					if (is_empty == false) { is_empty = true }
				}
			}
			//if ( (y >= sprites_list["morio"]["y_pos"]) && (y < sprites_list["morio"]["y_pos"] + sprites_list["morio"]["y_size"]) && (x >= sprites_list["morio"]["x_pos"]) && (x < sprites_list["morio"]["x_pos"] + sprites_list["morio"]["x_size"]) ) {
					
			//	temp_char = uniconvert["heavy"];
			//} 
			if (is_empty == false) {
				if (y >= player.ypos - player.ysize && y < player.ypos + player.ysize && x >= player.xpos - player.xsize && x < player.xpos + player.xsize) {
					temp_char = uniconvert['medium'];
				} else if ( y >= 0 && y < level.full.length &&  x >= 0 && x < level.full[0].length) {
					
					temp_char = level.full[y].substring(x,x+1);
				} else {
					//
				} 
			}
			text_output += temp_char;
		}
		/*if (y < start_yrender_from + ypos_onscreen - player.ysize || y >= start_yrender_from + ypos_onscreen + player.ysize) {
			
			text_output += level.full[y].substring(start_xrender_from, start_xrender_from + screen_width) + '\n';
		} 
		else {
			let text_before_player = 
			text_output += level.full[y].substring(start_xrender_from, start_xrender_from + xpos_onscreen - player.xsize)
				+ 'P'.repeat(player.xsize * 2)
				+ level.full[y].substring(start_xrender_from + xpos_onscreen + player.xsize - 1, start_xrender_from + screen_width) + '\n';
		}
		*/
	
		text_output += '\n';
		// now render the sprites on top
		
		
    }
    // console.log(text_output);
    document.getElementById(text_display).innerHTML = text_output;

    console.log('frames');
    requestAnimationFrame(update);
}