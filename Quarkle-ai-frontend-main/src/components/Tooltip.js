import React from 'react';

function Tooltip({ content, children }) {
    const [showTooltip, setShowTooltip] = React.useState(false);
  
    return (
      <div 
        onMouseOver={() => setShowTooltip(true)} 
        onMouseOut={() => setShowTooltip(false)}
      >
        {children}
        <span 
          className={`tooltip-text ${showTooltip ? 'show' : ''}`}
        >
          {content}
        </span>
      </div>
    );
  }
  

export default Tooltip;
