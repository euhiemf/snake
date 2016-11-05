/**
 * The module, used to capsulate "use strict";
 * @param  {Object} global window object
 * @return {Object}
 */
var CENTIPEDE = (function (global) {
	"use strict";
	
	/**
	 * Module holder
	 * @type {Object}
	 */
	var CENTIPEDE = {
		/**
		 * Contains the moudules to be initialized
		 * @type {Object}
		 */
		init: {
			/**
			 * Holds modules for initializing things related to canvas, and the game
			 * @type {Object}
			 */
			GAME: {
				/**
				 * Sets the inital brick values to a centipede, e.g, the start point, the keys that are monitored (eventListener) and other values
				 * @param  {Integer} index  The centipede index in the game, player 1 has index 1 and player 2 has index 2
				 * @param  {Object} player Contains data from the DOM, e.g the monitored (eventListener) keys
				 * @return {Object}
				 */
				"get-initial-property": function (index, player) {
	
					var modules = CENTIPEDE,
						GAME = modules.GAME,
						players = GAME.players,
						tools = GAME.tools,
						properties = GAME.properties,
						collide = tools['collide-check'],
						DOM = modules.DOM,
						x = tools.getRandomInt(50, properties.buffer.width - 50),
						y = tools.getRandomInt(50, properties.buffer.height - 50),
						angle = tools.getRandomArbitary(0, Math.PI * 2),
						right_code = Number(player['right-dom-key'].getAttribute('data-char')),
						left_code = Number(player['left-dom-key'].getAttribute('data-char')),
						width = 5,
						height = 5,
						points = 0,
						b = 0,
						prev_centipede_brick,
						collision,
						special,
						bricks_obj,
						colors,
						brick_properties,
						run;



					if (index > 0) {
						run = true;
						do {
							b = 0;
							for (; b < players.length; b++) {
	
								if (typeof CENTIPEDE.GAME.players[b].centipede.bricks === "undefined") {
									continue;
								}
	
								prev_centipede_brick = players[b].centipede.bricks[0];
	
								collision = collide["two-squares"]({
									x: prev_centipede_brick.x,
									y: prev_centipede_brick.y,
									w: 50,
									h: 50
								}, {
									x: x,
									y: y,
									w: 50,
									h: 50
								});
	
								if (collision) {
									x = tools.getRandomInt(50, properties.buffer.width - 50);
									y = tools.getRandomInt(50, properties.buffer.height - 50);
									run = true;
									b = 0;
								} else {
									run = false;
								}
							}
						} while (run === true);
					}
	
					special = {
						items: {
							"fat": {
								distance_to_normal: 0,
								active: false
							},
							"speed": {
								distance_to_normal: 0,
								active: false
							}
						}
					};
	
					bricks_obj = {
						x: x,
						y: y,
						angle: angle,
						width: width,
						height: height
					};
	
					colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF", "#C0C0C0"];
	
					brick_properties = {
						special: special,
						index: index,
						right_code: right_code,
						left_code: left_code,
						count_to_space: 100,
						ORIGINAL_COUNT_TO_SPACE: 80,
						space_width: 25,
						direction: "front",
						speed: 2,
						turn_diameter: 30,
						width: 5,
						height: 5,
						points: points,
						in_game: true,
						color: colors[index],
						bricks: [bricks_obj]
					}; // end return

					return brick_properties;

				},
				/**
				 * Sets init values to the players and > the centipedes. Starts the game, and draws 10 steps of the centipede
				 * @return {Object}
				 */
				setup: function (caller) {

					var modules = CENTIPEDE,
						GAME = modules.GAME,
						players = GAME.players,
						tools = GAME.tools,
						properties = GAME.properties,
						collide = tools['collide-check'],
						DOM = modules.DOM,
						buffers = DOM.buffers,
						index = 0,
						i = 0,
						player,
						c = buffers.context;
	
					if (caller != "New-round") DOM.tools.switchGameMode('game-mode');

	
					for (; index < players.length; index++) {
						player = players[index];
						player.centipede = this['get-initial-property'](index, player);
					}

	
					for (; i < 10; i++) {
						tools.update(); // make the initial centipede larger
					}
					global.setTimeout(function () {
						CENTIPEDE.GAME.running = true;
						CENTIPEDE.GAME.tools.animation.loop();
					}, 1000);

					return players;
				}
			},
			/**
			 * Initializing the DOM, like EventListeners.
			 */
			DOM: function () {

				var module = CENTIPEDE,
					DOM = module.DOM,
					GAME = module.GAME,
					tools = DOM.tools,
					buffers = DOM.buffers,
					$ = tools.$,
					canvas = $('#main-canvas'),
					context = canvas.getContext('2d'),
					inputs = document.querySelectorAll('#add-player-mode .container table tr td input[type="text"]'),
					i = 0,
					w = 0,
					input;
	
				buffers["canvas-element"] = canvas;
				buffers.context = context;
	
	
				/**
				 * Switch game mode from splash-screen-mode to add-player-mode when clicking "Click Here To Play" button
				 */
				tools.on($('#game-enter'), 'click', function () {
					CENTIPEDE.DOM.tools.switchGameMode('add-player-mode');
				});
				/**
				 * Adds DOM content and a modules.GAME.player Object when clicking "Add Player" button in add-player-mode
				 */
				tools.on($('#add-player'), 'click', function () {
					CENTIPEDE.DOM.tools.addPlayer();
				});
	
				// add the first add-player-html to the player object
				GAME.players.push({
					index: 0,
					name: 'player 1',
					"left-dom-key": $('tr.player-dom-representative').querySelectorAll('td>input[type="text"]')[0],
					"right-dom-key": $('tr.player-dom-representative').querySelectorAll('td>input[type="text"]')[1],
					score: 0
				});
				/**
				 * If there are more than two players, then you can remove one of them
				 */
				tools.on($('tr.player-dom-representative>td:last-child'), 'click', function () {
					if (document.querySelectorAll('tr.player-dom-representative').length > 1) {
						CENTIPEDE.DOM.tools.removePlayer(this.parentNode);
					}
				});

				/**
				 * To prevent functions in for-loop, returns a function, in the methods object
				 * @param  {string} type One of the propertis in the methods Object in the @function
				 * @return {Function}
				 */
				function keyEvent(type) {
					var methods = {
						keydown: function (e) {
							if (!e) {
								e = global.event;
							}
							e.preventDefault();
							var char_code = (e.which) ? e.which : e.keyCode,
								key_value = CENTIPEDE.DOM.tools["charcode-to-string"](char_code);
							this.value = key_value;
							this.setAttribute('data-char', char_code);
							this.style.fontSize = CENTIPEDE.DOM.tools["calculate-add-player-font-size"](key_value);
						},
						keypress: function (e) {
							if (!e) {
								e = global.event;
							}
							e.preventDefault();
							return false;
						}
					};

					return methods[type];
				}

				for (; i < inputs.length; i++) {
					input = inputs[i];
					tools.on(input, 'keypress', keyEvent('keypress'));
					tools.on(input, 'keydown', keyEvent('keydown'));
				}
				//end
	
				tools.on($('#start-game'), 'click', function () {
					if (document.querySelectorAll('tr.player-dom-representative').length > 0) {
						CENTIPEDE.init.GAME.setup('Start-game-button-click');
					}
				});
	
				tools.on(global.document, 'keydown', function (e) {
	
					if (typeof GAME.players[0].centipede === "undefined") {
						return false;
					} else if (Object.prototype.toString.call(GAME.players[0].centipede) === "[Object Array]") {
						return false;
					}
	
					w = 0;
					for (; w < GAME.players.length; w++) {
						var centipede = GAME.players[w].centipede;
	
						if (e.keyCode === centipede.left_code && centipede.direction !== "left") {
							centipede.direction = "left";
						} else if (e.keyCode === centipede.right_code && centipede.direction !== "right") {
							centipede.direction = "right";
						}
					}
				});
				tools.on(global.document, 'keyup', function (e) {
	
					if (typeof GAME.players[0].centipede === "undefined") {
						return false;
					} else if (Object.prototype.toString.call(GAME.players[0].centipede) === "[Object Array]") {
						return false;
					}

					w = 0;
	
					for (; w < GAME.players.length; w++) {
						var centipede = GAME.players[w].centipede;
						if ((e.keyCode === centipede.right_code || e.keyCode === centipede.left_code) && centipede.direction !== "front") {
							centipede.direction = "front";
						}
					}
				});
	
			},
			SCREEN: function () {
				// CENTIPEDE.DOM.tools.switchGameMode('add-player-mode');
				CENTIPEDE.DOM.tools.switchGameMode('splash-screen-mode');
			}
		},
		GAME: {
			running: false,
			over: function (player, caller) {
				// console.log(player.name + " GAME OVER!!");
				var index = 0,
					other_player,
					dead = 0,
					max_score = 0;
				console.log("Game over by: " + caller);

				player.centipede.in_game = false;

				for (; index < this.players.length; index++) {
					other_player = this.players[index];
					if (other_player.centipede.in_game) {
						if (player !== other_player) {
							other_player.score++;
							if (other_player.score > max_score) {
								max_score = other_player.score;
							}
						}
					} else {
						dead++;
					}
				}
				function kill () {
					global.webkitCancelAnimationFrame(CENTIPEDE.GAME.tools.animation.frame);
					CENTIPEDE.GAME.running = false;
					CENTIPEDE.DOM.buffers.context.clearRect(0, 0, CENTIPEDE.GAME.properties.buffer.width, CENTIPEDE.GAME.properties.buffer.height);
				}
				if (dead+1 >= this.players.length) {
					kill();
					if (max_score >= 20) {
						CENTIPEDE.GAME.reset();
					} else {
						CENTIPEDE.GAME.newRound();
					}
				}
			},
			reset: function () {
				var i = 0,
					player,
					GAME = this;

				for (; i < GAME.players.length; i++) {
					player = GAME.players[i];
					player.centipede = {};
					player.score = 0;
				}	
				CENTIPEDE.DOM.tools.switchGameMode('add-player-mode');
				//CENTIPEDE.init.GAME.setup('New-round');

			},
			pause: function () {
				global.webkitCancelAnimationFrame(CENTIPEDE.GAME.tools.animation.frame);
			},
			play: function () {
				CENTIPEDE.GAME.tools.animation.loop();
			},
			newRound: function () {
				var i = 0,
					player,
					GAME = this;

				for (; i < GAME.players.length; i++) {
					player = GAME.players[i];
					player.centipede = {};
				}

				CENTIPEDE.init.GAME.setup('New-round');

			},
			players: [],
			items: [],
			tools: {
				animation: {
					frame: null,
					loop: function () {
						var game = CENTIPEDE.GAME,
							tools = game.tools,
							animation = tools.animation;
	
						if (game.running) {
							tools.update();
							animation.frame = global.webkitRequestAnimationFrame(animation.loop);
						}
					},
					generata3dCurve: function (x, y, width, height, angle) {
	
						var radius = width / 2,
							p = {
								x1: x - radius,
								y1: y,
								x2: x + radius,
								y2: y
							},
							quadrant = Math.PI / 4,
							a1 = angle + quadrant,
							a2 = angle - quadrant,
							angles = {
								x1: radius * Math.cos(a1),
								y1: radius * Math.sin(a1),
								x2: radius * Math.cos(a2),
								y2: radius * Math.sin(a2)
							};
	
						if (a1 <= Math.PI) {
							p.y1 = p.y1 - angles.y1;
						} else if (a1 > Math.PI) {
							p.y1 = p.y1 + angles.y1;
						}
						if (a2 <= Math.PI) {
							p.y2 = p.y2 - angles.y2;
						} else if (a2 > Math.PI) {
							p.y2 = p.y2 + angles.y2;
						}
						if (quadrant <= a1 && a1 <= quadrant * 3) {
							p.x1 = p.x1 - angles.x1;
						} else {
							p.x1 = p.x1 + angles.x1;
						}
						if (quadrant <= a2 && a2 <= quadrant * 3) {
							p.x2 = p.x2 - angles.x2;
						} else {
							p.x2 = p.x2 + angles.x2;
						}
	
						return [
							p.x1,
							p.y1,
							(p.x1 + p.x2) / 2,
							p.y1 - height,
							p.x2,
							p.y2
						];
					}
				},
				draw: function () {
					var c = CENTIPEDE.DOM.buffers.context,
						modules = CENTIPEDE,
						GAME = modules.GAME,
						animation = GAME.tools.animation,
						DOM = modules.DOM,
						buffers = DOM.buffers,
						properties = GAME.properties,
						players = GAME.players,
						b = 0,
						i = 0,
						centipede,
						brick,
						bricks,
						args;
	
					c.clearRect(0, 0, properties.buffer.width, properties.buffer.height);
					// c.fillStyle = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF", "#C0C0C0"][CENTIPEDE.GAME.tools.getRandomInt(0,6)];
					// c.fillRect(0, 0, properties.buffer.width, properties.buffer.height);
	
					c.fillStyle = "black";
					c.fillText("Score:", properties.buffer.width - 40, 10);
					for (; b < players.length; b++) {
	
						centipede = players[b].centipede;
						// centipede = players[b].centipede;
	
						c.fillStyle = centipede.color;
						c.fillText(players[b].score, properties.buffer.width - 40, 20 + (b * 10));
						bricks = centipede.bricks;
						i = 1;
						for (; i < bricks.length; i++) {
						// for (; i < 3; i++) {
							brick = bricks[i];
							// brick = bricks[bricks.length - i];
							if (i === bricks.length - 1) {
								c.fillStyle = "blue";
							}
							// if (i === 1) {
								// c.fillStyle = "blue";
							// } else {
								// c.fillStyle = centipede.color;
							// }
	
							c.fillRect(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.width, brick.height);
	
							// args = animation.generata3dCurve(brick.x, brick.y, brick.width, brick.height, brick.angle);
							// c.save();
							// c.globalAlpha = 0.5;
							// c.fillStyle = "white";
							// c.beginPath();
							// c.moveTo(args[0], args[1]);
							// c.quadraticCurveTo(args[2],  args[3], args[4], args[5]);
							// c.lineTo(args[0], args[1]);
							// c.fill();
							// c.restore();
	
						}
						// }
					}
				},
				update: function () {
					var modules = CENTIPEDE,
						GAME = modules.GAME,
						players = GAME.players,
						tools = GAME.tools,
						properties = GAME.properties,
						collide = tools['collide-check'],
						DOM = modules.DOM,
						t = 0,
						centipede,
						player,
						last_brick,
						angle,
						x,
						y,
						units,
						new_x,
						new_y,
						centipede_collision,
						brick_properties,
						bricks;
					
					for (; t < players.length; t++) {
	
						player = players[t];
						centipede = player.centipede;
	
						if (!centipede.in_game || typeof centipede.bricks === "undefined") {
							continue;
						}
	
						bricks = centipede.bricks;
						last_brick = bricks[bricks.length - 1];
						angle = last_brick.angle;
						x = last_brick.x;
						y = last_brick.y;
		
						if (centipede.direction !== "front") {
		
							units = (Math.PI * 2) / ((centipede.turn_diameter / centipede.speed) * 2 * Math.PI);
		
							if (centipede.direction === "left") {
								angle -= units;
							} else if (centipede.direction === "right") {
								angle += units;
							}
						}
	
						new_x = x + (centipede.speed * Math.cos(angle));
						new_y = y + (centipede.speed * Math.sin(angle));
		
						centipede.count_to_space--;
						if (centipede.count_to_space < centipede.space_width) {
		
							centipede.bricks.splice(centipede.bricks.length - 1, 1);
		
							if (centipede.count_to_space === 1) {
								centipede.count_to_space = centipede.ORIGINAL_COUNT_TO_SPACE;
							}
						}
						var loop_in_game = true;
		
						if (new_x < 0 || new_x + centipede.width > properties.buffer.width && loop_in_game) {
							// angle = Math.PI - angle;
							GAME.over(player, "outside with");
							loop_in_game = false;
						}
						if (new_y < 0 || new_y + centipede.height > properties.buffer.height && loop_in_game) {
							// angle = 2*Math.PI - angle;
							GAME.over(player, "outside boundries");
							loop_in_game = false;
						}
		
						
						brick_properties = {
							x: new_x,
							y: new_y,
							angle: angle,
							width: centipede.width,
							height: centipede.height
						};
		
						centipede.bricks.push(brick_properties);
						
	
						if (collide["centipede-with-itself"](centipede, brick_properties) && loop_in_game) {
							GAME.over(player, "centipede collide with itself");
							loop_in_game = false;
						}
	
						// check if collide with bricks in other centipedes or itself
						centipede_collision = collide["centipede-with-any-centipede"](brick_properties, t);
						if (centipede_collision && loop_in_game) {
							GAME.over(player, "centipede collide with any centipede");
							loop_in_game = false;
						}
	
					} // end centipede for loop
	
					this.draw();
	
				},
				getRandomArbitary: function (min, max) {
					return Math.random() * (max - min) + min;
				},
				getRandomInt: function (min, max) {
					return Math.floor(Math.random() * (max - min + 1)) + min;
				},
				"collide-check": {
					"item-with-any-centipede": function (x, y, radius) { // function checkIfItemCollideWithWorm(x,y,radius) { }

						var ret_value = false,
							modules = CENTIPEDE,
							game = modules.GAME,
							players = game.players,
							centipede,
							w = 0,
							b = 0,
							brick,
							brick_radius,
							item_props,
							brick_props,
							up;

						for (; w < players.length; w++) {
							b = 0;
							for (; b < players[w].centipede.bricks.length; b++) {
								brick = players[w].centipede.bricks[b];
								brick_radius = brick.width / 2;
	
								item_props = {
									x: x,
									y: y,
									radius: radius
								};
								brick_props = {
									x: brick.x + brick_radius,
									y: brick.y + brick_radius,
									radius: brick_radius
								};
								up = this["two-circles"](brick_props, item_props);
								if (up) {
									return true;
								}
							}
						}
						return ret_value;
					},
					"item-with-any-item": function (x, y, radius) { // function checkIfItemCollideWithItem(x,y,radius) { }

						var ret_value = false,
							modules = CENTIPEDE,
							game = modules.GAME,
							items = game.items,
							i = 0,
							old_item,
							old_x,
							old_y,
							old_radius;

						if (items.length > 0) {
							for (; i < items.length; i++) {
								old_item = items[i];
								old_x = old_item.x;
								old_y = old_item.y;
								old_radius = old_item.radius;
	
								if (this["two-circles"]({
									x: x,
									y: y,
									radius: radius
								}, {
									x: old_x,
									y: old_y,
									radius: old_radius
								})) {
									return true;
								}
							}
						}
						return ret_value;
					},
					"two-circles": function (a, b) { // function checkIfCircleCollide(a, b) { }

						var difference = { x: a.x - b.x, y: a.y - b.y },
							distance = Math.sqrt((difference.x * difference.x) + (difference.y * difference.y));

						return distance < a.radius + b.radius;
					},
					"centipede-with-itself": function (centipede, brick_properties) {

						var i = 0,
							brick,
							collision;

						for (; i < centipede.bricks.length - centipede.width ; i++) {

							brick = centipede.bricks[i];
							collision = this["two-squares"]({
								x: brick.x,
								y: brick.y,
								width: brick.width,
								height: brick.height
							}, brick_properties);
	
							if (collision) {
								return true;
							}
	
						}
						return false;
					},
					"centipede-with-any-centipede": function (control_centipede, jump_over) { // function checkIfWormCollide(props, checked) { }

						var players = CENTIPEDE.GAME.players,
							w = 0,
							i = 0,
							brick,
							centipede,
							collision;

						for (; w < players.length; w++) {
	
							if (w === jump_over) {
								continue;
							}
	
							centipede = players[w].centipede;

							i = 0;
							for (; i < centipede.bricks.length; i++) {
	
								brick = centipede.bricks[i];
	
								collision = this["two-squares"]({
									x: brick.x,
									y: brick.y,
									width: brick.width,
									height: brick.height
								}, control_centipede);
	
								if (collision) {
									return true;
								}
							}
						}
						return false;
					},
					"two-squares": function (a, b) { // function checkIfCollide(a,b) { }
						if ((a.x + a.width > b.x && a.x + a.width < b.x + b.width) && (a.y + a.height > b.y && a.y + a.height < b.y + b.height) || (a.x < b.x + b.width && a.x > b.x) && (a.y < b.y + b.height && a.y > b.y)) {
							return true;
						}
						return false;
					}
				}
			},
			properties: {
				buffer: {
					width: 320,
					height: 480
				}
			}
		},
		DOM: {
			buffers: {},
			tools: {
				"calculate-add-player-font-size": function (value) {
					var size = "12px";
					switch (value.length) {
					case 6:
						size = "11px";
						break;
					case 7:
						size = "10px";
						break;
					case 8:
						size = "9px";
						break;
					case 9:
						size = "8px";
						break;
					case 10:
						size = "7px";
						break;
					case 11:
						size = "6px";
						break;
					case 12:
						size = "5px";
						break;
					case 13:
						size = "4px";
						break;
					case 14:
						size = "3px";
						break;
					case 15:
						size = "2px";
						break;
					case 16:
						size = "1px";
						break;
					default:
						size = "12px";
					}
					return size;
				},
				"charcode-to-string": function (char_code) {
					var value = String.fromCharCode(char_code);
					if (char_code === 8) { value = "backspace"; }
					if (char_code === 9) { value = "tab"; }
					if (char_code === 13) { value = "enter"; }
					if (char_code === 16) { value = "shift"; }
					if (char_code === 17) { value = "ctrl"; }
					if (char_code === 18) { value = "alt"; }
					if (char_code === 19) { value = "pause/break"; }
					if (char_code === 20) { value = "caps lock"; }
					if (char_code === 27) { value = "escape"; }
					if (char_code === 32) { value = "space bar"; }
					if (char_code === 33) { value = "page up"; }
					if (char_code === 34) { value = "page down"; }
					if (char_code === 35) { value = "end";  }
					if (char_code === 36) { value = "home"; }
					if (char_code === 37) { value = "left arrow"; }
					if (char_code === 38) { value = "up arrow"; }
					if (char_code === 39) { value = "right arrow"; }
					if (char_code === 40) { value = "down arrow"; }
					if (char_code === 45) { value = "insert"; }
					if (char_code === 46) { value = "delete"; }
					if (char_code === 91) { value = "left window"; }
					if (char_code === 92) { value = "right window"; }
					if (char_code === 93) { value = "select key"; }
					if (char_code === 96) { value = "numpad 0"; }
					if (char_code === 97) { value = "numpad 1"; }
					if (char_code === 98) { value = "numpad 2"; }
					if (char_code === 99) { value = "numpad 3"; }
					if (char_code === 100) { value = "numpad 4"; }
					if (char_code === 101) { value = "numpad 5"; }
					if (char_code === 102) { value = "numpad 6"; }
					if (char_code === 103) { value = "numpad 7"; }
					if (char_code === 104) { value = "numpad 8"; }
					if (char_code === 105) { value = "numpad 9"; }
					if (char_code === 106) { value = "multiply"; }
					if (char_code === 107) { value = "add"; }
					if (char_code === 109) { value = "subtract"; }
					if (char_code === 110) { value = "decimal point"; }
					if (char_code === 111) { value = "divide"; }
					if (char_code === 112) { value = "F1"; }
					if (char_code === 113) { value = "F2"; }
					if (char_code === 114) { value = "F3"; }
					if (char_code === 115) { value = "F4"; }
					if (char_code === 116) { value = "F5"; }
					if (char_code === 117) { value = "F6"; }
					if (char_code === 118) { value = "F7"; }
					if (char_code === 119) { value = "F8"; }
					if (char_code === 120) { value = "F9"; }
					if (char_code === 121) { value = "F10"; }
					if (char_code === 122) { value = "F11"; }
					if (char_code === 123) { value = "F12"; }
					if (char_code === 144) { value = "num lock"; }
					if (char_code === 145) { value = "scroll lock"; }
					if (char_code === 186) { value = ";"; }
					if (char_code === 187) { value = "="; }
					if (char_code === 188) { value = ","; }
					if (char_code === 189) { value = "-"; }
					if (char_code === 190) { value = "."; }
					if (char_code === 191) { value = "/"; }
					if (char_code === 192) { value = "`"; }
					if (char_code === 219) { value = "["; }
					if (char_code === 220) { value = "\\"; }
					if (char_code === 221) { value = "]"; }
					if (char_code === 222) { value = "'"; }
	
					return value;
				},
				removePlayer: function (dom_rep) {
					var dom_elms = document.getElementsByClassName('player-dom-representative'),
						index,
						i = 0,
						w = 0,
						name,
						player;

					for (; i < dom_elms.length; i++) {
						if (dom_elms[i] === dom_rep) {
							index = i;
						}
					}
					CENTIPEDE.GAME.players.splice(index, 1);
					dom_rep.parentNode.removeChild(dom_rep);
	
					dom_elms = document.getElementsByClassName('player-dom-representative');
	
					for (; w < CENTIPEDE.GAME.players.length; w++) {
						player = CENTIPEDE.GAME.players[w];
						name = "player " + (w + 1).toString();
						player.name = name;
						dom_elms[w].querySelector('td').innerHTML = name;
					}
				},
				addPlayer: function () {

					var tools = this,
						$ = tools.$,
						toggleVisibility = tools.toggleVisibility,
						dom_elms = document.getElementsByClassName('player-dom-representative'),
						new_player_index = dom_elms.length,
						player_name = "player " + (new_player_index + 1).toString(),
						tr = tools.createElm('tr'),
						tds = [],
						inputs = [],
						input,
						i = 0,
						b = 0,
						td;

					if (new_player_index >= 6) {
						alert('no more players alowed!');
						return false;
					}
	
					inputs[0] = (function () {var elm = tools.createElm('input'); elm.setAttribute('type', 'text'); return elm; }());
					inputs[1] = (function () {var elm = tools.createElm('input'); elm.setAttribute('type', 'text'); return elm; }());
	


					function keyEvent(type) {
						var methods = {
							keydown: function (e) {
								if (!e) {
									e = global.event;
								}
								e.preventDefault();
								var char_code = (e.which) ? e.which : e.keyCode,
									key_value = CENTIPEDE.DOM.tools["charcode-to-string"](char_code);
									
								this.value = key_value;
								this.setAttribute('data-char', char_code);
								this.style.fontSize = CENTIPEDE.DOM.tools["calculate-add-player-font-size"](key_value);
							},
							keypress: function (e) {
								if (!e) {
									e = global.event;
								}
								e.preventDefault();
								return false;
							}
						};

						return methods[type];
					}
					for (; i < 4; i++) {
						td = tools.createElm('td');
						if (i > 0 && i < 3) {
							input = inputs[i - 1];
							tools.on(input, 'keypress', keyEvent('keypress'));
							tools.on(input, 'keydown', keyEvent('keydown'));

							td.appendChild(input);
						}
						tds.push(td);
					}
					tds[0].className = "player-name";
					tds[0].innerHTML = player_name;
	
					tds[3].innerHTML = "";
	
					tr.className = 'player-dom-representative';
					for (; b < 4; b++) {
						tr.appendChild(tds[b]);
					}
	
					tools.on(tds[3], 'click', function () {
						CENTIPEDE.DOM.tools.removePlayer(this.parentNode);
					});
	
					CENTIPEDE.GAME.players.push({
						"left-dom-key": inputs[0],
						"right-dom-key": inputs[1],
						name: player_name,
						index: new_player_index,
						centipede: [],
						score: 0
					});
					dom_elms[0].parentNode.appendChild(tr);
					inputs[0].focus();
				},
				createElm: function (type) {
					return document.createElement(type);
				},
				switchGameMode: function (mode) {

					var tools = this,
						$ = tools.$,
						toggleVisibility = tools.toggleVisibility,
						old_element = $('.active-mode'),
						new_element = $("#" + mode);

					if (!!old_element) {
						toggleVisibility(old_element, 500, false);
						old_element.classList.remove('active-mode');
						old_element.style.zIndex = 0;
					}

					toggleVisibility(new_element, 500, false);
					new_element.classList.add('active-mode');
					new_element.style.zIndex = 1;
	
					new_element.click();
					return new_element;
				},
				$: function (string) {
					var elm = document.querySelector(string);
					if (elm === null) {
						elm = false;
					}
					return elm;
				},
				on: function (elm, event, action) {
					elm.addEventListener(event, action, false);
					return elm;
				},
				getElementStyle: function (elm, style_property) {
					var style;
					if (elm.currentStyle) {
						style = elm.currentStyle[style_property];
					} else if (global.getComputedStyle) {
						style = document.defaultView.getComputedStyle(elm, null).getPropertyValue(style_property);
					}
					return style;
				},
				toggleVisibility: function (elm, time, toggleHide) {
	
					if (typeof toggleHide === 'undefined') {
						toggleHide = false;
					}
	
					var current_opacity = CENTIPEDE.DOM.tools.getElementStyle(elm, "opacity");
					if (current_opacity === "") {
						current_opacity = "1";
					}
	
					if (toggleHide && current_opacity === "0") {
						elm.style.position = "static";
						elm.style.top = "auto";
						elm.style.left = "auto";
					}
	
					elm.style.webkitTransitionProperty = "opacity"
					elm.style.webkitTransitionDuration = time.toString() + "ms";
					elm.style.webkitTransitionTimingFunction = "ease";
					elm.style.webkitTransitionDelay = "0";
					elm.style.mozTransitionProperty = "opacity"
					elm.style.mozTransitionDuration = time.toString() + "ms";
					elm.style.mozTransitionTimingFunction = "ease";
					elm.style.mozTransitionDelay = "0";
	
					elm.style.opacity = current_opacity === "0" ? "1" : "0";
	
	
					
					function restore() {
						elm.style.webkitTransitionProperty = "all"
						elm.style.webkitTransitionDuration = "0";
						elm.style.webkitTransitionTimingFunction = "ease";
						elm.style.webkitTransitionDelay = "0";
						elm.style.mozTransitionProperty = "all"
						elm.style.mozTransitionDuration = "0";
						elm.style.mozTransitionTimingFunction = "ease";
						elm.style.mozTransitionDelay = "0";
	
						if (toggleHide) {
							var getElementStyle = CENTIPEDE.DOM.tools.getElementStyle;
							elm.style.position = getElementStyle(elm, "opacity") === "0" ? "absolute" : "static";
							elm.style.top = getElementStyle(elm, "opacity") === "0" ? "0" : "auto";
							elm.style.left = getElementStyle(elm, "opacity") === "0" ? "0" : "auto";
						}
					}
	
					global.setTimeout(restore, time);
				}
			}
		}
	}
	global.addEventListener('DOMContentLoaded', function () {
		for (var module in CENTIPEDE.init) {
			if (typeof CENTIPEDE.init[module] === "function") {
				CENTIPEDE.init[module]();
			}
		}
	});
	return CENTIPEDE;
} (window));
