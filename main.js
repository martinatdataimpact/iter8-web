// Email signup handler
function handleSignup(e) {
  e.preventDefault();
  const email = document.getElementById('signup-email').value.trim();
  if (!email) return false;

  // Send to Google Sheets
  fetch('https://script.google.com/macros/s/AKfycbx6OuZpeCFDUPBGqIYXpw9_AOE9OliaoWi35ci3EiNxlDCkoJ1ErmhZujVb9K-83TQo/exec', {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ email }),
  }).catch(() => {});

  // Show confirmation, hide form
  document.getElementById('signup-form').hidden = true;
  document.getElementById('signup-thanks').hidden = false;

  return false;
}
