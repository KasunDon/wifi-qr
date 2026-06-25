const form = document.getElementById('wifi-form');
const securitySelect = document.getElementById('security');
const passwordInput = document.getElementById('password');
const passwordLabel = document.getElementById('password-label');
const togglePasswordBtn = document.getElementById('toggle-password');
const resultEl = document.getElementById('result');
const qrImage = document.getElementById('qr-image');
const downloadLink = document.getElementById('download-link');
const errorEl = document.getElementById('error');
const generateBtn = document.getElementById('generate-btn');

securitySelect.addEventListener('change', () => {
  const isOpen = securitySelect.value === 'nopass';
  passwordInput.disabled = isOpen;
  passwordInput.required = !isOpen;
  passwordInput.value = isOpen ? '' : passwordInput.value;
  passwordLabel.style.opacity = isOpen ? 0.5 : 1;
});

togglePasswordBtn.addEventListener('click', () => {
  const showing = passwordInput.type === 'text';
  passwordInput.type = showing ? 'password' : 'text';
  togglePasswordBtn.textContent = showing ? 'Show password' : 'Hide password';
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorEl.classList.add('hidden');
  resultEl.classList.add('hidden');
  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating...';

  const payload = {
    ssid: document.getElementById('ssid').value,
    password: passwordInput.value,
    security: securitySelect.value,
    hidden: document.getElementById('hidden').checked,
  };

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong.');
    }

    qrImage.src = data.dataUrl;
    downloadLink.href = data.dataUrl;
    resultEl.classList.remove('hidden');
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate QR Code';
  }
});
