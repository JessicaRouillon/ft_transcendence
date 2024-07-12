import * as THREE from 'three';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const T_VAR = {
	HOME_TXT: "Welcome to our amazing Pong game.",
	ABOUT_TXT: "Pong is a two-dimensional sports game that simulates table tennis. The player controls an in-game paddle by moving it vertically across the left or right side of the screen. They can compete against another player controlling a second paddle on the opposing side. Players use the paddles to hit a ball back and forth.",
	TEAM_TXT: "Meet our incredible team.",
	LOGIN_TXT: "Log in to our amazing game",
	PLAY_PONG_TXT: "Prout"
};

document.addEventListener('DOMContentLoaded', () => {
    const routes = {
        'home': () => document.getElementById('app').innerHTML = `<h1>${T_VAR.HOME_TXT}</h1>`,
        'about': () => document.getElementById('app').innerHTML = `<h1>${T_VAR.ABOUT_TXT}</h1>`,
		'theteam': () => {
		document.getElementById('app').innerHTML = `
			<style>
				.team-container {
					display: flex;
					flex-wrap: wrap;
					justify-content: center;
					gap: 20px;
				}
				.team-member {
					display: flex;
					flex-direction: column;
					align-items: center;
				}
				.team-member img {
					width: 500px; /* Adjust based on your preference */
					height: auto;
					border-radius: 50%; /* Optional: makes images circular */
					margin-bottom: 10px; /* Space between image and name */
				}
			</style>
			<h1>${T_VAR.TEAM_TXT}</h1>
			<div class="team-container">
				<div class="team-member">
					<img src="imgs_spa/casomarr.jpg" alt="Carolina">
					<b><p>Carolina aka the Fist</p></b>
				</div>
				<div class="team-member">
					<img src="imgs_spa/jrouillo.jpg" alt="Jessica">
					<b><p>Jessica aka Spider-twerk</p></b>
				</div>
				<div class="team-member">
					<img src="imgs_spa/madavid.jpg" alt="Marine">
					<b><p>Marine aka the Glitterbox</p></b>
				</div>
				<div class="team-member">
					<img src="imgs_spa/cbernaze.jpg" alt="Clement">
					<b><p>Clement aka the Big Tub</p></b>
				</div>
				<div class="team-member">
					<img src="imgs_spa/kquerel.jpg" alt="Karl">
					<b><p>Karl aka K-K-Karl</p></b>
				</div>
			</div>
		`;},
		'play-pong': () => {
			document.getElementById('app').innerHTML = `<h1>${T_VAR.PLAY_PONG_TXT}</h1>`;

			let round				= 1;
			let newRound			= true;
			let newScore			= true;
			
			let roundStarted	= false;
			let launchSide	= 1;
			const SPACE = ' ';
			let game = true;
			
			/***********************************************************************************/
			/************************** Initialisation de la scene *****************************/
			/***********************************************************************************/
			
				const scene = new THREE.Scene();
			
				const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
				camera.position.x = 0;
				camera.position.y = -20;
				camera.position.z = 30;
				camera.lookAt(0, 0, 0); // La caméra regarde vers le centre de la scène
			
				const renderer = new THREE.WebGLRenderer({ antialias: true });
				renderer.setSize(window.innerWidth, window.innerHeight);
				document.getElementById('app').appendChild(renderer.domElement);
			
			// 	Ajouter OrbitControls
			
			
			/***********************************************************************************/
			/******************************** Les etoiles **************************************/
			/***********************************************************************************/
			
				const orbitRadius = 15;
				let angle0 = 0;
			
				var objloader = new OBJLoader();
				objloader.load(
					'star.obj',
					function (star0) {
						star0.position.set(0, 0, 10);
						star0.scale.set(0.25, 0.25, 0.25);
						scene.add(star0);
						function animation() {
							requestAnimationFrame(animation);
							star0.rotation.x += 0.01; // Faire tourner l'objet autour de l'axe x
							star0.rotation.y += 0.01; // Faire tourner l'objet autour de l'axe y
							star0.rotation.z += 0.10; // Faire tourner l'objet autour de l'axe y
							renderer.render(scene, camera);
							const x = orbitRadius * Math.cos(angle0);
							const y = orbitRadius * Math.sin(angle0);
						
							// Mettre à jour la position de l'objet
							star0.position.set(x, y, 10);
						
							// Augmenter l'angle pour la prochaine trame de rendu
							angle0 += 0.01;
							}
							animation();
					},
					function (xhr) {
						console.log((xhr.loaded / xhr.total * 100) + '% loaded');
					},
					function (error) {
						console.log('An error happened', error);
					}
				);
			
			/***********************************************************************************/
			/******************************** Le terrain  **************************************/
			/***********************************************************************************/
				
			// Le terrain
			
				const FIELD_X			= 20;
				const FIELD_Y			= 15;
				const FIELD_Z			= 2;
				const FIELD_COLOR		= 0x00ff00;
				const FIELD_POSITION_X	= 0;
				const FIELD_POSITION_Y	= 0;
				const FIELD_POSITION_Z	= FIELD_Z / 2;
			
				const fieldGeometry		= new THREE.BoxGeometry(FIELD_X, FIELD_Y, FIELD_Z);
				const fieldMaterial		= new THREE.MeshPhongMaterial({ color: FIELD_COLOR });
				const field				= new THREE.Mesh(fieldGeometry, fieldMaterial);
			
				field.position.set(FIELD_POSITION_X, FIELD_POSITION_Y, FIELD_POSITION_Z);
				scene.add(field);
			
			// La ligne de demarquation
			
				const lineGeometry = new THREE.PlaneGeometry(0.1, FIELD_Y);
				const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
				const line = new THREE.Mesh(lineGeometry, lineMaterial);
				scene.add(line);
				line.position.z = FIELD_POSITION_Z + FIELD_Z/ 2;
			
			// Les bordures
			
				//Constantes
			
					const BORDER_COLOR		= 0xffffff;
					const BORDER_Z			= FIELD_Z + 0.3 * 2;
					const BORDER_POSITION_Z	= BORDER_Z / 2;
			
				//Bordures horizontales
			
					const HOR_BORDER_X			= FIELD_X;
					const HOR_BORDER_Y			= 0.5;
					const HOR_BORDER_POSITION_X	= 0;
							
					const HOR_BORDER_0_POSITION_Y	= (FIELD_Y / 2) - HOR_BORDER_Y / 2 + 0.1;
			
					const horBorder0Geometry = new THREE.BoxGeometry(HOR_BORDER_X, HOR_BORDER_Y, BORDER_Z);
					const horBorder0Material = new THREE.MeshPhongMaterial({ color: BORDER_COLOR });
					const horBorder0 = new THREE.Mesh(horBorder0Geometry, horBorder0Material);
					horBorder0.position.set(HOR_BORDER_POSITION_X, HOR_BORDER_0_POSITION_Y, BORDER_POSITION_Z);
					scene.add(horBorder0);
			
					const HOR_BORDER_1_POSITION_Y	= -(FIELD_Y / 2) + HOR_BORDER_Y / 2 - 0.1;
			
					const horBorder1Geometry = new THREE.BoxGeometry(HOR_BORDER_X, HOR_BORDER_Y, BORDER_Z);
					const horBorder1Material = new THREE.MeshPhongMaterial({ color: BORDER_COLOR });
					const horBorder1 = new THREE.Mesh(horBorder1Geometry, horBorder1Material);
					horBorder1.position.set(HOR_BORDER_POSITION_X, HOR_BORDER_1_POSITION_Y, BORDER_POSITION_Z);
					scene.add(horBorder1);
					
				// Bordures verticales
					
					// const VER_BORDER_X			= 0.5;
					// const VER_BORDER_Y			= FIELD_Y;
					// const VER_BORDER_POSITION_Y	=  0 ;
					
					// const VER_BORDER_0_POSITION_X	=  (FIELD_X / 2) - VER_BORDER_X / 2 ;
					
					// const verBorder0Geometry = new THREE.BoxGeometry(VER_BORDER_X, VER_BORDER_Y, BORDER_Z);
					// const verBorder0Material = new THREE.MeshPhongMaterial({ color: BORDER_COLOR });
					// const verBorder0 = new THREE.Mesh(verBorder0Geometry, verBorder0Material);
					// verBorder0.position.set(VER_BORDER_0_POSITION_X, VER_BORDER_POSITION_Y, BORDER_POSITION_Z);
					// scene.add(verBorder0);
					
					// const VER_BORDER_1_POSITION_X	= - (FIELD_X / 2) + VER_BORDER_X / 2;
					
					// const verBorder1Geometry = new THREE.BoxGeometry(VER_BORDER_X, VER_BORDER_Y, BORDER_Z);
					// const verBorder1Material = new THREE.MeshPhongMaterial({ color: BORDER_COLOR });
					// const verBorder1 = new THREE.Mesh(verBorder1Geometry, verBorder1Material);
					// verBorder1.position.set(VER_BORDER_1_POSITION_X, VER_BORDER_POSITION_Y, BORDER_POSITION_Z);
					// scene.add(verBorder1);
			
			// Le plan
			
				const planeGeometry = new THREE.PlaneGeometry(FIELD_X + 10, FIELD_Y + 10);
				const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xf0f0ff, side: THREE.DoubleSide });
				const plane = new THREE.Mesh(planeGeometry, planeMaterial);
				// scene.add(plane);
			
			
			/***********************************************************************************/
			/******************************** Les paddles  *************************************/
			/***********************************************************************************/
			
			//Constantes
			
				const PADDLE_X			= 1;
				const PADDLE_Y			= 2;
				const PADDLE_Z			= 0.7;
				const PADDLE_SPEED		= 0.5;
				const PADDLE_POSITION_Y	= 0;
				const PADDLE_POSITION_Z	= 2 * FIELD_POSITION_Z + PADDLE_Z / 2;
				
			//Paddle left
				
				const LEFT_PADDLE_COLOR		= 0x00ffff;
				const LEFT_PADDLE_POSITION_X	= - FIELD_X / 2 + 1.2;
				
				const leftPaddleGeometry = new THREE.BoxGeometry(PADDLE_X, PADDLE_Y, PADDLE_Z);
				
				const leftPaddleMaterial = new THREE.MeshPhongMaterial({ color: LEFT_PADDLE_COLOR });
				const leftPaddle = new THREE.Mesh(leftPaddleGeometry, leftPaddleMaterial);
				leftPaddle.position.set(LEFT_PADDLE_POSITION_X, PADDLE_POSITION_Y, PADDLE_POSITION_Z);
				scene.add(leftPaddle);
				
			//Paddle right
				
				const RIGHT_PADDLE_COLOR		= 0xff00ff;
				const	RIGHT_PADDLE_POSITION_X	=  FIELD_X / 2 - 1.2;
				
				const rightPaddleGeometry = new THREE.BoxGeometry(PADDLE_X, PADDLE_Y, PADDLE_Z);
				
				const rightPaddleMaterial = new THREE.MeshPhongMaterial({ color: RIGHT_PADDLE_COLOR });
				const rightPaddle = new THREE.Mesh(rightPaddleGeometry, rightPaddleMaterial);
				rightPaddle.position.set(RIGHT_PADDLE_POSITION_X, PADDLE_POSITION_Y, PADDLE_POSITION_Z);
				scene.add(rightPaddle);
				
				
			// Limiter les position X et Y des raquettes pour qu'elles reste dans les limites du terrain
				function checkPaddleLimits()
				{
					// Limiter la position de la raquette left
					leftPaddle.position.x = Math.min(Math.max(leftPaddle.position.x, - FIELD_X / 2 + PADDLE_X / 2), - PADDLE_X/2 - 3);
					leftPaddle.position.y = Math.min(Math.max(leftPaddle.position.y, - FIELD_Y / 2 + PADDLE_Y / 2 + HOR_BORDER_Y),  FIELD_Y / 2 - PADDLE_Y / 2 - HOR_BORDER_Y);
					
					// Limiter la position Y
					rightPaddle.position.x = Math.min(Math.max(rightPaddle.position.x, + PADDLE_X / 2 + 3), FIELD_X / 2 - PADDLE_X/2);
					rightPaddle.position.y = Math.min(Math.max(rightPaddle.position.y, - FIELD_Y / 2 + PADDLE_Y / 2 + HOR_BORDER_Y),  FIELD_Y / 2 - PADDLE_Y / 2 - HOR_BORDER_Y);
				}
			
			
			/***********************************************************************************/
			/*********************************** La balle  *************************************/
			/***********************************************************************************/
				
				const BALL_RATIO		= 0.3;
				const BALL_COLOR		= 0xffffff;
				const BALL_POSITION_X	= 0;
				const BALL_POSITION_Y	= 0;
				const BALL_SPEED_X		= 0.40;
				const BALL_SPEED_Y		= 0.40;
				let ballSpeedX			= BALL_SPEED_X;
				let ballSpeedY			= BALL_SPEED_Y;
				const BALL_POSITION_Z	= FIELD_Z + BALL_RATIO;
			
				const ballGeometry = new THREE.SphereGeometry(BALL_RATIO, 32, 32);
				const ballMaterial = new THREE.MeshPhongMaterial({ color: BALL_COLOR });
				const ball = new THREE.Mesh(ballGeometry, ballMaterial);
				ball.position.set(BALL_POSITION_X, BALL_POSITION_Y, BALL_POSITION_Z);
				scene.add(ball);
				
				function updateBall()
				{
					ball.position.x += ballSpeedX;
					ball.position.y += ballSpeedY;
			
				}
			
			/***********************************************************************************/
			/********************************* Les scores  *************************************/
			/***********************************************************************************/
			
			let scoreLeft = 0;
			let scoreRight = 0;
			
			// Création de l'objet du paneau d'affichage du score
				const horizontalBeamGeometry = new THREE.BoxGeometry(FIELD_X - 4, 1, 0.5);
				const BeamMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
				
				const downBeam = new THREE.Mesh(horizontalBeamGeometry, BeamMaterial);
				downBeam.position.set(0, FIELD_Y-2.5, 10);
				scene.add(downBeam);
			
				const upBeam = new THREE.Mesh(horizontalBeamGeometry, BeamMaterial);
				upBeam.position.set(0, FIELD_Y-2.5, 18);
				scene.add(upBeam);
				
				const verticalBeamGeometry = new THREE.BoxGeometry(0.5, 1, 8.5);
				
				const leftBeam = new THREE.Mesh(verticalBeamGeometry, BeamMaterial);
				leftBeam.position.set(FIELD_X / 2 - 2, FIELD_Y-2.5, 14);
				scene.add(leftBeam);
			
				const rightBeam = new THREE.Mesh(verticalBeamGeometry, BeamMaterial);
				rightBeam.position.set(-FIELD_X / 2 +2, FIELD_Y-2.5, 14);
				scene.add(rightBeam);
			
				const centerBeamGeometry = new THREE.BoxGeometry(0.5, 1, 10);
			
				const centerBeam = new THREE.Mesh(centerBeamGeometry, BeamMaterial);
				centerBeam.position.set(0, FIELD_Y-2.5, 5);
				scene.add(centerBeam);
				
				const screenGeometry = new THREE.BoxGeometry(FIELD_X - 4, 1, 8);
				const screenMaterial = new THREE.MeshPhongMaterial({ color: 0x252525 });
				const screen = new THREE.Mesh(screenGeometry, screenMaterial);
				screen.position.set(0, FIELD_Y-2, 14);
				scene.add(screen);
				
			// Affichage du score sur le panneau
			var textMesh;
			
			
				var loader = new FontLoader();
				loader.load('./fonts/DS-Digital_Normal.json', function (font) {
					createScoreText(font, scoreLeft, scoreRight);
				});
			
				function createScoreText(font, scoreLeft, scoreRight) {
			
					var textGeometry = new TextGeometry(scoreLeft + " : " + scoreRight, {
						font: font,
						size: 5,
						height: 1,
						curveSegments: 12,
						bevelEnabled: true,
						bevelThickness: 0.03,
						bevelSize: 0.02,
						bevelSegments: 5
					});
					
					textGeometry.computeBoundingBox();
					var boundingBox = textGeometry.boundingBox;
					
					var centerX = (boundingBox.max.x - boundingBox.min.x) / 2;
					var centerY = (boundingBox.max.y - boundingBox.min.y) / 2;
					var centerZ = (boundingBox.max.z - boundingBox.min.z) / 2;
					
				// 	// Déplacer le texte pour qu'il soit centré
					textGeometry.translate(-centerX, -centerY, -centerZ);
					
					var textMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
			
					if (textMesh) {
						scene.remove(textMesh);
					}
			
					textMesh = new THREE.Mesh(textGeometry, textMaterial);
					textMesh.position.set(0, FIELD_Y -3, 14.5);
					textMesh.rotation.x = Math.PI / 2;
					scene.add(textMesh);
				}
			
				function updateScore() {
					loader.load('./fonts/DS-Digital_Normal.json', function (font) {
						createScoreText(font, scoreLeft, scoreRight);
					});
				}
			
			
			
				function endGame(){
					scene.remove(field);
					scene.remove(line);
					scene.remove(horBorder0);
					scene.remove(horBorder1);
					scene.remove(leftPaddle);
					scene.remove(rightPaddle);
					scene.remove(ball);
					scene.remove(cube);
					scene.remove(downBeam);
					scene.remove(upBeam);
					scene.remove(leftBeam);
					scene.remove(rightBeam);
					scene.remove(centerBeam);
					scene.remove(screen);
					scene.remove(textMesh);
					game = false;
				
					var loader = new FontLoader();
					loader.load('../fonts/DS-Digital_Normal.json', function (font) {
						
						var textGeometry = new TextGeometry("GAME OVER !", {
							font: font,
							size: 5,
							height: 1,
							curveSegments: 12,
							bevelEnabled: true,
							bevelThickness: 0.03,
							bevelSize: 0.02,
							bevelSegments: 5
						});
						
						textGeometry.computeBoundingBox();
						var boundingBox = textGeometry.boundingBox;
						
						var centerX = (boundingBox.max.x - boundingBox.min.x) / 2;
						var centerY = (boundingBox.max.y - boundingBox.min.y) / 2;
						var centerZ = (boundingBox.max.z - boundingBox.min.z) / 2;
						
						// Déplacer le texte pour qu'il soit centré
						textGeometry.translate(-centerX, -centerY, -centerZ);
						
						var textMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });
				
						var textMesh = new THREE.Mesh(textGeometry, textMaterial);
						textMesh.position.set(0,0, 14.5);
						textMesh.rotation.x = Math.PI / 3;
						scene.add(textMesh);
					});
					console.log("fiiin");
				}
				
				// Pour réinitialiser le jeu à chaque manche
				function reset() {
					ball.position.x = 0;
					ball.position.y = 0;
					launchSide *= -1;
					console.log("Score left: " + scoreLeft);
					console.log("Score right: " + scoreRight);
					updateScore();
					roundStarted = false;
				}
			
			/***********************************************************************************/
			/*********************************** Lumieres **************************************/
			/***********************************************************************************/
						
			// Lumière ambiante
				var ambientLight = new THREE.AmbientLight(0xffffff, 0.01);
				scene.add(ambientLight);
			
				const light = new THREE.PointLight(0xffffff,100, 50);
				light.position.set(0, 0, 10);
				scene.add(light);
			
			// Lumières en coins
				const UpLeftLight = new THREE.PointLight(0xffff00, 500, 50);
				UpLeftLight.position.set(-FIELD_X/2, +FIELD_Y / 2, 1);
				scene.add(UpLeftLight);
			
				const DownLeftLight = new THREE.PointLight(0xff00ff, 500, 50);
				DownLeftLight.position.set(-FIELD_X/2, -FIELD_Y / 2, 1);
				scene.add(DownLeftLight);
			
				const UpRightLight = new THREE.PointLight(0x00ffff, 500, 50);
				UpRightLight.position.set(FIELD_X/2, +FIELD_Y / 2, 1);
				scene.add(UpRightLight);
			
				const DownRightLight = new THREE.PointLight(0x00ff00, 500, 50);
				DownRightLight.position.set(FIELD_X / 2, -FIELD_Y / 2, 1);
				scene.add(DownRightLight);
				
			// Lumières en coins lointaines
				const farUpLeftLight = new THREE.PointLight(0xff1312, 500, 50);
				farUpLeftLight.position.set(-FIELD_X / 2 - 3, +FIELD_Y / 2 + 3, 0);
				scene.add(farUpLeftLight);
			
				const farDownLeftLight = new THREE.PointLight(0xff1312, 500, 50);
				farDownLeftLight.position.set(-FIELD_X / 2 - 3, -FIELD_Y / 2 - 3, 0);
				scene.add(farDownLeftLight);
			
				const farUpRightLight = new THREE.PointLight(0xff1312, 500, 50);
				farUpRightLight.position.set(FIELD_X / 2 + 3, +FIELD_Y / 2 + 3, 0);
				scene.add(farUpRightLight);
			
				const farDownRightLight = new THREE.PointLight(0xff1312, 500, 50);
				farDownRightLight.position.set(FIELD_X / 2 + 3, - FIELD_Y / 2 - 3, 0);
				scene.add(farDownRightLight);
			
			// Lumiere pour les scores
				const scoreLight = new THREE.SpotLight(0xff0000, 100);
			
			// Création d'une lumière SpotLight rouge pour le paneau d'affichage
				var spotLight = new THREE.SpotLight(0xff0000, 100); // Couleur rouge (hexadécimal), intensité
				spotLight.position.set(0, FIELD_Y, 17); // Position de la lumière
				spotLight.target.position.set(0, FIELD_Y-4, 10); // Cible de la lumière (votre objet screen)
				spotLight.angle = Math.PI / 1; // Angle d'étalement du cône de lumière
				spotLight.distance = 15; // Distance maximale de la lumière
				spotLight.castShadow = true;
				spotLight.shadow.mapSize.width = 1024;
				spotLight.shadow.mapSize.height = 1024;
				spotLight.shadow.camera.near = 0.5;
				spotLight.shadow.camera.far = 30;
				scene.add(spotLight);
			
				const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
				const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
				const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
				cube.position.set(scoreLight.position.x, scoreLight.position.y, scoreLight.position.z);
				scene.add(cube);
			
			/***********************************************************************************/
			/******************************** Event listener ***********************************/
			/***********************************************************************************/
			
			// Ajuster le rendu lors du redimensionnement de la fenêtre
				window.addEventListener('resize', () => {
					camera.aspect = window.innerWidth / window.innerHeight;
					camera.updateProjectionMatrix();
					renderer.setSize(window.innerWidth, window.innerHeight);
				});
			
			// Gestion du défilement pour ajuster la position de la caméra
				window.addEventListener('wheel', function(event) {
					if (event.deltaY > 0) {
						camera.position.z += 1;
						// camera.rotation.z += 1;
					} else {
						camera.position.z -= 1;
						// camera.rotation.z -= 1;
					}
					console.log("camera z = " + camera.position.z);
				});
				
			// Pour les keys
			
				let keysPressed	= {};
			
			// Pour détecter l'appui sur une touche
				
				document.addEventListener("keydown", function(event) {
					console.log(event.key + " realsed");
					keysPressed[event.key] = true;
				});
			
			// Pour détecter le relâchement d'une touche
			
				document.addEventListener("keyup", function(event) {
					console.log(event.key + " pressed");
					delete keysPressed[event.key];
				});
			
			// Pour écouter les keys
				function keyHook()
				{
					// Déplacer la raquette gauche
					if (keysPressed["w"]) {
						leftPaddle.position.y += PADDLE_SPEED;
					}
					if (keysPressed["s"]) {
						leftPaddle.position.y -= PADDLE_SPEED;
					}
					if (keysPressed["a"]) {
						leftPaddle.position.x -= PADDLE_SPEED;
					}
					if (keysPressed["d"]) {
						leftPaddle.position.x += PADDLE_SPEED;
					}
			
					// Déplacer la raquette droite
					if (keysPressed["ArrowUp"]) {
						rightPaddle.position.y += PADDLE_SPEED;
					}
					if (keysPressed["ArrowDown"]) {
						rightPaddle.position.y -= PADDLE_SPEED;
					}
					if (keysPressed["ArrowLeft"]) {
						rightPaddle.position.x -= PADDLE_SPEED;
					}
					if (keysPressed["ArrowRight"]) {
						rightPaddle.position.x += PADDLE_SPEED;
					}
				}
			
			/***********************************************************************************/
			/********************************** Collisions *************************************/
			/***********************************************************************************/
			
			function checkEdgesBounce() {
				// console.log("check bounce : ball.position.x = " + ball.position.x + " ball.position.y = " + ball.position.y);
				if (ball.position.y + BALL_RATIO * 2 >= FIELD_Y / 2 || ball.position.y - BALL_RATIO *2 <= -FIELD_Y / 2) {
					ballSpeedY = -ballSpeedY;
				}
			}
			
			function checkPaddleCollision() {
				if (
					ball.position.x - BALL_RATIO <= leftPaddle.position.x + PADDLE_X / 2 &&
					ball.position.x - BALL_RATIO >= leftPaddle.position.x - PADDLE_X / 2 &&
					ball.position.y + BALL_RATIO >= leftPaddle.position.y - PADDLE_Y / 2 &&
					ball.position.y - BALL_RATIO <= leftPaddle.position.y + PADDLE_Y / 2
				) {
					ballSpeedX = -ballSpeedX;
				}
			
				if (
					ball.position.x + BALL_RATIO >= rightPaddle.position.x - PADDLE_X / 2 &&
					ball.position.x + BALL_RATIO <= rightPaddle.position.x + PADDLE_X / 2 &&
					ball.position.y + BALL_RATIO >= rightPaddle.position.y - PADDLE_Y / 2 &&
					ball.position.y - BALL_RATIO <= rightPaddle.position.y + PADDLE_Y / 2
				) {
					ballSpeedX = -ballSpeedX;
				}
			}
			
				// Gérer les collisions avec les bords du terrain pour buts (x)
				function checkGoals() {
					console.log("check goal : ball.position.x = " + ball.position.x + " ball.position.y = " + ball.position.y);
					// La balle a atteint le bord gauche, réinitialiser la position
					if (ball.position.x + BALL_RATIO + 5 < - FIELD_X / 2) {
						scoreRight++;
						console.log("Point pour right");
					}
					// La balle a atteint le bord droit, réinitialiser la position
					else if (ball.position.x - BALL_RATIO - 5 > FIELD_X / 2) {
						scoreLeft++;
						console.log("Point pour left");
					}
					else
						return;
					round++;
					newScore = true;
					newRound = true;
					reset();
				if (game && scoreLeft == 10 || scoreRight == 10)
						setTimeout(endGame, 500);	
				}
			
			/***********************************************************************************/
			/********************************** Animation **************************************/
			/***********************************************************************************/
			
			// Définir une fonction d'animation
			
				function animate() {
					// controls.update();
					// changeScore();
					
					// Faire bouger la camera
					// leftFlipper.rotation.x += 0.05;
					// rightFlipper.rotation.x += 0.05;
					
					// // Faire rebondir la balle
					// ball.position.y += 0.1;
					// if (ball.position.y >= 5 || ball.position.y <= -5) {
						// 	ball.position.y = 0;
						// }
					if (keysPressed[SPACE] && !roundStarted) {
						ballSpeedX = -ballSpeedX;
						ballSpeedY = -ballSpeedY;
						ball.position.x = ballSpeedX;
						ball.position.y = ballSpeedY;
						roundStarted = true;
					}
					if (game)
					{
						keyHook();
						if (roundStarted)
							updateBall();
						checkPaddleLimits();
						checkEdgesBounce();
						checkPaddleCollision()
						if (roundStarted)
							checkGoals();
					}
						// Rendre la scène
						requestAnimationFrame(animate);
					renderer.render(scene, camera);
				}
			
			// Appel de la fonction d'animation
			animate();
				


		},
		'login': () => {
			document.getElementById('app').innerHTML = `
				<h1>${T_VAR.LOGIN_TXT}</h1>
				<form id="loginForm">
					<div>
						<label for="username">Username:</label>
						<input type="text" id="username" name="username" required>
					</div>
					<div>
						<label for="password">Password:</label>
						<input type="password" id="password" name="password" required>
					</div>
					<button type="submit">Log In</button>
				</form>
			`;
			document.getElementById('loginForm').addEventListener('submit', handleLogin);
		}
	};

	function navigateTo(path) {
		const routeKey = path.startsWith('#') ? path.slice(1) : path;
		if (window.location.protocol !== "file:") {
			history.pushState({}, '', routeKey);
		}
		if (routes[routeKey]) {
			routes[routeKey]();
		} else {
			console.error(`No route handler for ${routeKey}`);
		}
		console.log(`Navigating to ${routeKey}`);
	}

	function handleLogin(event) {
		event.preventDefault(); // Prevent the form from submitting through the browser
		const username = document.getElementById('username').value;
		const password = document.getElementById('password').value;

		// Replace 'https://yourserver.com/api/login' with your actual login endpoint
		fetch('https://yourserver.com/api/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username, password }),
		})
		.then(response => {
			if (!response.ok) {
				throw new Error('Login failed');
			}
			return response.json();
		})
		.then(data => {
			console.log('Login successful:', data);
			// Handle login success, e.g., redirecting to another page or showing a success message
			navigateTo('home');
		})
		.catch(error => {
			console.error('Error during login:', error);
			// Handle login failure, e.g., showing an error message
			alert('Login failed. Please try again.');
		});
	}

	// Listen for hash changes
	window.addEventListener('hashchange', () => {
		const path = window.location.hash ? window.location.hash.slice(1) : '/';
		navigateTo(path);
	});

	// Adjust initial route handling
	const initialPath = window.location.hash ? window.location.hash.slice(1) : '/';
	navigateTo(initialPath);
});

window.addEventListener('hashchange', function() {
    if (window.location.hash === '#theteam') {
        // When on the team page, remove the background image
        document.body.style.backgroundImage = 'none';
    } else {
        // For all other pages, set the background image back
        document.body.style.backgroundImage = "url('imgs_spa/transcendance.jpg')";
    }
});