const motion = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');

for (const surface of document.querySelectorAll('.hero, .card')) {
  let frame = 0;
  let targetX = 0.62;
  let targetY = 0.45;
  let x = targetX;
  let y = targetY;

  function animate() {
    x += (targetX - x) * 0.16;
    y += (targetY - y) * 0.16;
    surface.style.setProperty('--mx', `${x * 100}%`);
    surface.style.setProperty('--my', `${y * 100}%`);
    surface.style.setProperty('--tx', `${(x - 0.62) * 32}px`);
    surface.style.setProperty('--ty', `${(y - 0.45) * 24}px`);
    const moving = Math.abs(targetX - x) + Math.abs(targetY - y) > 0.002;
    frame = moving ? requestAnimationFrame(animate) : 0;
  }

  surface.addEventListener('pointermove', (event) => {
    if (!motion.matches || event.pointerType === 'touch') return;
    const bounds = surface.getBoundingClientRect();
    targetX = (event.clientX - bounds.left) / bounds.width;
    targetY = (event.clientY - bounds.top) / bounds.height;
    if (!frame) frame = requestAnimationFrame(animate);
  });

  surface.addEventListener('pointerleave', () => {
    if (!motion.matches) return;
    targetX = 0.62;
    targetY = 0.45;
    if (!frame) frame = requestAnimationFrame(animate);
  });

  motion.addEventListener('change', () => {
    cancelAnimationFrame(frame);
    frame = 0;
    x = targetX = 0.62;
    y = targetY = 0.45;
    for (const property of ['--mx', '--my', '--tx', '--ty']) surface.style.removeProperty(property);
  });
}
