(function() {
  const script = document.currentScript;
  const botId = script.getAttribute('data-bot-id');
  if (!botId) {
    console.error('OmniBot: data-bot-id attribute is missing');
    return;
  }

  const baseUrl = new URL(script.src).origin;
  const iframe = document.createElement('iframe');
  
  iframe.src = `${baseUrl}/widget/${botId}`;
  iframe.style.position = 'fixed';
  iframe.style.bottom = '0';
  iframe.style.right = '0';
  iframe.style.width = '420px'; // Start with a size that fits the button + some padding
  iframe.style.height = '120px';
  iframe.style.border = 'none';
  iframe.style.zIndex = '999999';
  iframe.style.backgroundColor = 'transparent';
  iframe.allow = 'clipboard-write';
  iframe.id = 'omnibot-iframe';

  document.body.appendChild(iframe);

  window.addEventListener('message', (event) => {
    if (event.origin !== baseUrl) return;
    
    if (event.data === 'omnibot-open') {
      iframe.style.width = '420px';
      iframe.style.height = '620px';
    } else if (event.data === 'omnibot-close') {
      iframe.style.width = '420px';
      iframe.style.height = '120px';
    }
  });
})();
