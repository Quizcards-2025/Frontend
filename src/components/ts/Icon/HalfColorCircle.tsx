import React from "react";

interface HalfColorCircleProps {
    diameter?: number; // Đường kính (tùy chọn, có giá trị mặc định)
    color?: string;    // Màu sắc (tùy chọn, có giá trị mặc định)
    strokeWidth?: number; // Độ dày đường viền (tùy chọn, có giá trị mặc định)
    halfOpacity?: number; // Độ mờ của nửa bên trái (tùy chọn, có giá trị mặc định)
    darkPercentage?: number;
}

const HalfColorCircle: React.FC<HalfColorCircleProps> = ({
                                                             diameter = 40,     // Giá trị mặc định cho diameter
                                                             color = "green",   // Giá trị mặc định cho color
                                                             strokeWidth = 8,   // Giá trị mặc định cho strokeWidth
                                                             halfOpacity = 0.4, // Giá trị mặc định cho halfOpacity
                                                             darkPercentage = 50,
                                                         }) => {
    // Đảm bảo darkPercentage nằm trong khoảng 0-100
    const clampedPercentage = Math.max(0, Math.min(100, darkPercentage));
    // Đảm bảo lightPartCustomOpacity nằm trong khoảng 0-1
    const clampedLightOpacity = Math.max(0, Math.min(1, halfOpacity));

    // Bán kính của hình tròn
    const radius: number = diameter / 2;
    // Bán kính hiệu dụng (tính cả độ dày đường viền)
    const effectiveRadius: number = radius - strokeWidth / 2;

    // Tọa độ tâm X, Y cho viewBox của SVG
    const centerX_svg: number = radius;
    const centerY_svg: number = radius;

    // Điểm bắt đầu của các cung (vị trí 12 giờ)
    const startPointX: number = centerX_svg;
    const startPointY: number = centerY_svg - effectiveRadius;

    // Nếu bán kính hiệu dụng không dương (ví dụ: strokeWidth lớn hơn hoặc bằng diameter), không vẽ gì cả
    if (effectiveRadius <= 0) {
        return <svg width={diameter} height={diameter} viewBox={`0 0 ${diameter} ${diameter}`} />;
    }

    // --- Tính toán cho cung màu đậm ---
    // Góc quét của cung màu đậm (tính bằng radian)
    const sweepAngleDarkRad = (clampedPercentage / 100) * 2 * Math.PI;

    // Điểm kết thúc của cung màu đậm
    // Sử dụng Math.sin và Math.cos để tính toán tọa độ điểm kết thúc
    // Góc trong SVG được tính từ trục X dương, chiều kim đồng hồ
    // Để bắt đầu từ 12 giờ, chúng ta cần điều chỉnh góc hoặc cách tính tọa độ
    // x = cx + r * sin(angle), y = cy - r * cos(angle) (với angle từ 0 ở 12 giờ, tăng theo chiều kim đồng hồ)
    let endPointDarkX: number;
    let endPointDarkY: number;

    // Xử lý trường hợp đặc biệt khi là vòng tròn đầy (0% hoặc 100%) để đảm bảo điểm đầu và cuối trùng nhau
    if (clampedPercentage === 0 || clampedPercentage === 100) {
        endPointDarkX = startPointX;
        endPointDarkY = startPointY;
    } else {
        endPointDarkX = centerX_svg + effectiveRadius * Math.sin(sweepAngleDarkRad);
        endPointDarkY = centerY_svg - effectiveRadius * Math.cos(sweepAngleDarkRad);
    }

    // Cờ large-arc-flag: 1 nếu cung lớn hơn 180 độ, ngược lại là 0
    const largeArcFlagDark = sweepAngleDarkRad > Math.PI ? 1 : 0;
    // Dữ liệu path cho cung màu đậm
    const darkArcPath = `M ${startPointX} ${startPointY} A ${effectiveRadius} ${effectiveRadius} 0 ${largeArcFlagDark} 1 ${endPointDarkX} ${endPointDarkY}`;

    // --- Tính toán cho cung màu nhạt ---
    // Góc quét của cung màu nhạt
    const sweepAngleLightRad = ((100 - clampedPercentage) / 100) * 2 * Math.PI;
    const largeArcFlagLight = sweepAngleLightRad > Math.PI ? 1 : 0;

    // Dữ liệu path cho cung màu nhạt
    // Cung này bắt đầu từ điểm kết thúc của cung đậm (endPointDarkX, endPointDarkY)
    // và kết thúc tại điểm bắt đầu ban đầu (startPointX, startPointY)
    const lightArcPath = `M ${endPointDarkX} ${endPointDarkY} A ${effectiveRadius} ${effectiveRadius} 0 ${largeArcFlagLight} 1 ${startPointX} ${startPointY}`;

    return (
        <svg width={diameter} height={diameter} viewBox={`0 0 ${diameter} ${diameter}`}>
            {/* Vẽ cung màu đậm nếu tỷ lệ > 0% */}
            {clampedPercentage > 0 && (
                <path
                    d={darkArcPath}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    opacity={1} // Phần đậm luôn có opacity là 1
                />
            )}

            {/* Vẽ cung màu nhạt nếu tỷ lệ < 100% */}
            {clampedPercentage < 100 && (
                <path
                    d={lightArcPath}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    opacity={clampedLightOpacity} // Sử dụng độ mờ tùy chỉnh đã được clamp
                />
            )}
        </svg>
    );
};

export default HalfColorCircle;