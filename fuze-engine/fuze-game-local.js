// This isnt part of fuze engine. it just stores and processes the properties of the player and game
// On multiplayer this file will be modified and on the server-side with some form of anti-cheat
// var player = { xpos: 88, ypos: 30, xsize: 3, ysize: 2, xspeed: 0, yspeed: 0, xpile:0, ypile:0 };
// alpha 2.6.3

// define weapons
weapons.rock = { 
name: "rock", 
damage: 13, 
penetration: 6,
speed: 60, 
cooldown: 18, 
delete_after: 80 }

weapons.destroyer = {
name : "destroyer",
damage: 11,
penetration: 30,
speed: 28,
cooldown: 40,
delete_after: 70 }

weapons.sniper = {
name : "sniper",
damage: 4,
penetration: 30,
speed: 90,
cooldown: 50,
delete_after: 60 }

// using new sprites system
create_sprite({ 
name: "mario",
x_pos : 100, 
y_pos : 100 , 
x_speed: -8, 
y_speed: -3,
type: "enemy", 
team: "enemies",
weapons: [weapons.destroyer],
lock_direction: true, use_ai: true, ai: {type: "goblin", speed: 30, targets: ["player"]},
 show_nametag: true,
skin: "load",has_resistance : true});

create_sprite({ 
name: "clippy",
x_pos : 210, 
y_pos : 145 , 
damage: 5,
x_speed: 0, 
y_speed: 0,
type: "enemy", 
team: "enemies",
lock_direction: true, use_ai: true, ai: {type: "sans", speed: 1, targets: ["player"]}, 
weapons: [weapons.sniper],
skin: "load",has_resistance : true, minimap_character: "C"});

// using new sprites system
create_sprite({ 
name: "sans",
x_pos : 400, 
y_pos : 73 , 
x_speed: -8, 
y_speed: -3,
health: 250,
type: "enemy", 
lock_direction: false,
use_ai: true,
move_towards: true,
ai: {type: "sans", speed: 39, targets: ["player"]},
show_nametag: true,
team: "enemies",
weapons: [weapons.rock, weapons.destroyer, weapons.sniper],
minimap_character: uniconvert['skull'],
skin: "load",has_resistance : true});

create_sprite({ name: "player" ,
x_pos : 73,
y_pos : 20,
x_speed: 0,
y_speed: 0,
type: "player",
show_nametag: true,
minimap_character: "P",
move_towards: true,
team: "player",
weapons: [weapons.rock, weapons.destroyer],
has_resistance : true,
skin: "snail"});

create_sprite({ name: "peter" ,
x_pos : -100,
y_pos : 20,
x_speed: 0,
y_speed: 0,
health: 1000,
damage: 1,
show_nametag: true,
minimap_character: "B",
move_towards: true,
team: "peter",
has_resistance : true,
skin: "peter"});

create_sprite({name: "fishron",
x_pos : randint(50,200),
y_pos : randint(50,200) ,
x_speed: 0,
y_speed: 0,
health: 5,
type: "enemy",
team: "enemies",
use_ai: true,
ai: {type: "goblin", speed: 20, targets: ["player"]}, lock_direction: true, skin: "fish", show_nametag: true, has_resistance : true});

create_sprite({name: "invader",
x_pos : randint(30,500),
y_pos : randint(30,160) ,
x_speed: 0,
y_speed: 0,
type: "enemy",
team: "enemies",
use_ai: true,
weapons: [weapons.rock],
ai: {type: "goblin", speed: 7, targets: ["player"]}, has_resistance: true, lock_direction: false, skin: "draft", show_nametag: true});

create_sprite({name: "impostor",
x_pos : 600,
y_pos : 100,
x_speed: 0,
y_speed: 10,
type: "enemy",
team: "enemies",
use_ai: true,
move_towards: true,
weapons: [weapons.destroyer],
ai: {type: "sans", speed: 20, targets: ["player"]}, has_resistance: true, lock_direction: false ,skin: "load", show_nametag: true});

var player_speed = 3

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
			use_weapon("player", weapons.rock, "mouse");
		}
		
		if (keystate.KeyR == true) {
			use_weapon("player", weapons.destroyer, "mouse");
		}
		
		if (keystate.KeyF == true) {
			use_weapon("player", weapons.sniper, "mouse");
		}
		
		if (keystate.KeyP == true) {
			respawn_player();
		}
		
		// If player is holding click
		if (mouse_down == 1) {
			use_weapon("player", weapons.rock, "mouse");
		}
	}
	sounds["sans_music"].volume(sound_decay(calculate_distance("player", "sans")));
	sounds["peter_sounds"].volume(sound_decay(calculate_distance("player", "peter")));
}

function on_click(sprites_list) {
	
	use_weapon("player", weapons.rock, "mouse");
	
}