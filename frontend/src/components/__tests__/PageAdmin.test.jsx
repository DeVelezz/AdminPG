import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PageAdmin from '../PageAdmin';

// Mock fetch global
const mockUser = {
  id: 10,
  nombre: 'Juan Perez',
  email: 'juan.perez@example.com',
  Residente: {
    telefono: '3001234567',
    torre: 'A',
    apartamento: '101',
    genero: 'masculino'
  }
};

describe('PageAdmin edit modal', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
      // First call: loadUsers -> resumen
      .mockResolvedValueOnce({ ok: true, json: async () => ([{ id: mockUser.id, nombre: mockUser.nombre, email: mockUser.email, torre: 'A', apartamento: '101', estado: 'Al dia', deudaTotal: 0 }]) })
      // Second call: GET /usuarios/:id
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: mockUser }) })
      // Third call: PUT /usuarios/:id
      .mockResolvedValueOnce({ ok: true, json: async () => ({ success: true }) });

    // mock token
    Storage.prototype.getItem = jest.fn(() => 'fake-token');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('edita usuario desde modal', async () => {
    render(<PageAdmin />);

    // esperar a que cargue la tabla
    await waitFor(() => expect(screen.getByText(/Información de los residentes/i)).toBeInTheDocument());

    // encontrar el botón Editar y hacer click (el primer usuario)
    const editButtons = await screen.findAllByText('Editar');
    expect(editButtons.length).toBeGreaterThan(0);

    fireEvent.click(editButtons[0]);

    // modal debe abrir y mostrar el nombre
    await waitFor(() => expect(screen.getByText(/Editar Usuario/i)).toBeInTheDocument());

    const emailInput = screen.getByLabelText(/Email/i);
    const telefonoInput = screen.getByLabelText(/Teléfono/i);

    // cambiar valores
    fireEvent.change(emailInput, { target: { value: 'nuevo.email@example.com' } });
    fireEvent.change(telefonoInput, { target: { value: '3005554444' } });

    const saveBtn = screen.getByText('Guardar');
    fireEvent.click(saveBtn);

    // esperar que fetch PUT haya sido llamado (3rd call)
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  });
});
