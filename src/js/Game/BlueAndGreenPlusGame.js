import Game from "enjine/src/js/enjine/Game";
import uiHtml from '../../ui/hud.html';
import Vector from "enjine/src/js/enjine/math/Vector";
import TransformComponent from "enjine/src/js/enjine/components/TransformComponent";
import ImageRendererComponent from "enjine/src/js/enjine/components/renderer-components/ImageRendererComponent";
import TileComponent from "../Components/TileComponent";
import CircleRendererComponent from "enjine/src/js/enjine/components/renderer-components/CircleRendererComponent";
import MovingStarComponent from "../Components/MovingStarComponent";
import {BackgroundSize, DefaultTileColor, FullTileSize, StarCount, TileMargin} from "../defines";
import World from "enjine/src/js/enjine/ecs/World";
import CanvasRendererSystem from "enjine/src/js/enjine/systems/CanvasRendererSystem";
import CameraComponent from "enjine/src/js/enjine/components/CameraComponent";
import SimpleTickSystem from "enjine/src/js/enjine/systems/SimpleTickSystem";
import TileSystem from "../Systems/TileSystem";
import MovingStarSystem from "../Systems/MovingStarSystem";
import {addListener} from "enjine/src/js/enjine/events";
import InputManager, {INPUT_CODES} from "enjine/src/js/enjine/managers/InputManager";
import SquareRendererComponent from "enjine/src/js/enjine/components/renderer-components/SquareRendererComponent";
import {createTile} from "../entity-helpers";

export default class BlueAndGreenPlusGame extends Game {

    #WorldCameraComponent;
    #inputManager;
    #canvas;
    #cursorWorldCoordinate;
    #cursorTileCoordinate = new Vector(1, 2);

    tiles = {};

    currentPlayer = 0;
    gameOver = true;


    constructor() {
        super("BlueAndGreen");
        this.#setupHud();
        this.#createWorld();
        this.#setupInput();
        this.#createBackgroundStars();
        this.#createTiles();
        this.#setupRestart();
        this.#updateZoom();

        //update zoom
        window.addEventListener('resize', () => this.#updateZoom());

        //when game inits, kick off the Systems
        addListener(this, 'game.init', event => {
            console.log('game.init', event);
            this.world.systems.forEach(system => {
                console.info('initializing system', system);
                system.tick();
            });

            //give the UI a chance to load before we publish the current player
            window.setTimeout(() => this.#publishCurrentPlayer(), 100);

            const system = this.world.getSystem(SimpleTickSystem);
            addListener(system, 'system.tick', event => this.update(event.data.delta));
        })
    }


    update(delta) {
        //update the mouse position
        this.#cursorWorldCoordinate = this.#WorldCameraComponent.getWorldCoordinatesFromViewportCoordinates(
            this.#inputManager.cursorScreenPosition
        );

        //determine a tile coord from the current cursor position
        const x = Math.round(this.#cursorWorldCoordinate.x / FullTileSize) * FullTileSize;
        const y = Math.round(this.#cursorWorldCoordinate.y / FullTileSize) * FullTileSize;

        //same as before, bail
        if (x === this.#cursorTileCoordinate.x && y === this.#cursorTileCoordinate.y) {
            return;
        }

        //unhover if different
        if (x !== this.#cursorTileCoordinate.x || y !== this.#cursorTileCoordinate.y) {
            const tile = this.tiles[`${this.#cursorTileCoordinate.x},${this.#cursorTileCoordinate.y}`];
            if (tile) {
                tile.getComponent(TileComponent).hovered = false;
            }
        }

        this.#cursorTileCoordinate.x = x;
        this.#cursorTileCoordinate.y = y;

        //set hover state on new tile, if not owned
        const tile = this.tiles[`${x},${y}`];
        if (tile) {
            const component = tile.getComponent(TileComponent);
            if (component.ownedBy > -1) {
                return;
            }
            component.hovered = true;
        }
    }


    #setupHud() {
        const $transient = document.createElement('div');
        $transient.innerHTML = uiHtml;

        //move all elements into the doc
        while ($transient.firstChild) {
            document.body.appendChild($transient.firstChild);
        }
    }

    /**
     * Create a background of stars, each comprised of a circle renderer to draw the "star"
     */
    #createBackgroundStars() {
        const renderer = new SquareRendererComponent;
        const background = this.world.createNewEntity(
            new TransformComponent,
            renderer,
        );
        renderer.color = 'black';
        renderer.radius = BackgroundSize;

        //create stars
        for (let i = 0; i < StarCount; i++) {
            const star = this.world.createNewEntity(
                new TransformComponent,
                new MovingStarComponent,
                new CircleRendererComponent
            );
            star.getComponent(CircleRendererComponent).color = 'rgba(255, 255, 255, 0.3)';
            star.getComponent(CircleRendererComponent).radius = Math.random() * 2;
            star.getComponent(TransformComponent).position.x = Math.random() * BackgroundSize - BackgroundSize / 2;
            star.getComponent(TransformComponent).position.y = Math.random() * BackgroundSize - BackgroundSize / 2;
        }
    }

    #createWorld() {
        const world = new World();

        const canvasRendererSystem = new CanvasRendererSystem;

        canvasRendererSystem.setCamera(world.camera);
        const t = world.camera.getComponent(TransformComponent);
        t.position.x = 0;
        t.position.y = 0;

        //create a simple tick system with a reduced tick rate, this.update will be called every tick
        const simpleTickSystem = new SimpleTickSystem;
        simpleTickSystem.tickRate = 1000 / 10;

        world.addSystem(simpleTickSystem);
        world.addSystem(new TileSystem);
        world.addSystem(new MovingStarSystem);

        world.addSystem(canvasRendererSystem);
        this.world = world;

        this.#WorldCameraComponent = this.world.camera.getComponent(CameraComponent);
        this.#canvas = this.world.getSystem(CanvasRendererSystem).canvas;
    }

