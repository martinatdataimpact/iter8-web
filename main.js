// A script to morph the SVG paths to create an organic, slow-moving "white light" effect.
const path1 = document.getElementById('fluid');
const path2 = document.getElementById('fluid-2');

let time = 0;

function animateFluid() {
  time += 0.005; // Slow, elegant movement

  // Wave 1
  if (path1) {
    const points1 = [];
    for(let x = 0; x <= 100; x += 2) {
      const y = 30 + Math.sin(x * 0.05 + time) * 15 + Math.cos(time * 0.5) * 5;
      points1.push(`${x},${y}`);
    }
    
    let d1 = `M0,100 L0,${points1[0].split(',')[1]} `;
    for(let i = 1; i < points1.length; i++){
        d1 += `L${points1[i]} `;
    }
    d1 += `L100,100 Z`;
    path1.setAttribute('d', d1);
  }

  // Wave 2
  if (path2) {
    const points2 = [];
    for(let x = 0; x <= 100; x += 2) {
      const y = 45 + Math.sin(x * 0.03 - time) * 20 + Math.sin(time) * 10;
      points2.push(`${x},${y}`);
    }
    
    let d2 = `M0,100 L0,${points2[0].split(',')[1]} `;
    for(let i = 1; i < points2.length; i++){
        d2 += `L${points2[i]} `;
    }
    d2 += `L100,100 Z`;
    path2.setAttribute('d', d2);
  }

  requestAnimationFrame(animateFluid);
}

// Start moving SVG animation
animateFluid();

// Email signup handler
function handleSignup(e) {
  e.preventDefault();
  const email = document.getElementById('signup-email').value.trim();
  if (!email) return false;

  // Send to Google Sheets
  fetch('https://script.google.com/macros/s/AKfycbx6OuZpeCFDUPBGqIYXpw9_AOE9OliaoWi35ci3EiNxlDCkoJ1ErmhZujVb9K-83TQo/exec', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }).catch(() => {});

  // Show confirmation, hide form
  document.getElementById('signup-form').hidden = true;
  document.getElementById('signup-thanks').hidden = false;

  return false;
}
