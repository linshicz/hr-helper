// Canvas confetti generator for celebration moments
export function fireConfetti(durationMs: number = 3000) {
  if (typeof window === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const handleResize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener('resize', handleResize);

  const colors = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
    '#EC4899', '#F97316', '#06B6D4', '#EAB308'
  ];

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rotation: number;
    rotationSpeed: number;
    shape: 'rect' | 'circle';
    opacity: number;
  }

  const particles: Particle[] = [];
  const particleCount = Math.min(180, Math.floor(width / 8));

  // Spawn from two sides or center burst
  for (let i = 0; i < particleCount; i++) {
    const isLeft = i % 2 === 0;
    particles.push({
      x: isLeft ? width * 0.2 + (Math.random() * 0.2 - 0.1) * width : width * 0.8 + (Math.random() * 0.2 - 0.1) * width,
      y: height * 0.45,
      vx: (isLeft ? 1 : -1) * (Math.random() * 9 + 4) + (Math.random() * 6 - 3),
      vy: -(Math.random() * 14 + 8),
      size: Math.random() * 9 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      shape: Math.random() > 0.3 ? 'rect' : 'circle',
      opacity: 1
    });
  }

  const startTime = Date.now();
  let animationId: number;

  const render = () => {
    const elapsed = Date.now() - startTime;
    ctx.clearRect(0, 0, width, height);

    let activeParticles = 0;

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.vx *= 0.985; // air resistance
      p.rotation += p.rotationSpeed;

      if (elapsed > durationMs - 1000) {
        p.opacity = Math.max(0, p.opacity - 0.02);
      }

      if (p.opacity > 0 && p.y < height + 50) {
        activeParticles++;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    });

    if (elapsed < durationMs && activeParticles > 0) {
      animationId = requestAnimationFrame(render);
    } else {
      window.removeEventListener('resize', handleResize);
      canvas.remove();
    }
  };

  animationId = requestAnimationFrame(render);
}
