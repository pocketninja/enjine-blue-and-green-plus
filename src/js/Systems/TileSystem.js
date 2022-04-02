import System from "enjine/src/js/enjine/ecs/System";
import Query from "enjine/src/js/enjine/ecs/Query";
import TransformComponent from "enjine/src/js/enjine/components/TransformComponent";
import TileComponent from "../Components/TileComponent";
import ImageRendererComponent from "enjine/src/js/enjine/components/renderer-components/ImageRendererComponent";
import {FullSizeScale, HoverScale, TakenScale} from "../defines";
import {addListener} from "enjine/src/js/enjine/events";
import {lerp} from "enjine/src/js/enjine/math";

export default class TileSystem extends System {
    animationSpeed = 10;

    constructor() {
        super();
        this.tickRate = 1000 / 60;
        this.queries.push(new Query(TransformComponent, TileComponent, ImageRendererComponent));
        addListener(this, 'system.tick', event => this.updateTileState(event.data.delta));
    }

    updateTileState(delta) {
        this.queries.forEach(query => {
            query.entities.forEach(entity => {
                const tile = entity.getComponent(TileComponent);
                const transform = entity.getComponent(TransformComponent);

                let targetScale = tile.hovered
                    ? HoverScale
                    : FullSizeScale;

                if (tile.ownedBy !== -1) {
                    targetScale = TakenScale;
                }

                targetScale = lerp(transform.scale.x, targetScale, delta * this.animationSpeed);

                transform.scale.x = targetScale;
                transform.scale.y = targetScale;
            });
        });
    }
}