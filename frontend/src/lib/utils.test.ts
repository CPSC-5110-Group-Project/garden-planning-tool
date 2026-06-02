import { describe, expect, it } from 'vitest'

import { getPlantIcon, getResizedImageUrl } from './utils'

describe('getResizedImageUrl', () => {
  it('converts Supabase storage URLs to rendered image URLs', () => {
    expect(
      getResizedImageUrl('https://example.test/storage/v1/object/public/plants/tomato.webp', 200, 100),
    ).toBe(
      'https://example.test/storage/v1/render/image/public/plants/tomato.webp?width=200&height=100&resize=cover',
    )
  })
})

describe('getPlantIcon', () => {
  it('shows a sprout before growth has started', () => {
    expect(getPlantIcon(0)).toBe('🌱')
  })

  it('shows a mature tree icon for older tree plants', () => {
    expect(getPlantIcon(120, { perenual_id: 1, common_name: 'Apple', type: 'Tree' })).toBe('🌳')
  })

  it('shows a harvest icon for mature edible plants', () => {
    expect(
      getPlantIcon(60, {
        perenual_id: 2,
        common_name: 'Carrot',
        growth_rate: 'high',
        edible_leaf: true,
      }),
    ).toBe('🥕')
  })
})
