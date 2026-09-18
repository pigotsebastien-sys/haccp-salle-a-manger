// Générer et injecter le favicon SVG dynamiquement
(function(){
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="14" fill="#1a2c4a"/>
    <text x="32" y="34" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-size="22" font-weight="900" fill="#ffffff">SP</text>
    <text x="32" y="50" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" font-weight="700" fill="#52B788">CONSEIL</text>
  </svg>`;
  const url='data:image/svg+xml,'+encodeURIComponent(svg);
  const link=document.createElement('link');
  link.rel='icon';link.type='image/svg+xml';link.href=url;
  document.head.appendChild(link);
  // Apple touch icon (180x180)
  const svg2=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
    <rect width="180" height="180" rx="38" fill="#1A3A5C"/>
    <text x="90" y="125" text-anchor="middle" font-size="100">🍽</text>
    <text x="90" y="160" text-anchor="middle" font-size="16" fill="#FFFFFF" font-family="Arial" font-weight="bold">HACCP</text>
  </svg>`;
  const url2='data:image/svg+xml,'+encodeURIComponent(svg2);
  const link2=document.createElement('link');
  link2.rel='apple-touch-icon';link2.href=url2;
  document.head.appendChild(link2);
})();
