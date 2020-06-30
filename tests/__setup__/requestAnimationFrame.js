global.requestAnimationFrame = cb => setTimeout(cb, 0) && Math.round(Math.random() * 100);
