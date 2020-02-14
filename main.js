void function main(root = document.body) {
	// Создаём рендерер
	const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	renderer.setSize(root.offsetWidth, root.offsetHeight);
	// Вставляем канвас в html
	root.appendChild(renderer.domElement);

	const scene = new THREE.Scene();
	scene.background = new THREE.Color();
	window.scene = scene;

	const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.set(250, 400, 250);

	const orbit = new THREE.OrbitControls(camera);

	scene.add(new THREE.AmbientLight(0xF7F7F7));


	void function animate() {
		TWEEN.update();
		orbit.update();
		renderer.render(scene, camera);
		requestAnimationFrame(animate);
	}();

	// scene.add(new THREE.Mesh(new THREE.BoxGeometry(100,100,100), new THREE.MeshNormalMaterial()));

	void function initializeCube() {
		const SIZE_OF_PIECE = 50;
		const SIZE_OF_PIECE_WITH_GAPS= SIZE_OF_PIECE * 1.01;

		const FRONT = "front";
		const BACK = "back";
		const TOP = "top";
		const BOTTOM = "bottom";
		const LEFT = "left";
		const RIGHT = "right";

		const cube3x3 = new Array(26).fill(null).map( () => ({
			colors: new Array(6).fill(""),
			position: new Array(3).fill(0),
		}));

		void function initialize3x3() {
			getSide(FRONT, cube3x3).forEach(({colors, position}) => {
				colors[0] = '#ed0cde';
				position[0] = 1;
			});
			getSide(BACK, cube3x3).forEach(({colors, position}) => {
				colors[1] = '#ff00bb';
				position[0] = -1;
			});
			getSide(TOP, cube3x3).forEach(({colors, position}) => {
				colors[2] = '#f58cee';
				position[1] = 1;
			});
			getSide(BOTTOM, cube3x3).forEach(({colors, position}) => {
				colors[3] = '#80537d';
				position[1] = -1;
			});
			getSide(LEFT, cube3x3).forEach(({colors, position}) => {
				colors[4] = '#ffadf9';
				position[2] = 1;
			});
			getSide(RIGHT, cube3x3).forEach(({colors, position}) => {
				colors[5] = '#bf0286';
				position[2] = -1;
			});

		
		}();

		function getSide(side, array) {
			switch (side) {
				case FRONT:
					return array.slice(0, 9);
				case BACK:
					return array.slice(17);
				case TOP:
					return [
						...array.slice(0, 3),
						...array.slice(9, 12),
						...array.slice(17, 20),
					];
				case BOTTOM:
					return [
						...array.slice(6, 9),
						...array.slice(14, 17),
						...array.slice(23, 26),
					];
				case LEFT:
					return [
						array[0],
						array[3],
						array[6],
						array[9],
						array[12],
						array[14],
						array[17],
						array[20],
						array[23],
					];
				case RIGHT:
					return [
						array[2],
						array[5],
						array[8],
						array[11],
						array[13],
						array[16],
						array[19],
						array[22],
						array[25],
					];
			}
		}

		const createPiece = (function () {
			const WHITE_MATERIAL = new THREE.MeshBasicMaterial({color: 0xff00bb}),
				ORANGE_MATERIAL = new THREE.MeshBasicMaterial({color: 0xd952b5}),
				GREEN_MATERIAL = new THREE.MeshBasicMaterial({color: 0xff0099}),
				RED_MATERIAL = new THREE.MeshBasicMaterial({color: 0xfa9be5}),
				YELLOW_MATERIAL = new THREE.MeshBasicMaterial({color: 0xcc00f0}),
				BLUE_MATERIAL = new THREE.MeshBasicMaterial({color: 0x91006b}),
				BLACK_MATERIAL = new THREE.MeshBasicMaterial({color: 0x00000});

			const pieceGeometry = new THREE.BoxGeometry(SIZE_OF_PIECE, SIZE_OF_PIECE, SIZE_OF_PIECE);

			function mapColor(color) {
				switch (color) {
					case '#ed0cde':
						return WHITE_MATERIAL;
					case '#ff00bb':
						return ORANGE_MATERIAL;
					case '#f58cee':
						return GREEN_MATERIAL;
					case '#80537d':
						return RED_MATERIAL;
					case '#ffadf9':
						return YELLOW_MATERIAL;
					case '#bf0286':
						return BLUE_MATERIAL;
					default:
						return BLACK_MATERIAL;
				}
			}
			
			return (colors) => new THREE.Mesh(pieceGeometry, colors.map(mapColor));
		})();

		const allPieces = [];
		cube3x3.forEach(({colors, position: [x, y, z]}) => {
			const smallPiece = createPiece(colors);
			smallPiece.position.set(
				SIZE_OF_PIECE_WITH_GAPS * x,
				SIZE_OF_PIECE_WITH_GAPS * y,
				SIZE_OF_PIECE_WITH_GAPS * z
			);
			allPieces.push(smallPiece);
			scene.add(smallPiece);
		});


		void function controller() {
			const control = new THREE.Object3D();
			window.control = control;
			window.pieces = allPieces;
			scene.add(control);
			const tween = new TWEEN.Tween({delta: 0});
			tween.to({delta: 1}, 350);
			let axis, clockwise;
			const ninetyDegrees = Math.PI / 2;
			const rotatingSide = [];
			tween.onStart(() => {
				control.rotation.set( 0, 0, 0 );
				control.updateMatrixWorld(true);
				rotatingSide.forEach((box) => {
					box.updateMatrixWorld(true);
					THREE.SceneUtils.attach(box, scene, control);
				});
			});
			tween.onUpdate(({delta}) => {
				control.rotation[axis] = (ninetyDegrees * clockwise * delta);
			});
			tween.onComplete((tick) => {
				control.updateMatrixWorld(true);
				rotatingSide.forEach((box) => {
					box.updateMatrixWorld(true);
					THREE.SceneUtils.detach(box, control, scene);
				});
				rotatingSide.length = 0;
				tick.delta = 0;
			});

			window.addEventListener('keydown', function handleKeyDown({keyCode, shiftKey}) {
				if (tween.isPlaying())
					return;
				clockwise = shiftKey ? -1 : 1;
				let filtered;
				switch (keyCode) {
					case 81: // q
						axis = 'x';
						filtered = allPieces.filter(({position: {x}}) => x > SIZE_OF_PIECE);
						filtered.forEach(item => rotatingSide.push(item));
						tween.start();
						break;
					case 87: // w
						axis = 'y';
						filtered = allPieces.filter(({position: {y}}) => y > SIZE_OF_PIECE);
						filtered.forEach(item => rotatingSide.push(item));
						tween.start();
						break;
					case 69: // e
						axis = 'z';
						filtered = allPieces.filter(({position: {z}}) => z > SIZE_OF_PIECE);
						filtered.forEach(item => rotatingSide.push(item));
						tween.start();
						break;
					case 65: // a
						axis = 'x';
						filtered = allPieces.filter(({position: {x}}) => x < -SIZE_OF_PIECE);
						filtered.forEach(item => rotatingSide.push(item));
						tween.start();
						break;
					case 83: // s
						axis = 'y';
						filtered = allPieces.filter(({position: {y}}) => y < -SIZE_OF_PIECE);
						filtered.forEach(item => rotatingSide.push(item));
						tween.start();
						break;
					case 68: // d
						axis = 'z';
						filtered = allPieces.filter(({position: {z}}) => z < -SIZE_OF_PIECE);
						filtered.forEach(item => rotatingSide.push(item));
						tween.start();
						break;
				}
			});
		}();
	}();
}();