import React, { useState, useRef, useEffect } from 'react';
import type { CityItem } from '../types/api';

interface TreeDropdownProps {
  data: CityItem[];
  loading: boolean;
  placeholder: string;
  value: number;
  displayValue: string;
  onSelect: (value: number, label: string) => void;
  theme: any;
  isRTL: boolean;
  style?: React.CSSProperties;
  onBlur?: () => void;
}

interface FlattenedItem {
  value: number;
  text: string;
  label: string;
  countryText: string;
  countryLabel: string;
  isCountry: boolean;
}

const TreeDropdown: React.FC<TreeDropdownProps> = ({
  data,
  loading,
  placeholder,
  displayValue,
  onSelect,
  isRTL,
  style,
  onBlur
}) => {
  // CSS for hiding scrollbar in all browsers
  const hideScrollbarStyle = `
    .hide-scrollbar {
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE and Edge */
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none; /* Chrome, Safari, Opera */
    }
  `;

  // Add CSS to document head if not already added
  React.useEffect(() => {
    const styleId = 'hide-scrollbar-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = hideScrollbarStyle;
      document.head.appendChild(style);
    }
  }, []);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCountries, setExpandedCountries] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Flatten the tree structure for easier searching
  const flattenItems = (data: CityItem[]): FlattenedItem[] => {
    const flattened: FlattenedItem[] = [];
    
    data.forEach(country => {
      // Add country as a header (not selectable)
      flattened.push({
        value: parseInt(country.value),
        text: country.text || country.label,
        label: country.label,
        countryText: country.text || country.label,
        countryLabel: country.label,
        isCountry: true
      });
      
      // Add cities under this country
      country.children.forEach(city => {
        flattened.push({
          value: parseInt(city.value),
          text: city.text || city.label,
          label: city.label,
          countryText: country.text || country.label,
          countryLabel: country.label,
          isCountry: false
        });
      });
    });
    
    return flattened;
  };

  const flattenedItems = flattenItems(data);

  // Filter items based on search term
  const filteredItems = flattenedItems.filter(item => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (item.text || item.label).toLowerCase().includes(searchLower) ||
      item.label.toLowerCase().includes(searchLower) ||
      (item.countryText || item.countryLabel).toLowerCase().includes(searchLower) ||
      item.countryLabel.toLowerCase().includes(searchLower)
    );
  });

  // Group filtered items by country
  const groupedItems = filteredItems.reduce((acc, item) => {
    const countryKey = isRTL ? (item.countryText || item.countryLabel) : item.countryLabel;
    if (!acc[countryKey]) {
      acc[countryKey] = [];
    }
    if (!item.isCountry) {
      acc[countryKey].push(item);
    }
    return acc;
  }, {} as Record<string, FlattenedItem[]>);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleItemClick = (item: FlattenedItem) => {
    if (!item.isCountry) {
      const displayLabel = isRTL ? (item.text || item.label) : item.label;
      onSelect(item.value, displayLabel);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const toggleCountry = (countryKey: string) => {
    const newExpanded = new Set(expandedCountries);
    if (newExpanded.has(countryKey)) {
      newExpanded.delete(countryKey);
    } else {
      newExpanded.add(countryKey);
    }
    setExpandedCountries(newExpanded);
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '5px',
    border: '1px solid #3a4a5c',
    backgroundColor: '#212a33',
    color: '#848d96',
    fontSize: '13px',
    fontFamily: 'IRANSansX, sans-serif',
    direction: isRTL ? 'rtl' as const : 'ltr' as const,
    textAlign: isRTL ? 'right' as const : 'left' as const,
    outline: 'none',
    cursor: 'pointer',
    position: 'relative' as const,
    ...style
  };

  const dropdownStyle = {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#212a33',
    border: '1px solid #3a4a5c',
    borderRadius: '5px',
    maxHeight: '300px',
    overflowY: 'auto' as const,
    zIndex: 1000,
    marginTop: '2px'
  };

  const searchInputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: 'none',
    borderBottom: '1px solid #3a4a5c',
    backgroundColor: '#2a3441',
    color: '#ffffff',
    fontSize: '13px',
    fontFamily: 'IRANSansX, sans-serif',
    direction: isRTL ? 'rtl' as const : 'ltr' as const,
    textAlign: isRTL ? 'right' as const : 'left' as const,
    outline: 'none'
  };

  const countryHeaderStyle = {
    padding: '8px 12px',
    backgroundColor: '#3a4a5c',
    color: '#50b4ff',
    fontSize: '12px',
    fontWeight: '700',
    fontFamily: 'IRANSansX, sans-serif',
    direction: isRTL ? 'rtl' as const : 'ltr' as const,
    textAlign: isRTL ? 'right' as const : 'left' as const,
    borderBottom: '1px solid #4a5a6c',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'background-color 0.2s ease'
  };

  const accordionIconStyle = {
    fontSize: '10px',
    transition: 'transform 0.2s ease',
    color: '#50b4ff'
  };

  const cityItemStyle = {
    padding: '8px 20px',
    color: '#848d96',
    fontSize: '13px',
    fontFamily: 'IRANSansX, sans-serif',
    direction: isRTL ? 'rtl' as const : 'ltr' as const,
    textAlign: isRTL ? 'right' as const : 'left' as const,
    cursor: 'pointer',
    borderBottom: '1px solid #2a3441',
    transition: 'background-color 0.2s ease'
  };

  const cityItemHoverStyle = {
    backgroundColor: '#3a4a5c'
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }}>
      <div
        style={inputStyle}
        onClick={() => !loading && setIsOpen(!isOpen)}
        onBlur={onBlur}
        tabIndex={0}
      >
        {loading ? (
          <span style={{ color: '#848d96' }}>در حال بارگذاری...</span>
        ) : (
          <span style={{ color: displayValue ? '#ffffff' : '#848d96' }}>
            {displayValue || placeholder}
          </span>
        )}
        <span
          style={{
            position: 'absolute',
            right: isRTL ? 'auto' : '12px',
            left: isRTL ? '12px' : 'auto',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#848d96',
            fontSize: '12px',
            transition: 'transform 0.2s ease',
            ...(isOpen && { transform: 'translateY(-50%) rotate(180deg)' })
          }}
        >
          ▼
        </span>
      </div>

      {isOpen && (
        <div style={dropdownStyle} className="hide-scrollbar">
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isRTL ? 'جستجو...' : 'Search...'}
            style={searchInputStyle}
          />
          
          <div>
            {Object.keys(groupedItems).length === 0 ? (
              <div style={{ padding: '12px', color: '#848d96', textAlign: 'center' }}>
                {isRTL ? 'نتیجه‌ای یافت نشد' : 'No results found'}
              </div>
            ) : (
              Object.entries(groupedItems).map(([countryLabel, cities]) => {
                const isExpanded = expandedCountries.has(countryLabel);
                return (
                  <div key={countryLabel}>
                    <div 
                      style={countryHeaderStyle}
                      onClick={() => toggleCountry(countryLabel)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#4a5a6c';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#3a4a5c';
                      }}
                    >
                      <span>{countryLabel}</span>
                      <span 
                        style={{
                          ...accordionIconStyle,
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}
                      >
                        ▼
                      </span>
                    </div>
                    {isExpanded && (
                      <div 
                        className="hide-scrollbar"
                        style={{ 
                          maxHeight: '200px', 
                          overflowY: 'auto',
                          animation: 'slideDown 0.2s ease-out'
                        }}>
                        {cities.map((city) => (
                          <div
                            key={city.value}
                            style={cityItemStyle}
                            onClick={() => handleItemClick(city)}
                            onMouseEnter={(e) => {
                              Object.assign(e.currentTarget.style, cityItemHoverStyle);
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            {isRTL ? (city.text || city.label) : city.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TreeDropdown;