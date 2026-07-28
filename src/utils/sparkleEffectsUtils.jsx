export const createBorderSparkEffect = (
    rowIndex,
    highlightedRowRefs,
    particleIntervalsRef
) => {
    const rowElement = highlightedRowRefs.current[rowIndex];
    if (!rowElement) return;

    const canvas = document.createElement("canvas");
    const EFFECT_MARGIN = 40;
    canvas.width = rowElement.offsetWidth + EFFECT_MARGIN * 2;
    canvas.height = rowElement.offsetHeight + EFFECT_MARGIN * 2;
    canvas.style.position = "absolute";
    canvas.style.left = `-${EFFECT_MARGIN}px`;
    canvas.style.top = `-${EFFECT_MARGIN}px`;
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "4";
    canvas.classList.add("canvas-border-sparkle-animation");

    rowElement.style.position = "relative";
    rowElement.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    const particles = [];
    const rowWidth = rowElement.offsetWidth;
    const rowHeight = rowElement.offsetHeight;

    class BorderParticle {
        constructor() {
            this.edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
            if (this.edge === 0) {
                this.x = EFFECT_MARGIN + Math.random() * rowWidth;
                this.y = EFFECT_MARGIN;
            } else if (this.edge === 1) {
                this.x = EFFECT_MARGIN + rowWidth;
                this.y = EFFECT_MARGIN + Math.random() * rowHeight;
            } else if (this.edge === 2) {
                this.x = EFFECT_MARGIN + Math.random() * rowWidth;
                this.y = EFFECT_MARGIN + rowHeight;
            } else {
                this.x = EFFECT_MARGIN;
                this.y = EFFECT_MARGIN + Math.random() * rowHeight;
            }
            const angle = this.calculateAngle();
            const speed = Math.random() * 1 + 0.5;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.size = Math.random() * 2.5 + 1;
            this.lifespan = Math.random() * 22;
            const hue = Math.random() * 20;
            const brightness = Math.random() * 20 + 80;
            this.color = `hsl(${hue}, 100%, ${brightness}%)`;
            this.opacity = Math.random() * 0.4 + 0.6;
        }

        calculateAngle() {
            if (this.edge === 0)
                return Math.PI * 1.5 + (Math.random() * 0.5 - 0.25);
            if (this.edge === 1)
                return 0 + (Math.random() * 0.5 - 0.25);
            if (this.edge === 2)
                return Math.PI * 0.5 + (Math.random() * 0.5 - 0.25);
            return Math.PI + (Math.random() * 0.5 - 0.25);
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.lifespan--;
            this.opacity -= 0.01;
            this.size -= 0.05;
        }

        draw(ctx) {
            if (this.isAlive()) {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = this.color;
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        isAlive() {
            return this.lifespan > 0 && this.size > 0 && this.opacity > 0;
        }
    }

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (Math.random() < 0.3) {
            for (let i = 0; i < 5; i++) {
                particles.push(new BorderParticle());
            }
        }
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw(ctx);
            if (!particles[i].isAlive()) {
                particles.splice(i, 1);
                i--;
            }
        }
    };

    const interval = setInterval(animate, 1000 / 20);
    particleIntervalsRef.current[rowIndex] = interval;

    return () => {
        clearInterval(interval);
        if (rowElement && rowElement.contains(canvas)) {
            rowElement.removeChild(canvas);
        }
    };
};

