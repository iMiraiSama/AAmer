import React from 'react';

const WhatsAppLink = () => {
  const phoneNumber = '+923242646659'; // Add the phone number in international format (without + or leading zeros)
  const message = encodeURIComponent('Hello! I am interested in your services.');

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <button onClick={handleWhatsAppClick} style={{ padding: '10px 20px', backgroundColor: '#25D366', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
      Contact on WhatsApp
    </button>
  );
};

export default WhatsAppLink;
