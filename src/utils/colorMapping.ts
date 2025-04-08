export function getClosestColor([r, g, b]: number[], palette: string[]): number[] {
    let closestColor = [0, 0, 0];
    let minDistance = Infinity;

    for (const hex of palette) {
        const rgb = hexToRgb(hex);
        const distance = Math.sqrt(
            (rgb[0] - r) ** 2 + (rgb[1] - g) ** 2 + (rgb[2] - b) ** 2
        );

        if (distance < minDistance) {
            minDistance = distance;
            closestColor = rgb;
        }
    }

    return closestColor;
}

function hexToRgb(hex: string): number[] {
    const bigint = parseInt(hex.slice(1), 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}