export const createSparklesForRow = (
    rowIndex,
    highlightedRowRefs,
    sparkleIntervalsRef
) => {
    const rowElement = highlightedRowRefs.current[rowIndex];
    if (!rowElement) return;

    const createSparkle = () => {
        const sparkle = document.createElement("div");
        const width = rowElement.offsetWidth;
        const height = rowElement.offsetHeight;
        const left = Math.random() * width;
        const top = Math.random() * height;

        sparkle.style.position = "absolute";
        sparkle.style.width = "5px";
        sparkle.style.height = "5px";
        sparkle.style.background = "rgba(255, 255, 255, 0.6)";
        sparkle.style.borderRadius = "50%";
        sparkle.style.left = `${left}px`;
        sparkle.style.top = `${top}px`;
        sparkle.style.pointerEvents = "none";
        sparkle.style.zIndex = "10";
        sparkle.classList.add("background-sparkle-animation");

        const animation = sparkle.animate(
            [
                { opacity: 0, transform: "scale(0.2)" },
                { opacity: 1, transform: "scale(1)" },
                { opacity: 0, transform: "scale(0.2)" },
            ],
            {
                duration: 2400,
                easing: "ease-in-out",
                fill: "forwards",
            }
        );

        rowElement.appendChild(sparkle);
        animation.onfinish = () => {
            if (sparkle.parentNode === rowElement) {
                rowElement.removeChild(sparkle);
            }
        };
    };

    // Tạo các sparkles ban đầu
    for (let i = 0; i < 50; i++) {
        setTimeout(createSparkle, i * 400);
    }
    const interval = setInterval(createSparkle, 400);
    sparkleIntervalsRef.current[rowIndex] = interval;

    return () => {
        clearInterval(interval);
        const sparkles = rowElement.querySelectorAll(".background-sparkle-animation");
        sparkles.forEach((sparkle) => rowElement.removeChild(sparkle));
    };
};

export const changeBgAndApplyEffects = (
    rowIndices,
    highlightedRowRefs,
    particleIntervalsRef,
    sparkleIntervalsRef
) => {
    setTimeout(() => {
        rowIndices.forEach((rowIndex) => {
            const rowSelector = `.MuiDayCalendar-weekContainer[aria-rowindex="${rowIndex}"]`;
            const rowElement = document.querySelector(rowSelector);
            if (rowElement) {
                highlightedRowRefs.current[rowIndex] = rowElement;
                rowElement.classList.add("streak-highlighted-row-glow");
                createBorderSparkEffect(rowIndex, highlightedRowRefs, particleIntervalsRef);
                createSparklesForRow(rowIndex, highlightedRowRefs, sparkleIntervalsRef);
            }
        });
    }, 200);
};

export const changeBlurBgAndApplyEffects = (rowIndices, highlightedRowRefs) => {
    setTimeout(() => {
        rowIndices.forEach((rowIndex) => {
            const rowSelector = `.MuiDayCalendar-weekContainer[aria-rowindex="${rowIndex}"]`;
            const rowElement = document.querySelector(rowSelector);
            if (rowElement) {
                highlightedRowRefs.current[rowIndex] = rowElement;
                rowElement.classList.add("streak-highlighted-row-blur-glow");
            }
        });
    }, 100);
};

export const cleanupEffects = (
    highlightedRowRefs,
    particleIntervalsRef,
    sparkleIntervalsRef
) => {
    Object.keys(particleIntervalsRef.current).forEach((rowIndex) => {
        if (particleIntervalsRef.current[rowIndex]) {
            clearInterval(particleIntervalsRef.current[rowIndex]);
        }
    });
    Object.keys(sparkleIntervalsRef.current).forEach((rowIndex) => {
        if (sparkleIntervalsRef.current[rowIndex]) {
            clearInterval(sparkleIntervalsRef.current[rowIndex]);
        }
    });
    Object.keys(highlightedRowRefs.current).forEach((rowIndex) => {
        const rowElement = highlightedRowRefs.current[rowIndex];
        if (rowElement) {
            const canvases = Array.from(
                rowElement.querySelectorAll(".canvas-border-sparkle-animation")
            );
            canvases.forEach((canvas) => rowElement.removeChild(canvas));
            const sparkles = Array.from(
                rowElement.querySelectorAll(".background-sparkle-animation")
            );
            sparkles.forEach((sparkle) => rowElement.removeChild(sparkle));
            rowElement.classList.remove("streak-highlighted-row-glow");
            rowElement.classList.remove("streak-highlighted-row-blur-glow");
        }
    });
};