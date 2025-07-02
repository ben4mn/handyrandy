import React from 'react';
import { ChatExample } from '../types';

interface ExampleQueriesProps {
  examples: ChatExample[];
  onSelectExample: (query: string) => void;
  isLoading?: boolean;
}

export const ExampleQueries: React.FC<ExampleQueriesProps> = ({
  examples,
  onSelectExample,
  isLoading = false,
}) => {
  if (examples.length === 0) {
    return null;
  }

  return (
    <div className="example-queries">
      <h3 className="examples-title">💡 Try these example questions:</h3>
      
      <div className="examples-grid">
        {examples.map((category, categoryIndex) => (
          <div key={categoryIndex} className="example-category">
            <h4 className="category-title">{category.category}</h4>
            <div className="category-queries">
              {category.queries.map((query, queryIndex) => (
                <button
                  key={queryIndex}
                  onClick={() => onSelectExample(query)}
                  disabled={isLoading}
                  className="example-query-button"
                  title={`Click to use: ${query}`}
                >
                  <span className="query-icon">💬</span>
                  <span className="query-text">{query}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="examples-footer">
        <p className="examples-note">
          Click any example to use it, or type your own question below.
        </p>
      </div>
    </div>
  );
};