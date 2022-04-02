import System from "enjine/src/js/enjine/ecs/System";
import Vector from "enjine/src/js/enjine/math/Vector";
import {addListener} from "enjine/src/js/enjine/events";
import TransformComponent from "enjine/src/js/enjine/components/TransformComponent";
import MovingStarComponent from "../Components/MovingStarComponent";
import Query from "enjine/src/js/enjine/ecs/Query";
import {BackgroundSize} from "../defines";

/**
 * Moves the stars in the background
 */
export default class MovingStarSystem extends System {
    #direction = new Vector(2, 1);
    #angleShiftSpeed = 5;

    constructor() {
        super();
        this.tickRate = 1000 / 60;
        this.queries.push(new Query(TransformComponent, MovingStarComponent));
        addListener(this, 'system.tick', event => this.updateStarPosition(event.data.delta));
    }

    updateStarPosition(delta) {
        //continually rotate the direction vector accounting for the angle shift speed
        this.#direction = this.#direction.rotate2d(delta * this.#angleShiftSpeed);

        this.queries.forEach(query => {
            query.entities.forEach(entity => {
                const transform = entity.getComponent(TransformComponent);
                const star = entity.getComponent(MovingStarComponent);

                transform.position.x += this.#direction.x * star.speed * delta;
                transform.position.y += this.#direction.y * star.speed * delta;

                if (transform.position.x > BackgroundSize / 2) {
                    transform.position.x = BackgroundSize / -2;
                } else if (transform.position.x < -BackgroundSize / 2) {
                    transform.position.x = BackgroundSize / 2;
                }

                if (transform.position.y > BackgroundSize / 2) {
                    transform.position.y = BackgroundSize / -2;
                } else if (transform.position.y < -BackgroundSize / 2) {
                    transform.position.y = BackgroundSize / 2;
                }
            });
        });
    }
}