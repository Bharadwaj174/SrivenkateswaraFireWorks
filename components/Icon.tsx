
import React, { useState, useEffect } from 'react';
import { 
  LucideProps, 
  Crown, 
  Shield, 
  Sparkles, 
  Bird, 
  Rocket,
  Rainbow,
  Flame,
  Sun,
  // New icons for better fallbacks
  Bomb,
  Box,
  Flower,
  Star,
  Loader,
  Circle,
  Waves,
  Target
} from 'lucide-react';

// FIX: Changed from 'interface extends' to a type intersection '&' to fix prop type inference issues. This ensures that IconProps correctly inherits properties like className and style from LucideProps.
type IconProps = LucideProps & {
  name: string;
};

// Map of brand name substrings to Lucide components for better fallbacks
const brandIconMap: { [key: string]: React.ComponentType<LucideProps> } = {
  coronation: Crown,
  standard: Shield,
  sony: Sparkles,
  cock: Bird,
  peacock: Bird,
  vanavil: Rainbow,
  horse: Flame,
  sun: Sun,
  suriyan: Sun,
  // New mappings to provide better fallbacks for generic firework icons
  sparkler: Sparkles,
  fountain: Waves,
  bomb: Bomb,
  cracker: Box,
  deepam: Flame,
  flower: Flower,
  shot: Target,
  rocket: Rocket,
  spinner: Loader,
  burst: Star,
  comet: Star,
  star: Star,
  wheel: Circle,
};

/**
 * Determines the appropriate fallback icon component based on the icon name.
 * It extracts the brand name from the path and checks against the map.
 * @param name The original icon name or path.
 * @returns A Lucide icon component.
 */
const getFallbackIcon = (name: string): React.ComponentType<LucideProps> => {
    const brandName = name.split('/').pop()?.split('.')[0] || '';
    for (const key in brandIconMap) {
        if (brandName.includes(key)) {
            return brandIconMap[key];
        }
    }
    return Rocket; // Default thematic fallback
};


const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const [hasError, setHasError] = useState(false);
  
  // Reset error state if the icon name changes
  useEffect(() => {
    setHasError(false);
  }, [name]);

  // If the name is a path to our assets, try to render an image.
  if (name && name.startsWith('/assets/icons/') && !hasError) {
    return (
      <img
        src={name}
        alt={`${name.split('/').pop()?.split('.')[0] || 'brand'} icon`}
        className={props.className}
        style={{ ...(props.style || {}), color: 'transparent' }}
        onError={() => setHasError(true)}
      />
    );
  }

  // Determine which fallback icon to render on image error or if it's not an asset path.
  const FallbackIcon = getFallbackIcon(name);

  return <FallbackIcon {...props} />;
};

export default Icon;
