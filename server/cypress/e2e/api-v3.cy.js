describe('GET /customers API', () => {
  const baseUrl = Cypress.env('API_BASE_URL') || 'http://localhost:3001'

  context('Successful requests', () => {
    it('returns default query parameters when none are provided', () => {
      // Arrange
      const endpoint = `${baseUrl}/customers`

      // Act
      cy.request('GET', endpoint).then(({ status, body }) => {
        // Assert
        expect(status).to.eq(200)

        const { customers, pageInfo } = body
        expect(customers).to.be.an('array')
        expect(pageInfo).to.have.keys(['currentPage', 'totalPages', 'totalCustomers'])
        expect(pageInfo.currentPage).to.eq(1)
        expect(pageInfo.totalPages).to.be.greaterThan(0)
        expect(pageInfo.totalCustomers).to.be.greaterThan(0)
      })
    })

    it('filters customers by size', () => {
      // Arrange
      const size = 'Medium'
      const endpoint = `${baseUrl}/customers?size=${size}`

      // Act
      cy.request('GET', endpoint).then(({ status, body }) => {
        // Assert
        expect(status).to.eq(200)

        const { customers } = body
        customers.forEach(({ size: customerSize, employees }) => {
          expect(customerSize).to.eq(size)
          expect(employees).to.be.within(100, 999)
        })
      })
    })

    it('filters customers by industry', () => {
      // Arrange
      const industry = 'Technology'
      const endpoint = `${baseUrl}/customers?industry=${industry}`

      // Act
      cy.request('GET', endpoint).then(({ status, body }) => {
        // Assert
        expect(status).to.eq(200)

        const { customers } = body
        customers.forEach(({ industry: customerIndustry }) => {
          expect(customerIndustry).to.eq(industry)
        })
      })
    })

    it('paginates results with page and limit query parameters', () => {
      // Arrange
      const page = 2
      const limit = 5
      const endpoint = `${baseUrl}/customers?page=${page}&limit=${limit}`

      // Act
      cy.request('GET', endpoint).then(({ status, body }) => {
        // Assert
        expect(status).to.eq(200)

        const { customers, pageInfo } = body
        expect(customers).to.have.length.of.at.most(limit)
        expect(pageInfo.currentPage).to.eq(page)
        expect(pageInfo.totalPages).to.be.greaterThan(1)
      })
    })
  })

  context('Error scenarios', () => {
    it('returns 400 for invalid page or limit', () => {
      // Arrange
      const invalidPage = -1
      const invalidLimit = 0
      const endpoint = `${baseUrl}/customers?page=${invalidPage}&limit=${invalidLimit}`

      // Act
      cy.request({
        method: 'GET',
        url: endpoint,
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        // Assert
        expect(status).to.eq(400)
        expect(body.error).to.eq('Invalid page or limit. Both must be positive numbers.')
      })
    })

    it('returns 400 for unsupported size value', () => {
      // Arrange
      const invalidSize = 'InvalidSize'
      const endpoint = `${baseUrl}/customers?size=${invalidSize}`

      // Act
      cy.request({
        method: 'GET',
        url: endpoint,
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        // Assert
        expect(status).to.eq(400)
        expect(body.error).to.eq('Unsupported size value. Supported values are All, Small, Medium, Enterprise, Large Enterprise, and Very Large Enterprise.')
      })
    })

    it('returns 400 for unsupported industry value', () => {
      // Arrange
      const invalidIndustry = 'InvalidIndustry'
      const endpoint = `${baseUrl}/customers?industry=${invalidIndustry}`

      // Act
      cy.request({
        method: 'GET',
        url: endpoint,
        failOnStatusCode: false,
      }).then(({ status, body }) => {
        // Assert
        expect(status).to.eq(400)
        expect(body.error).to.eq('Unsupported industry value. Supported values are All, Logistics, Retail, Technology, HR, and Finance.')
      })
    })
  })
})