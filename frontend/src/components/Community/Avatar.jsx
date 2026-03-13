/**
 * Avatar – reusable circular avatar with DiceBear fallback.
 *
 * Props:
 *   src       – image URL (optional)
 *   name      – display name used for fallback seed
 *   size      – 'sm' (40px)  | 'md' (50px) | 'lg' (80px)  [default: 'sm']
 *   onClick   – click handler (optional)
 *   className – extra CSS classes (optional)
 */
export default function Avatar({ src, name = 'Farmer', size = 'sm', onClick, className = '' }) {
  // Static blue smile placeholder image
  const fallback = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23005c4b'/%3E%3Ccircle cx='35' cy='45' r='5' fill='white'/%3E%3Ccircle cx='65' cy='45' r='5' fill='white'/%3E%3Cpath d='M38 68 q12 8 24 0' stroke='white' stroke-width='4' fill='none' stroke-linecap='round'/%3E%3C/svg%3E";
  
  // Guard against empty strings which bypass || operator, and override legacy DiceBear URLs
  const isDicebear = typeof src === 'string' && src.includes('dicebear.com');
  const imgSrc = (src && typeof src === 'string' && src.trim() !== '' && !isDicebear) ? src : fallback;

  const sizeClass = size === 'lg' ? 'avatar lg' : size === 'md' ? 'avatar md' : 'avatar sm';
  const combinedClass = `${sizeClass} ${className}`.trim();

  if (onClick) {
    return (
      <button className="avatar-btn" onClick={onClick} type="button" title={`View ${name}'s profile`}>
        <img
          src={imgSrc}
          alt={name}
          className={combinedClass}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = fallback; }}
        />
      </button>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={name}
      className={combinedClass}
      loading="lazy"
      onError={(e) => { e.currentTarget.src = fallback; }}
    />
  );
}