    #updateZoom() {
        const boardSize = FullTileSize * 3 + TileMargin * 2;
        //set camera zoom based on canvas size
        const canvas = this.#canvas;
        const camera = this.#WorldCameraComponent;
        const hor = canvas.width / boardSize;
        const vert = canvas.height / boardSize;

        camera.zoom = Math.min(hor, vert);
    }

    #setupRestart() {
        window.addEventListener('restartGame', () => {
            console.log('Restarting!!');
            this.currentPlayer = 0;

            //clear owners on all tiles
            for (let i = 0; i < 9; i++) {
                this.tiles[i].getComponent(TileComponent).take(null);
            }

            this.gameOver = false;
            this.dispatchData('game-over', {
                winState: false
            });
        })
    }

    #publishCurrentPlayer() {
        this.dispatchData('setplayer', {
            player: this.currentPlayer
        });
    }

    #createTiles() {
        let coord;

        //top row
        coord = [-FullTileSize, FullTileSize];
        this.tiles[coord.join(',')] = createTile(this.world, ...coord);
        coord = [0, FullTileSize];
        this.tiles[coord.join(',')] = createTile(this.world, ...coord);
        coord = [FullTileSize, FullTileSize];
        this.tiles[coord.join(',')] = createTile(this.world, ...coord);

        //middle row
        coord = [-FullTileSize, 0];
        this.tiles[coord.join(',')] = createTile(this.world, ...coord);
        coord = [0, 0];
        this.tiles[coord.join(',')] = createTile(this.world, ...coord);
        coord = [FullTileSize, 0];
        this.tiles[coord.join(',')] = createTile(this.world, ...coord);

        //bottom row
        coord = [-FullTileSize, -FullTileSize];
        this.tiles[coord.join(',')] = createTile(this.world, ...coord);
        coord = [0, -FullTileSize];
        this.tiles[coord.join(',')] = createTile(this.world, ...coord);
        coord = [FullTileSize, -FullTileSize];
        this.tiles[coord.join(',')] = createTile(this.world, ...coord);

        //now create indexed entries for the existing tiles (this helps with win checks later)
        let index = 0;
        Object.entries(this.tiles).forEach(([key, tile]) => {
            this.tiles[index++] = tile;
        });

        console.log('tiles', this.tiles);
    }

    #setupInput() {
        this.#inputManager = new InputManager(this.world.getSystem(CanvasRendererSystem).canvas);
        this.#inputManager.createButton('Touch', INPUT_CODES.Mouse0);

        this.#inputManager.addButtonCallback(
            'Touch',
            event => this.#touchBegin(event),
            event => this.#touchEnd(event),
        );
    }

    #touchBegin(event) {
        //...
    }


    #touchEnd(event) {
        if (this.gameOver) {
            return;
        }

        //get the current determined coordinate previously determined from the input manager
        const coord = [
            this.#cursorTileCoordinate.x,
            this.#cursorTileCoordinate.y,
        ];
        const entity = this.tiles[coord.join(',')];

        if (!entity) {
            console.error('oh no, no entity at ', ...coord);
            return;
        }

        const tile = entity.getComponent(TileComponent);

        if (!tile) {
            console.error('oh no, no tile at ', ...coord);
            return;
        }

        //try take the tile
        tile.take(this.currentPlayer);

        if (this.foundWinState()) {
            console.log('winner is', this.currentPlayer);
            this.gameOver = true;
            this.dispatchData('game-over', {
                winState: true
            });
            return;
        }

        this.currentPlayer = this.currentPlayer === 0 ? 1 : 0;
        this.#publishCurrentPlayer();
    }

    dispatchData(eventName, data) {
        const event = new CustomEvent(eventName, {
            bubbles: true,
            detail: data
        });
        window.dispatchEvent(event);
    }

    foundWinState() {
        const rows = [
            [0, 1, 2], //top row
            [3, 4, 5], //middle row
            [6, 7, 8], //bottom row
            [0, 3, 6], //left col
            [1, 4, 7], //middle col
            [2, 5, 8], //right col
            [0, 4, 8], //diagonal
            [2, 4, 6], //diagonal
        ];

        //test each row for matching player owners on tiles
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const tile0 = this.tiles[row[0]].getComponent(TileComponent);
            const tile1 = this.tiles[row[1]].getComponent(TileComponent);
            const tile2 = this.tiles[row[2]].getComponent(TileComponent);

            //if unowned tiles...
            if (tile0.ownedBy < 0 || tile1.ownedBy < 0 || tile2.ownedBy < 0) {
                continue;
            }

            if (tile0.ownedBy === tile1.ownedBy && tile1.ownedBy === tile2.ownedBy) {
                console.info('winning row', row, tile0, tile1, tile2);
                return true;
            }
        }

        return false;
    }

}