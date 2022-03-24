// This isnt part of fuze engine. it just stores and processes the properties of the player and game
// On multiplayer this file will be modified and on the server-side with some form of anti-cheat
// var player = { xpos: 88, ypos: 30, xsize: 3, ysize: 2, xspeed: 0, yspeed: 0, xpile:0, ypile:0 };
// alpha 2.4.1

// using new sprites system
create_sprite({ 
name: "morio",
x_pos : 100, 
y_pos : 100 , 
x_size : 10, 
y_size: 5,  
x_speed: -8, 
y_speed: -3,
type: "enemy", 
lock_direction: true, use_ai: true, ai: {type: "goblin", speed: 10, targets: ["player"]},
 show_nametag: true,
skin: load_sprite_skin(textures_path + "mario.txt"),has_resistance : true});

create_sprite({ 
name: "clippy",
x_pos : 100, 
y_pos : 90 , 
x_size : 17, 
y_size: 17,  
x_speed: 0, 
y_speed: 0,
type: "enemy", 
lock_direction: true, use_ai: true, ai: {type: "clippy", speed: 1, targets: ["player"]},lock_direction: true,skin: load_sprite_skin(textures_path + "clippy.txt"), show_nametag: true,
skin: load_sprite_skin(textures_path + "clippy.txt"),has_resistance : true, minimap_character: "C"});

create_sprite({ name: "peter", x_pos : 30, y_pos : 55, x_size : 38, y_size : 19, x_speed: 1, y_speed: -2,type: "enemy",starting_direction: 270, skin: load_sprite_skin(textures_path + "peter.txt")});
// using new sprites system
create_sprite({ 
name: "sans",
x_pos : 400, 
y_pos : 73 , 
x_size : 23, 
y_size: 14,  
x_speed: -8, 
y_speed: -3,
type: "enemy", 
lock_direction: true, use_ai: true, ai: {type: "goblin", speed: 50, targets: ["player"]}, show_nametag: true,
skin: load_sprite_skin(textures_path + "sans.txt"),has_resistance : true});
create_sprite({ name: "monke_haha" ,x_pos : 666, y_pos : 125, x_size : 21, y_size : 14, x_speed: 140, y_speed: -99,type: "enemy", show_nametag: true, minimap_character: uniconvert['monkey'], lock_direction: true,skin: load_sprite_skin(textures_path + "monkey.txt") });

create_sprite({ name: "player" ,
x_pos : 73,
y_pos : 20,
x_size : 12,
y_size : 5,
x_speed: 0,
y_speed: 0,
type: "player",
show_nametag: true,
minimap_character: "P",
move_towards: true,
has_resistance : true,
skin: load_sprite_skin(textures_path + "snail.txt")});

// define weapons
weapons.rock = { name: "rock", damage: 10, speed: 30, cooldown: 60 }

play_audio("sans_music", "Megalovania.mp3", {loop: true});
play_audio("peter_sounds", "peter_owchie.mp3", {loop: true});
play_audio("background_music", "phrygian.wav", {loop: true, volume: 0.3});

create_timer("minimap_update", update_minimap, 30, 'undefined', true);
create_timer("objectives_update", update_objectives_display, 30, 'undefined', true);

add_objective("kill_sans", is_dead, "Kill sans", "sans");

/*
create_timer(
"fish_timer",
create_sprite,
180,
{name: "fishron",x_pos : 100, y_pos : 100 , x_size : 4, y_size: 2,  x_speed: 0, y_speed: 0,type: "enemy",
 use_ai: true, ai: {type: "fishron", speed: 1, targets: ["player"]},lock_direction: true,skin: load_sprite_skin(textures_path + "fish.txt"), show_nametag: true},
true)

create_timer(
"goblin_timer",
create_sprite,
240,
{name: "goblin",x_pos : 100, y_pos : 100 , x_size : 8, y_size: 5,  x_speed: 8, y_speed: 3,type: "enemy",
 use_ai: true, ai: {type: "goblin", speed: 10, targets: ["player"]},has_resistance : true,lock_direction: false,skin: load_sprite_skin(textures_path + "goblin.txt"), show_nametag: true},
true)
*/

create_sprite({name: "fishron",
x_pos : randint(50,200),
 y_pos : randint(50,200) ,
 x_size : 4,
 y_size: 2,
 x_speed: 0,
 y_speed: 0,
 type: "enemy",
 use_ai: true,
 ai: {type: "fishron", speed: 2, targets: ["player"]},lock_direction: true,skin: load_sprite_skin(textures_path + "fish.txt"), show_nametag: true,has_resistance : true});

create_sprite({name: "goblin",
x_pos : randint(50,200),
 y_pos : randint(50,200) ,
 x_size : 8,
 y_size: 5,
 x_speed: 0,
 y_speed: 0,
 type: "enemy",
 use_ai: true,
 ai: {type: "goblin", speed: 10, targets: ["player"]},has_resistance : true,lock_direction: false,skin: load_sprite_skin(textures_path + "goblin.txt"), show_nametag: true});
 
create_sprite({name: "invader",
x_pos : randint(100,500),
 y_pos : randint(100,500) ,
 x_size : 11,
 y_size: 5,
 x_speed: 0,
 y_speed: 0,
 type: "enemy",
 use_ai: true,
 ai: {type: "goblin", speed: 7, targets: ["player"]},has_resistance : true,lock_direction: false,skin: load_sprite_skin(textures_path + "draft.txt"), show_nametag: true});

function on_frame(sprites_list) {
	// insert functions here
	
	if (!(typeof sprites_list["player"] === 'undefined')) {
		if (keystate.KeyA == true) {
			sprites_list["player"].x_pile -= 1;
			sprites_list["player"].x_speed -= 1;
		}
		if (keystate.KeyW == true) {
			sprites_list["player"].y_pile -= 1;
			sprites_list["player"].y_speed -= 1;
		}

		if (keystate.KeyD == true) {
			sprites_list["player"].x_pile += 1;
			sprites_list["player"].x_speed += 1;
		}

		if (keystate.KeyS == true) {
			sprites_list["player"].y_pile += 1;
			sprites_list["player"].y_speed += 1;
		}
		
		if (keystate.KeyE == true) {
			use_weapon("player", weapons.rock);
		}
		
	if (find_sprite_collisions("player").length > 0) {
		stop_all_sounds();
		play_audio("glitch", "Glitch Sound Effect (Speaker).mp3", {volume: 1.0});
		
		delete_sprite("player");
		
		// uncomment below to crash the game when player dies
		// console.log(sprites_list["player"].lol_u_crashed);
	}
	}
	
	sounds["sans_music"].volume(sound_decay(calculate_distance("player", "sans")));
	sounds["peter_sounds"].volume(sound_decay(calculate_distance("player", "peter")));
	

}

