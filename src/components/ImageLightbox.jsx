import { useEffect, useRef } from 'react';

function ImageLightbox({ image, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!image) return undefined;
    closeRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [image, onClose]);

  if (!image) return null;
  return (
    <div className="image-lightbox" role="presentation" onClick={onClose}>
      <section
        className="image-lightbox-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`Agrandissement : ${image.alt}`}
        onClick={(event) => event.stopPropagation()}
      >
        <button ref={closeRef} className="overlay-close" type="button" onClick={onClose} aria-label="Fermer l’image agrandie">×</button>
        <img src={image.url} alt={image.alt} />
        <div className="image-lightbox-caption">
          <strong>{image.caption || image.alt}</strong>
          <span>{image.credit}{image.license ? ` · ${image.license}` : ''}</span>
          {image.source?.url && <a href={image.source.url} target="_blank" rel="noopener noreferrer">Voir la source de l’image</a>}
        </div>
      </section>
    </div>
  );
}

export default ImageLightbox;
