const { test, expect } = require('@playwright/test')

const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001'

test.describe('GET /customers API', () => {
  test.describe('Successful requests', () => {
    test('returns default query parameters when none are provided', async ({ request }) => {
      // Arrange
      const endpoint = `${baseUrl}/customers`

      // Act
      const response = await request.get(endpoint)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(200)

      const { customers, pageInfo } = body
      expect(customers).toBeInstanceOf(Array)
      expect(pageInfo).toMatchObject({
        currentPage: 1,
        totalPages: expect.any(Number),
        totalCustomers: expect.any(Number),
      })
    })

    test('filters customers by size', async ({ request }) => {
      // Arrange
      const size = 'Medium'
      const endpoint = `${baseUrl}/customers?size=${size}`

      // Act
      const response = await request.get(endpoint)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(200)

      const { customers } = body
      customers.forEach(({ size: customerSize, employees }) => {
        expect(customerSize).toBe(size)
        expect(employees).toBeGreaterThanOrEqual(100)
        expect(employees).toBeLessThan(1000)
      })
    })

    test('filters customers by industry', async ({ request }) => {
      // Arrange
      const industry = 'Technology'
      const endpoint = `${baseUrl}/customers?industry=${industry}`

      // Act
      const response = await request.get(endpoint)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(200)

      const { customers } = body
      customers.forEach(({ industry: customerIndustry }) => {
        expect(customerIndustry).toBe(industry)
      })
    })

    test('paginates results with page and limit query parameters', async ({ request }) => {
      // Arrange
      const page = 2
      const limit = 5
      const endpoint = `${baseUrl}/customers?page=${page}&limit=${limit}`

      // Act
      const response = await request.get(endpoint)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(200)

      const { customers, pageInfo } = body
      expect(customers.length).toBeLessThanOrEqual(limit)
      expect(pageInfo.currentPage).toBe(page)
      expect(pageInfo.totalPages).toBeGreaterThan(1)
    })
  })

  test.describe('Error scenarios', () => {
    test('returns 400 for invalid page or limit', async ({ request }) => {
      // Arrange
      const invalidPage = -1
      const invalidLimit = 0
      const endpoint = `${baseUrl}/customers?page=${invalidPage}&limit=${invalidLimit}`

      // Act
      const response = await request.get(endpoint)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(400)
      expect(body.error).toBe('Invalid page or limit. Both must be positive numbers.')
    })

    test('returns 400 for unsupported size value', async ({ request }) => {
      // Arrange
      const invalidSize = 'InvalidSize'
      const endpoint = `${baseUrl}/customers?size=${invalidSize}`

      // Act
      const response = await request.get(endpoint)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(400)
      expect(body.error).toBe(
        'Unsupported size value. Supported values are All, Small, Medium, Enterprise, Large Enterprise, and Very Large Enterprise.',
      )
    })

    test('returns 400 for unsupported industry value', async ({ request }) => {
      // Arrange
      const invalidIndustry = 'InvalidIndustry'
      const endpoint = `${baseUrl}/customers?industry=${invalidIndustry}`

      // Act
      const response = await request.get(endpoint)
      const body = await response.json()

      // Assert
      expect(response.status()).toBe(400)
      expect(body.error).toBe(
        'Unsupported industry value. Supported values are All, Logistics, Retail, Technology, HR, and Finance.',
      )
    })
  })
})