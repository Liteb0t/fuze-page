// Fuze engine a0.0.0

// The HTML class that text will be rendered to
// via document.getElementById(text_display).innerHTML(text_output)
var text_display = "game-display";
var el = document.getElementById('game-display');
var font_size = parseFloat(window.getComputedStyle(el, null).getPropertyValue('font-size'));
var screen_width = parseInt(el.clientWidth / 12);
var screen_height = parseInt(el.clientHeight / 18);
var current_file;
var level;
var render = false;
var uniconvert = { '#': '\u2588', '\'': '\u2591' };
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

// comment vsauce out if you're using another JS file to create the vectors.
// make sure it uses the same names: player = [{id, type, xpos, ETC}]
var vsauce = { id: 'default', type: "basic", xpos: 10, ypos: 10, xsize: 6, ysize: 4, xspeed: 1, yspeed: 1 };
function updateScreen() {
    screen_width = parseInt(document.getElementById("scr-width").value);
    screen_height = parseInt(document.getElementById("scr-height").value);
    document.getElementById("scr-widthlabel").innerHTML = screen_width;
    document.getElementById("scr-heightlabel").innerHTML = screen_height;
    console.log(screen_width);
    console.log(screen_height);
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

// level_name is the name of the level text file. this code assumes that it is in a /levels/ folder.
function load_level(level_name) {
    level = { raw: loadFile('/level/' + level_name + '.txt'), full: [''] };
    document.getElementById('minimap').innerText = level.raw;
    level.xlen = level.raw.indexOf('\n') - 1;
    console.log(level.xlen);
    // var temp = '';
    console.log(level);
    var current_row = 0;
    for (loop = 0; loop < level.raw.length; loop++) {
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
            level.full[current_row] += uniconvert[level.raw.charAt(loop)].repeat(18);
        }
    }
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
    if (player.xspeed > 30) { player.xspeed = 30; } if (player.yspeed > 15) { player.yspeed = 15; }
    if (player.xspeed < -30) { player.xspeed = -30; } if (player.yspeed < -15) { player.yspeed = -15; }
    player.xpile += player.xspeed / 30;
    player.ypile += player.yspeed / 30;
    if (player.xpile >= 1) { player.xpos += 1; player.xpile -= 1; } else if (player.xpile <= -1) { player.xpos -= 1; player.xpile += 1; }
    if (player.ypile >= 1) { player.ypos += 1; player.ypile -= 1; } else if (player.ypile <= -1) { player.ypos -= 1; player.ypile += 1; }
    let half_height = Math.floor(screen_height / 2);
    let half_width = Math.floor(screen_width / 2);
    let start_yrender_from = player.ypos - half_height;
    let start_xrender_from = player.xpos - half_width;
    if (start_yrender_from < 0) { start_yrender_from = 0; } else if (start_yrender_from > level.full.length - screen_height) { start_yrender_from = level.full.length - screen_height }
    if (start_xrender_from < 0) { start_xrender_from = 0; } else if (start_xrender_from > level.full[0].length - screen_width) { start_xrender_from = level.full[0].length - screen_width }
    let xpos_onscreen = player.xpos - start_xrender_from;
    let ypos_onscreen = player.ypos - start_yrender_from;
    // x-axis collisions
    // the fastest you can possily travel is 30, which is 1 per frame, meaning no worrying about overlaps
    // right
    if (level.full[start_yrender_from + ypos_onscreen - player.ysize].charAt(start_xrender_from + xpos_onscreen + player.xsize - 1) == '\u2588' ||
        level.full[start_yrender_from + ypos_onscreen + player.ysize - 1].charAt(start_xrender_from + xpos_onscreen + player.xsize - 1) == '\u2588') {
        if (player.xpile > 0) {
            player.xpile = 0 - player.xpile;
        }
        if (player.xspeed > 0) {
            player.xspeed = 0 - player.xspeed;
        }
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
    } 

    let text_output = '';
    //console.log(level); 
    for (y = start_yrender_from; y < start_yrender_from + screen_height; y++) {
        if (y < start_yrender_from + ypos_onscreen - player.ysize || y >= start_yrender_from + ypos_onscreen + player.ysize) {
            text_output += level.full[y].substring(start_xrender_from, start_xrender_from + screen_width) + '\n';
        } else {
            text_output += level.full[y].substring(start_xrender_from, start_xrender_from + xpos_onscreen - player.xsize)
                + 'P'.repeat(player.xsize * 2)
                + level.full[y].substring(start_xrender_from + xpos_onscreen + player.xsize - 1, start_xrender_from + screen_width) + '\n';
        }
    }
    // console.log(text_output);
    document.getElementById(text_display).innerHTML = text_output;

    console.log('frames');
    requestAnimationFrame(update);
}