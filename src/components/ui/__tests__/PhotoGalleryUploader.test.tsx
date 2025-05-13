import React from 'react';
import { render, screen } from '@testing-library/react';
import PhotoGalleryUploader from '../PhotoGalleryUploader';

describe('PhotoGalleryUploader', () => {
  it('renders upload button', () => {
    render(
      <PhotoGalleryUploader servicePointId={1} />
    );
    expect(screen.getByText('Добавить фото')).toBeInTheDocument();
  });
});
