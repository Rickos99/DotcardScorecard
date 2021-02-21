export const diceFaces = {
    0: {
        color: "",
        layout: [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ],
    },
    1: {
        color: "DeepSkyBlue",
        layout: [
            [0, 0, 0],
            [0, 1, 0],
            [0, 0, 0],
        ],
    },
    2: {
        color: "HotPink",
        layout: [
            [0, 0, 1],
            [0, 0, 0],
            [1, 0, 0],
        ],
    },
    3: {
        color: "Brown",
        layout: [
            [0, 0, 1],
            [0, 1, 0],
            [1, 0, 0],
        ],
    },
    4: {
        color: "White",
        layout: [
            [1, 0, 1],
            [0, 0, 0],
            [1, 0, 1],
        ],
    },
    5: {
        color: "Black",
        layout: [
            [1, 0, 1],
            [0, 1, 0],
            [1, 0, 1],
        ],
    },
    6: {
        color: "ForestGreen",
        layout: [
            [1, 0, 1],
            [1, 0, 1],
            [1, 0, 1],
        ],
    },
    7: {
        color: "Yellow",
        layout: [
            [1, 0, 1],
            [1, 1, 1],
            [1, 0, 1],
        ],
    },
    8: {
        color: "Purple",
        layout: [
            [1, 1, 1],
            [1, 0, 1],
            [1, 1, 1],
        ],
    },
    9: {
        color: "red",
        layout: [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1],
        ],
    },
};

/**
 * Generates a SVG element with the specified value
 * @param {Number} faceValue Value of diceface
 * @returns {SVGSVGElement} The generated SVG element
 */
export function generateDiceFace(faceValue) {
    const face = diceFaces[faceValue];
    const faceColor = face.color;
    const radius = 7;
    const margin = 2;
    const canvasSize = (radius * 2 + margin) * 3;

    const svgNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgNode.setAttributeNS(null, "viewBox", `0 0 ${canvasSize} ${canvasSize}`);

    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            if (face.layout[y][x] !== 1) continue;
            const centerX = radius * (x + 1) + x * (radius + margin) + 1;
            const centerY = radius * (y + 1) + y * (radius + margin) + 1;

            const circleNode = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circleNode.setAttributeNS(null, "stroke", "black");
            circleNode.setAttributeNS(null, "fill", faceColor);
            circleNode.setAttributeNS(null, "cx", centerX);
            circleNode.setAttributeNS(null, "cy", centerY);
            circleNode.setAttributeNS(null, "r", radius);
            svgNode.appendChild(circleNode);
        }
    }
    return svgNode;
}
