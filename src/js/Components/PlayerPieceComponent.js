import Component from "enjine/src/js/enjine/ecs/Component";
import RendererComponent from "enjine/src/js/enjine/components/RendererComponent";
import Vector from "enjine/src/js/enjine/math/Vector";

export default class PlayerPieceComponent extends Component {
    taken = false;
    startPosition = new Vector();

    /**
     * The allocated tile
     * @type {TileComponent|null}
     */
    tile = null;

    get size() {
        return this.entity.transform.scale.x;
    }

    set size(value) {
        this.entity.transform.scale.x = value;
        this.entity.transform.scale.y = value;
    }

    rememberStartPosition() {
        this.startPosition.x = this.entity.transform.position.x;
        this.startPosition.y = this.entity.transform.position.y;
    }

}