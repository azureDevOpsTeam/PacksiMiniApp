import React, { useState, useRef, useEffect } from 'react';
import type { CityItem } from '../types/api';

interface MultiSelectTreeDropdownProps {
  data: CityItem[];
  loading: boolean;
  placeholder: string;
  selectedValues: number[];
  onSelectionChange: (selectedValues: number[]) => void;
  theme: any;
  isRTL: boolean;
  style?: React.CSSProperties;
  onBlur?: () => void;
  disabled?: boolean;
  excludeCountryId?: number;
}

interface FlattenedItem {
  value: number;
  text: string;
  label: string;
  countryText: string;
  countryLabel: string;
  countryValue: number;
  isCountry: boolean;
}

const MultiSelectTreeDropdown: React.FC<MultiSelectTreeDropdownProps> = ({
  data,
  loading,
  placeholder,
  selectedValues,
  onSelectionChange,
  isRTL,
  style,
  onBlur,
  disabled = false,
  excludeCountryId
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
      const countryId = parseInt(country.value);
      
      // Skip this country entirely if it's the excluded country
      if (excludeCountryId && countryId === excludeCountryId) {
        return;
      }
      
      // Add country as a selectable item
      flattened.push({
        value: countryId,
        text: country.text || country.label,
        label: country.label,
        countryText: country.text || country.label,
        countryLabel: country.label,
        countryValue: countryId,
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
          countryValue: countryId,
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
      acc[countryKey] = {
        country: null as FlattenedItem | null,
        cities: [] as FlattenedItem[]
      };
    }
    if (item.isCountry) {
      acc[countryKey].country = item;
    } else {
      acc[countryKey].cities.push(item);
    }
    return acc;
  }, {} as Record<string, { country: FlattenedItem | null; cities: FlattenedItem[] }>);

  // Auto-expand countries when searching for cities
  useEffect(() => {
    if (searchTerm.trim() === '') {
      // If search is empty, collapse all countries
      setExpandedCountries(new Set());
    } else {
      // Find countries that have matching cities and expand them
      const countriesWithMatches = new Set<string>();
      Object.entries(groupedItems).forEach(([countryLabel, { cities }]) => {
        if (cities.length > 0) {
          countriesWithMatches.add(countryLabel);
        }
      });
      setExpandedCountries(countriesWithMatches);
    }
  }, [searchTerm, groupedItems]);

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
    let newSelectedValues = [...selectedValues];
    const itemValue = item.value;

    if (item.isCountry) {
      // If country is clicked, toggle all cities in that country
      const countryCities = flattenedItems.filter(i => 
        !i.isCountry && i.countryValue === item.value
      );
      const cityValues = countryCities.map(city => city.value);
      
      // Check if all cities are already selected
      const allCitiesSelected = cityValues.every(cityValue => 
        selectedValues.includes(cityValue)
      );
      
      if (allCitiesSelected) {
        // Remove all cities from selection
        newSelectedValues = newSelectedValues.filter(value => 
          !cityValues.includes(value)
        );
      } else {
        // Add all cities to selection
        cityValues.forEach(cityValue => {
          if (!newSelectedValues.includes(cityValue)) {
            newSelectedValues.push(cityValue);
          }
        });
      }
    } else {
      // If city is clicked, toggle just that city
      if (selectedValues.includes(itemValue)) {
        newSelectedValues = newSelectedValues.filter(value => value !== itemValue);
      } else {
        newSelectedValues.push(itemValue);
      }
    }

    onSelectionChange(newSelectedValues);
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

  // Check if all cities in a country are selected
  const isCountryFullySelected = (countryValue: number): boolean => {
    const countryCities = flattenedItems.filter(i => 
      !i.isCountry && i.countryValue === countryValue
    );
    return countryCities.length > 0 && countryCities.every(city => 
      selectedValues.includes(city.value)
    );
  };

  // Check if some cities in a country are selected
  const isCountryPartiallySelected = (countryValue: number): boolean => {
    const countryCities = flattenedItems.filter(i => 
      !i.isCountry && i.countryValue === countryValue
    );
    return countryCities.some(city => selectedValues.includes(city.value)) && 
           !isCountryFullySelected(countryValue);
  };

  // Generate display text
  const getDisplayText = (): string => {
    if (selectedValues.length === 0) return '';
    if (selectedValues.length === 1) {
      const item = flattenedItems.find(i => i.value === selectedValues[0]);
      return item ? (isRTL ? (item.text || item.label) : item.label) : '';
    }
    return isRTL ? `${selectedValues.length} شهر انتخاب شده` : `${selectedValues.length} cities selected`;
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
    transition: 'background-color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const checkboxStyle = {
    width: '16px',
    height: '16px',
    borderRadius: '3px',
    border: '2px solid #50b4ff',
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    color: '#50b4ff',
    flexShrink: 0
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%' }} onBlur={onBlur} tabIndex={0}>
      <div
        style={{
          ...inputStyle,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
        onClick={() => !loading && !disabled && setIsOpen(!isOpen)}
      >
        {loading ? (
          <span style={{ color: '#848d96' }}>در حال بارگذاری...</span>
        ) : (
          <span style={{ color: getDisplayText() ? '#ffffff' : '#848d96' }}>
            {getDisplayText() || placeholder}
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
              Object.entries(groupedItems).map(([countryLabel, { country, cities }]) => {
                const isExpanded = expandedCountries.has(countryLabel);
                const countryFullySelected = country ? isCountryFullySelected(country.value) : false;
                const countryPartiallySelected = country ? isCountryPartiallySelected(country.value) : false;
                
                return (
                  <div key={countryLabel}>
                    <div 
                      style={{
                        ...countryHeaderStyle,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#4a5a6c';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#3a4a5c';
                      }}
                    >
                      <div 
                        style={{
                          ...checkboxStyle,
                          backgroundColor: countryFullySelected ? '#50b4ff' : 'transparent',
                          border: countryPartiallySelected ? '2px solid #ff9800' : '2px solid #50b4ff'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          country && handleItemClick(country);
                        }}
                      >
                        {countryFullySelected ? '✓' : (countryPartiallySelected ? '−' : '')}
                      </div>
                      <span 
                        style={{ flex: 1, cursor: 'pointer' }}
                        onClick={() => toggleCountry(countryLabel)}
                      >
                        {countryLabel}
                      </span>
                      <span 
                        style={{
                          ...accordionIconStyle,
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}
                        onClick={() => toggleCountry(countryLabel)}
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
                        {cities.map((city) => {
                          const isSelected = selectedValues.includes(city.value);
                          return (
                            <div
                              key={city.value}
                              style={cityItemStyle}
                              onClick={() => handleItemClick(city)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#3a4a5c';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              <div style={{
                                ...checkboxStyle,
                                backgroundColor: isSelected ? '#50b4ff' : 'transparent'
                              }}>
                                {isSelected ? '✓' : ''}
                              </div>
                              <span>{isRTL ? (city.text || city.label) : city.label}</span>
                            </div>
                          );
                        })}
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

export default MultiSelectTreeDropdown;