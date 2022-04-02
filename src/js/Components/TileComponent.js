import Component from "enjine/src/js/enjine/ecs/Component";
import ImageRendererComponent from "enjine/src/js/enjine/components/renderer-components/ImageRendererComponent";
import {DefaultTileColor, FullSizeScale, PlayerImages} from "../defines";



export default class TileComponent extends Component {
    ownedBy = -1;
    hovered = false;

    take(player) {
        this.hovered = false;

        if (player === null) {
            this.ownedBy = -1;
            this.hovered = false;
            this.entity.getComponent(ImageRendererComponent).color = DefaultTileColor;
            this.entity.getComponent(ImageRendererComponent).setImage(PlayerImages[2]);
            this.entity.transform.scale.x = FullSizeScale;
            this.entity.transform.scale.y = FullSizeScale;
            return;
        }

        if (this.ownedBy !== -1) {
            console.warn('This tile is already owned...')
            return false;
        }

        this.ownedBy = player;

        /** @type {ImageRendererComponent} */
        const imageRenderer = this.entity.getComponent(ImageRendererComponent);

        // imageRenderer.color = PlayerColors[player];
        imageRenderer.setImage(PlayerImages[player]);
    }

    setImage(imageKey) {
        this.entity.world.resourceManager.loadImage(imageKey)
            .then(image => {
                this.image = image;
                this.updateBounds();
            })
            .catch(error => console.warn('Failed to load image: ' + imageKey, error));
    }

    //ideally enjine would handle this itself, but that's not in there yet...
    updateBounds() {
        if (!this.image) {
            console.warn('ImageRendererComponent: No image set to update bounds with');
            return;
        }
        this.unscaledBounds.w = this.image.width * this.entity.transform.scale.x;
        this.unscaledBounds.h = this.image.height * this.entity.transform.scale.y;
    }
}