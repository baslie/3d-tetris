export function setupInput(callbacks) {
  const { move, rotate, hardDrop, softDropStart, softDropEnd, pause, toggleHelp } = callbacks;

  const rotationAxes = ['y', 'x', 'z'];
  let rotationAxisIndex = 0;

  function rotateCycle() {
    rotate(rotationAxes[rotationAxisIndex], 1);
    rotationAxisIndex = (rotationAxisIndex + 1) % 3;
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyH') { toggleHelp(); return; }
    if (e.code === 'Escape') { pause(); return; }

    switch (e.code) {
      case 'ArrowLeft':  move(-1, 0, 0); break;
      case 'ArrowRight': move(1, 0, 0); break;
      case 'ArrowUp':    move(0, 0, -1); break;
      case 'ArrowDown':  move(0, 0, 1); break;
      case 'KeyR': rotateCycle(); break;
      case 'Space': hardDrop(); break;
      case 'ShiftLeft':
      case 'ShiftRight':
        softDropStart();
        break;
    }
    if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(e.code)) e.preventDefault();
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') softDropEnd();
  });

  // Touch-контролы
  document.getElementById('touch-controls').addEventListener('pointerdown', (e) => {
    const act = e.target.dataset.act;
    if (!act) return;
    e.preventDefault();
    if (act === 'pause') { pause(); return; }

    switch (act) {
      case 'left':  move(-1, 0, 0); break;
      case 'right': move(1, 0, 0); break;
      case 'up':    move(0, 0, -1); break;
      case 'down':  move(0, 0, 1); break;
      case 'rot':   rotateCycle(); break;
      case 'drop':  hardDrop(); break;
    }
  });
}
