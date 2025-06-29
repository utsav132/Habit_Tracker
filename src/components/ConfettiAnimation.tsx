import React, { useEffect, useState } from 'react';

interface ConfettiAnimationProps {
  show: boolean;
  onComplete: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  gravity: number;
  life: number;
  maxLife: number;
}

const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({ show, onComplete }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (show) {
      const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#84CC16'];
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      // Create fountain-style particles
      const newParticles: Particle[] = Array.from({ length: 80 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 80 + (Math.random() - 0.5) * 0.5;
        const velocity = 8 + Math.random() * 12;
        const life = 3000 + Math.random() * 2000;
        
        return {
          id: i,
          x: centerX + (Math.random() - 0.5) * 100,
          y: centerY + 50,
          vx: Math.cos(angle) * velocity * (0.7 + Math.random() * 0.6),
          vy: Math.sin(angle) * velocity * (0.8 + Math.random() * 0.4) - Math.random() * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          scale: 0.6 + Math.random() * 0.8,
          gravity: 0.3 + Math.random() * 0.2,
          life,
          maxLife: life,
        };
      });
      
      setParticles(newParticles);
      
      // Animate particles
      const animateParticles = () => {
        setParticles(prevParticles => {
          const updatedParticles = prevParticles.map(particle => {
            const newParticle = {
              ...particle,
              x: particle.x + particle.vx,
              y: particle.y + particle.vy,
              vx: particle.vx * 0.99, // Air resistance
              vy: particle.vy + particle.gravity,
              rotation: particle.rotation + particle.rotationSpeed,
              life: particle.life - 16, // Assuming 60fps
            };
            
            // Bounce off edges
            if (newParticle.x < 0 || newParticle.x > window.innerWidth) {
              newParticle.vx *= -0.7;
              newParticle.x = Math.max(0, Math.min(window.innerWidth, newParticle.x));
            }
            
            return newParticle;
          }).filter(particle => particle.life > 0);
          
          if (updatedParticles.length === 0) {
            onComplete();
            return [];
          }
          
          return updatedParticles;
        });
      };
      
      const interval = setInterval(animateParticles, 16);
      
      return () => {
        clearInterval(interval);
        setParticles([]);
      };
    } else {
      // Clear particles immediately when show is false
      setParticles([]);
    }
  }, [show, onComplete]);

  if (!show || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => {
        const opacity = Math.max(0, particle.life / particle.maxLife);
        return (
          <div
            key={particle.id}
            className="absolute w-3 h-3 rounded-sm"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              backgroundColor: particle.color,
              transform: `rotate(${particle.rotation}deg) scale(${particle.scale})`,
              opacity,
              boxShadow: `0 0 6px ${particle.color}40`,
            }}
          />
        );
      })}
    </div>
  );
};

export default ConfettiAnimation;