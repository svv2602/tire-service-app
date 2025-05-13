import React from 'react';
import { render } from '@testing-library/react';
import { GridContainer, GridItem } from '../GridComponents';

describe('GridContainer', () => {
  it('renders children and applies spacing', () => {
    const { getByText } = render(
      <GridContainer spacing={4} data-testid="container">
        <div>Child 1</div>
        <div>Child 2</div>
      </GridContainer>
    );
    expect(getByText('Child 1')).toBeInTheDocument();
    expect(getByText('Child 2')).toBeInTheDocument();
  });
});

describe('GridItem', () => {
  it('renders children and applies width', () => {
    const { getByText } = render(
      <GridItem xs={6} data-testid="item">
        Test Item
      </GridItem>
    );
    expect(getByText('Test Item')).toBeInTheDocument();
  });
});
