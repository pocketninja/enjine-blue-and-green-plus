import World from "enjine/src/js/enjine/ecs/World";
import TransformComponent from "enjine/src/js/enjine/components/TransformComponent";
import ImageRendererComponent from "enjine/src/js/enjine/components/renderer-components/ImageRendererComponent";
import TileComponent from "./Components/TileComponent";
import {DefaultTileColor, FullTileSize, PlayerImages, TileMargin} from "./defines";

/**
 * Create a tile for the given coordinate
 *
 * @param {World} world
 * @param {number} x
 * @param {number} y
 */
export function createTile(world, x, y) {
    const tile = world.createNewEntity(
        new TransformComponent,
        new ImageRendererComponent(PlayerImages[2]),
        new TileComponent,
    );

    /** @type {TransformComponent} */
    const transform = tile.getComponent(TransformComponent);
    transform.position.x = x;
    transform.position.y = y;

    /** @type {ImageRendererComponent} */
    const renderer = tile.getComponent(ImageRendererComponent);
    renderer.color = DefaultTileColor;
    renderer.radius = FullTileSize - TileMargin;

    //set the initial sizes with a subtle zoom effect thanks to TileSystem...
    transform.scale.x = 0;
    transform.scale.y = 0;

    return tile;
}