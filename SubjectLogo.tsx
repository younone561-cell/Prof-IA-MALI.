import React from 'react';
import { 
  Calculator, 
  Zap, 
  FlaskConical, 
  BookOpen, 
  Landmark, 
  Globe2, 
  Languages, 
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { SubjectId } from '../types';
import { SUBJECTS } from '../data/subjects';

interface SubjectLogoProps {
  subjectId: SubjectId | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'solid' | 'subtle' | 'outline' | 'ghost' | 'plain';
  className?: string;
}

export const getSubjectIcon = (subjectId: string) => {
  switch (subjectId) {
    case 'maths':
      return Calculator;
    case 'physique':
      return Zap;
    case 'chimie':
      return FlaskConical;
    case 'francais':
      return BookOpen;
    case 'histoire':
      return Landmark;
    case 'geographie':
      return Globe2;
    case 'anglais':
      return Languages;
    default:
      return GraduationCap;
  }
};

export const SubjectLogo: React.FC<SubjectLogoProps> = ({
  subjectId,
  size = 'md',
  variant = 'subtle',
  className = ''
}) => {
  const IconComponent = getSubjectIcon(subjectId);
  const subjectInfo = SUBJECTS[subjectId as SubjectId];

  const sizeClasses = {
    xs: { container: 'w-5 h-5 rounded-md', icon: 'w-3 h-3' },
    sm: { container: 'w-7 h-7 rounded-lg', icon: 'w-4 h-4' },
    md: { container: 'w-9 h-9 rounded-xl', icon: 'w-5 h-5' },
    lg: { container: 'w-12 h-12 rounded-2xl', icon: 'w-6 h-6' },
    xl: { container: 'w-16 h-16 rounded-3xl', icon: 'w-8 h-8' }
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  if (variant === 'plain') {
    return (
      <IconComponent 
        className={`${currentSize.icon} ${subjectInfo ? subjectInfo.color : 'text-slate-700'} ${className}`} 
      />
    );
  }

  const getVariantClasses = () => {
    if (!subjectInfo) return 'bg-slate-100 text-slate-700 border-slate-200';
    
    switch (variant) {
      case 'solid':
        return `bg-gradient-to-br from-${subjectId === 'maths' ? 'emerald' : subjectId === 'physique' ? 'amber' : subjectId === 'chimie' ? 'teal' : subjectId === 'francais' ? 'indigo' : subjectId === 'histoire' ? 'rose' : subjectId === 'geographie' ? 'cyan' : 'blue'}-600 to-slate-900 text-white shadow-sm`;
      case 'outline':
        return `bg-white ${subjectInfo.color} border-2 ${subjectInfo.borderColor} shadow-2xs`;
      case 'ghost':
        return `bg-transparent ${subjectInfo.color}`;
      case 'subtle':
      default:
        return `${subjectInfo.bgColor} ${subjectInfo.color} border ${subjectInfo.borderColor}`;
    }
  };

  return (
    <div 
      className={`inline-flex items-center justify-center shrink-0 transition-transform ${currentSize.container} ${getVariantClasses()} ${className}`}
      title={subjectInfo?.name || subjectId}
    >
      <IconComponent className={currentSize.icon} />
    </div>
  );
};

interface SubjectBadgeProps {
  subjectId: SubjectId | string;
  showIcon?: boolean;
  showShortName?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const SubjectBadge: React.FC<SubjectBadgeProps> = ({
  subjectId,
  showIcon = true,
  showShortName = false,
  size = 'sm',
  className = ''
}) => {
  const subjectInfo = SUBJECTS[subjectId as SubjectId];
  const IconComponent = getSubjectIcon(subjectId);

  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-1 rounded-md',
    sm: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg',
    md: 'px-3 py-1.5 text-xs font-semibold gap-2 rounded-xl'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4'
  };

  const nameToDisplay = subjectInfo 
    ? (showShortName ? subjectInfo.shortName : subjectInfo.name) 
    : subjectId;

  return (
    <span 
      className={`inline-flex items-center font-bold transition-all ${subjectInfo ? `${subjectInfo.bgColor} ${subjectInfo.color} border ${subjectInfo.borderColor}` : 'bg-slate-100 text-slate-700 border-slate-200'} ${sizeStyles[size]} ${className}`}
    >
      {showIcon && <IconComponent className={`${iconSizes[size]} shrink-0`} />}
      <span className="truncate">{nameToDisplay}</span>
    </span>
  );
};
