import { Text } from 'react-konva';

interface PlantProps {
    index: number;
    parentWidth: number;
}

export default function Plant({ index, parentWidth }: PlantProps) {
    const spacing = 35;
    const padding = 10;
    const columns = Math.max(
        1,
        Math.floor((parentWidth - padding * 2) / spacing)
    );
    const x = padding + (index % columns) * spacing;
    const y = padding + Math.floor(index / columns) * spacing;

    return <Text text="🌱" fontSize={20} x={x} y={y} />;
}
