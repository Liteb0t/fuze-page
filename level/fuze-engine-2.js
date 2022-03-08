// Fuze engine a2.0

// The HTML class that text will be rendered to
// via document.getElementById(text_display).innerHTML(text_output)
var text_display = "game-display";
var el = document.getElementById('game-display');
var font_size = parseFloat(window.getComputedStyle(el, null).getPropertyValue('font-size'));
var screen_width = parseInt(el.clientWidth / 12);
var screen_height = parseInt(el.clientHeight / 18);
var current_file;
var level;
var start_xrender_from;
var start_yrender_from;
var text_output = '';
var temp_char = "'";
var sprites_list = { };
var collided_x = false;
var resistance = 0.1;
var collided_y = false;
var render = false;
var listy_text_output = [];
var uniconvert = { '#': '\u2588', '\'': '\u2591', ' ':' ', 'checker' : '\u259a', 'medium': '\u2592', 'heavy': '\u2593'};
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
	
	if (document.getElementById("cb_pov").checked == true) {
		if (start_yrender_from < 0) { start_yrender_from = 0; }
		else 
		if (start_yrender_from > level.full.length - screen_height) { start_yrender_from = level.full.length - screen_height }
	
		if (start_xrender_from < 0) { start_xrender_from = 0; } 
		else 
		if (start_xrender_from > level.full[0].length - screen_width) { start_xrender_from = level.full[0].length - screen_width }
    }
	
	
	// now, process functions from game file.
	on_frame(sprites_list);
	
	
    let half_height = Math.floor(screen_height / 2);
    let half_width = Math.floor(screen_width / 2);
	
	start_yrender_from = sprites_list["player"].y_pos - half_height;
    start_xrender_from = sprites_list["player"].x_pos - half_width;
	
	text_output = '';
	
	listy_text_output = [];
    //console.log(level); 
    for (y = start_yrender_from; y < start_yrender_from + screen_height; y++) {
		
		for (x = start_xrender_from; x < start_xrender_from + screen_width ; x++ ) {
			temp_char = "'";				// let temp_layer = -1;
			let is_empty = false;
			for (sprite in sprites_list) {
				// console.log(sprites_list[sprite]["y_pos"]);
				if ( y >= sprites_list[sprite].y_pos && y < sprites_list[sprite].y_pos + sprites_list[sprite].y_size &&
				x >= sprites_list[sprite].x_pos && x < sprites_list[sprite].x_pos + sprites_list[sprite].x_size ) {
					
					// temp_char = uniconvert["heavy"];
					temp_char = sprites_list[sprite].skin[y - sprites_list[sprite].y_pos].charAt(x - sprites_list[sprite].x_pos)
					console.log(temp_char)
					if (is_empty == false) { is_empty = true }
				}
			}
			//if ( (y >= sprites_list["morio"]["y_pos"]) && (y < sprites_list["morio"]["y_pos"] + sprites_list["morio"]["y_size"]) && (x >= sprites_list["morio"]["x_pos"]) && (x < sprites_list["morio"]["x_pos"] + sprites_list["morio"]["x_size"]) ) {
					
			//	temp_char = uniconvert["heavy"];
		
			if (is_empty == false) {
				if ( y >= 0 && y < level.full.length &&  x >= 0 && x < level.full[0].length) {
					
					temp_char = level.full[y].substring(x,x+1);
				} else {
					//
				} 
			}
			text_output += temp_char;
		}
	
		listy_text_output.push(text_output);
		text_output += '\n';
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

		}
		
	}
	
    // console.log(text_output);
    document.getElementById(text_display).innerHTML = text_output;

    // console.log('frames');
    requestAnimationFrame(update);
}