import System from "enjine/src/js/enjine/ecs/System";
import {addListener} from "enjine/src/js/enjine/events";
import TransformComponent from "enjine/src/js/enjine/components/TransformComponent";
import Query from "enjine/src/js/enjine/ecs/Query";
import PlayerPieceComponent from "../Components/PlayerPieceComponent";
import {lerp} from "enjine/src/js/enjine/math";

/**
 * Moves the stars in the background
 */
export default class PlayerPieceSystem extends System {
    #speed = 15;

    constructor() {
        super();
        this.tickRate = 1000 / 60;
        this.queries.push(new Query(TransformComponent, PlayerPieceComponent));
        addListener(this, 'system.tick', event => this.updatePositions(event.data.delta));
    }

    updatePositions(delta) {
        this.queries.forEach(query => {
            query.entities.forEach(entity => {
                const transform = entity.getComponent(TransformComponent);
                const playerPiece = entity.getComponent(PlayerPieceComponent);

                let targetPosition = playerPiece.startPosition;

                if (playerPiece.tile) {
                    targetPosition = playerPiece.tile.entity.transform.position;
                }

                //bail if no position to move to... this might occur at the very start of the game while setup is
                //happening. We could restructure things to manage that better, but this is just an experiment :)
                if (!targetPosition) {
                    return;
                }

                //smoothly move the piece to the correct position
                transform.position.x = lerp(transform.position.x, targetPosition.x, delta * this.#speed);
                transform.position.y = lerp(transform.position.y, targetPosition.y, delta * this.#speed);
            });
        });
    }
}