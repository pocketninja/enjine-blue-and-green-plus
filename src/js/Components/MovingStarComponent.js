import Component from "enjine/src/js/enjine/ecs/Component";

export default class MovingStarComponent extends Component {
    speed = Math.random() * 100;
}