import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FileUploader from '../FileUploader';

// Вынесенный мок axios
jest.mock('../../utils/axios', () => ({
  post: jest.fn(() => Promise.resolve({ data: { status: 'success', path: '/uploads/test.pdf' } }))
}));

describe('FileUploader', () => {
  it('renders upload button', () => {
    render(
      <FileUploader onFileUploaded={jest.fn()} endpoint="/api/upload" />
    );
    expect(screen.getByText('Загрузить файл')).toBeInTheDocument();
  });

  it('calls onFileUploaded after successful upload (mock)', async () => {
    const onFileUploaded = jest.fn();
    render(
      <FileUploader onFileUploaded={onFileUploaded} endpoint="/api/upload" />
    );
    // Симулируем выбор файла и клик по загрузке (оставлено как пример, требует доработки для полного теста)
  });
});
