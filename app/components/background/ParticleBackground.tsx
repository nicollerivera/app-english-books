// app/components/background/ParticleBackground.tsx
"use client";

import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import type { Engine, Container } from "tsparticles-engine";

/**
 * ParticleBackground renders a subtle particle effect that reacts to scroll speed.
 * It uses tsparticles with a minimal configuration to avoid performance issues.
 */
export default function ParticleBackground() {
    const particlesInit = useCallback(async (engine: Engine) => {
        // you can initialize the tsParticles instance (engine) here, adding custom shapes or presets
        await loadFull(engine);
    }, []);

    const particlesLoaded = useCallback(async (container: Container | undefined) => {
        // you can access the particles container after it is loaded
        // console.log(container);
    }, []);

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            loaded={particlesLoaded}
            options={{
                background: {
                    color: { value: "transparent" },
                },
                fpsLimit: 60,
                interactivity: {
                    events: {
                        onHover: { enable: true, mode: "repulse" },
                        resize: true,
                    },
                    modes: {
                        repulse: { distance: 100, duration: 0.4 },
                    },
                },
                particles: {
                    color: { value: "#ffffff" },
                    links: { enable: false },
                    move: { direction: "none", enable: true, outModes: "bounce", speed: 0.5 },
                    number: { density: { enable: true, area: 800 }, value: 30 },
                    opacity: { value: 0.3 },
                    shape: { type: "circle" },
                    size: { value: { min: 1, max: 3 } },
                },
                detectRetina: true,
            }}
        />
    );
}
