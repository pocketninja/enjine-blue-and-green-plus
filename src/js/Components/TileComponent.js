import Component from "enjine/src/js/enjine/ecs/Component";
import ImageRendererComponent from "enjine/src/js/enjine/components/renderer-components/ImageRendererComponent";
import {DefaultTileColor, TileMarkerFullSizeScale, PlayerImages} from "../defines";


export default class TileComponent extends Component {
    /**
     * Who owns it?
     * @type {number}
     */
    ownedBy = -1;

    /**
     * Is it hovered?
     * @type {boolean}
     */
    hovered = false;

    /**
     * pieces currently allocated to this tile
     * @type {PlayerPieceComponent[]}
     */
    allocatedPieces = [];

    /**
     * Attempt to take a tile for a player. If there is an available piece
     * larger than the current piece on the tile, it is successful.
     *
     * @param {number} player
     * @param {PlayerPieceComponent[]} playersAvailablePieces
     * @returns {boolean}
     */
    take(player, playersAvailablePieces = []) {
        this.hovered = false;

        if (player === null) {
            this.ownedBy = -1;
            this.hovered = false;
            this.allocatedPieces = [];
            this.entity.getComponent(ImageRendererComponent).color = DefaultTileColor;
            this.entity.getComponent(ImageRendererComponent).setImage(PlayerImages[2]);
            this.entity.transform.scale.x = TileMarkerFullSizeScale;
            this.entity.transform.scale.y = TileMarkerFullSizeScale;
            return;
        }

        if (this.ownedBy === player) {
            console.warn('Cannot take a tile you already own! Naughty player', player);
            return false;
        }

        if (playersAvailablePieces.length === 0) {
            console.warn('Tried to take with no avail pieces!');
            return false;
        }

        //get the largest size
        let largestTileSize = this.allocatedPieces.length > 0
            ? this.allocatedPieces
                .map(piece => piece.size)
                .reduce((a, b) => Math.max(a.size, b.size))
            : 0;

        //sort available pieces, no allocations, smallest first
        const pieces = playersAvailablePieces
            .filter(piece => piece.tile === null)
            .sort((a, b) => a.size - b.size);

        //get an available piece that is larger than the largest size currently allocated
        let availablePiece = null;
        for (let i = 0; i < pieces.length; i++) {
            if (pieces[i].size > largestTileSize) {
                availablePiece = pieces[i];
                break;
            }
        }

        if (!availablePiece) {
            console.warn('No pieces available to take over the current piece, which has size of', largestTileSize);
            return false;
        }

        this.ownedBy = player;

        /** @type {ImageRendererComponent} */
        const imageRenderer = this.entity.getComponent(ImageRendererComponent);
        imageRenderer.setImage(PlayerImages[player]);

        this.allocatedPieces.push(availablePiece);
        availablePiece.tile = this;

        return true;
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