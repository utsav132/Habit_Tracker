import { Ritual, Task, HabitItem } from '../types';

export const generateUniqueName = (
  baseName: string,
  existingItems: (Ritual | Task | HabitItem)[]
): string => {
  const existingNames = existingItems.map(item => item.name.toLowerCase());
  const baseNameLower = baseName.toLowerCase().trim();
  
  // If the name doesn't exist, return it as is
  if (!existingNames.includes(baseNameLower)) {
    return baseName.trim();
  }
  
  // Find the highest number suffix for this base name
  let highestNumber = 1;
  const basePattern = new RegExp(`^${escapeRegExp(baseNameLower)}\\s*(\\d+)?$`);
  
  existingNames.forEach(name => {
    const match = name.match(basePattern);
    if (match) {
      const number = match[1] ? parseInt(match[1]) : 1;
      highestNumber = Math.max(highestNumber, number);
    }
  });
  
  // Return the next available number
  return `${baseName.trim()} ${highestNumber + 1}`;
};

export const checkForDuplicateName = (
  name: string,
  existingItems: (Ritual | Task | HabitItem)[]
): boolean => {
  const existingNames = existingItems.map(item => item.name.toLowerCase());
  return existingNames.includes(name.toLowerCase().trim());
};

// Helper function to escape special regex characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}