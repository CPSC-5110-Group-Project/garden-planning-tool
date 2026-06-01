import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import GardenNameModal from './GardenNameModal'

describe('GardenNameModal', () => {
  it('confirms with the typed garden name', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(<GardenNameModal onConfirm={onConfirm} onCancel={vi.fn()} />)

    await user.type(screen.getByPlaceholderText('Enter garden name...'), 'Herb Bed')
    await user.click(screen.getByRole('button', { name: 'Create Garden' }))

    expect(onConfirm).toHaveBeenCalledWith('Herb Bed')
  })

  it('keeps submit disabled for blank names', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(<GardenNameModal onConfirm={onConfirm} onCancel={vi.fn()} />)

    await user.type(screen.getByPlaceholderText('Enter garden name...'), '   ')

    expect(screen.getByRole('button', { name: 'Create Garden' })).toBeDisabled()
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
