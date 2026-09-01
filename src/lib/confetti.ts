import confetti from 'canvas-confetti';

/**
 * Trigger cute Sakura & Star anime confetti animation
 */
export const triggerSakuraConfetti = () => {
  // Burst 1: Central Sakura pink & peach petals
  confetti({
    particleCount: 45,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#FF5277', '#FF6B8B', '#FFCCD7', '#FFAAB8', '#FFF0F3', '#FFD98E'],
    shapes: ['circle'],
    scalar: 1.1,
    ticks: 200,
    gravity: 0.8,
    drift: 0,
  });

  // Burst 2: Left & Right shimmering sparkles
  setTimeout(() => {
    confetti({
      particleCount: 25,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.7 },
      colors: ['#FF6B8B', '#D8B4FE', '#FFD98E', '#A7D8B0'],
      shapes: ['star', 'circle'],
      scalar: 0.9,
    });
    confetti({
      particleCount: 25,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.7 },
      colors: ['#FF5277', '#FFCCD7', '#D8B4FE', '#FFD98E'],
      shapes: ['star', 'circle'],
      scalar: 0.9,
    });
  }, 120);
};
